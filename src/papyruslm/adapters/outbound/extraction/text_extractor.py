import asyncio
from collections.abc import Mapping
from typing import BinaryIO, Protocol

from papyruslm.domain.entities.document import DocumentType


class DocumentTextExtractor(Protocol):
    def extract(self, content: BinaryIO) -> str: ...


class DocumentTypeTextExtractor:
    def __init__(self, extractors: Mapping[DocumentType, DocumentTextExtractor]):
        self._extractors = dict(extractors)

    async def extract(self, content: BinaryIO, document_type: DocumentType) -> str:
        extractor = self._extractors.get(document_type)
        if extractor is None:
            raise ValueError(f"No text extractor for document type {document_type}")
        return await asyncio.to_thread(extractor.extract, content)
