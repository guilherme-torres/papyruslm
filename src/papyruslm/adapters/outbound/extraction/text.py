from typing import BinaryIO


class PlainTextExtractor:
    def extract(self, content: BinaryIO) -> str:
        return content.read().decode("utf-8-sig", errors="replace")
