from papyruslm.application.dto import CreateNotebookInput
from papyruslm.application.ports.repositories.notebook_repository import NotebookRepository
from papyruslm.domain.entities import Notebook, Tag


class CreateNotebookUseCase:
    def __init__(self, notebook_repository: NotebookRepository):
        self._notebook_repository = notebook_repository

    async def execute(self, notebook: CreateNotebookInput) -> Notebook:
        return await self._notebook_repository.create_notebook(
            Notebook(
                name=notebook.name,
                tags=[Tag(name=name) for name in notebook.tags],
            )
        )
