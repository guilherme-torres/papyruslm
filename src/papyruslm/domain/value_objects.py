from dataclasses import dataclass

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
