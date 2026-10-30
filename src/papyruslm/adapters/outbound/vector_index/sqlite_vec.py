from uuid import UUID

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlite_vec import serialize_float32

from papyruslm.application.ports import IndexSignature, VectorMatch
from papyruslm.domain.entities import Chunk

TABLE_NAME = "chunk_vectors"
META_TABLE_NAME = "chunk_vectors_meta"


class VectorIndexNotInitialized(RuntimeError):
    def __init__(self):
        super().__init__(f"The vector index table {TABLE_NAME} does not exist yet")


class SqliteVecIndex:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def get_signature(self) -> IndexSignature | None:
        await self._ensure_meta_table()
        row = (await self._session.execute(text(f"SELECT model, dimensions FROM {META_TABLE_NAME}"))).first()
        if row is None or not await self._table_exists():
            return None
        return IndexSignature(model=row.model, dimensions=row.dimensions)

    async def reset(self, signature: IndexSignature) -> None:
        await self._ensure_meta_table()
        await self._session.execute(text(f"DROP TABLE IF EXISTS {TABLE_NAME}"))
        await self._session.execute(
            text(
                f"CREATE VIRTUAL TABLE {TABLE_NAME} USING vec0("
                "chunk_id TEXT PRIMARY KEY, "
                "notebook_id TEXT PARTITION KEY, "
                "document_id TEXT, "
                f"embedding FLOAT[{int(signature.dimensions)}] distance_metric=cosine)"
            )
        )
        await self._session.execute(text(f"DELETE FROM {META_TABLE_NAME}"))
        await self._session.execute(
            text(f"INSERT INTO {META_TABLE_NAME} (model, dimensions) VALUES (:model, :dimensions)"),
            {"model": signature.model, "dimensions": signature.dimensions},
        )

    async def add(self, notebook_id: UUID, chunks: list[Chunk], vectors: list[list[float]]) -> None:
        if len(chunks) != len(vectors):
            raise ValueError(f"Got {len(chunks)} chunks and {len(vectors)} vectors")
        if not chunks:
            return
        if not await self._table_exists():
            raise VectorIndexNotInitialized()
        await self._session.execute(
            text(
                f"INSERT INTO {TABLE_NAME} (chunk_id, notebook_id, document_id, embedding) "
                "VALUES (:chunk_id, :notebook_id, :document_id, :embedding)"
            ),
            [
                {
                    "chunk_id": chunk.id.hex,
                    "notebook_id": notebook_id.hex,
                    "document_id": chunk.document_id.hex,
                    "embedding": serialize_float32(vector),
                }
                for chunk, vector in zip(chunks, vectors)
            ],
        )

    async def delete_by_document_id(self, document_id: UUID) -> None:
        if not await self._table_exists():
            return
        await self._session.execute(
            text(f"DELETE FROM {TABLE_NAME} WHERE document_id = :document_id"),
            {"document_id": document_id.hex},
        )

    async def search(
        self,
        notebook_id: UUID,
        vector: list[float],
        limit: int,
        document_ids: list[UUID] | None = None,
    ) -> list[VectorMatch]:
        if not await self._table_exists():
            return []
        if document_ids is None:
            matches = await self._knn(notebook_id, vector, limit)
        else:
            matches = [
                match
                for document_id in set(document_ids)
                for match in await self._knn(notebook_id, vector, limit, document_id)
            ]
        return sorted(matches, key=lambda match: match.score, reverse=True)[:limit]

    async def _knn(
        self,
        notebook_id: UUID,
        vector: list[float],
        limit: int,
        document_id: UUID | None = None,
    ) -> list[VectorMatch]:
        document_filter = "AND document_id = :document_id" if document_id else ""
        result = await self._session.execute(
            text(
                f"SELECT chunk_id, distance FROM {TABLE_NAME} "
                f"WHERE embedding MATCH :vector AND k = :limit AND notebook_id = :notebook_id {document_filter} "
                "ORDER BY distance"
            ),
            {
                "vector": serialize_float32(vector),
                "limit": limit,
                "notebook_id": notebook_id.hex,
                "document_id": document_id.hex if document_id else None,
            },
        )
        return [VectorMatch(chunk_id=UUID(chunk_id), score=1 - distance) for chunk_id, distance in result]

    async def _table_exists(self) -> bool:
        result = await self._session.execute(
            text("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = :name"),
            {"name": TABLE_NAME},
        )
        return result.first() is not None

    async def _ensure_meta_table(self) -> None:
        await self._session.execute(
            text(f"CREATE TABLE IF NOT EXISTS {META_TABLE_NAME} (model TEXT NOT NULL, dimensions INTEGER NOT NULL)")
        )
