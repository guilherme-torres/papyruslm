from typing import Annotated
from uuid import UUID

from dishka.integrations.fastapi import DishkaRoute, FromDishka
from fastapi import APIRouter, Query, status

from papyruslm.adapters.inbound.http.routers.v1.schemas import (
    NotebookFilterParams,
    NotebookIn,
    NotebookOut,
    NotebookPage,
)
from papyruslm.application.use_cases.create_notebook import CreateNotebookUseCase
from papyruslm.application.use_cases.delete_notebook import DeleteNotebookUseCase
from papyruslm.application.use_cases.list_notebooks import ListNotebooksUseCase
from papyruslm.application.use_cases.update_notebook import UpdateNotebookUseCase
from papyruslm.domain.entities import Notebook, Tag


router = APIRouter(prefix="/notebooks", tags=["notebooks"], route_class=DishkaRoute)


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_notebook(
    body: NotebookIn,
    use_case: FromDishka[CreateNotebookUseCase],
) -> NotebookOut:
    notebook = Notebook(name=body.name, tags=[Tag(name=name) for name in body.tags])
    await use_case.execute(notebook)
    return NotebookOut.model_validate(notebook)


@router.get("")
async def list_notebooks(
    params: Annotated[NotebookFilterParams, Query()],
    use_case: FromDishka[ListNotebooksUseCase],
) -> NotebookPage:
    notebooks = await use_case.execute(params.limit, params.offset, params.tags)
    return NotebookPage(
        items=[NotebookOut.model_validate(notebook) for notebook in notebooks],
        limit=params.limit,
        offset=params.offset,
    )


@router.put("/{id}")
async def update_notebook(
    id: UUID,
    body: NotebookIn,
    use_case: FromDishka[UpdateNotebookUseCase],
) -> NotebookOut:
    notebook = Notebook(id=id, name=body.name, tags=[Tag(name=name) for name in body.tags])
    await use_case.execute(notebook)
    return NotebookOut.model_validate(notebook)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notebook(
    id: UUID,
    use_case: FromDishka[DeleteNotebookUseCase],
) -> None:
    await use_case.execute(id)
