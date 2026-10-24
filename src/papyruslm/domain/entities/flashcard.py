from datetime import datetime, timezone, timedelta
from dataclasses import dataclass, field
from uuid import UUID, uuid4

from papyruslm.domain.exceptions import EmptyField, InvalidEaseFactor, NegativeValue, ReviewNotDue
from papyruslm.domain.value_objects import ReviewQuality

MIN_EASE_FACTOR = 1.3


@dataclass
class Flashcard:
    front: str
    back: str
    notebook_id: UUID
    repetitions: int = 0
    interval_days: int = 0
    ease_factor: float = 2.5
    due_date: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    id: UUID = field(default_factory=uuid4)

    def __post_init__(self):
        if not self.front.strip():
            raise EmptyField("front")
        if not self.back.strip():
            raise EmptyField("back")
        if self.repetitions < 0:
            raise NegativeValue("repetitions", self.repetitions)
        if self.interval_days < 0:
            raise NegativeValue("interval_days", self.interval_days)
        if self.ease_factor < MIN_EASE_FACTOR:
            raise InvalidEaseFactor(self.ease_factor, MIN_EASE_FACTOR)

    def review(self, review_quality: ReviewQuality, now: datetime) -> None:
        if now < self.due_date:
            raise ReviewNotDue(self.due_date)

        if review_quality.is_failure:
            self.repetitions = 0
            self.interval_days = 1
        else:
            self.repetitions += 1

            if self.repetitions == 1:
                self.interval_days = 1
            elif self.repetitions == 2:
                self.interval_days = 6
            else:
                self.interval_days = round(self.interval_days * self.ease_factor)

            delta = 0.1 - (5 - review_quality.value) * (0.08 + (5 - review_quality.value) * 0.02)
            self.ease_factor = max(MIN_EASE_FACTOR, self.ease_factor + delta)

        self.due_date = now + timedelta(days=self.interval_days)
