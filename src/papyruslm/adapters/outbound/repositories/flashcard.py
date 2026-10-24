from datetime import datetime
from uuid import UUID

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from papyruslm.adapters.outbound.database.models import SQLAlchemyFlashcard
from papyruslm.domain.entities import Flashcard
from papyruslm.domain.repositories.flashcard import FlashcardCounts


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
    
    async def count_by_notebooks(
        self, notebook_ids: list[UUID], now: datetime
    ) -> dict[UUID, FlashcardCounts]:
        if not notebook_ids:
            return {}
        stmt = (
            select(
                SQLAlchemyFlashcard.notebook_id,
                func.count(),
                func.count().filter(SQLAlchemyFlashcard.due_date <= now),
            )
            .where(SQLAlchemyFlashcard.notebook_id.in_(notebook_ids))
            .group_by(SQLAlchemyFlashcard.notebook_id)
        )
        rows = await self._session.execute(stmt)
        counts = {notebook_id: FlashcardCounts(total, due) for notebook_id, total, due in rows}
        return {id: counts.get(id, FlashcardCounts(0, 0)) for id in notebook_ids}

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

    async def list_flashcards_by_notebook_id(
        self,
        notebook_id: UUID,
        limit: int,
        offset: int,
    ) -> tuple[list[Flashcard], int]:
        stmt = (
            select(SQLAlchemyFlashcard)
            .where(SQLAlchemyFlashcard.notebook_id == notebook_id)
            .order_by(SQLAlchemyFlashcard.created_at.desc(), SQLAlchemyFlashcard.id)
            .limit(limit)
            .offset(offset)
        )
        count_stmt = (
            select(func.count())
            .select_from(SQLAlchemyFlashcard)
            .where(SQLAlchemyFlashcard.notebook_id == notebook_id)
        )
        result = await self._session.scalars(stmt)
        total = await self._session.scalar(count_stmt)
        return [flashcard_db.to_entity() for flashcard_db in result], total

    async def _get_model(self, id: UUID) -> SQLAlchemyFlashcard | None:
        return await self._session.get(SQLAlchemyFlashcard, id)
