from dataclasses import dataclass
from hashlib import sha256
from uuid import UUID

from papyruslm.domain.exceptions import EmptyField, InvalidTextRange


@dataclass(frozen=True)
class DocumentContent:
    document_id: UUID
    text: str
    checksum: str

    @classmethod
    def from_text(cls, document_id: UUID, text: str) -> "DocumentContent":
        return cls(document_id=document_id, text=text, checksum=sha256(text.encode()).hexdigest())

    def __post_init__(self):
        if not self.text.strip():
            raise EmptyField("text")

    def excerpt(self, start: int, end: int) -> str:
        if not 0 <= start < end <= len(self.text):
            raise InvalidTextRange(start, end)
        return self.text[start:end]
