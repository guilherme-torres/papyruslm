from datetime import datetime, timezone

from papyruslm.application.dto import ListNotebookOutput, NotebookListItem
from papyruslm.domain.repositories import FlashcardRepository, NotebookRepository


class ListNotebooksUseCase:
    def __init__(
        self,
        notebook_repository: NotebookRepository,
        flashcard_repository: FlashcardRepository,
    ):
        self._notebook_repository = notebook_repository
        self._flashcard_repository = flashcard_repository

    async def execute(
        self,
        limit: int = 100,
        offset: int = 0,
        tags: list[str] | None = None,
        now: datetime | None = None,
    ) -> ListNotebookOutput:
        now = now or datetime.now(timezone.utc)
        notebooks, total = await self._notebook_repository.list_notebooks(limit, offset, tags)
        counts = await self._flashcard_repository.count_by_notebooks(
            [notebook.id for notebook in notebooks], now
        )
        return ListNotebookOutput(
            total=total,
            limit=limit,
            offset=offset,
            items=[
                NotebookListItem(
                    notebook=notebook,
                    flashcards_total=counts[notebook.id].total,
                    flashcards_due=counts[notebook.id].due,
                )
                for notebook in notebooks
            ],
        )
