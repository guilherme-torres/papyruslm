from typing import Protocol
import uuid

from papyruslm.domain.entities import Notebook, Tag


class NotebookRepository(Protocol):
    async def create_notebook(self, notebook: Notebook) -> None: ...
    async def list_notebooks(
        self,
        limit: int,
        offset: int,
        tags: list[str] | None = None,
    ) -> list[Notebook]: ...
    async def update_notebook(self, notebook: Notebook) -> None: ...
    async def delete_notebook(self, id: uuid.UUID) -> None: ...
