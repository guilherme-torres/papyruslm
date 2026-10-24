from papyruslm.application.dto import ListNotebookOutput
from papyruslm.domain.repositories import NotebookRepository


class ListNotebooksUseCase:
    def __init__(self, notebook_repository: NotebookRepository):
        self._notebook_repository = notebook_repository

    async def execute(
        self,
        limit: int = 100,
        offset: int = 0,
        tags: list[str] | None = None
    ) -> ListNotebookOutput:
        notebooks, total = await self._notebook_repository.list_notebooks(limit, offset, tags)
        return ListNotebookOutput(
            total=total,
            limit=limit,
            offset=offset,
            items=notebooks,
        )
