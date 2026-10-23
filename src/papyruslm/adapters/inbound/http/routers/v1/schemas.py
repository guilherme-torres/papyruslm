from typing import Annotated
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class NotebookRequest(BaseModel):
    name: str = Field(min_length=1, max_length=60)
    tags: list[Annotated[str, Field(min_length=1, max_length=30)]] = []


class TagResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str


class NotebookResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    tags: list[TagResponse]


class NotebookFilterParams(BaseModel):
    limit: int = Field(100, gt=0, le=100)
    offset: int = Field(0, ge=0)
    tags: list[str] = []


class NotebookResponsePaginated(BaseModel):    
    total: int
    limit: int
    offset: int
    items: list[NotebookResponse]
