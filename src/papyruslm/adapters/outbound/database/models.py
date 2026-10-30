from datetime import datetime
from uuid import UUID

from typing import Any

from sqlalchemy import JSON, Column, ForeignKey, Index, String, Table, Text, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

from papyruslm.adapters.outbound.database.types import UTCDateTime
from papyruslm.domain.entities import Chunk, Document, DocumentContent, Flashcard, Message, Notebook, Tag
from papyruslm.domain.entities.document import DocumentStatus
from papyruslm.domain.entities.message import MessageRole
from papyruslm.domain.value_objects import Citation


class Base(DeclarativeBase):
    type_annotation_map = {datetime: UTCDateTime}


tags_notebooks = Table(
    "tags_notebooks",
    Base.metadata,
    Column("tag_id", ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
    Column("notebook_id", ForeignKey("notebooks.id", ondelete="CASCADE"), primary_key=True),
)


class SQLAlchemyNotebook(Base):
    __tablename__ = "notebooks"

    id: Mapped[UUID] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    tags: Mapped[list["SQLAlchemyTag"]] = relationship(secondary=tags_notebooks, lazy="selectin")

    def to_entity(self) -> Notebook:
        return Notebook(id=self.id, name=self.name, tags=[tag.to_entity() for tag in self.tags])


class SQLAlchemyTag(Base):
    __tablename__ = "tags"

    id: Mapped[UUID] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    def to_entity(self) -> Tag:
        return Tag(id=self.id, name=self.name)


class SQLAlchemyFlashcard(Base):
    __tablename__ = "flashcards"
    __table_args__ = (Index("ix_flashcards_notebook_due", "notebook_id", "due_date"),)

    id: Mapped[UUID] = mapped_column(primary_key=True)
    front: Mapped[str] = mapped_column(Text)
    back: Mapped[str] = mapped_column(Text)
    notebook_id: Mapped[UUID] = mapped_column(ForeignKey("notebooks.id", ondelete="CASCADE"))
    repetitions: Mapped[int]
    interval_days: Mapped[int]
    ease_factor: Mapped[float]
    due_date: Mapped[datetime]
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    @classmethod
    def from_entity(cls, flashcard: Flashcard) -> "SQLAlchemyFlashcard":
        return cls(
            id=flashcard.id,
            front=flashcard.front,
            back=flashcard.back,
            notebook_id=flashcard.notebook_id,
            repetitions=flashcard.repetitions,
            interval_days=flashcard.interval_days,
            ease_factor=flashcard.ease_factor,
            due_date=flashcard.due_date,
        )

    def to_entity(self) -> Flashcard:
        return Flashcard(
            id=self.id,
            front=self.front,
            back=self.back,
            notebook_id=self.notebook_id,
            repetitions=self.repetitions,
            interval_days=self.interval_days,
            ease_factor=self.ease_factor,
            due_date=self.due_date,
        )


class SQLAlchemyDocument(Base):
    __tablename__ = "documents"
    __table_args__ = (
        Index("ix_documents_notebook_created", "notebook_id", "created_at"),
        Index("ix_documents_status_created", "status", "created_at"),
    )

    id: Mapped[UUID] = mapped_column(primary_key=True)
    notebook_id: Mapped[UUID] = mapped_column(ForeignKey("notebooks.id", ondelete="CASCADE"))
    filename: Mapped[str] = mapped_column(String(255))
    file_key: Mapped[str] = mapped_column(String(255))
    size_bytes: Mapped[int]
    mime_type: Mapped[str] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(20))
    embedding_model: Mapped[str | None] = mapped_column(String(255))
    attempts: Mapped[int] = mapped_column(default=0)
    lease_version: Mapped[int] = mapped_column(default=0)
    heartbeat_at: Mapped[datetime | None]
    created_at: Mapped[datetime]
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    @classmethod
    def from_entity(cls, document: Document) -> "SQLAlchemyDocument":
        return cls(
            id=document.id,
            notebook_id=document.notebook_id,
            filename=document.filename,
            file_key=document.file_key,
            size_bytes=document.size_bytes,
            mime_type=document.mime_type,
            status=document.status,
            embedding_model=document.embedding_model,
            attempts=document.attempts,
            lease_version=document.lease_version,
            heartbeat_at=document.heartbeat_at,
            created_at=document.created_at,
        )

    def to_entity(self) -> Document:
        return Document(
            id=self.id,
            notebook_id=self.notebook_id,
            filename=self.filename,
            file_key=self.file_key,
            size_bytes=self.size_bytes,
            mime_type=self.mime_type,
            status=DocumentStatus(self.status),
            embedding_model=self.embedding_model,
            attempts=self.attempts,
            lease_version=self.lease_version,
            heartbeat_at=self.heartbeat_at,
            created_at=self.created_at,
        )


