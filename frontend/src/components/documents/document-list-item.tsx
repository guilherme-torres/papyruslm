import { useState } from 'react'
import { FileTextIcon, RotateCwIcon, Trash2Icon, TriangleAlertIcon } from 'lucide-react'
import type { NotebookDocument } from '@/api/documents'
import { DeleteDocumentDialog } from '@/components/documents/delete-document-dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Spinner } from '@/components/ui/spinner'
import { toast } from '@/components/ui/toast'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useReprocessDocument } from '@/queries/documents'

interface DocumentListItemProps {
    notebookId: string
    document: NotebookDocument
    selected: boolean
    onSelectedChange: (selected: boolean) => void
    onOpen: () => void
}

export function DocumentListItem({ notebookId, document, selected, onSelectedChange, onOpen }: DocumentListItemProps) {
    const [deleteOpen, setDeleteOpen] = useState(false)
    const reprocessDocument = useReprocessDocument(notebookId)
    const isReady = document.status === 'ready'
    const isInProgress = document.status === 'pending' || document.status === 'processing'
    const isFailed = document.status === 'failed'

    function reprocess() {
        reprocessDocument.mutate(document.id, {
            onError: (error) => toast.add({ type: 'error', title: 'Não foi possível reprocessar', description: error.message }),
        })
    }

    return (
        <li className="flex items-center gap-1">
            <Tooltip>
                <TooltipTrigger
                    render={
                        <Button
                            variant="ghost"
                            className="min-w-0 flex-1 justify-start font-normal"
                            disabled={!isReady}
                            onClick={onOpen}
                        />
                    }
                >
                    {isFailed ? (
                        <TriangleAlertIcon data-icon="inline-start" className="text-destructive" />
                    ) : (
                        <FileTextIcon data-icon="inline-start" />
                    )}
                    <span className="truncate">{document.filename}</span>
                </TooltipTrigger>
                <TooltipContent side="right">{document.filename}</TooltipContent>
            </Tooltip>
            <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Excluir ${document.filename}`}
                disabled={isInProgress}
                onClick={() => setDeleteOpen(true)}
            >
                <Trash2Icon />
            </Button>
            <span className="flex size-8 shrink-0 items-center justify-center">
                {isReady && (
                    <Checkbox
                        checked={selected}
                        onCheckedChange={(checked) => onSelectedChange(checked)}
                        aria-label={`Usar ${document.filename} como fonte`}
                    />
                )}
                {isInProgress && <Spinner aria-label={`Processando ${document.filename}`} />}
                {isFailed && (
                    <Tooltip>
                        <TooltipTrigger
                            render={
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-label={`Processar ${document.filename} novamente`}
                                    disabled={reprocessDocument.isPending}
                                    onClick={reprocess}
                                />
                            }
                        >
                            <RotateCwIcon />
                        </TooltipTrigger>
                        <TooltipContent side="right">Falha no processamento. Processar novamente</TooltipContent>
                    </Tooltip>
                )}
            </span>
            <DeleteDocumentDialog
                notebookId={notebookId}
                document={document}
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
            />
        </li>
    )
}
