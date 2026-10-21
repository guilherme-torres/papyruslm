from uuid import UUID

from sqlalchemy import select
from sqlalchemy.dialects.sqlite import insert
from sqlalchemy.exc import NoResultFound
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from papyruslm.adapters.outbound.database.models import SQLAlchemyNotebook, SQLAlchemyTag
from papyruslm.application.exceptions import NotebookNotFound
from papyruslm.domain.entities import Notebook, Tag


class SQLAlchemyNotebookRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def create_notebook(self, notebook: Notebook) -> None:
        tag_models = await self._get_or_create_tags(notebook.tags)
        self._session.add(
            SQLAlchemyNotebook(id=notebook.id, name=notebook.name, tags=tag_models)
        )
        await self._session.commit()
        notebook.tags = [tag.to_domain() for tag in tag_models]

    async def list_notebooks(
        self,
        limit: int,
        offset: int,
        tags: list[str] | None = None,
    ) -> list[Notebook]:
        stmt = (
            select(SQLAlchemyNotebook)
            .options(selectinload(SQLAlchemyNotebook.tags))
            .order_by(SQLAlchemyNotebook.created_at.desc(), SQLAlchemyNotebook.id)
            .limit(limit)
            .offset(offset)
        )
        if tags:
            stmt = stmt.where(SQLAlchemyNotebook.tags.any(SQLAlchemyTag.name.in_(tags)))
        result = await self._session.scalars(stmt)
        return [model.to_domain() for model in result]

    async def update_notebook(self, notebook: Notebook) -> None:
        try:
            model = await self._get_model(notebook.id)
        except NoResultFound as e:
            raise NotebookNotFound(notebook.id) from e
        model.name = notebook.name
        model.tags = await self._get_or_create_tags(notebook.tags)
        await self._session.commit()
        notebook.tags = [tag.to_domain() for tag in model.tags]

    async def delete_notebook(self, id: UUID) -> None:
        try:
            model = await self._get_model(id)
        except NoResultFound as e:
            raise NotebookNotFound(id) from e
        await self._session.delete(model)
        await self._session.commit()

    async def _get_model(self, id: UUID) -> SQLAlchemyNotebook:
        stmt = (
            select(SQLAlchemyNotebook)
            .where(SQLAlchemyNotebook.id == id)
            .options(selectinload(SQLAlchemyNotebook.tags))
        )
        result = await self._session.scalars(stmt)
        return result.one()

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
