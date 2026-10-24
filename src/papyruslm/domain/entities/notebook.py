from dataclasses import dataclass, field
from uuid import UUID, uuid4

from papyruslm.domain.entities.tag import Tag
from papyruslm.domain.exceptions import EmptyField, FieldTooLong

NOTEBOOK_NAME_MAX_LENGTH = 255


@dataclass
class Notebook:
    name: str
    tags: list[Tag] = field(default_factory=list)
    id: UUID = field(default_factory=uuid4)

    def __post_init__(self):
        if not self.name.strip():
            raise EmptyField("name")
        if len(self.name) > NOTEBOOK_NAME_MAX_LENGTH:
            raise FieldTooLong("name", NOTEBOOK_NAME_MAX_LENGTH, len(self.name))
