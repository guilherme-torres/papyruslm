from uuid import UUID

from dishka.integrations.fastapi import DishkaRoute, FromDishka
from fastapi import APIRouter, status

from papyruslm.adapters.inbound.http.routers.v1.schemas import (
    FlashcardRequest,
    FlashcardResponse,
    ReviewRequest,
)
from papyruslm.application.dto import CreateFlashcardInput, ReviewFlashcardInput
from papyruslm.application.use_cases import (
    CreateFlashcardUseCase,
    ReviewFlashcardUseCase,
    DeleteFlashcardUseCase,
)

router = APIRouter(prefix="/flashcards", tags=["flashcards"], route_class=DishkaRoute)


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_flashcard(
    body: FlashcardRequest,
    use_case: FromDishka[CreateFlashcardUseCase],
) -> FlashcardResponse:
    flashcard = await use_case.execute(
        CreateFlashcardInput(front=body.front, back=body.back, notebook_id=body.notebook_id)
    )
    return FlashcardResponse.model_validate(flashcard)


@router.post("/{id}/review")
async def review_flashcard(
    id: UUID,
    body: ReviewRequest,
    use_case: FromDishka[ReviewFlashcardUseCase],
) -> FlashcardResponse:
    flashcard = await use_case.execute(
        ReviewFlashcardInput(flashcard_id=id, review_quality=body.review_quality)
    )
    return FlashcardResponse.model_validate(flashcard)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_flashcard(
    id: UUID,
    use_case: FromDishka[DeleteFlashcardUseCase],
) -> None:
    await use_case.execute(id)
