from uuid import UUID

from papyruslm.application.exceptions import FlashcardNotFound
from papyruslm.domain.repositories import FlashcardRepository


class DeleteFlashcardUseCase:
    def __init__(self, flashcard_repository: FlashcardRepository):
        self._flashcard_repository = flashcard_repository

    async def execute(self, id: UUID) -> None:
        if not await self._flashcard_repository.delete_flashcard(id):
            raise FlashcardNotFound(id)
