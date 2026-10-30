import logging
from dataclasses import replace

from papyruslm.application.dto import DocumentOutput
from papyruslm.application.ports import Embedder, FileStorage, TextExtractor, TextSplitter, UnitOfWork, VectorIndex
from papyruslm.domain.entities import Chunk, Document, DocumentContent
from papyruslm.domain.entities.document import DocumentJob
from papyruslm.domain.repositories import ChunkRepository, DocumentContentRepository, DocumentRepository

logger = logging.getLogger(__name__)


class ProcessDocumentUseCase:
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
        unit_of_work: UnitOfWork,
    ):
        self._document_repository = document_repository
        self._document_content_repository = document_content_repository
        self._chunk_repository = chunk_repository
        self._file_storage = file_storage
        self._text_extractor = text_extractor
        self._text_splitter = text_splitter
        self._embedder = embedder
        self._vector_index = vector_index
        self._unit_of_work = unit_of_work

    async def execute(self, document: Document) -> DocumentOutput | None:
        if document.job is DocumentJob.REINDEX:
            chunks = await self._chunk_repository.list_by_document_id(document.id)
            if chunks:
                return await self._reindex(document, chunks)
        return await self._process(document)

    async def _process(self, document: Document) -> DocumentOutput | None:
        try:
            content, chunks, vectors = await self._prepare(document)
        except Exception:
            logger.exception("Failed to process document %s", document.id)
            return await self._fail(document)

        ready = replace(document)
        ready.mark_ready(self._embedder.model)
        try:
            if not await self._document_repository.finish(ready):
                await self._unit_of_work.rollback()
                logger.warning("Lost the lease of document %s, discarding the result", document.id)
                return None
            await self._document_content_repository.save_content(content)
            await self._chunk_repository.replace_chunks(document.id, chunks)
            await self._vector_index.delete_by_document_id(document.id)
            await self._vector_index.add(document.notebook_id, chunks, vectors)
            await self._unit_of_work.commit()
        except Exception:
            await self._unit_of_work.rollback()
            logger.exception("Failed to save document %s", document.id)
            return await self._fail(document)
        return DocumentOutput.from_entity(ready)

    async def _reindex(self, document: Document, chunks: list[Chunk]) -> DocumentOutput | None:
        try:
            vectors = await self._embedder.embed_documents([chunk.text for chunk in chunks])
        except Exception:
            logger.exception("Failed to reindex document %s", document.id)
            return await self._fail(document)

        ready = replace(document)
        ready.mark_ready(self._embedder.model)
        try:
            if not await self._document_repository.finish(ready):
                await self._unit_of_work.rollback()
                logger.warning("Lost the lease of document %s, discarding the result", document.id)
                return None
            await self._vector_index.delete_by_document_id(document.id)
            await self._vector_index.add(document.notebook_id, chunks, vectors)
            await self._unit_of_work.commit()
        except Exception:
            await self._unit_of_work.rollback()
            logger.exception("Failed to save the index of document %s", document.id)
            return await self._fail(document)
        return DocumentOutput.from_entity(ready)

    async def _prepare(self, document: Document) -> tuple[DocumentContent, list[Chunk], list[list[float]]]:
        async with self._file_storage.open(document.file_key) as file:
            text = await self._text_extractor.extract(file, document.document_type)
        content = DocumentContent.from_text(document.id, text)
        chunks = self._text_splitter.split(content)
        vectors = await self._embedder.embed_documents([chunk.text for chunk in chunks])
        return content, chunks, vectors

    async def _fail(self, document: Document) -> DocumentOutput | None:
        failed = replace(document)
        failed.mark_failed()
        finished = await self._document_repository.finish(failed)
        await self._unit_of_work.commit()
        return DocumentOutput.from_entity(failed) if finished else None
