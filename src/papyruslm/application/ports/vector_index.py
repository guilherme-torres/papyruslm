from dataclasses import dataclass
from typing import Protocol
from uuid import UUID

from papyruslm.domain.entities import Chunk


@dataclass(frozen=True)
class VectorMatch:
    chunk_id: UUID
    score: float


@dataclass(frozen=True)
class IndexSignature:
    model: str
    dimensions: int


class VectorIndex(Protocol):
    async def get_signature(self) -> IndexSignature | None: ...
    async def reset(self, signature: IndexSignature) -> None: ...
    async def add(self, notebook_id: UUID, chunks: list[Chunk], vectors: list[list[float]]) -> None: ...
    async def delete_by_document_id(self, document_id: UUID) -> None: ...
    async def search(
        self,
        notebook_id: UUID,
        vector: list[float],
        limit: int,
        document_ids: list[UUID] | None = None,
    ) -> list[VectorMatch]: ...
