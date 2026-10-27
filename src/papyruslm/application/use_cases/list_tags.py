from papyruslm.domain.entities import Tag
from papyruslm.domain.repositories import TagRepository


class ListTagsUseCase:
    def __init__(self, tags_repository: TagRepository):
        self._tags_repository = tags_repository

    async def execute(self) -> list[Tag]:
        return await self._tags_repository.list_tags()
