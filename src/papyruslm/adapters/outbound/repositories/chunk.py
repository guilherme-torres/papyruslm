from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from papyruslm.adapters.outbound.database.models import SQLAlchemyChunk
from papyruslm.domain.entities import Chunk


class SQLAlchemyChunkRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def replace_chunks(self, document_id: UUID, chunks: list[Chunk]) -> None:
        await self._session.execute(delete(SQLAlchemyChunk).where(SQLAlchemyChunk.document_id == document_id))
        self._session.add_all(SQLAlchemyChunk.from_entity(chunk) for chunk in chunks)

    async def find_by_ids(self, ids: list[UUID]) -> list[Chunk]:
        if not ids:
            return []
        result = await self._session.scalars(select(SQLAlchemyChunk).where(SQLAlchemyChunk.id.in_(ids)))
        return [chunk_db.to_entity() for chunk_db in result]
