from dataclasses import dataclass, field
from datetime import datetime
from typing import BinaryIO
from uuid import UUID

from papyruslm.domain.entities import Document, Notebook, Flashcard, Message
from papyruslm.domain.entities.document import DocumentStatus
from papyruslm.domain.entities.message import MessageRole
from papyruslm.domain.value_objects import Citation


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
class NotebookListItem:
    notebook: Notebook
    flashcards_total: int
    flashcards_due: int


@dataclass(frozen=True)
class ListNotebookOutput:
    total: int
    limit: int
    offset: int
    items: list[NotebookListItem]


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
class ListFlashcardsOutput:
    total: int
    limit: int
    offset: int
    items: list[FlashcardOutput]


@dataclass(frozen=True)
class ReviewFlashcardInput:
    flashcard_id: UUID
    review_quality: int


@dataclass(frozen=True)
class UpdateFlashcardInput:
    flashcard_id: UUID
    front: str
    back: str


@dataclass(frozen=True)
class AddDocumentInput:
    notebook_id: UUID
    filename: str
    content: BinaryIO


@dataclass(frozen=True)
class DocumentOutput:
    id: UUID
    notebook_id: UUID
    filename: str
    mime_type: str
    size_bytes: int
    status: DocumentStatus
    created_at: datetime

    @classmethod
    def from_entity(cls, document: Document) -> "DocumentOutput":
        return cls(
            id=document.id,
            notebook_id=document.notebook_id,
            filename=document.filename,
            mime_type=document.mime_type,
            size_bytes=document.size_bytes,
            status=document.status,
            created_at=document.created_at,
        )


@dataclass(frozen=True)
class AskQuestionInput:
    notebook_id: UUID
    question: str
    document_ids: list[UUID] | None = None


@dataclass(frozen=True)
class MessageOutput:
    id: UUID
    notebook_id: UUID
    role: MessageRole
    content: str
    citations: list[Citation]
    model: str | None
    created_at: datetime

    @classmethod
    def from_entity(cls, message: Message) -> "MessageOutput":
        return cls(
            id=message.id,
            notebook_id=message.notebook_id,
            role=message.role,
            content=message.content,
            citations=list(message.citations),
            model=message.model,
            created_at=message.created_at,
        )


@dataclass(frozen=True)
class AnswerDelta:
    text: str


@dataclass(frozen=True)
class AnswerCompleted:
    message: MessageOutput


ChatEvent = AnswerDelta | AnswerCompleted
