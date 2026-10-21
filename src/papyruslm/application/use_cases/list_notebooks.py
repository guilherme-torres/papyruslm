from papyruslm.application.ports.repositories.notebook_repository import NotebookRepository
from papyruslm.domain.entities import Notebook


class ListNotebooksUseCase:
    def __init__(self, notebook_repository: NotebookRepository):
        self._notebook_repository = notebook_repository

    async def execute(
        self,
        limit: int = 100,
        offset: int = 0,
        tags: list[str] | None = None
    ) -> list[Notebook]:
        return await self._notebook_repository.list_notebooks(limit, offset, tags)
