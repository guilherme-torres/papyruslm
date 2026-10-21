from contextlib import asynccontextmanager

from dishka.integrations.fastapi import setup_dishka
from fastapi import FastAPI

from papyruslm.adapters.inbound.http.exception_handlers import register_exception_handlers
from papyruslm.adapters.inbound.http.routers import health, v1
from papyruslm.ioc import create_container


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await app.state.dishka_container.close()

app = FastAPI(lifespan=lifespan)

app.include_router(health.router)
app.include_router(v1.router)

register_exception_handlers(app)
setup_dishka(create_container(), app)
