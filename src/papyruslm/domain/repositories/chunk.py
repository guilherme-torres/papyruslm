from typing import Protocol
from uuid import UUID

from papyruslm.domain.entities import Chunk


class ChunkRepository(Protocol):
    async def replace_chunks(self, document_id: UUID, chunks: list[Chunk]) -> None: ...
    async def find_by_ids(self, ids: list[UUID]) -> list[Chunk]: ...
