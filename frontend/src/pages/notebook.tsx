import { useState } from 'react'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { getRouteApi, Link } from '@tanstack/react-router'
import {
    ArrowLeftIcon,
    CircleAlertIcon,
    GalleryVerticalEndIcon,
    NotebookTabsIcon,
    PanelLeftIcon,
    PanelRightIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { NotebookDocument } from '@/api/documents'
import type { Notebook } from '@/api/notebooks'
import { ApiError } from '@/api/client'
import { ChatPanel, type ChatPanelProps } from '@/components/chat/chat-panel'
import type { CitationTarget } from '@/components/documents/citation-source-panel'
import { DocumentsPanel, type DocumentsPanelProps, type DocumentsViewer } from '@/components/documents/documents-panel'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FlashcardsPanel } from '@/components/workspace/flashcards-panel'
import { CollapsedPanel } from '@/components/workspace/panel'
import { useDocumentSelection } from '@/hooks/use-document-selection'
import { useFailedDocumentToasts } from '@/hooks/use-failed-document-toasts'
import { useMediaQuery } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'
import { documentsQueryOptions } from '@/queries/documents'
import { useAskQuestion } from '@/queries/messages'
import { notebookQueryOptions } from '@/queries/notebooks'

const route = getRouteApi('/notebook/$notebookId')

const DESKTOP_MEDIA_QUERY = '(min-width: 1024px)'

type ViewerState = { type: 'document'; documentId: string } | { type: 'citation'; target: CitationTarget }

type MobileTab = 'documents' | 'chat' | 'flashcards'

export function NotebookPage() {
    const { notebookId } = route.useParams()
    const notebookQuery = useQuery(notebookQueryOptions(notebookId))
    const documentsQuery = useQuery(documentsQueryOptions(notebookId))
    const selection = useDocumentSelection(documentsQuery.data)
    const chat = useAskQuestion(notebookId)
    const [viewerState, setViewerState] = useState<ViewerState | null>(null)
    const [documentsOpen, setDocumentsOpen] = useState(true)
    const [mobileTab, setMobileTab] = useState<MobileTab>('chat')
    const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY)
    useFailedDocumentToasts(documentsQuery.data)

    if (notebookQuery.isError) {
        return <NotebookError error={notebookQuery.error} onRetry={() => void notebookQuery.refetch()} />
    }

    const viewer = resolveViewer(viewerState, documentsQuery.data)

    const openCitation = (target: CitationTarget) => {
        setViewerState({ type: 'citation', target })
        setDocumentsOpen(true)
        setMobileTab('documents')
    }

    const documentsPanelProps: DocumentsPanelProps = {
        notebookId,
        documentsQuery,
        selection,
        viewer,
        onOpenDocument: (documentId) => setViewerState({ type: 'document', documentId }),
        onCloseViewer: () => setViewerState(null),
    }

    const chatPanelProps: ChatPanelProps = {
        notebookId,
        chat,
        selectedDocumentIds: selection.selectedIds,
        onOpenCitation: openCitation,
    }

    return (
        <div className="flex h-full min-h-0 flex-col gap-3 p-3 sm:p-4">
            <NotebookHeader notebookId={notebookId} notebookQuery={notebookQuery} />
            {isDesktop ? (
                <DesktopWorkspace
                    notebookId={notebookId}
                    documentsPanelProps={documentsPanelProps}
                    chatPanelProps={chatPanelProps}
                    documentsOpen={documentsOpen}
                    onDocumentsOpenChange={setDocumentsOpen}
                />
            ) : (
                <MobileWorkspace
                    notebookId={notebookId}
                    documentsPanelProps={documentsPanelProps}
                    chatPanelProps={chatPanelProps}
                    tab={mobileTab}
                    onTabChange={setMobileTab}
                />
            )}
        </div>
    )
}

function resolveViewer(state: ViewerState | null, documents: NotebookDocument[] | undefined): DocumentsViewer | null {
    if (state?.type === 'citation') return state
    if (state?.type !== 'document') return null
    const document = documents?.find((candidate) => candidate.id === state.documentId && candidate.status === 'ready')
    return document ? { type: 'document', document } : null
}

interface NotebookHeaderProps {
    notebookId: string
    notebookQuery: UseQueryResult<Notebook, Error>
}

function NotebookHeader({ notebookId, notebookQuery }: NotebookHeaderProps) {
    const { t } = useTranslation()
    return (
        <div className="flex min-w-0 shrink-0 items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t('common.backToNotebooks')}
                    nativeButton={false}
                    render={<Link to="/" />}
                >
                    <ArrowLeftIcon />
                </Button>
                {notebookQuery.isSuccess ? (
                    <h1 className="min-w-0 truncate font-heading text-xl font-medium">{notebookQuery.data.name}</h1>
                ) : (
                    <Skeleton className="h-6 w-56" />
                )}
            </div>
            <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link to="/notebook/$notebookId/flashcards" params={{ notebookId }} />}
            >
                <GalleryVerticalEndIcon data-icon="inline-start" />
                {t('notebook.manageFlashcards')}
            </Button>
        </div>
    )
}

