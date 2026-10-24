from dataclasses import dataclass, field
from uuid import UUID, uuid4

from papyruslm.domain.exceptions import EmptyField, FieldTooLong

TAG_NAME_MAX_LENGTH = 100


@dataclass
class Tag:
    name: str
    id: UUID = field(default_factory=uuid4)

    def __post_init__(self):
        if not self.name.strip():
            raise EmptyField("name")
        if len(self.name) > TAG_NAME_MAX_LENGTH:
            raise FieldTooLong("name", TAG_NAME_MAX_LENGTH, len(self.name))
