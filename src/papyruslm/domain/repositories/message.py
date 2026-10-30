from typing import Protocol
from uuid import UUID

from papyruslm.domain.entities import Message


class MessageRepository(Protocol):
    async def create_message(self, message: Message) -> Message: ...
    async def find_by_id(self, id: UUID) -> Message | None: ...
    async def list_messages_by_notebook_id(
        self,
        notebook_id: UUID,
        limit: int,
        offset: int,
    ) -> tuple[list[Message], int]: ...
    async def list_recent_messages(self, notebook_id: UUID, limit: int) -> list[Message]: ...
    async def delete_messages_by_notebook_id(self, notebook_id: UUID) -> int: ...
