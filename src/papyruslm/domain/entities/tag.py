from dataclasses import dataclass, field
from uuid import UUID, uuid4


@dataclass
class Tag:
    name: str
    id: UUID = field(default_factory=uuid4)
