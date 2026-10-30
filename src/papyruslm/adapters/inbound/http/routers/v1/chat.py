import json
import logging
from collections.abc import AsyncIterator
from typing import Annotated, Any
from uuid import UUID

from dishka.integrations.fastapi import DishkaRoute, FromDishka
from fastapi import APIRouter, Query, status
from fastapi.sse import EventSourceResponse

from papyruslm.adapters.inbound.http.routers.v1.schemas import (
    AskQuestionRequest,
    MessageFilterParams,
    MessageResponse,
    MessageResponsePaginated,
)
from papyruslm.application.dto import AnswerDelta, AskQuestionInput, ChatEvent
from papyruslm.application.use_cases import AskQuestionUseCase, ClearMessagesUseCase, ListMessagesUseCase

logger = logging.getLogger(__name__)

STREAM_ERROR_MESSAGE = "Não foi possível gerar a resposta."

router = APIRouter(prefix="/notebooks", tags=["chat"], route_class=DishkaRoute)


@router.post("/{id}/chat")
async def ask_question(
    id: UUID,
    body: AskQuestionRequest,
    use_case: FromDishka[AskQuestionUseCase],
) -> EventSourceResponse:
    events = use_case.execute(
        AskQuestionInput(notebook_id=id, question=body.question, document_ids=body.document_ids)
    )
    first_event = await anext(events)
    return EventSourceResponse(_stream(first_event, events))


@router.get("/{id}/messages")
async def list_messages(
    id: UUID,
    params: Annotated[MessageFilterParams, Query()],
    use_case: FromDishka[ListMessagesUseCase],
) -> MessageResponsePaginated:
    output = await use_case.execute(id, params.limit, params.offset)
    return MessageResponsePaginated(
        total=output.total,
        limit=output.limit,
        offset=output.offset,
        items=[MessageResponse.model_validate(message) for message in output.items],
    )


@router.delete("/{id}/messages", status_code=status.HTTP_204_NO_CONTENT)
async def clear_messages(
    id: UUID,
    use_case: FromDishka[ClearMessagesUseCase],
) -> None:
    await use_case.execute(id)


async def _stream(first_event: ChatEvent, events: AsyncIterator[ChatEvent]) -> AsyncIterator[str]:
    try:
        yield _encode(first_event)
        async for event in events:
            yield _encode(event)
    except Exception:
        logger.exception("Chat stream failed")
        yield _sse("error", {"detail": STREAM_ERROR_MESSAGE})


def _encode(event: ChatEvent) -> str:
    if isinstance(event, AnswerDelta):
        return _sse("delta", {"text": event.text})
    return _sse("done", MessageResponse.model_validate(event.message).model_dump(mode="json"))


def _sse(event: str, data: dict[str, Any]) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"
