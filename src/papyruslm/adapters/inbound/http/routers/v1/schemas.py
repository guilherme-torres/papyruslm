from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class NotebookRequest(BaseModel):
    name: str
    tags: list[str] = []


class TagResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str


class NotebookResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    tags: list[TagResponse]


class NotebookListItemResponse(NotebookResponse):
    flashcards_total: int
    flashcards_due: int


class NotebookFilterParams(BaseModel):
    limit: int = Field(100, gt=0, le=100)
    offset: int = Field(0, ge=0)
    tags: list[str] = []


class NotebookResponsePaginated(BaseModel):
    total: int
    limit: int
    offset: int
    items: list[NotebookListItemResponse]


class FlashcardRequest(BaseModel):
    front: str
    back: str
    notebook_id: UUID


class FlashcardUpdateRequest(BaseModel):
    front: str
    back: str


class ReviewRequest(BaseModel):
    review_quality: int


class FlashcardFilterParams(BaseModel):
    limit: int = Field(100, gt=0, le=100)
    offset: int = Field(0, ge=0)


class FlashcardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    notebook_id: UUID
    front: str
    back: str
    due_date: datetime


class FlashcardResponsePaginated(BaseModel):
    total: int
    limit: int
    offset: int
    items: list[FlashcardResponse]
