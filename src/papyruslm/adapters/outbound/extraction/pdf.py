from pathlib import Path
from typing import BinaryIO

from liteparse import LiteParse


class LiteParsePdfExtractor:
    def __init__(self, ocr_language: str, tessdata_path: Path | None = None):
        self._parser = LiteParse(
            output_format="text",
            ocr_language=ocr_language,
            tessdata_path=str(tessdata_path) if tessdata_path else None,
            quiet=True,
        )

    def extract(self, content: BinaryIO) -> str:
        return self._parser.parse(content.read()).text
