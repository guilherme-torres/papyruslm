import codecs

import filetype

MIME_TYPE_ALIASES = {
    "audio/x-wav": "audio/wav",
    "audio/x-flac": "audio/flac",
    "video/webm": "audio/webm",
}
MARKDOWN_EXTENSIONS = (".md", ".markdown")


class FiletypeDetector:
    def detect(self, header: bytes, filename: str) -> str | None:
        kind = filetype.guess(header)
        if kind is not None:
            return MIME_TYPE_ALIASES.get(kind.mime, kind.mime)
        if self._is_text(header):
            return "text/markdown" if filename.lower().endswith(MARKDOWN_EXTENSIONS) else "text/plain"
        return None

    @staticmethod
    def _is_text(header: bytes) -> bool:
        if b"\x00" in header:
            return False
        try:
            codecs.getincrementaldecoder("utf-8")().decode(header, final=False)
        except UnicodeDecodeError:
            return False
        return True
