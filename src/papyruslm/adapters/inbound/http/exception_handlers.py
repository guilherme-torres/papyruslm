from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

from papyruslm.application.exceptions import NotebookNotFound


async def notebook_not_found_handler(_request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"detail": str(exc)})


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(NotebookNotFound, notebook_not_found_handler)
