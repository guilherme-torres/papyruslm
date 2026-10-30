from papyruslm.application.dto import SyncVectorIndexOutput
from papyruslm.application.ports import Embedder, IndexSignature, UnitOfWork, VectorIndex
from papyruslm.domain.repositories import DocumentRepository

DIMENSION_PROBE = "dimension probe"


class SyncVectorIndexUseCase:
    def __init__(
        self,
        embedder: Embedder,
        vector_index: VectorIndex,
        document_repository: DocumentRepository,
        unit_of_work: UnitOfWork,
    ):
        self._embedder = embedder
        self._vector_index = vector_index
        self._document_repository = document_repository
        self._unit_of_work = unit_of_work

    async def execute(self) -> SyncVectorIndexOutput:
        probe = await self._embedder.embed_query(DIMENSION_PROBE)
        current = IndexSignature(model=self._embedder.model, dimensions=len(probe))
        if await self._vector_index.get_signature() == current:
            await self._unit_of_work.commit()
            return SyncVectorIndexOutput(changed=False, model=current.model, dimensions=current.dimensions)

        try:
            await self._vector_index.reset(current)
            reindex, reprocess = await self._document_repository.requeue_for_new_index()
            await self._unit_of_work.commit()
        except Exception:
            await self._unit_of_work.rollback()
            raise
        return SyncVectorIndexOutput(
            changed=True,
            model=current.model,
            dimensions=current.dimensions,
            reindex=reindex,
            reprocess=reprocess,
        )
