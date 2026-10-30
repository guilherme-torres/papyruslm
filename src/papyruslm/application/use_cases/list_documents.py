from uuid import UUID

from papyruslm.application.dto import DocumentOutput
from papyruslm.application.exceptions import NotebookNotFound
from papyruslm.domain.repositories import DocumentRepository, NotebookRepository


class ListDocumentsUseCase:
    def __init__(self, document_repository: DocumentRepository, notebook_repository: NotebookRepository):
        self._document_repository = document_repository
        self._notebook_repository = notebook_repository

    async def execute(self, notebook_id: UUID) -> list[DocumentOutput]:
        if not await self._notebook_repository.exists_by_id(notebook_id):
            raise NotebookNotFound(notebook_id)
        documents = await self._document_repository.list_documents_by_notebook_id(notebook_id)
        return [DocumentOutput.from_entity(document) for document in documents]
