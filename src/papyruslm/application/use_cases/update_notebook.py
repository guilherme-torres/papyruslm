from papyruslm.application.dto import UpdateNotebookInput
from papyruslm.application.exceptions import NotebookNotFound
from papyruslm.domain.repositories import NotebookRepository
from papyruslm.domain.entities import Notebook, Tag


class UpdateNotebookUseCase:
    def __init__(self, notebook_repository: NotebookRepository):
        self._notebook_repository = notebook_repository

    async def execute(self, notebook: UpdateNotebookInput) -> Notebook:
        updated = await self._notebook_repository.update_notebook(
            Notebook(
                id=notebook.id,
                name=notebook.name,
                tags=[Tag(name=name) for name in notebook.tags],
            )
        )
        if updated is None:
            raise NotebookNotFound(notebook.id)
        return updated
