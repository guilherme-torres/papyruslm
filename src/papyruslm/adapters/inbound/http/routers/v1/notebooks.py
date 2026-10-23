from typing import Annotated
from uuid import UUID

from dishka.integrations.fastapi import DishkaRoute, FromDishka
from fastapi import APIRouter, Query, status

from papyruslm.adapters.inbound.http.routers.v1.schemas import (
    NotebookFilterParams,
    NotebookRequest,
    NotebookResponse,
    NotebookResponsePaginated,
)
from papyruslm.application.dto import CreateNotebookInput, UpdateNotebookInput
from papyruslm.application.use_cases.create_notebook import CreateNotebookUseCase
from papyruslm.application.use_cases.delete_notebook import DeleteNotebookUseCase
from papyruslm.application.use_cases.list_notebooks import ListNotebooksUseCase
from papyruslm.application.use_cases.update_notebook import UpdateNotebookUseCase


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
        items=[NotebookResponse.model_validate(notebook) for notebook in response.items]
    )


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
