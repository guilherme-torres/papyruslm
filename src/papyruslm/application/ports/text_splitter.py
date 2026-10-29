from typing import Protocol

from papyruslm.domain.entities import Chunk, DocumentContent


class TextSplitter(Protocol):
    def split(self, content: DocumentContent) -> list[Chunk]: ...
