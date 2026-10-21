import uuid

from papyruslm.application.ports.repositories.notebook_repository import NotebookRepository


class DeleteNotebookUseCase:
    def __init__(self, notebook_repository: NotebookRepository):
        self._notebook_repository = notebook_repository

    async def execute(self, id: uuid.UUID) -> None:
        return await self._notebook_repository.delete_notebook(id)
