from typing import BinaryIO, Protocol

from papyruslm.domain.entities.document import DocumentType


class TextExtractor(Protocol):
    async def extract(self, content: BinaryIO, document_type: DocumentType) -> str: ...
