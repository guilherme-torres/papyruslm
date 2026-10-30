from os import SEEK_END
from typing import BinaryIO
from uuid import uuid4

from papyruslm.application.dto import AddDocumentInput, DocumentOutput
from papyruslm.application.exceptions import NotebookNotFound
from papyruslm.application.ports import FileStorage, FileTypeDetector
from papyruslm.domain.entities import Document
from papyruslm.domain.repositories import DocumentRepository, NotebookRepository

UNKNOWN_MIME_TYPE = "application/octet-stream"
HEADER_SIZE = 8192


class AddDocumentUseCase:
    def __init__(
        self,
        document_repository: DocumentRepository,
        notebook_repository: NotebookRepository,
        file_storage: FileStorage,
        file_type_detector: FileTypeDetector,
    ):
        self._document_repository = document_repository
        self._notebook_repository = notebook_repository
        self._file_storage = file_storage
        self._file_type_detector = file_type_detector

    async def execute(self, data: AddDocumentInput) -> DocumentOutput:
        if not await self._notebook_repository.exists_by_id(data.notebook_id):
            raise NotebookNotFound(data.notebook_id)

        document_id = uuid4()
        document = Document(
            id=document_id,
            notebook_id=data.notebook_id,
            filename=data.filename,
            file_key=f"{data.notebook_id}/{document_id}",
            size_bytes=self._size_of(data.content),
            mime_type=self._detect_mime_type(data.content, data.filename),
        )

        await self._file_storage.save(document.file_key, data.content)
        try:
            created = await self._document_repository.create_document(document)
        except Exception:
            await self._file_storage.delete(document.file_key)
            raise
        return DocumentOutput.from_entity(created)

    def _detect_mime_type(self, content: BinaryIO, filename: str) -> str:
        header = content.read(HEADER_SIZE)
        content.seek(0)
        return self._file_type_detector.detect(header, filename) or UNKNOWN_MIME_TYPE

    @staticmethod
    def _size_of(content: BinaryIO) -> int:
        size = content.seek(0, SEEK_END)
        content.seek(0)
        return size
