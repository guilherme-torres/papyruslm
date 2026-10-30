from typing import Annotated
from uuid import UUID

from dishka.integrations.fastapi import DishkaRoute, FromDishka
from fastapi import APIRouter, Query, status

from papyruslm.adapters.inbound.http.routers.v1.schemas import (
    FlashcardFilterParams,
    FlashcardResponse,
    FlashcardResponsePaginated,
    NotebookFilterParams,
    NotebookListItemResponse,
    NotebookRequest,
    NotebookResponse,
    NotebookResponsePaginated,
)
from papyruslm.application.dto import CreateNotebookInput, UpdateNotebookInput
from papyruslm.application.use_cases import (
    CreateNotebookUseCase,
    GetNotebookUseCase,
    ListNotebooksUseCase,
    UpdateNotebookUseCase,
    DeleteNotebookUseCase,
    FindNextDueUseCase,
    ListFlashcardsUseCase,
)

router = APIRouter(prefix="/notebooks", tags=["notebooks"], route_class=DishkaRoute)


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_notebook(
    body: NotebookRequest,
    use_case: FromDishka[CreateNotebookUseCase],
) -> NotebookResponse:
    notebook = await use_case.execute(CreateNotebookInput(name=body.name, tags=body.tags))
    return NotebookResponse.model_validate(notebook)


@router.get("")
async def list_notebooks(
    params: Annotated[NotebookFilterParams, Query()],
    use_case: FromDishka[ListNotebooksUseCase],
) -> NotebookResponsePaginated:
    response = await use_case.execute(params.limit, params.offset, params.tags)
    return NotebookResponsePaginated(
        total=response.total,
        limit=response.limit,
        offset=response.offset,
        items=[
            NotebookListItemResponse(
                **NotebookResponse.model_validate(item.notebook).model_dump(),
                flashcards_total=item.flashcards_total,
                flashcards_due=item.flashcards_due,
            )
            for item in response.items
        ],
    )


@router.get("/{id}")
async def get_notebook(
    id: UUID,
    use_case: FromDishka[GetNotebookUseCase],
) -> NotebookResponse:
    notebook = await use_case.execute(id)
    return NotebookResponse.model_validate(notebook)


@router.put("/{id}")
async def update_notebook(
    id: UUID,
    body: NotebookRequest,
    use_case: FromDishka[UpdateNotebookUseCase],
) -> NotebookResponse:
    notebook = await use_case.execute(UpdateNotebookInput(id=id, name=body.name, tags=body.tags))
    return NotebookResponse.model_validate(notebook)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notebook(
    id: UUID,
    use_case: FromDishka[DeleteNotebookUseCase],
) -> None:
    await use_case.execute(id)


@router.get("/{id}/flashcards/next-due")
async def find_next_due(
    id: UUID,
    use_case: FromDishka[FindNextDueUseCase],
) -> FlashcardResponse | None:
    flashcard = await use_case.execute(id)
    if flashcard is None:
        return None
    return FlashcardResponse.model_validate(flashcard)


@router.get("/{id}/flashcards")
async def list_flashcards(
    id: UUID,
    params: Annotated[FlashcardFilterParams, Query()],
    use_case: FromDishka[ListFlashcardsUseCase],
) -> FlashcardResponsePaginated:
    output = await use_case.execute(id, params.limit, params.offset)
    return FlashcardResponsePaginated(
        total=output.total,
        limit=output.limit,
        offset=output.offset,
        items=[FlashcardResponse.model_validate(item) for item in output.items],
    )
