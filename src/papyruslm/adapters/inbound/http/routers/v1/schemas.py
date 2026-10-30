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


class ListTagsResponse(BaseModel):
    items: list[TagResponse]


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


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    notebook_id: UUID
    filename: str
    mime_type: str
    size_bytes: int
    status: str
    created_at: datetime


class CitationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    index: int
    document_id: UUID
    document_name: str
    start: int
    end: int
    excerpt: str


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    notebook_id: UUID
    role: str
    content: str
    citations: list[CitationResponse]
    model: str | None
    created_at: datetime


class MessageFilterParams(BaseModel):
    limit: int = Field(50, gt=0, le=100)
    offset: int = Field(0, ge=0)


class MessageResponsePaginated(BaseModel):
    total: int
    limit: int
    offset: int
    items: list[MessageResponse]


class AskQuestionRequest(BaseModel):
    question: str
    document_ids: list[UUID] | None = None
