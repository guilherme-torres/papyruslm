import { useState } from 'react'
import { AudioLinesIcon, FileTextIcon, RotateCwIcon, Trash2Icon, TriangleAlertIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
    const { t } = useTranslation()
    const [deleteOpen, setDeleteOpen] = useState(false)
    const reprocessDocument = useReprocessDocument(notebookId)
    const isReady = document.status === 'ready'
    const isInProgress = document.status === 'pending' || document.status === 'processing'
    const isFailed = document.status === 'failed'
    const isAudio = document.mime_type.startsWith('audio/')

    function reprocess() {
        reprocessDocument.mutate(document.id, {
            onError: (error) => toast.add({ type: 'error', title: t('documents.reprocessError'), description: error.message }),
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
                    ) : isAudio ? (
                        <AudioLinesIcon data-icon="inline-start" />
                    ) : (
                        <FileTextIcon data-icon="inline-start" />
                    )}
                    <span className="truncate">{document.filename}</span>
                </TooltipTrigger>
                <TooltipContent side="bottom">{document.filename}</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger
                    render={
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={t('documents.deleteLabel', { filename: document.filename })}
                            disabled={isInProgress}
                            onClick={() => setDeleteOpen(true)}
                        />
                    }
                >
                    <Trash2Icon />
                </TooltipTrigger>
                <TooltipContent side="bottom">{t('documents.deleteAction')}</TooltipContent>
            </Tooltip>
            <span className="flex size-8 shrink-0 items-center justify-center">
                {isReady && (
                    <Checkbox
                        checked={selected}
                        onCheckedChange={(checked) => onSelectedChange(checked)}
                        aria-label={t('documents.useAsSource', { filename: document.filename })}
                    />
                )}
                {isInProgress && <Spinner aria-label={t('documents.processing', { filename: document.filename })} />}
                {isFailed && (
                    <Tooltip>
                        <TooltipTrigger
                            render={
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-label={t('documents.reprocessLabel', { filename: document.filename })}
                                    disabled={reprocessDocument.isPending}
                                    onClick={reprocess}
                                />
                            }
                        >
                            <RotateCwIcon />
                        </TooltipTrigger>
                        <TooltipContent side="bottom">{t('documents.reprocessTooltip')}</TooltipContent>
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
