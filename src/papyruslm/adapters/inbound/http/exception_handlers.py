import logging

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

from papyruslm.application.exceptions import FlashcardNotFound, NotebookNotFound
from papyruslm.domain.exceptions import DomainValidationError, ReviewNotDue

logger = logging.getLogger(__name__)


async def not_found_handler(_request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"detail": str(exc)})


async def review_not_due_handler(_request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(status_code=status.HTTP_409_CONFLICT, content={"detail": str(exc)})


async def domain_validation_handler(_request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, content={"detail": str(exc)}
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled error on %s %s", request.method, request.url.path, exc_info=exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(NotebookNotFound, not_found_handler)
    app.add_exception_handler(FlashcardNotFound, not_found_handler)
    app.add_exception_handler(ReviewNotDue, review_not_due_handler)
    app.add_exception_handler(DomainValidationError, domain_validation_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)
