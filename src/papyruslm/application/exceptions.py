from uuid import UUID


class ApplicationException(Exception): ...


class NotebookNotFound(ApplicationException):
    def __init__(self, id: UUID):
        self.id = id
        super().__init__(f"Notebook {id} not found")
