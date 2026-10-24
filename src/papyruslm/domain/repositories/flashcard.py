from dataclasses import dataclass
from datetime import datetime
from typing import Protocol
from uuid import UUID

from papyruslm.domain.entities.flashcard import Flashcard


@dataclass(frozen=True)
class FlashcardCounts:
    total: int
    due: int


class FlashcardRepository(Protocol):
    async def create_flashcard(self, flashcard: Flashcard) -> Flashcard: ...
    async def find_by_id(self, id: UUID) -> Flashcard | None: ...
    async def delete_flashcard(self, id: UUID) -> bool: ...
    async def update_flashcard(self, flashcard: Flashcard) -> Flashcard | None: ...
    async def count_by_notebooks(self, notebook_ids: list[UUID], now: datetime) -> dict[UUID, FlashcardCounts]: ...
    async def find_next_due(self, notebook_id: UUID, now: datetime) -> Flashcard | None: ...
    async def list_flashcards_by_notebook_id(
        self,
        notebook_id: UUID,
        limit: int,
        offset: int,
    ) -> tuple[list[Flashcard], int]: ...
