import logging
from contextlib import asynccontextmanager

from dishka.integrations.fastapi import setup_dishka
from fastapi import FastAPI

from papyruslm.adapters.inbound.http.exception_handlers import register_exception_handlers
from papyruslm.adapters.inbound.http.routers import health, v1
from papyruslm.application.use_cases import SyncVectorIndexUseCase
from papyruslm.ioc import create_container

logger = logging.getLogger(__name__)


async def sync_vector_index(app: FastAPI) -> None:
    try:
        async with app.state.dishka_container() as request:
            result = await (await request.get(SyncVectorIndexUseCase)).execute()
    except Exception:
        logger.exception("Could not check the vector index, it will be checked again on the next start")
        return
    if result.changed:
        logger.warning(
            "Vector index rebuilt for %s (%dd): %d documents to reindex, %d to reprocess",
            result.model,
            result.dimensions,
            result.reindex,
            result.reprocess,
        )
    else:
        logger.info("Vector index is up to date for %s (%dd)", result.model, result.dimensions)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await sync_vector_index(app)
    yield
    await app.state.dishka_container.close()

app = FastAPI(lifespan=lifespan)

app.include_router(health.router)
app.include_router(v1.router)

register_exception_handlers(app)
setup_dishka(create_container(), app)
