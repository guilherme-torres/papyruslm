import uuid

from papyruslm.application.exceptions import NotebookNotFound
from papyruslm.application.ports import FileStorage, VectorIndex
from papyruslm.domain.repositories import DocumentRepository, NotebookRepository


class DeleteNotebookUseCase:
    def __init__(
        self,
        notebook_repository: NotebookRepository,
        document_repository: DocumentRepository,
        vector_index: VectorIndex,
        file_storage: FileStorage,
    ):
        self._notebook_repository = notebook_repository
        self._document_repository = document_repository
        self._vector_index = vector_index
        self._file_storage = file_storage

    async def execute(self, id: uuid.UUID) -> None:
        documents = await self._document_repository.list_documents_by_notebook_id(id)
        for document in documents:
            await self._vector_index.delete_by_document_id(document.id)
        if not await self._notebook_repository.delete_notebook(id):
            raise NotebookNotFound(id)
        for document in documents:
            await self._file_storage.delete(document.file_key)
