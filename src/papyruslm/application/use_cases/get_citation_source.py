from uuid import UUID

from papyruslm.application.dto import CitationSourceOutput
from papyruslm.application.exceptions import CitationNotFound, CitationSourceUnavailable, MessageNotFound
from papyruslm.domain.repositories import DocumentContentRepository, MessageRepository


class GetCitationSourceUseCase:
    def __init__(
        self,
        message_repository: MessageRepository,
        document_content_repository: DocumentContentRepository,
    ):
        self._message_repository = message_repository
        self._document_content_repository = document_content_repository

    async def execute(self, notebook_id: UUID, message_id: UUID, index: int) -> CitationSourceOutput:
        message = await self._message_repository.find_by_id(message_id)
        if message is None or message.notebook_id != notebook_id:
            raise MessageNotFound(message_id)

        citation = next((citation for citation in message.citations if citation.index == index), None)
        if citation is None:
            raise CitationNotFound(message_id, index)

        content = await self._document_content_repository.find_by_document_id(citation.document_id)
        location = content.locate(citation) if content else None
        if content is None or location is None:
            raise CitationSourceUnavailable(message_id, index)

        start, end = location
        return CitationSourceOutput(
            document_id=citation.document_id,
            document_name=citation.document_name,
            before=content.text[:start],
            highlight=content.text[start:end],
            after=content.text[end:],
        )
