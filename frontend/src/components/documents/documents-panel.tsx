import type { UseQueryResult } from '@tanstack/react-query'
import { CircleAlertIcon, FilesIcon, Minimize2Icon, PanelLeftCloseIcon } from 'lucide-react'
import type { NotebookDocument } from '@/api/documents'
import { DocumentListItem } from '@/components/documents/document-list-item'
import { DocumentViewer } from '@/components/documents/document-viewer'
import { UploadDocumentsDialog } from '@/components/documents/upload-documents-dialog'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Panel, PanelAction } from '@/components/workspace/panel'
import type { DocumentSelection } from '@/hooks/use-document-selection'

export interface DocumentsPanelProps {
    notebookId: string
    documentsQuery: UseQueryResult<NotebookDocument[], Error>
    selection: DocumentSelection
    viewingDocument: NotebookDocument | undefined
    onViewingDocumentChange: (documentId: string | null) => void
    onCollapse?: () => void
    className?: string
}

export function DocumentsPanel({
    notebookId,
    documentsQuery,
    selection,
    viewingDocument,
    onViewingDocumentChange,
    onCollapse,
    className,
}: DocumentsPanelProps) {
    if (viewingDocument) {
        return (
            <Panel
                title={viewingDocument.filename}
                className={className}
                action={
                    <PanelAction label="Fechar documento" onClick={() => onViewingDocumentChange(null)}>
                        <Minimize2Icon />
                    </PanelAction>
                }
            >
                <DocumentViewer key={viewingDocument.id} notebookId={notebookId} document={viewingDocument} />
            </Panel>
        )
    }

    return (
        <Panel
            title="Documentos"
            className={className}
            action={
                onCollapse && (
                    <PanelAction label="Recolher painel de documentos" side="right" onClick={onCollapse}>
                        <PanelLeftCloseIcon />
                    </PanelAction>
                )
            }
        >
            <div className="shrink-0 p-3">
                <UploadDocumentsDialog notebookId={notebookId} />
            </div>
            <DocumentList
                notebookId={notebookId}
                documentsQuery={documentsQuery}
                selection={selection}
                onOpen={(documentId) => onViewingDocumentChange(documentId)}
            />
        </Panel>
    )
}

interface DocumentListProps {
    notebookId: string
    documentsQuery: UseQueryResult<NotebookDocument[], Error>
    selection: DocumentSelection
    onOpen: (documentId: string) => void
}

function DocumentList({ notebookId, documentsQuery, selection, onOpen }: DocumentListProps) {
    if (documentsQuery.isPending) {
        return (
            <div aria-busy className="flex flex-col gap-3 px-4 py-2">
                {Array.from({ length: 4 }, (_, index) => (
                    <Skeleton key={index} className="h-6 w-full" />
                ))}
            </div>
        )
    }

    if (documentsQuery.isError) {
        return (
            <div className="px-3">
                <Alert variant="destructive">
                    <CircleAlertIcon />
                    <AlertTitle>Não foi possível carregar os documentos</AlertTitle>
                    <AlertDescription>{documentsQuery.error.message}</AlertDescription>
                    <AlertAction>
                        <Button variant="outline" size="sm" onClick={() => void documentsQuery.refetch()}>
                            Tentar novamente
                        </Button>
                    </AlertAction>
                </Alert>
            </div>
        )
    }

    if (documentsQuery.data.length === 0) {
        return (
            <Empty className="flex-1">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <FilesIcon />
                    </EmptyMedia>
                    <EmptyTitle>Nenhum documento</EmptyTitle>
                    <EmptyDescription>
                        Adicione PDFs, documentos do Word, Markdown ou textos para usar como fonte do chat.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        )
    }

    const allSelected = selection.readyCount > 0 && selection.selectedIds.length === selection.readyCount
    const someSelected = selection.selectedIds.length > 0 && !allSelected

    return (
        <>
            <div className="flex shrink-0 items-center gap-1 px-3 pb-1">
                <Label htmlFor="select-all-documents" className="min-w-0 flex-1 px-2.5 text-muted-foreground">
                    Selecionar todos
                </Label>
                <span className="flex size-8 shrink-0 items-center justify-center">
                    <Checkbox
                        id="select-all-documents"
                        checked={allSelected}
                        indeterminate={someSelected}
                        disabled={selection.readyCount === 0}
                        onCheckedChange={(checked) => selection.setAll(checked)}
                    />
                </span>
            </div>
            <ScrollArea className="min-h-0 flex-1">
                <ul aria-label="Documentos do caderno" className="flex flex-col gap-0.5 px-3 pb-3">
                    {documentsQuery.data.map((document) => (
                        <DocumentListItem
                            key={document.id}
                            notebookId={notebookId}
                            document={document}
                            selected={selection.isSelected(document.id)}
                            onSelectedChange={(selected) => selection.toggle(document.id, selected)}
                            onOpen={() => onOpen(document.id)}
                        />
                    ))}
                </ul>
            </ScrollArea>
        </>
    )
}
