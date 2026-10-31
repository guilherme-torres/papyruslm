from papyruslm.domain.repositories import TagRepository
from papyruslm.domain.repositories.tag import TagUsage


class ListTagsUseCase:
    def __init__(self, tags_repository: TagRepository):
        self._tags_repository = tags_repository

    async def execute(self) -> list[TagUsage]:
        return await self._tags_repository.list_tags()
