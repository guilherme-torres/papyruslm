from fastapi import APIRouter

from papyruslm.adapters.inbound.http.routers.v1 import chat, documents, flashcards, notebooks, tags


router = APIRouter(prefix="/api/v1")
router.include_router(notebooks.router)
router.include_router(flashcards.router)
router.include_router(tags.router)
router.include_router(documents.router)
router.include_router(chat.router)

__all__ = ["router"]
