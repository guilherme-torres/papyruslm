from collections.abc import AsyncIterator
from dataclasses import dataclass
from typing import Protocol

from papyruslm.domain.entities import Chunk, Message


@dataclass(frozen=True)
class Source:
    index: int
    chunk: Chunk
    document_name: str
    content_checksum: str


class ChatAssistant(Protocol):
    @property
    def model(self) -> str: ...
    async def rewrite_question(self, history: list[Message], question: str) -> str: ...
    def select_sources(self, question: str, sources: list[Source]) -> list[Source]: ...
    def stream_answer(self, history: list[Message], question: str, sources: list[Source]) -> AsyncIterator[str]: ...
