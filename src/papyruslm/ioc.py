from collections.abc import AsyncIterator

from dishka import AsyncContainer, Provider, Scope, make_async_container, provide, provide_all
from dishka.integrations.fastapi import FastapiProvider
from sqlalchemy.ext.asyncio import AsyncSession

from papyruslm.adapters.outbound.database.sqlite import SQLiteDatabaseManager
from papyruslm.adapters.outbound.repositories.notebook_repository import SQLAlchemyNotebookRepository
from papyruslm.application.ports.repositories.notebook_repository import NotebookRepository
from papyruslm.application.use_cases.create_notebook import CreateNotebookUseCase
from papyruslm.application.use_cases.delete_notebook import DeleteNotebookUseCase
from papyruslm.application.use_cases.list_notebooks import ListNotebooksUseCase
from papyruslm.application.use_cases.update_notebook import UpdateNotebookUseCase
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

    use_cases = provide_all(
        CreateNotebookUseCase,
        ListNotebooksUseCase,
        UpdateNotebookUseCase,
        DeleteNotebookUseCase,
        scope=Scope.REQUEST,
    )


def create_container() -> AsyncContainer:
    return make_async_container(AppProvider(), FastapiProvider())
