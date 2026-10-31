from dishka.integrations.fastapi import DishkaRoute, FromDishka
from fastapi import APIRouter

from papyruslm.adapters.inbound.http.routers.v1.schemas import ListTagsResponse, TagListItemResponse
from papyruslm.application.use_cases import ListTagsUseCase

router = APIRouter(prefix="/tags", tags=["tags"], route_class=DishkaRoute)


@router.get("")
async def list_tags(use_case: FromDishka[ListTagsUseCase]) -> ListTagsResponse:
    tags = await use_case.execute()
    return ListTagsResponse(
        items=[
            TagListItemResponse(id=item.tag.id, name=item.tag.name, notebooks_total=item.notebooks_total)
            for item in tags
        ]
    )
