from papyruslm.application.dto import CreateFlashcardInput, FlashcardOutput
from papyruslm.application.exceptions import NotebookNotFound
from papyruslm.domain.repositories import FlashcardRepository, NotebookRepository
from papyruslm.domain.entities import Flashcard


class CreateFlashcardUseCase:
    def __init__(
        self,
        flashcard_repository: FlashcardRepository,
        notebook_repository: NotebookRepository,
    ):
        self._flashcard_repository = flashcard_repository
        self._notebook_repository = notebook_repository

    async def execute(self, flashcard: CreateFlashcardInput) -> FlashcardOutput:
        if not await self._notebook_repository.exists_by_id(flashcard.notebook_id):
            raise NotebookNotFound(flashcard.notebook_id)
        created = await self._flashcard_repository.create_flashcard(
            Flashcard(
                front=flashcard.front,
                back=flashcard.back,
                notebook_id=flashcard.notebook_id,
            )
        )
        return FlashcardOutput.from_entity(created)
