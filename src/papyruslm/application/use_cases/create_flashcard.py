from papyruslm.application.dto import CreateFlashcardInput, FlashcardOutput
from papyruslm.application.ports.repositories.flashcard_repository import FlashcardRepository
from papyruslm.domain.entities.flashcard import Flashcard


class CreateFlashcardUseCase:
    def __init__(self, flashcard_repository: FlashcardRepository):
        self._flashcard_repository = flashcard_repository

    async def execute(self, flashcard: CreateFlashcardInput) -> FlashcardOutput:
        created = await self._flashcard_repository.create_flashcard(
            Flashcard(
                front=flashcard.front,
                back=flashcard.back,
                notebook_id=flashcard.notebook_id,
            )
        )
        return FlashcardOutput.from_entity(created)
