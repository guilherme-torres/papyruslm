from datetime import datetime, timezone

from papyruslm.domain.entities import Document
from papyruslm.domain.repositories import DocumentRepository


class ClaimNextDocumentUseCase:
    def __init__(self, document_repository: DocumentRepository):
        self._document_repository = document_repository

    async def execute(self, now: datetime | None = None) -> Document | None:
        return await self._document_repository.claim_next_pending(now or datetime.now(timezone.utc))
