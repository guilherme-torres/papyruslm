from dataclasses import dataclass
from uuid import UUID

from papyruslm.domain.exceptions import InvalidReviewQuality


@dataclass(frozen=True)
class ReviewQuality:
    value: int

    def __post_init__(self):
        if not 0 <= self.value <= 5:
            raise InvalidReviewQuality(self.value)

    @property
    def is_failure(self) -> bool:
        return self.value < 3


@dataclass(frozen=True)
class Citation:
    index: int
    document_id: UUID
    document_name: str
    start: int
    end: int
    excerpt: str
    content_checksum: str
