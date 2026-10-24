from datetime import datetime, timezone
from uuid import UUID

from papyruslm.application.dto import FlashcardOutput
from papyruslm.domain.repositories import FlashcardRepository


class FindNextDueUseCase:
    def __init__(self, flashcard_repository: FlashcardRepository):
        self._flashcard_repository = flashcard_repository

    async def execute(self, notebook_id: UUID, now: datetime | None = None) -> FlashcardOutput | None:
        now = now or datetime.now(timezone.utc)
        flashcard = await self._flashcard_repository.find_next_due(notebook_id, now)
        if flashcard is not None:
            return FlashcardOutput.from_entity(flashcard)
        return None
