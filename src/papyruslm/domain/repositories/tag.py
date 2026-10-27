from typing import Protocol
from uuid import UUID

from papyruslm.domain.entities import Tag


class TagRepository(Protocol):
    async def list_tags(self) -> list[Tag]: ...
