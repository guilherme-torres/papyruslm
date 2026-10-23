from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID

from papyruslm.domain.entities import Notebook, Flashcard


@dataclass(frozen=True)
class CreateFlashcardInput:
    front: str
    back: str
    notebook_id: UUID


@dataclass(frozen=True)
class CreateNotebookInput:
    name: str
    tags: list[str] = field(default_factory=list)


@dataclass(frozen=True)
class UpdateNotebookInput:
    id: UUID
    name: str
    tags: list[str] = field(default_factory=list)


@dataclass(frozen=True)
class ListNotebookOutput:
    total: int
    limit: int
    offset: int
    items: list[Notebook]


@dataclass(frozen=True)
class FlashcardOutput:
    id: UUID
    notebook_id: UUID
    front: str
    back: str
    due_date: datetime

    @classmethod
    def from_entity(cls, flashcard: Flashcard) -> "FlashcardOutput":
        return cls(
            id=flashcard.id,
            notebook_id=flashcard.notebook_id,
            front=flashcard.front,
            back=flashcard.back,
            due_date=flashcard.due_date,
        )


@dataclass(frozen=True)
class ReviewFlashcardInput:
    flashcard_id: UUID
    review_quality: int
