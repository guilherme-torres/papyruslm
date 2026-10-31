from dataclasses import dataclass
from typing import Protocol

from papyruslm.domain.entities import Tag


@dataclass(frozen=True)
class TagUsage:
    tag: Tag
    notebooks_total: int


class TagRepository(Protocol):
    async def list_tags(self) -> list[TagUsage]: ...
