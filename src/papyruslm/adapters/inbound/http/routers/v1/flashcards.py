from uuid import UUID

from dishka.integrations.fastapi import DishkaRoute, FromDishka
from fastapi import APIRouter, status

from papyruslm.adapters.inbound.http.routers.v1.schemas import (
    FlashcardRequest,
    FlashcardResponse,
    FlashcardUpdateRequest,
    ReviewRequest,
)
from papyruslm.application.dto import (
    CreateFlashcardInput,
    ReviewFlashcardInput,
    UpdateFlashcardInput,
)
from papyruslm.application.use_cases import (
    CreateFlashcardUseCase,
    ReviewFlashcardUseCase,
    DeleteFlashcardUseCase,
    UpdateFlashcardUseCase,
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


@router.put("/{id}")
async def update_flashcard(
    id: UUID,
    body: FlashcardUpdateRequest,
    use_case: FromDishka[UpdateFlashcardUseCase],
) -> FlashcardResponse:
    flashcard = await use_case.execute(
        UpdateFlashcardInput(flashcard_id=id, front=body.front, back=body.back)
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
