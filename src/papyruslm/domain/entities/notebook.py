from dataclasses import dataclass, field
from uuid import UUID, uuid4

from papyruslm.domain.entities.tag import Tag


@dataclass
class Notebook:
    name: str
    tags: list[Tag] = field(default_factory=list)
    id: UUID = field(default_factory=uuid4)
