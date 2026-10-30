from uuid import UUID

from papyruslm.application.dto import DocumentContentOutput
from papyruslm.application.exceptions import DocumentContentNotFound, DocumentNotFound
from papyruslm.domain.repositories import DocumentContentRepository, DocumentRepository


class GetDocumentContentUseCase:
    def __init__(
        self,
        document_repository: DocumentRepository,
        document_content_repository: DocumentContentRepository,
    ):
        self._document_repository = document_repository
        self._document_content_repository = document_content_repository

    async def execute(self, document_id: UUID) -> DocumentContentOutput:
        if await self._document_repository.find_by_id(document_id) is None:
            raise DocumentNotFound(document_id)
        content = await self._document_content_repository.find_by_document_id(document_id)
        if content is None:
            raise DocumentContentNotFound(document_id)
        return DocumentContentOutput(document_id=content.document_id, text=content.text)
