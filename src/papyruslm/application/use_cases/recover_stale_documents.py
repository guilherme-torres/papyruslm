from datetime import datetime, timedelta, timezone

from papyruslm.application.dto import RecoverStaleDocumentsOutput
from papyruslm.domain.repositories import DocumentRepository


class RecoverStaleDocumentsUseCase:
    def __init__(self, document_repository: DocumentRepository):
        self._document_repository = document_repository

    async def execute(
        self,
        lease_timeout: timedelta,
        max_attempts: int,
        now: datetime | None = None,
    ) -> RecoverStaleDocumentsOutput:
        now = now or datetime.now(timezone.utc)
        requeued, failed = await self._document_repository.recover_stale(now - lease_timeout, max_attempts)
        return RecoverStaleDocumentsOutput(requeued=requeued, failed=failed)
