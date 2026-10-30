from collections.abc import AsyncIterator

from dishka import AsyncContainer, Provider, Scope, make_async_container, provide, provide_all
from dishka.integrations.fastapi import FastapiProvider
from sqlalchemy.ext.asyncio import AsyncSession

from papyruslm.adapters.outbound.chat import OllamaChatAssistant
from papyruslm.adapters.outbound.database.sqlite import SQLiteDatabaseManager
from papyruslm.adapters.outbound.database.unit_of_work import SQLAlchemyUnitOfWork
from papyruslm.adapters.outbound.embedding import OllamaEmbedder
from papyruslm.adapters.outbound.extraction import (
    DocumentTypeTextExtractor,
    DocxExtractor,
    FasterWhisperTranscriber,
    LiteParsePdfExtractor,
    PlainTextExtractor,
)
from papyruslm.adapters.outbound.file_type import FiletypeDetector
from papyruslm.adapters.outbound.repositories import (
    SQLAlchemyChunkRepository,
    SQLAlchemyDocumentContentRepository,
    SQLAlchemyDocumentRepository,
    SQLAlchemyFlashcardRepository,
    SQLAlchemyMessageRepository,
    SQLAlchemyNotebookRepository,
    SQLAlchemyTagRepository,
)
from papyruslm.adapters.outbound.splitting import RecursiveTextSplitter
from papyruslm.adapters.outbound.storage import FileSystemStorage
from papyruslm.adapters.outbound.vector_index import SqliteVecIndex
from papyruslm.application.ports import (
    ChatAssistant,
    Embedder,
    FileStorage,
    FileTypeDetector,
    TextExtractor,
    TextSplitter,
    UnitOfWork,
    VectorIndex,
)
from papyruslm.application.use_cases import (
    AddDocumentUseCase,
    AskQuestionUseCase,
    ClaimNextDocumentUseCase,
    ClearMessagesUseCase,
    DeleteDocumentUseCase,
    CreateFlashcardUseCase,
    CreateNotebookUseCase,
    DeleteFlashcardUseCase,
    DeleteNotebookUseCase,
    FindNextDueUseCase,
    ListDocumentsUseCase,
    ListFlashcardsUseCase,
    ListMessagesUseCase,
    ListNotebooksUseCase,
    ListTagsUseCase,
    ProcessDocumentUseCase,
    RecoverStaleDocumentsUseCase,
    RenewLeaseUseCase,
    ReviewFlashcardUseCase,
    UpdateFlashcardUseCase,
    UpdateNotebookUseCase,
)
from papyruslm.domain.entities.document import DocumentType
from papyruslm.domain.repositories import (
    ChunkRepository,
    DocumentContentRepository,
    DocumentRepository,
    FlashcardRepository,
    MessageRepository,
    NotebookRepository,
    TagRepository,
)
from papyruslm.settings import Settings, get_settings


class DatabaseProvider(Provider):
    @provide(scope=Scope.APP)
    def settings(self) -> Settings:
        return get_settings()

    @provide(scope=Scope.APP)
    async def database(self, settings: Settings) -> AsyncIterator[SQLiteDatabaseManager]:
        settings.db_path.parent.mkdir(parents=True, exist_ok=True)
        db = SQLiteDatabaseManager(settings.db_url, echo=settings.db_echo)
        await db.connect()
        yield db
        await db.disconnect()

    @provide(scope=Scope.REQUEST)
    async def session(self, db: SQLiteDatabaseManager) -> AsyncIterator[AsyncSession]:
        async with db.session() as session:
            yield session

    unit_of_work = provide(SQLAlchemyUnitOfWork, provides=UnitOfWork, scope=Scope.REQUEST)
    notebook_repository = provide(SQLAlchemyNotebookRepository, provides=NotebookRepository, scope=Scope.REQUEST)
    flashcard_repository = provide(SQLAlchemyFlashcardRepository, provides=FlashcardRepository, scope=Scope.REQUEST)
    tag_repository = provide(SQLAlchemyTagRepository, provides=TagRepository, scope=Scope.REQUEST)
    document_repository = provide(SQLAlchemyDocumentRepository, provides=DocumentRepository, scope=Scope.REQUEST)
    document_content_repository = provide(
        SQLAlchemyDocumentContentRepository,
        provides=DocumentContentRepository,
        scope=Scope.REQUEST,
    )
    chunk_repository = provide(SQLAlchemyChunkRepository, provides=ChunkRepository, scope=Scope.REQUEST)
    message_repository = provide(SQLAlchemyMessageRepository, provides=MessageRepository, scope=Scope.REQUEST)


class RagProvider(Provider):
    @provide(scope=Scope.APP)
    def file_storage(self, settings: Settings) -> FileStorage:
        return FileSystemStorage(settings.documents_dir)

    @provide(scope=Scope.APP)
    def embedder(self, settings: Settings) -> Embedder:
        return OllamaEmbedder(settings.embedding_model, settings.ollama_base_url)

    @provide(scope=Scope.REQUEST)
    def vector_index(self, session: AsyncSession, settings: Settings) -> VectorIndex:
        return SqliteVecIndex(session, settings.embedding_dimensions)


class ApiProvider(Provider):
    file_type_detector = provide(FiletypeDetector, provides=FileTypeDetector, scope=Scope.APP)

    @provide(scope=Scope.APP)
    def chat_assistant(self, settings: Settings) -> ChatAssistant:
        return OllamaChatAssistant(settings.chat_model, settings.ollama_base_url, settings.chat_context_tokens)

    use_cases = provide_all(
        CreateNotebookUseCase,
        ListNotebooksUseCase,
        UpdateNotebookUseCase,
        DeleteNotebookUseCase,
        CreateFlashcardUseCase,
        ReviewFlashcardUseCase,
        ListFlashcardsUseCase,
        UpdateFlashcardUseCase,
        DeleteFlashcardUseCase,
        FindNextDueUseCase,
        ListTagsUseCase,
        AddDocumentUseCase,
        ListDocumentsUseCase,
        DeleteDocumentUseCase,
        AskQuestionUseCase,
        ListMessagesUseCase,
        ClearMessagesUseCase,
        scope=Scope.REQUEST,
    )


class WorkerProvider(Provider):
    @provide(scope=Scope.APP)
    def text_extractor(self, settings: Settings) -> TextExtractor:
        plain_text = PlainTextExtractor()
        return DocumentTypeTextExtractor(
            {
                DocumentType.PDF: LiteParsePdfExtractor(settings.ocr_language, settings.tessdata_path),
                DocumentType.DOCX: DocxExtractor(),
                DocumentType.TEXT: plain_text,
                DocumentType.MARKDOWN: plain_text,
                DocumentType.AUDIO: FasterWhisperTranscriber(
                    settings.whisper_model,
                    settings.whisper_device,
                    settings.whisper_compute_type,
                    settings.transcription_language,
                ),
            }
        )

    @provide(scope=Scope.APP)
    def text_splitter(self, settings: Settings) -> TextSplitter:
        return RecursiveTextSplitter(settings.chunk_size, settings.chunk_overlap)

    use_cases = provide_all(
        ClaimNextDocumentUseCase,
        ProcessDocumentUseCase,
        RenewLeaseUseCase,
        RecoverStaleDocumentsUseCase,
        scope=Scope.REQUEST,
    )


def create_container() -> AsyncContainer:
    return make_async_container(DatabaseProvider(), RagProvider(), ApiProvider(), FastapiProvider())


def create_worker_container() -> AsyncContainer:
    return make_async_container(DatabaseProvider(), RagProvider(), WorkerProvider())
