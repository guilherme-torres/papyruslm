from typing import Protocol


class FileTypeDetector(Protocol):
    def detect(self, header: bytes, filename: str) -> str | None: ...
