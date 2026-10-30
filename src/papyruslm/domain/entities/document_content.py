from dataclasses import dataclass
from hashlib import sha256
from uuid import UUID

from papyruslm.domain.exceptions import EmptyField, InvalidTextRange
from papyruslm.domain.value_objects import Citation


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

    def locate(self, citation: Citation) -> tuple[int, int] | None:
        if citation.document_id != self.document_id:
            return None
        if citation.content_checksum == self.checksum and self.text[citation.start : citation.end] == citation.excerpt:
            return citation.start, citation.end
        position = self.text.find(citation.excerpt)
        if position < 0:
            return None
        return position, position + len(citation.excerpt)
