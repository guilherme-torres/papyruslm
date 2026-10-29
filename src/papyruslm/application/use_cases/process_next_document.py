import logging

from papyruslm.application.dto import DocumentOutput
from papyruslm.application.ports import Embedder, FileStorage, TextExtractor, TextSplitter, VectorIndex
from papyruslm.domain.entities import DocumentContent
from papyruslm.domain.repositories import ChunkRepository, DocumentContentRepository, DocumentRepository

logger = logging.getLogger(__name__)


class ProcessNextDocumentUseCase:
    def __init__(
        self,
        document_repository: DocumentRepository,
        document_content_repository: DocumentContentRepository,
        chunk_repository: ChunkRepository,
        file_storage: FileStorage,
        text_extractor: TextExtractor,
        text_splitter: TextSplitter,
        embedder: Embedder,
        vector_index: VectorIndex,
    ):
        self._document_repository = document_repository
        self._document_content_repository = document_content_repository
        self._chunk_repository = chunk_repository
        self._file_storage = file_storage
        self._text_extractor = text_extractor
        self._text_splitter = text_splitter
        self._embedder = embedder
        self._vector_index = vector_index

    async def execute(self) -> DocumentOutput | None:
        document = await self._document_repository.claim_next_pending()
        if document is None:
            return None

        try:
            async with self._file_storage.open(document.file_key) as file:
                text = await self._text_extractor.extract(file, document.document_type)

            content = DocumentContent.from_text(document.id, text)
            chunks = self._text_splitter.split(content)
            vectors = await self._embedder.embed_documents([chunk.text for chunk in chunks])

            await self._document_content_repository.save_content(content)
            await self._chunk_repository.replace_chunks(document.id, chunks)
            await self._vector_index.delete_by_document_id(document.id)
            await self._vector_index.add(document.notebook_id, chunks, vectors)
            document.mark_ready(self._embedder.model)
        except Exception:
            logger.exception("Failed to process document %s", document.id)
            document.mark_failed()

        await self._document_repository.update_document(document)
        return DocumentOutput.from_entity(document)
