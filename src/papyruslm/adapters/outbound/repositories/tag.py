from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from papyruslm.adapters.outbound.database.models import SQLAlchemyTag, tags_notebooks
from papyruslm.domain.repositories.tag import TagUsage


class SQLAlchemyTagRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def list_tags(self) -> list[TagUsage]:
        result = await self._session.execute(
            select(SQLAlchemyTag, func.count(tags_notebooks.c.notebook_id))
            .join(tags_notebooks, tags_notebooks.c.tag_id == SQLAlchemyTag.id)
            .group_by(SQLAlchemyTag.id)
            .order_by(SQLAlchemyTag.name, SQLAlchemyTag.id)
        )
        return [TagUsage(tag=tag_db.to_entity(), notebooks_total=total) for tag_db, total in result]
