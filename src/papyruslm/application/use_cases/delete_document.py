from uuid import UUID

from papyruslm.application.exceptions import DocumentNotFound
from papyruslm.application.ports import FileStorage, VectorIndex
from papyruslm.domain.repositories import DocumentRepository


class DeleteDocumentUseCase:
    def __init__(
        self,
        document_repository: DocumentRepository,
        vector_index: VectorIndex,
        file_storage: FileStorage,
    ):
        self._document_repository = document_repository
        self._vector_index = vector_index
        self._file_storage = file_storage

    async def execute(self, document_id: UUID) -> None:
        document = await self._document_repository.find_by_id(document_id)
        if document is None:
            raise DocumentNotFound(document_id)
        await self._vector_index.delete_by_document_id(document.id)
        if not await self._document_repository.delete_document(document.id):
            raise DocumentNotFound(document_id)
        await self._file_storage.delete(document.file_key)
