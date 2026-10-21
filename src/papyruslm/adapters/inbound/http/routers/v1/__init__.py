from fastapi import APIRouter

from papyruslm.adapters.inbound.http.routers.v1 import notebooks


router = APIRouter(prefix="/api/v1")
router.include_router(notebooks.router)

__all__ = ["router"]
