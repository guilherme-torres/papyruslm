import asyncio
import logging
import signal
import time
from datetime import timedelta

from dishka import AsyncContainer

from papyruslm.application.use_cases import (
    ClaimNextDocumentUseCase,
    ProcessDocumentUseCase,
    RecoverStaleDocumentsUseCase,
    RenewLeaseUseCase,
)
from papyruslm.domain.entities import Document
from papyruslm.ioc import create_worker_container
from papyruslm.settings import Settings

logger = logging.getLogger(__name__)


class DocumentWorker:
    def __init__(self, container: AsyncContainer, settings: Settings):
        self._container = container
        self._settings = settings
        self._stopping = asyncio.Event()

    def stop(self) -> None:
        logger.info("Stopping after the current document")
        self._stopping.set()

    async def run(self) -> None:
        logger.info("Worker started")
        delay = self._settings.worker_poll_interval_seconds
        next_recovery = 0.0
        while not self._stopping.is_set():
            try:
                if time.monotonic() >= next_recovery:
                    await self._recover_stale()
                    next_recovery = time.monotonic() + self._settings.lease_timeout_seconds
                document = await self._claim()
            except Exception:
                logger.exception("Worker loop failed")
                await self._sleep(self._settings.worker_max_poll_interval_seconds)
                continue

            if document is None:
                await self._sleep(delay)
                delay = min(delay * 2, self._settings.worker_max_poll_interval_seconds)
                continue

            delay = self._settings.worker_poll_interval_seconds
            await self._process_with_lease(document)
        logger.info("Worker stopped")

    async def _recover_stale(self) -> None:
        async with self._container() as request:
            use_case = await request.get(RecoverStaleDocumentsUseCase)
            result = await use_case.execute(
                timedelta(seconds=self._settings.lease_timeout_seconds),
                self._settings.processing_max_attempts,
            )
        if result.requeued or result.failed:
            logger.warning("Recovered stale documents: %d requeued, %d failed", result.requeued, result.failed)

    async def _claim(self) -> Document | None:
        async with self._container() as request:
            use_case = await request.get(ClaimNextDocumentUseCase)
            return await use_case.execute()

    async def _process_with_lease(self, document: Document) -> None:
        logger.info("Processing document %s (attempt %d)", document.id, document.attempts)
        processing = asyncio.create_task(self._process(document))
        heartbeat = asyncio.create_task(self._keep_lease(document, processing))
        try:
            output = await processing
        except asyncio.CancelledError:
            if asyncio.current_task().cancelling():
                raise
            logger.warning("Processing of document %s was cancelled after losing its lease", document.id)
        except Exception:
            logger.exception("Unexpected error processing document %s", document.id)
        else:
            if output is None:
                logger.warning("Document %s was discarded: lease lost", document.id)
            else:
                logger.info("Document %s finished as %s", document.id, output.status)
        finally:
            heartbeat.cancel()

    async def _process(self, document: Document):
        async with self._container() as request:
            use_case = await request.get(ProcessDocumentUseCase)
            return await use_case.execute(document)

    async def _keep_lease(self, document: Document, processing: asyncio.Task) -> None:
        while True:
            await asyncio.sleep(self._settings.lease_heartbeat_seconds)
            try:
                async with self._container() as request:
                    use_case = await request.get(RenewLeaseUseCase)
                    renewed = await use_case.execute(document.id, document.lease_version)
            except Exception:
                logger.exception("Failed to renew the lease of document %s", document.id)
                continue
            if not renewed:
                logger.warning("Lost the lease of document %s", document.id)
                processing.cancel()
                return

    async def _sleep(self, seconds: float) -> None:
        try:
            await asyncio.wait_for(self._stopping.wait(), timeout=seconds)
        except TimeoutError:
            pass


async def _run() -> None:
    container = create_worker_container()
    try:
        worker = DocumentWorker(container, await container.get(Settings))
        loop = asyncio.get_running_loop()
        for sig in (signal.SIGINT, signal.SIGTERM):
            loop.add_signal_handler(sig, worker.stop)
        await worker.run()
    finally:
        await container.close()


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    asyncio.run(_run())
