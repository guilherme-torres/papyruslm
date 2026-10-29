import logging
from collections.abc import AsyncIterator

from papyruslm.application.citations import resolve_citations
from papyruslm.application.dto import AnswerCompleted, AnswerDelta, AskQuestionInput, ChatEvent, MessageOutput
from papyruslm.application.exceptions import NotebookNotFound
from papyruslm.application.ports import ChatAssistant, Embedder, Source, VectorIndex
from papyruslm.domain.entities import Message
from papyruslm.domain.entities.message import MessageRole
from papyruslm.domain.repositories import (
    ChunkRepository,
    DocumentContentRepository,
    DocumentRepository,
    MessageRepository,
    NotebookRepository,
)

logger = logging.getLogger(__name__)

HISTORY_MESSAGES = 10
TOP_K = 6


class AskQuestionUseCase:
    def __init__(
        self,
        notebook_repository: NotebookRepository,
        message_repository: MessageRepository,
        document_repository: DocumentRepository,
        document_content_repository: DocumentContentRepository,
        chunk_repository: ChunkRepository,
        embedder: Embedder,
        vector_index: VectorIndex,
        chat_assistant: ChatAssistant,
    ):
        self._notebook_repository = notebook_repository
        self._message_repository = message_repository
        self._document_repository = document_repository
        self._document_content_repository = document_content_repository
        self._chunk_repository = chunk_repository
        self._embedder = embedder
        self._vector_index = vector_index
        self._chat_assistant = chat_assistant

    async def execute(self, data: AskQuestionInput) -> AsyncIterator[ChatEvent]:
        if not await self._notebook_repository.exists_by_id(data.notebook_id):
            raise NotebookNotFound(data.notebook_id)

        history = await self._message_repository.list_recent_messages(data.notebook_id, HISTORY_MESSAGES)
        question = await self._message_repository.create_message(
            Message(notebook_id=data.notebook_id, role=MessageRole.USER, content=data.question)
        )

        search_query = await self._search_query(history, question.content)
        sources = await self._find_sources(data, search_query)

        parts: list[str] = []
        async for token in self._chat_assistant.stream_answer(history, question.content, sources):
            parts.append(token)
            yield AnswerDelta(token)

        answer = "".join(parts)
        message = await self._message_repository.create_message(
            Message(
                notebook_id=data.notebook_id,
                role=MessageRole.ASSISTANT,
                content=answer,
                citations=resolve_citations(answer, sources),
                model=self._chat_assistant.model,
            )
        )
        yield AnswerCompleted(MessageOutput.from_entity(message))

    async def _search_query(self, history: list[Message], question: str) -> str:
        if not history:
            return question
        try:
            rewritten = await self._chat_assistant.rewrite_question(history, question)
        except Exception:
            logger.exception("Failed to rewrite question, using the original")
            return question
        return rewritten.strip() or question

    async def _find_sources(self, data: AskQuestionInput, search_query: str) -> list[Source]:
        vector = await self._embedder.embed_query(search_query)
        matches = await self._vector_index.search(data.notebook_id, vector, TOP_K, data.document_ids)
        if not matches:
            return []

        found = await self._chunk_repository.find_by_ids([match.chunk_id for match in matches])
        chunks_by_id = {chunk.id: chunk for chunk in found}
        chunks = [chunks_by_id[m.chunk_id] for m in matches if m.chunk_id in chunks_by_id]

        document_ids = list({chunk.document_id for chunk in chunks})
        documents = {document.id: document for document in await self._document_repository.find_by_ids(document_ids)}
        checksums = await self._document_content_repository.find_checksums(document_ids)

        available = [c for c in chunks if c.document_id in documents and c.document_id in checksums]
        return [
            Source(
                index=index,
                chunk=chunk,
                document_name=documents[chunk.document_id].filename,
                content_checksum=checksums[chunk.document_id],
            )
            for index, chunk in enumerate(available, start=1)
        ]
