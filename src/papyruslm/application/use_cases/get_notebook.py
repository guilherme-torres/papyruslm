from uuid import UUID

from papyruslm.application.exceptions import NotebookNotFound
from papyruslm.domain.entities import Notebook
from papyruslm.domain.repositories import NotebookRepository


class GetNotebookUseCase:
    def __init__(self, notebook_repository: NotebookRepository):
        self._notebook_repository = notebook_repository

    async def execute(self, notebook_id: UUID) -> Notebook:
        notebook = await self._notebook_repository.find_by_id(notebook_id)
        if notebook is None:
            raise NotebookNotFound(notebook_id)
        return notebook
