from datetime import datetime, timezone, timedelta
from dataclasses import dataclass, field
from uuid import UUID, uuid4

from papyruslm.domain.exceptions import ReviewNotDue
from papyruslm.domain.value_objects import ReviewQuality


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
            self.ease_factor = max(1.3, self.ease_factor + delta)

        self.due_date = now + timedelta(days=self.interval_days)
