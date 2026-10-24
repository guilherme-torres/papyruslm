from uuid import UUID

from sqlalchemy import delete, func, select
from sqlalchemy.dialects.sqlite import insert
from sqlalchemy.ext.asyncio import AsyncSession

from papyruslm.adapters.outbound.database.models import SQLAlchemyNotebook, SQLAlchemyTag
from papyruslm.domain.entities import Notebook, Tag


class SQLAlchemyNotebookRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def create_notebook(self, notebook: Notebook) -> Notebook:
        tags_db = await self._get_or_create_tags(notebook.tags)
        notebook_db = SQLAlchemyNotebook(id=notebook.id, name=notebook.name, tags=tags_db)
        self._session.add(notebook_db)
        await self._session.commit()
        await self._session.refresh(notebook_db)
        return notebook_db.to_entity()

    async def list_notebooks(
        self,
        limit: int,
        offset: int,
        tags: list[str] | None = None,
    ) -> tuple[list[Notebook], int]:
        stmt = (
            select(SQLAlchemyNotebook)
            .order_by(SQLAlchemyNotebook.created_at.desc(), SQLAlchemyNotebook.id)
            .limit(limit)
            .offset(offset)
        )
        count_stmt = select(func.count()).select_from(SQLAlchemyNotebook)
        if tags:
            stmt = stmt.where(SQLAlchemyNotebook.tags.any(SQLAlchemyTag.name.in_(tags)))
            count_stmt = count_stmt.where(SQLAlchemyNotebook.tags.any(SQLAlchemyTag.name.in_(tags)))
        result = await self._session.scalars(stmt)
        total = await self._session.scalar(count_stmt)
        return [notebook_db.to_entity() for notebook_db in result], total

    async def update_notebook(self, notebook: Notebook) -> Notebook | None:
        notebook_db = await self._get_model(notebook.id)
        if notebook_db is None:
            return None
        notebook_db.name = notebook.name
        notebook_db.tags = await self._get_or_create_tags(notebook.tags)
        await self._session.commit()
        await self._session.refresh(notebook_db)
        return notebook_db.to_entity()

    async def delete_notebook(self, id: UUID) -> bool:
        result = await self._session.execute(
            delete(SQLAlchemyNotebook).where(SQLAlchemyNotebook.id == id)
        )
        await self._session.commit()
        return result.rowcount > 0

    async def exists_by_id(self, id: UUID) -> bool:
        stmt = select(SQLAlchemyNotebook.id).where(SQLAlchemyNotebook.id == id)
        return await self._session.scalar(stmt) is not None

    async def _get_model(self, id: UUID) -> SQLAlchemyNotebook | None:
        return await self._session.get(SQLAlchemyNotebook, id)

    async def _get_or_create_tags(self, tags: list[Tag]) -> list[SQLAlchemyTag]:
        tags_by_name: dict[str, Tag] = {}
        for tag in tags:
            tags_by_name.setdefault(tag.name, tag)
        if not tags_by_name:
            return []
        names = list(tags_by_name)
        unique_tags = tags_by_name.values()
        await self._session.execute(
            insert(SQLAlchemyTag)
            .values([{"id": tag.id, "name": tag.name} for tag in unique_tags])
            .on_conflict_do_nothing(index_elements=["name"])
        )
        result = await self._session.scalars(
            select(SQLAlchemyTag).where(SQLAlchemyTag.name.in_(names))
        )
        models_by_name = {tag.name: tag for tag in result}
        return [models_by_name[name] for name in names]
