from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import StrEnum
from uuid import UUID, uuid4

from papyruslm.domain.exceptions import EmptyField, UserMessageWithSources
from papyruslm.domain.value_objects import Citation


class MessageRole(StrEnum):
    USER = "user"
    ASSISTANT = "assistant"


@dataclass
class Message:
    notebook_id: UUID
    role: MessageRole
    content: str
    citations: list[Citation] = field(default_factory=list)
    model: str | None = None
    id: UUID = field(default_factory=uuid4)
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def __post_init__(self):
        if not self.content.strip():
            raise EmptyField("content")
        if self.role is MessageRole.USER and (self.citations or self.model):
            raise UserMessageWithSources()
