import asyncio
import os
import shutil
import tempfile
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from pathlib import Path
from typing import BinaryIO

from papyruslm.application.exceptions import FileStorageError


class FileSystemStorage:
    def __init__(self, base_dir: Path):
        self._base_dir = base_dir.resolve()

    async def save(self, key: str, content: BinaryIO) -> None:
        path = self._path(key)
        try:
            await asyncio.to_thread(self._write, path, content)
        except Exception as exc:
            raise FileStorageError(key) from exc

    @asynccontextmanager
    async def open(self, key: str) -> AsyncGenerator[BinaryIO]:
        try:
            file = await asyncio.to_thread(self._path(key).open, "rb")
        except OSError as exc:
            raise FileStorageError(key) from exc
        try:
            yield file
        finally:
            file.close()

    async def delete(self, key: str) -> None:
        await asyncio.to_thread(self._path(key).unlink, missing_ok=True)

    def _path(self, key: str) -> Path:
        path = (self._base_dir / key).resolve()
        if not path.is_relative_to(self._base_dir):
            raise ValueError(f"Invalid file key: {key}")
        return path

    @staticmethod
    def _write(path: Path, content: BinaryIO) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        fd, tmp_name = tempfile.mkstemp(dir=path.parent, prefix=f".{path.name}.", suffix=".tmp")
        try:
            with os.fdopen(fd, "wb") as tmp:
                shutil.copyfileobj(content, tmp)
            os.replace(tmp_name, path)
        except BaseException:
            Path(tmp_name).unlink(missing_ok=True)
            raise
