from langchain_text_splitters import RecursiveCharacterTextSplitter

from papyruslm.domain.entities import Chunk, DocumentContent


class RecursiveTextSplitter:
    def __init__(self, chunk_size: int, chunk_overlap: int):
        self._splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            add_start_index=True,
        )

    def split(self, content: DocumentContent) -> list[Chunk]:
        text = content.text
        chunks: list[Chunk] = []
        search_from = 0
        for document in self._splitter.create_documents([text]):
            piece = document.page_content
            if not piece.strip():
                continue
            start = self._locate(text, piece, document.metadata.get("start_index", -1), search_from)
            if start < 0:
                continue
            chunks.append(
                Chunk(
                    document_id=content.document_id,
                    position=len(chunks),
                    start=start,
                    end=start + len(piece),
                    text=piece,
                )
            )
            search_from = start + 1
        return chunks

    @staticmethod
    def _locate(text: str, piece: str, start_index: int, search_from: int) -> int:
        if start_index >= 0 and text.startswith(piece, start_index):
            return start_index
        return text.find(piece, search_from)
