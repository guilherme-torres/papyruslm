from datetime import datetime


class DomainException(Exception): ...


class InvalidReviewQuality(DomainException):
    def __init__(self, review_quality: int):
        self.review_quality = review_quality
        super().__init__(f"review_quality must be between 0 and 5, got {review_quality}")


class ReviewNotDue(DomainException):
    def __init__(self, next_review_date: datetime):
        self.next_review_date = next_review_date
        super().__init__(f"Flashcard is not due for review until {next_review_date.isoformat()}")
