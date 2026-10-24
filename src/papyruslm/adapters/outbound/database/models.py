from datetime import datetime
from uuid import UUID

from sqlalchemy import Column, ForeignKey, Index, String, Table, Text, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

from papyruslm.adapters.outbound.database.types import UTCDateTime
from papyruslm.domain.entities import Notebook, Tag, Flashcard


class Base(DeclarativeBase):
    type_annotation_map = {datetime: UTCDateTime}


tags_notebooks = Table(
    "tags_notebooks",
    Base.metadata,
    Column("tag_id", ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
    Column("notebook_id", ForeignKey("notebooks.id", ondelete="CASCADE"), primary_key=True),
)


class SQLAlchemyNotebook(Base):
    __tablename__ = "notebooks"

    id: Mapped[UUID] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    tags: Mapped[list["SQLAlchemyTag"]] = relationship(secondary=tags_notebooks, lazy="selectin")

    def to_entity(self) -> Notebook:
        return Notebook(id=self.id, name=self.name, tags=[tag.to_entity() for tag in self.tags])


class SQLAlchemyTag(Base):
    __tablename__ = "tags"

    id: Mapped[UUID] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    def to_entity(self) -> Tag:
        return Tag(id=self.id, name=self.name)


class SQLAlchemyFlashcard(Base):
    __tablename__ = "flashcards"
    __table_args__ = (Index("ix_flashcards_notebook_due", "notebook_id", "due_date"),)

    id: Mapped[UUID] = mapped_column(primary_key=True)
    front: Mapped[str] = mapped_column(Text)
    back: Mapped[str] = mapped_column(Text)
    notebook_id: Mapped[UUID] = mapped_column(ForeignKey("notebooks.id", ondelete="CASCADE"))
    repetitions: Mapped[int]
    interval_days: Mapped[int]
    ease_factor: Mapped[float]
    due_date: Mapped[datetime]
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    @classmethod
    def from_entity(cls, flashcard: Flashcard) -> "SQLAlchemyFlashcard":
        return cls(
            id=flashcard.id,
            front=flashcard.front,
            back=flashcard.back,
            notebook_id=flashcard.notebook_id,
            repetitions=flashcard.repetitions,
            interval_days=flashcard.interval_days,
            ease_factor=flashcard.ease_factor,
            due_date=flashcard.due_date,
        )

    def to_entity(self) -> Flashcard:
        return Flashcard(
            id=self.id,
            front=self.front,
            back=self.back,
            notebook_id=self.notebook_id,
            repetitions=self.repetitions,
            interval_days=self.interval_days,
            ease_factor=self.ease_factor,
            due_date=self.due_date,
        )
