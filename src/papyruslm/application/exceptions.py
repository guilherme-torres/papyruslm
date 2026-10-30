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


class DocumentContentNotFound(ApplicationException):
    def __init__(self, document_id: UUID):
        self.document_id = document_id
        super().__init__(f"Content of document {document_id} not found")


class MessageNotFound(ApplicationException):
    def __init__(self, id: UUID):
        self.id = id
        super().__init__(f"Message {id} not found")


class CitationNotFound(ApplicationException):
    def __init__(self, message_id: UUID, index: int):
        self.message_id = message_id
        self.index = index
        super().__init__(f"Citation [{index}] not found in message {message_id}")


class CitationSourceUnavailable(ApplicationException):
    def __init__(self, message_id: UUID, index: int):
        self.message_id = message_id
        self.index = index
        super().__init__(f"The source of citation [{index}] is no longer available in the document")


class FileStorageError(ApplicationException):
    def __init__(self, key: str):
        self.key = key
        super().__init__(f"Could not store file {key}")
