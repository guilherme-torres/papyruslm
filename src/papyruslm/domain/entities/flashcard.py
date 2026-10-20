from datetime import datetime, timezone, timedelta
from dataclasses import dataclass, field


@dataclass
class FlashCard:
    front: str
    back: str
    repetitions: int = 0
    interval_days: int = 0
    ease_factor: float = 2.5
    review_date: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def review(self, review_quality: int, now: datetime | None = None) -> None:
        if not 0 <= review_quality <= 5:
            raise ValueError("review_quality must be between 0 and 5")

        now = now or datetime.now(timezone.utc)

        if review_quality < 3:
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

            delta = 0.1 - (5 - review_quality) * (0.08 + (5 - review_quality) * 0.02)
            self.ease_factor = max(1.3, self.ease_factor + delta)

        self.review_date = now + timedelta(days=self.interval_days)
