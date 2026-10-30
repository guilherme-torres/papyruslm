from uuid import UUID

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from papyruslm.adapters.outbound.database.models import SQLAlchemyMessage
from papyruslm.domain.entities import Message


class SQLAlchemyMessageRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def create_message(self, message: Message) -> Message:
        message_db = SQLAlchemyMessage.from_entity(message)
        self._session.add(message_db)
        await self._session.commit()
        await self._session.refresh(message_db)
        return message_db.to_entity()

    async def list_messages_by_notebook_id(
        self,
        notebook_id: UUID,
        limit: int,
        offset: int,
    ) -> tuple[list[Message], int]:
        result = await self._session.scalars(
            select(SQLAlchemyMessage)
            .where(SQLAlchemyMessage.notebook_id == notebook_id)
            .order_by(SQLAlchemyMessage.created_at, SQLAlchemyMessage.id)
            .limit(limit)
            .offset(offset)
        )
        total = await self._session.scalar(
            select(func.count()).select_from(SQLAlchemyMessage).where(SQLAlchemyMessage.notebook_id == notebook_id)
        )
        return [message_db.to_entity() for message_db in result], total

    async def list_recent_messages(self, notebook_id: UUID, limit: int) -> list[Message]:
        result = await self._session.scalars(
            select(SQLAlchemyMessage)
            .where(SQLAlchemyMessage.notebook_id == notebook_id)
            .order_by(SQLAlchemyMessage.created_at.desc(), SQLAlchemyMessage.id.desc())
            .limit(limit)
        )
        return [message_db.to_entity() for message_db in reversed(result.all())]

    async def delete_messages_by_notebook_id(self, notebook_id: UUID) -> int:
        result = await self._session.execute(
            delete(SQLAlchemyMessage).where(SQLAlchemyMessage.notebook_id == notebook_id)
        )
        await self._session.commit()
        return result.rowcount
