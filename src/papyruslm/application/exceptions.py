from uuid import UUID


class ApplicationException(Exception): ...


class NotebookNotFound(ApplicationException):
    def __init__(self, id: UUID):
        self.id = id
        super().__init__(f"Notebook {id} not found")


class FlashcardNotFound(ApplicationException):
    def __init__(self, id: UUID):
        self.id = id
        super().__init__(f"Flashcard {id} not found")


class DocumentNotFound(ApplicationException):
    def __init__(self, id: UUID):
        self.id = id
        super().__init__(f"Document {id} not found")


class FileStorageError(ApplicationException):
    def __init__(self, key: str):
        self.key = key
        super().__init__(f"Could not store file {key}")
