from uuid import UUID

from papyruslm.application.dto import DocumentOutput
from papyruslm.application.exceptions import DocumentNotFound
from papyruslm.domain.repositories import DocumentRepository


class ReprocessDocumentUseCase:
    def __init__(self, document_repository: DocumentRepository):
        self._document_repository = document_repository

    async def execute(self, document_id: UUID) -> DocumentOutput:
        document = await self._document_repository.find_by_id(document_id)
        if document is None:
            raise DocumentNotFound(document_id)
        document.requeue()
        updated = await self._document_repository.update_document(document)
        if updated is None:
            raise DocumentNotFound(document_id)
        return DocumentOutput.from_entity(updated)
