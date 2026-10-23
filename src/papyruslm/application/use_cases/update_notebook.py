from papyruslm.application.dto import UpdateNotebookInput
from papyruslm.application.ports.repositories.notebook_repository import NotebookRepository
from papyruslm.domain.entities import Notebook, Tag


class UpdateNotebookUseCase:
    def __init__(self, notebook_repository: NotebookRepository):
        self._notebook_repository = notebook_repository

    async def execute(self, notebook: UpdateNotebookInput) -> Notebook:
        return await self._notebook_repository.update_notebook(
            Notebook(
                id=notebook.id,
                name=notebook.name,
                tags=[Tag(name=name) for name in notebook.tags],
            )
        )
