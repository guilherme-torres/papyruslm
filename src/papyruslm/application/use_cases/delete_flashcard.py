from uuid import UUID

from papyruslm.application.ports.repositories.flashcard_repository import FlashcardRepository


class CreateFlashcardUseCase:
    def __init__(self, flashcard_repository: FlashcardRepository):
        self._flashcard_repository = flashcard_repository

    async def execute(self, id: UUID) -> None:
        return await self._flashcard_repository.delete_flashcard(id)
