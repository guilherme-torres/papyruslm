from datetime import datetime, timezone
from uuid import UUID

from papyruslm.domain.repositories import DocumentRepository


class RenewLeaseUseCase:
    def __init__(self, document_repository: DocumentRepository):
        self._document_repository = document_repository

    async def execute(self, document_id: UUID, lease_version: int, now: datetime | None = None) -> bool:
        return await self._document_repository.renew_lease(
            document_id, lease_version, now or datetime.now(timezone.utc)
        )
