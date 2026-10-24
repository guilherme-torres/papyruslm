import uuid

from papyruslm.application.exceptions import NotebookNotFound
from papyruslm.domain.repositories import NotebookRepository


class DeleteNotebookUseCase:
    def __init__(self, notebook_repository: NotebookRepository):
        self._notebook_repository = notebook_repository

    async def execute(self, id: uuid.UUID) -> None:
        if not await self._notebook_repository.delete_notebook(id):
            raise NotebookNotFound(id)
