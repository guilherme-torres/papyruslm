from datetime import datetime
import uuid

from sqlalchemy import Column, DateTime, ForeignKey, String, Table, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

from papyruslm.domain.entities import Notebook, Tag


class Base(DeclarativeBase):
    pass


tags_notebooks = Table(
    "tags_notebooks",
    Base.metadata,
    Column("tag_id", ForeignKey("tags.id"), primary_key=True),
    Column("notebook_id", ForeignKey("notebooks.id"), primary_key=True),
)


class SQLAlchemyNotebook(Base):
    __tablename__ = "notebooks"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(60))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    tags: Mapped[list["SQLAlchemyTag"]] = relationship(secondary=tags_notebooks)

    def to_domain(self) -> Notebook:
        return Notebook(id=self.id, name=self.name, tags=[tag.to_domain() for tag in self.tags])


class SQLAlchemyTag(Base):
    __tablename__ = "tags"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(30), unique=True)

    def to_domain(self) -> Tag:
        return Tag(id=self.id, name=self.name)
