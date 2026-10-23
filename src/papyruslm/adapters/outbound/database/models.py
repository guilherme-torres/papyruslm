from datetime import datetime
from uuid import UUID

from sqlalchemy import Column, DateTime, ForeignKey, String, Table, Text, func, text
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

    id: Mapped[UUID] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(60))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    tags: Mapped[list["SQLAlchemyTag"]] = relationship(secondary=tags_notebooks)

    def to_entity(self) -> Notebook:
        return Notebook(id=self.id, name=self.name, tags=[tag.to_entity() for tag in self.tags])


class SQLAlchemyTag(Base):
    __tablename__ = "tags"

    id: Mapped[UUID] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(30), unique=True)

    def to_entity(self) -> Tag:
        return Tag(id=self.id, name=self.name)


class Flashcard(Base):
    __tablename__ = "flashcards"

    id: Mapped[UUID] = mapped_column(primary_key=True)
    front: Mapped[str] = mapped_column(Text)
    back: Mapped[str] = mapped_column(Text)
    notebook_id: Mapped[UUID] = mapped_column(ForeignKey("notebooks.id", ondelete="CASCADE"))
    repetitions: Mapped[int]
    interval_days: Mapped[int]
    ease_factor: Mapped[float]
    due_date: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
