from dataclasses import dataclass, field
from uuid import UUID, uuid4

from papyruslm.domain.exceptions import EmptyField, InvalidTextRange, NegativeValue


@dataclass(frozen=True)
class Chunk:
    document_id: UUID
    position: int
    start: int
    end: int
    text: str
    id: UUID = field(default_factory=uuid4)

    def __post_init__(self):
        if not self.text.strip():
            raise EmptyField("text")
        if self.position < 0:
            raise NegativeValue("position", self.position)
        if self.start < 0 or self.end <= self.start:
            raise InvalidTextRange(self.start, self.end)
