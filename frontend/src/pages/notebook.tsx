import { useState } from 'react'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { getRouteApi, Link } from '@tanstack/react-router'
import { ArrowLeftIcon, CircleAlertIcon, NotebookTabsIcon, PanelLeftIcon, PanelRightIcon } from 'lucide-react'
import type { Notebook } from '@/api/notebooks'
import { ApiError } from '@/api/client'
import { DocumentsPanel, type DocumentsPanelProps } from '@/components/documents/documents-panel'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChatPanel } from '@/components/workspace/chat-panel'
import { FlashcardsPanel } from '@/components/workspace/flashcards-panel'
import { CollapsedPanel } from '@/components/workspace/panel'
import { useDocumentSelection } from '@/hooks/use-document-selection'
import { useFailedDocumentToasts } from '@/hooks/use-failed-document-toasts'
import { useMediaQuery } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'
import { documentsQueryOptions } from '@/queries/documents'
import { notebookQueryOptions } from '@/queries/notebooks'

const route = getRouteApi('/notebooks/$notebookId')

const DESKTOP_MEDIA_QUERY = '(min-width: 1024px)'

export function NotebookPage() {
    const { notebookId } = route.useParams()
    const notebookQuery = useQuery(notebookQueryOptions(notebookId))
    const documentsQuery = useQuery(documentsQueryOptions(notebookId))
    const selection = useDocumentSelection(documentsQuery.data)
    const [viewingDocumentId, setViewingDocumentId] = useState<string | null>(null)
    const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY)
    useFailedDocumentToasts(documentsQuery.data)

    if (notebookQuery.isError) {
        return <NotebookError error={notebookQuery.error} onRetry={() => void notebookQuery.refetch()} />
    }

    const viewingDocument = documentsQuery.data?.find(
        (document) => document.id === viewingDocumentId && document.status === 'ready',
    )

    const documentsPanelProps: DocumentsPanelProps = {
        notebookId,
        documentsQuery,
        selection,
        viewingDocument,
        onViewingDocumentChange: setViewingDocumentId,
    }

    return (
        <div className="flex h-full min-h-0 flex-col gap-3 p-3 sm:p-4">
            <NotebookHeader notebookQuery={notebookQuery} />
            {isDesktop ? (
                <DesktopWorkspace documentsPanelProps={documentsPanelProps} selectedSourcesCount={selection.selectedIds.length} />
            ) : (
                <MobileWorkspace documentsPanelProps={documentsPanelProps} selectedSourcesCount={selection.selectedIds.length} />
            )}
        </div>
    )
}

interface NotebookHeaderProps {
    notebookQuery: UseQueryResult<Notebook, Error>
}

function NotebookHeader({ notebookQuery }: NotebookHeaderProps) {
    return (
        <div className="flex min-w-0 shrink-0 items-center gap-2">
            <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Voltar para Meus cadernos"
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
    )
}

interface WorkspaceProps {
    documentsPanelProps: DocumentsPanelProps
    selectedSourcesCount: number
}

function DesktopWorkspace({ documentsPanelProps, selectedSourcesCount }: WorkspaceProps) {
    const [documentsOpen, setDocumentsOpen] = useState(true)
    const [flashcardsOpen, setFlashcardsOpen] = useState(true)

    return (
        <div className="flex min-h-0 flex-1 gap-3">
            {documentsOpen ? (
                <DocumentsPanel
                    {...documentsPanelProps}
                    onCollapse={() => setDocumentsOpen(false)}
                    className={cn(
                        'w-80 shrink-0 xl:w-96',
                        documentsPanelProps.viewingDocument && 'w-[28rem] xl:w-[36rem]',
                    )}
                />
            ) : (
                <CollapsedPanel
                    label="Documentos"
                    expandLabel="Abrir painel de documentos"
                    side="left"
                    onExpand={() => setDocumentsOpen(true)}
                    icon={<PanelLeftIcon />}
                />
            )}
            <ChatPanel selectedSourcesCount={selectedSourcesCount} className="min-w-0 flex-1" />
            {flashcardsOpen ? (
                <FlashcardsPanel onCollapse={() => setFlashcardsOpen(false)} className="w-80 shrink-0 xl:w-96" />
            ) : (
                <CollapsedPanel
                    label="Flashcards"
                    expandLabel="Abrir painel de flashcards"
                    side="right"
                    onExpand={() => setFlashcardsOpen(true)}
                    icon={<PanelRightIcon />}
                />
            )}
        </div>
    )
}

function MobileWorkspace({ documentsPanelProps, selectedSourcesCount }: WorkspaceProps) {
    return (
        <Tabs defaultValue="chat" className="min-h-0 flex-1">
            <TabsList className="w-full shrink-0">
                <TabsTrigger value="documents">Documentos</TabsTrigger>
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
            </TabsList>
            <TabsContent value="documents" className="flex min-h-0">
                <DocumentsPanel {...documentsPanelProps} className="flex-1" />
            </TabsContent>
            <TabsContent value="chat" className="flex min-h-0">
                <ChatPanel selectedSourcesCount={selectedSourcesCount} className="flex-1" />
            </TabsContent>
            <TabsContent value="flashcards" className="flex min-h-0">
                <FlashcardsPanel className="flex-1" />
            </TabsContent>
        </Tabs>
    )
}

interface NotebookErrorProps {
    error: Error
    onRetry: () => void
}

function NotebookError({ error, onRetry }: NotebookErrorProps) {
    if (error instanceof ApiError && error.status === 404) {
        return (
            <Empty className="m-4">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <NotebookTabsIcon />
                    </EmptyMedia>
                    <EmptyTitle>Caderno não encontrado</EmptyTitle>
                    <EmptyDescription>Ele pode ter sido excluído ou o endereço está incorreto.</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <Button variant="outline" nativeButton={false} render={<Link to="/" />}>
                        Voltar para Meus cadernos
                    </Button>
                </EmptyContent>
            </Empty>
        )
    }

    return (
        <div className="mx-auto w-full max-w-2xl p-4">
            <Alert variant="destructive">
                <CircleAlertIcon />
                <AlertTitle>Não foi possível carregar o caderno</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
                <AlertAction>
                    <Button variant="outline" size="sm" onClick={onRetry}>
                        Tentar novamente
                    </Button>
                </AlertAction>
            </Alert>
        </div>
    )
}
