from datetime import datetime, timezone

from papyruslm.application.dto import FlashcardOutput, ReviewFlashcardInput
from papyruslm.application.exceptions import FlashcardNotFound
from papyruslm.domain.repositories import FlashcardRepository
from papyruslm.domain.value_objects import ReviewQuality


class ReviewFlashcardUseCase:
    def __init__(self, flashcard_repository: FlashcardRepository):
        self._flashcard_repository = flashcard_repository

    async def execute(self, review: ReviewFlashcardInput, now: datetime | None = None) -> FlashcardOutput:
        review_quality = ReviewQuality(review.review_quality)
        now = now or datetime.now(timezone.utc)
        flashcard = await self._flashcard_repository.find_by_id(review.flashcard_id)
        if flashcard is None:
            raise FlashcardNotFound(review.flashcard_id)
        flashcard.review(review_quality, now)
        flashcard = await self._flashcard_repository.update_flashcard(flashcard)
        if flashcard is None:
            raise FlashcardNotFound(review.flashcard_id)
        return FlashcardOutput.from_entity(flashcard)
