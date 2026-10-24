from fastapi import APIRouter

from papyruslm.adapters.inbound.http.routers.v1 import flashcards, notebooks


router = APIRouter(prefix="/api/v1")
router.include_router(notebooks.router)
router.include_router(flashcards.router)

__all__ = ["router"]
