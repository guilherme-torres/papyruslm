from collections.abc import AsyncIterator

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage
from langchain_ollama import ChatOllama

from papyruslm.adapters.outbound.chat.prompts import (
    REWRITE_SYSTEM_PROMPT,
    answer_system_prompt,
    rewrite_user_prompt,
    strip_citation_markers,
)
from papyruslm.application.ports import Source
from papyruslm.domain.entities import Message
from papyruslm.domain.entities.message import MessageRole

CHARS_PER_TOKEN = 3
REWRITE_MAX_TOKENS = 128


class OllamaChatAssistant:
    def __init__(self, model: str, base_url: str, context_tokens: int, answer_tokens: int = 1024):
        self._model = model
        self._context_tokens = context_tokens
        self._answer_tokens = answer_tokens
        self._answer_llm = ChatOllama(
            model=model,
            base_url=base_url,
            temperature=0.2,
            num_ctx=context_tokens,
            num_predict=answer_tokens,
        )
        self._rewrite_llm = ChatOllama(
            model=model,
            base_url=base_url,
            temperature=0,
            num_ctx=context_tokens,
            num_predict=REWRITE_MAX_TOKENS,
        )

    @property
    def model(self) -> str:
        return self._model

    async def rewrite_question(self, history: list[Message], question: str) -> str:
        conversation = [
            (message.type, message.text)
            for message in self._history_messages(history, [REWRITE_SYSTEM_PROMPT, question], REWRITE_MAX_TOKENS)
        ]
        response = await self._rewrite_llm.ainvoke(
            [SystemMessage(REWRITE_SYSTEM_PROMPT), HumanMessage(rewrite_user_prompt(conversation, question))]
        )
        lines = [line.strip().removeprefix("Pergunta reescrita:").strip().strip("\"'“”") for line in response.text.splitlines()]
        return next((line for line in lines if line), "")

    async def stream_answer(self, history: list[Message], question: str, sources: list[Source]) -> AsyncIterator[str]:
        system = SystemMessage(answer_system_prompt(sources))
        prompt = [system, *self._history_messages(history, [system.text, question], self._answer_tokens), HumanMessage(question)]
        async for chunk in self._answer_llm.astream(prompt):
            if chunk.text:
                yield chunk.text

    def _history_messages(self, history: list[Message], fixed_texts: list[str], reserved_tokens: int) -> list[BaseMessage]:
        budget = self._context_tokens - reserved_tokens - sum(self._estimate_tokens(text) for text in fixed_texts)
        selected: list[BaseMessage] = []
        for message in reversed(history):
            content = message.content if message.role is MessageRole.USER else strip_citation_markers(message.content)
            cost = self._estimate_tokens(content)
            if cost > budget:
                break
            budget -= cost
            selected.append(HumanMessage(content) if message.role is MessageRole.USER else AIMessage(content))
        return list(reversed(selected))

    @staticmethod
    def _estimate_tokens(text: str) -> int:
        return len(text) // CHARS_PER_TOKEN + 1
