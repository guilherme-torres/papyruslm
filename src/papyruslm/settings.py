from functools import cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    data_dir: Path = Path("data")
    db_echo: bool = False

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
