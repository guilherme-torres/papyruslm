from dataclasses import dataclass, field
import uuid

from papyruslm.domain.entities.tag import Tag


@dataclass
class Notebook:
    name: str
    tags: list[Tag] = field(default_factory=list)
    id: uuid.UUID = field(default_factory=uuid.uuid4)
