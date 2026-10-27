from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from papyruslm.adapters.outbound.database.models import SQLAlchemyTag
from papyruslm.domain.entities import Tag


class SQLAlchemyTagRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def list_tags(self) -> list[Tag]:
        result = await self._session.scalars(
            select(SQLAlchemyTag).order_by(SQLAlchemyTag.created_at.desc(), SQLAlchemyTag.id)
        )
        return [tag_db.to_entity() for tag_db in result]
