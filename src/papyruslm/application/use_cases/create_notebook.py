from papyruslm.application.ports.repositories.notebook_repository import NotebookRepository
from papyruslm.domain.entities import Notebook


class CreateNotebookUseCase:
    def __init__(self, notebook_repository: NotebookRepository):
        self._notebook_repository = notebook_repository

    async def execute(self, notebook: Notebook) -> None:
        return await self._notebook_repository.create_notebook(notebook)
