from papyruslm.application.ports.notebook_repository import NotebookRepository
from papyruslm.domain.entities import Notebook


class UpdateNotebookUseCase:
    def __init__(self, notebook_repository: NotebookRepository):
        self._notebook_repository = notebook_repository

    async def execute(self, notebook: Notebook) -> None:
        return await self._notebook_repository.update_notebook(notebook)
