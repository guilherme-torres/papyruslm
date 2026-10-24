from typing import Protocol
from uuid import UUID

from papyruslm.domain.entities import Tag


class TagRepository(Protocol):
    async def list_tags(
        self,
        limit: int,
        offset: int,
    ) -> list[Tag]: ...
    async def update_tag(self, tag: Tag) -> None: ...
    async def delete_tag(self, id: UUID) -> None: ...
