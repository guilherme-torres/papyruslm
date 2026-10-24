from uuid import UUID

from papyruslm.application.dto import FlashcardOutput, ListFlashcardsOutput
from papyruslm.application.exceptions import NotebookNotFound
from papyruslm.domain.repositories import FlashcardRepository, NotebookRepository


class ListFlashcardsUseCase:
    def __init__(
        self,
        flashcard_repository: FlashcardRepository,
        notebook_repository: NotebookRepository,
    ):
        self._flashcard_repository = flashcard_repository
        self._notebook_repository = notebook_repository

    async def execute(
        self,
        notebook_id: UUID,
        limit: int = 100,
        offset: int = 0,
    ) -> ListFlashcardsOutput:
        if not await self._notebook_repository.exists_by_id(notebook_id):
            raise NotebookNotFound(notebook_id)
        flashcards, total = await self._flashcard_repository.list_flashcards_by_notebook_id(
            notebook_id=notebook_id,
            limit=limit,
            offset=offset,
        )
        return ListFlashcardsOutput(
            total=total,
            limit=limit,
            offset=offset,
            items=[FlashcardOutput.from_entity(flashcard) for flashcard in flashcards],
        )
