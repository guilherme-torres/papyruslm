from uuid import UUID

from papyruslm.application.dto import ListMessagesOutput, MessageOutput
from papyruslm.application.exceptions import NotebookNotFound
from papyruslm.domain.repositories import MessageRepository, NotebookRepository


class ListMessagesUseCase:
    def __init__(self, message_repository: MessageRepository, notebook_repository: NotebookRepository):
        self._message_repository = message_repository
        self._notebook_repository = notebook_repository

    async def execute(self, notebook_id: UUID, limit: int = 50, offset: int = 0) -> ListMessagesOutput:
        if not await self._notebook_repository.exists_by_id(notebook_id):
            raise NotebookNotFound(notebook_id)
        messages, total = await self._message_repository.list_messages_by_notebook_id(notebook_id, limit, offset)
        return ListMessagesOutput(
            total=total,
            limit=limit,
            offset=offset,
            items=[MessageOutput.from_entity(message) for message in messages],
        )
