from uuid import UUID

from papyruslm.application.exceptions import NotebookNotFound
from papyruslm.domain.repositories import MessageRepository, NotebookRepository


class ClearMessagesUseCase:
    def __init__(self, message_repository: MessageRepository, notebook_repository: NotebookRepository):
        self._message_repository = message_repository
        self._notebook_repository = notebook_repository

    async def execute(self, notebook_id: UUID) -> int:
        if not await self._notebook_repository.exists_by_id(notebook_id):
            raise NotebookNotFound(notebook_id)
        return await self._message_repository.delete_messages_by_notebook_id(notebook_id)