class SQLAlchemyDocumentContent(Base):
    __tablename__ = "document_contents"

    document_id: Mapped[UUID] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"), primary_key=True)
    text: Mapped[str] = mapped_column(Text)
    checksum: Mapped[str] = mapped_column(String(64))

    def to_entity(self) -> DocumentContent:
        return DocumentContent(document_id=self.document_id, text=self.text, checksum=self.checksum)


class SQLAlchemyChunk(Base):
    __tablename__ = "chunks"
    __table_args__ = (Index("ix_chunks_document_position", "document_id", "position"),)

    id: Mapped[UUID] = mapped_column(primary_key=True)
    document_id: Mapped[UUID] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"))
    position: Mapped[int]
    start: Mapped[int]
    end: Mapped[int]
    text: Mapped[str] = mapped_column(Text)

    @classmethod
    def from_entity(cls, chunk: Chunk) -> "SQLAlchemyChunk":
        return cls(
            id=chunk.id,
            document_id=chunk.document_id,
            position=chunk.position,
            start=chunk.start,
            end=chunk.end,
            text=chunk.text,
        )

    def to_entity(self) -> Chunk:
        return Chunk(
            id=self.id,
            document_id=self.document_id,
            position=self.position,
            start=self.start,
            end=self.end,
            text=self.text,
        )


class SQLAlchemyMessage(Base):
    __tablename__ = "messages"
    __table_args__ = (Index("ix_messages_notebook_created", "notebook_id", "created_at"),)

    id: Mapped[UUID] = mapped_column(primary_key=True)
    notebook_id: Mapped[UUID] = mapped_column(ForeignKey("notebooks.id", ondelete="CASCADE"))
    role: Mapped[str] = mapped_column(String(20))
    content: Mapped[str] = mapped_column(Text)
    citations: Mapped[list[dict[str, Any]]] = mapped_column(JSON)
    model: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[datetime]

    @classmethod
    def from_entity(cls, message: Message) -> "SQLAlchemyMessage":
        return cls(
            id=message.id,
            notebook_id=message.notebook_id,
            role=message.role,
            content=message.content,
            citations=[_citation_to_dict(citation) for citation in message.citations],
            model=message.model,
            created_at=message.created_at,
        )

    def to_entity(self) -> Message:
        return Message(
            id=self.id,
            notebook_id=self.notebook_id,
            role=MessageRole(self.role),
            content=self.content,
            citations=[_citation_from_dict(data) for data in self.citations],
            model=self.model,
            created_at=self.created_at,
        )


def _citation_to_dict(citation: Citation) -> dict[str, Any]:
    return {
        "index": citation.index,
        "document_id": str(citation.document_id),
        "document_name": citation.document_name,
        "start": citation.start,
        "end": citation.end,
        "excerpt": citation.excerpt,
        "content_checksum": citation.content_checksum,
    }


def _citation_from_dict(data: dict[str, Any]) -> Citation:
    return Citation(**{**data, "document_id": UUID(data["document_id"])})