interface DesktopWorkspaceProps {
    notebookId: string
    documentsPanelProps: DocumentsPanelProps
    chatPanelProps: ChatPanelProps
    documentsOpen: boolean
    onDocumentsOpenChange: (open: boolean) => void
}

function DesktopWorkspace({
    notebookId,
    documentsPanelProps,
    chatPanelProps,
    documentsOpen,
    onDocumentsOpenChange,
}: DesktopWorkspaceProps) {
    const { t } = useTranslation()
    const [flashcardsOpen, setFlashcardsOpen] = useState(true)

    return (
        <div className="flex min-h-0 flex-1 gap-3">
            {documentsOpen ? (
                <DocumentsPanel
                    {...documentsPanelProps}
                    onCollapse={() => onDocumentsOpenChange(false)}
                    className={cn(
                        'w-80 shrink-0 xl:w-96',
                        documentsPanelProps.viewer && 'w-md xl:w-xl',
                    )}
                />
            ) : (
                <CollapsedPanel
                    label={t('common.documents')}
                    expandLabel={t('notebook.openDocumentsPanel')}
                    onExpand={() => onDocumentsOpenChange(true)}
                    icon={<PanelLeftIcon />}
                />
            )}
            <ChatPanel {...chatPanelProps} className="min-w-0 flex-1" />
            {flashcardsOpen ? (
                <FlashcardsPanel
                    notebookId={notebookId}
                    onCollapse={() => setFlashcardsOpen(false)}
                    className="w-80 shrink-0 xl:w-96"
                />
            ) : (
                <CollapsedPanel
                    label={t('common.flashcards')}
                    expandLabel={t('notebook.openFlashcardsPanel')}
                    onExpand={() => setFlashcardsOpen(true)}
                    icon={<PanelRightIcon />}
                />
            )}
        </div>
    )
}

interface MobileWorkspaceProps {
    notebookId: string
    documentsPanelProps: DocumentsPanelProps
    chatPanelProps: ChatPanelProps
    tab: MobileTab
    onTabChange: (tab: MobileTab) => void
}

function MobileWorkspace({ notebookId, documentsPanelProps, chatPanelProps, tab, onTabChange }: MobileWorkspaceProps) {
    const { t } = useTranslation()
    return (
        <Tabs value={tab} onValueChange={(value: MobileTab) => onTabChange(value)} className="min-h-0 flex-1">
            <TabsList className="w-full shrink-0">
                <TabsTrigger value="documents">{t('common.documents')}</TabsTrigger>
                <TabsTrigger value="chat">{t('common.chat')}</TabsTrigger>
                <TabsTrigger value="flashcards">{t('common.flashcards')}</TabsTrigger>
            </TabsList>
            <TabsContent value="documents" className="flex min-h-0">
                <DocumentsPanel {...documentsPanelProps} className="flex-1" />
            </TabsContent>
            <TabsContent value="chat" className="flex min-h-0">
                <ChatPanel {...chatPanelProps} className="flex-1" />
            </TabsContent>
            <TabsContent value="flashcards" className="flex min-h-0">
                <FlashcardsPanel notebookId={notebookId} className="flex-1" />
            </TabsContent>
        </Tabs>
    )
}

interface NotebookErrorProps {
    error: Error
    onRetry: () => void
}

function NotebookError({ error, onRetry }: NotebookErrorProps) {
    const { t } = useTranslation()
    if (error instanceof ApiError && error.status === 404) {
        return (
            <Empty className="m-4">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <NotebookTabsIcon />
                    </EmptyMedia>
                    <EmptyTitle>{t('common.notebookNotFound')}</EmptyTitle>
                    <EmptyDescription>{t('notebook.notFoundDescription')}</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <Button variant="outline" nativeButton={false} render={<Link to="/" />}>
                        {t('common.backToNotebooks')}
                    </Button>
                </EmptyContent>
            </Empty>
        )
    }

    return (
        <div className="mx-auto w-full max-w-2xl p-4">
            <Alert variant="destructive">
                <CircleAlertIcon />
                <AlertTitle>{t('notebook.loadError')}</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
                <AlertAction>
                    <Button variant="outline" size="sm" onClick={onRetry}>
                        {t('common.retry')}
                    </Button>
                </AlertAction>
            </Alert>
        </div>
    )
}
