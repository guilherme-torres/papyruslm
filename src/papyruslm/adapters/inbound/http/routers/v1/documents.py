from uuid import UUID

from dishka.integrations.fastapi import DishkaRoute, FromDishka
from fastapi import APIRouter, UploadFile, status

from papyruslm.adapters.inbound.http.routers.v1.schemas import DocumentContentResponse, DocumentResponse
from papyruslm.application.dto import AddDocumentInput
from papyruslm.application.use_cases import (
    AddDocumentUseCase,
    DeleteDocumentUseCase,
    GetDocumentContentUseCase,
    ListDocumentsUseCase,
    ReprocessDocumentUseCase,
)

router = APIRouter(tags=["documents"], route_class=DishkaRoute)


@router.post("/notebooks/{id}/documents", status_code=status.HTTP_201_CREATED)
async def add_document(
    id: UUID,
    file: UploadFile,
    use_case: FromDishka[AddDocumentUseCase],
) -> DocumentResponse:
    document = await use_case.execute(
        AddDocumentInput(notebook_id=id, filename=file.filename or "", content=file.file)
    )
    return DocumentResponse.model_validate(document)


@router.get("/notebooks/{id}/documents")
async def list_documents(
    id: UUID,
    use_case: FromDishka[ListDocumentsUseCase],
) -> list[DocumentResponse]:
    documents = await use_case.execute(id)
    return [DocumentResponse.model_validate(document) for document in documents]


@router.get("/documents/{id}/content")
async def get_document_content(
    id: UUID,
    use_case: FromDishka[GetDocumentContentUseCase],
) -> DocumentContentResponse:
    content = await use_case.execute(id)
    return DocumentContentResponse.model_validate(content)


@router.delete("/documents/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    id: UUID,
    use_case: FromDishka[DeleteDocumentUseCase],
) -> None:
    await use_case.execute(id)


@router.post("/documents/{id}/reprocess", status_code=status.HTTP_202_ACCEPTED)
async def reprocess_document(
    id: UUID,
    use_case: FromDishka[ReprocessDocumentUseCase],
) -> DocumentResponse:
    document = await use_case.execute(id)
    return DocumentResponse.model_validate(document)
