from typing import Protocol
from uuid import UUID

from papyruslm.domain.entities import DocumentContent


class DocumentContentRepository(Protocol):
    async def save_content(self, content: DocumentContent) -> None: ...
    async def find_by_document_id(self, document_id: UUID) -> DocumentContent | None: ...
    async def find_checksums(self, document_ids: list[UUID]) -> dict[UUID, str]: ...
