from uuid import UUID

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlite_vec import serialize_float32

from papyruslm.application.ports import VectorMatch
from papyruslm.domain.entities import Chunk

TABLE_NAME = "chunk_vectors"


class SqliteVecIndex:
    def __init__(self, session: AsyncSession, dimensions: int):
        self._session = session
        self._dimensions = dimensions
        self._table_ready = False

    async def add(self, notebook_id: UUID, chunks: list[Chunk], vectors: list[list[float]]) -> None:
        if len(chunks) != len(vectors):
            raise ValueError(f"Got {len(chunks)} chunks and {len(vectors)} vectors")
        if not chunks:
            return
        await self._ensure_table()
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
        await self._ensure_table()
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
        await self._ensure_table()
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

    async def _ensure_table(self) -> None:
        if self._table_ready:
            return
        await self._session.execute(
            text(
                f"CREATE VIRTUAL TABLE IF NOT EXISTS {TABLE_NAME} USING vec0("
                "chunk_id TEXT PRIMARY KEY, "
                "notebook_id TEXT PARTITION KEY, "
                "document_id TEXT, "
                f"embedding FLOAT[{self._dimensions}] distance_metric=cosine)"
            )
        )
        self._table_ready = True
