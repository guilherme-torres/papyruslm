from datetime import datetime
from uuid import UUID

from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from papyruslm.adapters.outbound.database.models import SQLAlchemyDocument
from papyruslm.domain.entities import Document
from papyruslm.domain.entities.document import DocumentStatus


class SQLAlchemyDocumentRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def create_document(self, document: Document) -> Document:
        document_db = SQLAlchemyDocument.from_entity(document)
        self._session.add(document_db)
        await self._session.commit()
        await self._session.refresh(document_db)
        return document_db.to_entity()

    async def find_by_id(self, id: UUID) -> Document | None:
        document_db = await self._session.get(SQLAlchemyDocument, id)
        return document_db.to_entity() if document_db else None

    async def find_by_ids(self, ids: list[UUID]) -> list[Document]:
        if not ids:
            return []
        result = await self._session.scalars(select(SQLAlchemyDocument).where(SQLAlchemyDocument.id.in_(ids)))
        return [document_db.to_entity() for document_db in result]

    async def list_documents_by_notebook_id(self, notebook_id: UUID) -> list[Document]:
        result = await self._session.scalars(
            select(SQLAlchemyDocument)
            .where(SQLAlchemyDocument.notebook_id == notebook_id)
            .order_by(SQLAlchemyDocument.created_at, SQLAlchemyDocument.id)
        )
        return [document_db.to_entity() for document_db in result]

    async def update_document(self, document: Document) -> Document | None:
        document_db = await self._session.get(SQLAlchemyDocument, document.id)
        if document_db is None:
            return None
        document_db.status = document.status
        document_db.embedding_model = document.embedding_model
        await self._session.commit()
        await self._session.refresh(document_db)
        return document_db.to_entity()

    async def delete_document(self, id: UUID) -> bool:
        result = await self._session.execute(delete(SQLAlchemyDocument).where(SQLAlchemyDocument.id == id))
        await self._session.commit()
        return result.rowcount > 0

    async def claim_next_pending(self, now: datetime) -> Document | None:
        next_pending = (
            select(SQLAlchemyDocument.id)
            .where(SQLAlchemyDocument.status == DocumentStatus.PENDING)
            .order_by(SQLAlchemyDocument.created_at, SQLAlchemyDocument.id)
            .limit(1)
            .scalar_subquery()
        )
        document_db = await self._session.scalar(
            update(SQLAlchemyDocument)
            .where(SQLAlchemyDocument.id == next_pending)
            .values(
                status=DocumentStatus.PROCESSING,
                attempts=SQLAlchemyDocument.attempts + 1,
                lease_version=SQLAlchemyDocument.lease_version + 1,
                heartbeat_at=now,
            )
            .returning(SQLAlchemyDocument)
        )
        await self._session.commit()
        return document_db.to_entity() if document_db else None

    async def renew_lease(self, document_id: UUID, lease_version: int, now: datetime) -> bool:
        result = await self._session.execute(
            update(SQLAlchemyDocument)
            .where(
                SQLAlchemyDocument.id == document_id,
                SQLAlchemyDocument.lease_version == lease_version,
                SQLAlchemyDocument.status == DocumentStatus.PROCESSING,
            )
            .values(heartbeat_at=now)
        )
        await self._session.commit()
        return result.rowcount > 0

    async def recover_stale(self, heartbeat_before: datetime, max_attempts: int) -> tuple[int, int]:
        stale = (
            SQLAlchemyDocument.status == DocumentStatus.PROCESSING,
            SQLAlchemyDocument.heartbeat_at < heartbeat_before,
        )
        requeued = await self._session.execute(
            update(SQLAlchemyDocument)
            .where(*stale, SQLAlchemyDocument.attempts < max_attempts)
            .values(status=DocumentStatus.PENDING)
        )
        failed = await self._session.execute(
            update(SQLAlchemyDocument)
            .where(*stale, SQLAlchemyDocument.attempts >= max_attempts)
            .values(status=DocumentStatus.FAILED)
        )
        await self._session.commit()
        return requeued.rowcount, failed.rowcount

    async def finish(self, document: Document) -> bool:
        result = await self._session.execute(
            update(SQLAlchemyDocument)
            .where(
                SQLAlchemyDocument.id == document.id,
                SQLAlchemyDocument.lease_version == document.lease_version,
                SQLAlchemyDocument.status == DocumentStatus.PROCESSING,
            )
            .values(status=document.status, embedding_model=document.embedding_model)
        )
        return result.rowcount > 0
