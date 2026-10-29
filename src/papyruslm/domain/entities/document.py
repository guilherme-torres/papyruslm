from dataclasses import dataclass, field
from datetime import datetime, timezone
from uuid import UUID, uuid4
from enum import StrEnum

from papyruslm.domain.exceptions import (
    EmptyField,
    FieldTooLong,
    FileTooLarge,
    InvalidStatusTransition,
    UnsupportedMimeType,
)

FILENAME_MAX_LENGTH = 255


class DocumentType(StrEnum):
    PDF = "pdf"
    DOCX = "docx"
    TEXT = "text"
    MARKDOWN = "markdown"
    AUDIO = "audio"


MIME_TYPE_TO_DOCUMENT_TYPE: dict[str, DocumentType] = {
    "application/pdf": DocumentType.PDF,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": DocumentType.DOCX,
    "text/plain": DocumentType.TEXT,
    "text/markdown": DocumentType.MARKDOWN,
    "audio/mpeg": DocumentType.AUDIO,
    "audio/wav": DocumentType.AUDIO,
    "audio/mp4": DocumentType.AUDIO,
    "audio/ogg": DocumentType.AUDIO,
    "audio/webm": DocumentType.AUDIO,
    "audio/flac": DocumentType.AUDIO,
}


MAX_SIZE_BYTES: dict[DocumentType, int] = {
    DocumentType.PDF: 50 * 1024 * 1024,
    DocumentType.DOCX: 50 * 1024 * 1024,
    DocumentType.TEXT: 10 * 1024 * 1024,
    DocumentType.MARKDOWN: 10 * 1024 * 1024,
    DocumentType.AUDIO: 200 * 1024 * 1024,
}


class DocumentStatus(StrEnum):
    PENDING = "pending"
    PROCESSING = "processing"
    READY = "ready"
    FAILED = "failed"


@dataclass
class Document:
    notebook_id: UUID
    filename: str
    file_key: str
    size_bytes: int
    mime_type: str
    status: DocumentStatus = DocumentStatus.PENDING
    embedding_model: str | None = None
    id: UUID = field(default_factory=uuid4)
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def __post_init__(self):
        if not self.filename.strip():
            raise EmptyField("filename")
        if len(self.filename) > FILENAME_MAX_LENGTH:
            raise FieldTooLong("filename", FILENAME_MAX_LENGTH, len(self.filename))
        if self.mime_type not in MIME_TYPE_TO_DOCUMENT_TYPE:
            raise UnsupportedMimeType(self.mime_type)
        if self.size_bytes <= 0:
            raise EmptyField("size_bytes")
        if self.size_bytes > MAX_SIZE_BYTES[self.document_type]:
            raise FileTooLarge(self.size_bytes, MAX_SIZE_BYTES[self.document_type])

    @property
    def document_type(self) -> DocumentType:
        return MIME_TYPE_TO_DOCUMENT_TYPE[self.mime_type]

    def mark_processing(self) -> None:
        self._status_transition(
            from_status={DocumentStatus.PENDING, DocumentStatus.FAILED},
            to_status=DocumentStatus.PROCESSING,
        )

    def mark_ready(self, embedding_model: str) -> None:
        self._status_transition(
            from_status={DocumentStatus.PROCESSING},
            to_status=DocumentStatus.READY,
        )
        self.embedding_model = embedding_model

    def mark_failed(self) -> None:
        self._status_transition(
            from_status={DocumentStatus.PROCESSING},
            to_status=DocumentStatus.FAILED,
        )

    def _status_transition(self, from_status: set[DocumentStatus], to_status: DocumentStatus) -> None:
        if self.status not in from_status:
            raise InvalidStatusTransition(self.status, to_status)
        self.status = to_status
