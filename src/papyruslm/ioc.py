from collections.abc import AsyncIterator

from dishka import AsyncContainer, Provider, Scope, make_async_container, provide, provide_all
from dishka.integrations.fastapi import FastapiProvider
from sqlalchemy.ext.asyncio import AsyncSession

from papyruslm.adapters.outbound.database.sqlite import SQLiteDatabaseManager
from papyruslm.adapters.outbound.repositories import SQLAlchemyNotebookRepository, SQLAlchemyFlashcardRepository
from papyruslm.domain.repositories import NotebookRepository, FlashcardRepository
from papyruslm.application.use_cases import (
    CreateNotebookUseCase,
    DeleteNotebookUseCase,
    ListNotebooksUseCase,
    UpdateNotebookUseCase,
    CreateFlashcardUseCase,
    ReviewFlashcardUseCase,
    FindNextDueUseCase,
    DeleteFlashcardUseCase,
    ListFlashcardsUseCase,
    UpdateFlashcardUseCase,
)
from papyruslm.settings import Settings, get_settings


class AppProvider(Provider):
    @provide(scope=Scope.APP)
    def settings(self) -> Settings:
        return get_settings()

    @provide(scope=Scope.APP)
    async def database(self, settings: Settings) -> AsyncIterator[SQLiteDatabaseManager]:
        db = SQLiteDatabaseManager(settings.db_url, echo=settings.db_echo)
        await db.connect()
        yield db
        await db.disconnect()

    @provide(scope=Scope.REQUEST)
    async def session(self, db: SQLiteDatabaseManager) -> AsyncIterator[AsyncSession]:
        async with db.session() as session:
            yield session

    notebook_repository = provide(
        SQLAlchemyNotebookRepository,
        provides=NotebookRepository,
        scope=Scope.REQUEST,
    )

    flashcard_repository = provide(
        SQLAlchemyFlashcardRepository,
        provides=FlashcardRepository,
        scope=Scope.REQUEST,
    )

    use_cases = provide_all(
        CreateNotebookUseCase,
        ListNotebooksUseCase,
        UpdateNotebookUseCase,
        DeleteNotebookUseCase,
        CreateFlashcardUseCase,
        ReviewFlashcardUseCase,
        FindNextDueUseCase,
        DeleteFlashcardUseCase,
        ListFlashcardsUseCase,
        UpdateFlashcardUseCase,
        scope=Scope.REQUEST,
    )


def create_container() -> AsyncContainer:
    return make_async_container(AppProvider(), FastapiProvider())
