from langchain_ollama import OllamaEmbeddings


class OllamaEmbedder:
    def __init__(self, model: str, base_url: str, batch_size: int = 32):
        self._model = model
        self._embeddings = OllamaEmbeddings(model=model, base_url=base_url)
        self._batch_size = batch_size

    @property
    def model(self) -> str:
        return self._model

    async def embed_documents(self, texts: list[str]) -> list[list[float]]:
        vectors: list[list[float]] = []
        for i in range(0, len(texts), self._batch_size):
            vectors.extend(await self._embeddings.aembed_documents(texts[i : i + self._batch_size]))
        return vectors

    async def embed_query(self, text: str) -> list[float]:
        return await self._embeddings.aembed_query(text)
