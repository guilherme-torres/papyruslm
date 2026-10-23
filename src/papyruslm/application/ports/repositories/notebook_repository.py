from typing import Protocol
from uuid import UUID

from papyruslm.domain.entities import Notebook


class NotebookRepository(Protocol):
    async def create_notebook(self, notebook: Notebook) -> Notebook: ...
    async def list_notebooks(
        self,
        limit: int,
        offset: int,
        tags: list[str] | None = None,
    ) -> tuple[list[Notebook], int]: ...
    async def update_notebook(self, notebook: Notebook) -> Notebook: ...
    async def delete_notebook(self, id: UUID) -> None: ...
