from uuid import UUID

from sqlalchemy import select
from sqlalchemy.dialects.sqlite import insert
from sqlalchemy.ext.asyncio import AsyncSession

from papyruslm.adapters.outbound.database.models import SQLAlchemyDocumentContent
from papyruslm.domain.entities import DocumentContent


class SQLAlchemyDocumentContentRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def save_content(self, content: DocumentContent) -> None:
        stmt = insert(SQLAlchemyDocumentContent).values(
            document_id=content.document_id,
            text=content.text,
            checksum=content.checksum,
        )
        await self._session.execute(
            stmt.on_conflict_do_update(
                index_elements=[SQLAlchemyDocumentContent.document_id],
                set_={"text": stmt.excluded.text, "checksum": stmt.excluded.checksum},
            )
        )

    async def find_by_document_id(self, document_id: UUID) -> DocumentContent | None:
        content_db = await self._session.get(SQLAlchemyDocumentContent, document_id)
        return content_db.to_entity() if content_db else None

    async def find_checksums(self, document_ids: list[UUID]) -> dict[UUID, str]:
        if not document_ids:
            return {}
        result = await self._session.execute(
            select(SQLAlchemyDocumentContent.document_id, SQLAlchemyDocumentContent.checksum).where(
                SQLAlchemyDocumentContent.document_id.in_(document_ids)
            )
        )
        return {document_id: checksum for document_id, checksum in result}
