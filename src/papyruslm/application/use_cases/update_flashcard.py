from dataclasses import replace

from papyruslm.application.dto import FlashcardOutput, UpdateFlashcardInput
from papyruslm.application.exceptions import FlashcardNotFound
from papyruslm.domain.repositories import FlashcardRepository


class UpdateFlashcardUseCase:
    def __init__(self, flashcard_repository: FlashcardRepository):
        self._flashcard_repository = flashcard_repository

    async def execute(self, data: UpdateFlashcardInput) -> FlashcardOutput:
        flashcard = await self._flashcard_repository.find_by_id(data.flashcard_id)
        if flashcard is None:
            raise FlashcardNotFound(data.flashcard_id)
        updated = await self._flashcard_repository.update_flashcard(
            replace(flashcard, front=data.front, back=data.back)
        )
        if updated is None:
            raise FlashcardNotFound(data.flashcard_id)
        return FlashcardOutput.from_entity(updated)
