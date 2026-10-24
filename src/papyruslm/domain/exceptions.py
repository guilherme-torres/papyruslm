from datetime import datetime


class DomainException(Exception): ...


class DomainValidationError(DomainException): ...


class InvalidReviewQuality(DomainValidationError):
    def __init__(self, review_quality: int):
        self.review_quality = review_quality
        super().__init__(f"review_quality must be between 0 and 5, got {review_quality}")


class EmptyField(DomainValidationError):
    def __init__(self, field: str):
        self.field = field
        super().__init__(f"{field} must not be empty")


class NegativeValue(DomainValidationError):
    def __init__(self, field: str, value: int):
        self.field = field
        self.value = value
        super().__init__(f"{field} must not be negative, got {value}")


class InvalidEaseFactor(DomainValidationError):
    def __init__(self, value: float, minimum: float):
        self.value = value
        self.minimum = minimum
        super().__init__(f"ease_factor must be >= {minimum}, got {value}")


class FieldTooLong(DomainValidationError):
    def __init__(self, field: str, max_length: int, length: int):
        self.field = field
        self.max_length = max_length
        self.length = length
        super().__init__(f"{field} must have at most {max_length} characters, got {length}")


class ReviewNotDue(DomainException):
    def __init__(self, next_review_date: datetime):
        self.next_review_date = next_review_date
        super().__init__(f"Flashcard is not due for review until {next_review_date.isoformat()}")
