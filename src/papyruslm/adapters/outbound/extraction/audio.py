from threading import Lock
from typing import BinaryIO

from faster_whisper import WhisperModel


class FasterWhisperTranscriber:
    def __init__(self, model_size: str, device: str, compute_type: str, language: str | None = None):
        self._model_size = model_size
        self._device = device
        self._compute_type = compute_type
        self._language = language
        self._model: WhisperModel | None = None
        self._lock = Lock()

    def extract(self, content: BinaryIO) -> str:
        segments, _ = self._load_model().transcribe(content, language=self._language, vad_filter=True)
        return "\n".join(text for segment in segments if (text := segment.text.strip()))

    def _load_model(self) -> WhisperModel:
        with self._lock:
            if self._model is None:
                self._model = WhisperModel(self._model_size, device=self._device, compute_type=self._compute_type)
            return self._model
