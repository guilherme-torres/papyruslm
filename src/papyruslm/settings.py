from functools import cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    data_dir: Path = Path("data")
    db_echo: bool = False
    ollama_base_url: str = "http://localhost:11434"
    chat_model: str = "phi4-mini"
    chat_context_tokens: int = 8192
    embedding_model: str = "qwen3-embedding:0.6b"
    chunk_size: int = 2000
    chunk_overlap: int = 300
    ocr_language: str = "por+eng"
    tessdata_path: Path | None = None
    whisper_model: str = "small"
    whisper_device: str = "cpu"
    whisper_compute_type: str = "int8"
    transcription_language: str | None = None
    worker_poll_interval_seconds: float = 1.0
    worker_max_poll_interval_seconds: float = 5.0
    lease_heartbeat_seconds: float = 30.0
    lease_timeout_seconds: float = 120.0
    processing_max_attempts: int = 3

    @property
    def db_path(self) -> Path:
        return self.data_dir / "papyruslm.db"

    @property
    def documents_dir(self) -> Path:
        return self.data_dir / "documents"

    @property
    def db_url(self) -> str:
        return f"sqlite+aiosqlite:///{self.db_path}"


@cache
def get_settings() -> Settings:
    return Settings()
