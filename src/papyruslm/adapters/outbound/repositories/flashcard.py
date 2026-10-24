from datetime import datetime
from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from papyruslm.adapters.outbound.database.models import SQLAlchemyFlashcard
from papyruslm.domain.entities import Flashcard


class SQLAlchemyFlashcardRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def create_flashcard(self, flashcard: Flashcard) -> Flashcard:
        flashcard_db = SQLAlchemyFlashcard.from_entity(flashcard)
        self._session.add(flashcard_db)
        await self._session.commit()
        await self._session.refresh(flashcard_db)
        return flashcard_db.to_entity()

    async def find_by_id(self, id: UUID) -> Flashcard | None:
        flashcard_db = await self._get_model(id)
        if flashcard_db is None:
            return None
        return flashcard_db.to_entity()

    async def delete_flashcard(self, id: UUID) -> bool:
        result = await self._session.execute(
            delete(SQLAlchemyFlashcard).where(SQLAlchemyFlashcard.id == id)
        )
        await self._session.commit()
        return result.rowcount > 0
    
    async def update_flashcard(self, flashcard: Flashcard) -> Flashcard | None:
        flashcard_db = await self._get_model(flashcard.id)
        if flashcard_db is None:
            return None
        flashcard_db.front = flashcard.front
        flashcard_db.back = flashcard.back
        flashcard_db.repetitions = flashcard.repetitions
        flashcard_db.interval_days = flashcard.interval_days
        flashcard_db.ease_factor = flashcard.ease_factor
        flashcard_db.due_date = flashcard.due_date
        await self._session.commit()
        await self._session.refresh(flashcard_db)
        return flashcard_db.to_entity()

    async def count_due(self, now: datetime) -> int:
        raise NotImplementedError()
    
    async def count_due_by_notebook(self, notebook_id: UUID, now: datetime) -> int:
        raise NotImplementedError()
    
    async def count_due_by_notebooks(self, notebook_ids: list[UUID], now: datetime) -> dict[UUID, int]:
        raise NotImplementedError()

    async def find_next_due(self, notebook_id: UUID, now: datetime) -> Flashcard | None:
        stmt = (
            select(SQLAlchemyFlashcard)
            .where(
                SQLAlchemyFlashcard.due_date <= now,
                SQLAlchemyFlashcard.notebook_id == notebook_id,
            )
            .order_by(SQLAlchemyFlashcard.due_date.asc(), SQLAlchemyFlashcard.id)
            .limit(1)
        )
        result = await self._session.scalar(stmt)
        if result is None:
            return None
        return result.to_entity()

    async def _get_model(self, id: UUID) -> SQLAlchemyFlashcard | None:
        return await self._session.get(SQLAlchemyFlashcard, id)
