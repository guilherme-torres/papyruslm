import { CircleAlertIcon, Trash2Icon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { NotebookDocument } from '@/api/documents'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Spinner } from '@/components/ui/spinner'
import { useDeleteDocument } from '@/queries/documents'

interface DeleteDocumentDialogProps {
    notebookId: string
    document: NotebookDocument
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function DeleteDocumentDialog({ notebookId, document, open, onOpenChange }: DeleteDocumentDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <DeleteDocumentConfirmation
                    notebookId={notebookId}
                    document={document}
                    onDeleted={() => onOpenChange(false)}
                />
            </AlertDialogContent>
        </AlertDialog>
    )
}

interface DeleteDocumentConfirmationProps {
    notebookId: string
    document: NotebookDocument
    onDeleted: () => void
}

function DeleteDocumentConfirmation({ notebookId, document, onDeleted }: DeleteDocumentConfirmationProps) {
    const { t } = useTranslation()
    const deleteDocument = useDeleteDocument(notebookId)

    return (
        <>
            <AlertDialogHeader>
                <AlertDialogMedia className="bg-destructive/10 text-destructive">
                    <Trash2Icon />
                </AlertDialogMedia>
                <AlertDialogTitle>{t('documents.deleteTitle')}</AlertDialogTitle>
                <AlertDialogDescription className="wrap-break-word">
                    {t('documents.deleteDescription', { filename: document.filename })}
                </AlertDialogDescription>
            </AlertDialogHeader>
            {deleteDocument.isError && (
                <Alert variant="destructive">
                    <CircleAlertIcon />
                    <AlertTitle>{t('documents.deleteError')}</AlertTitle>
                    <AlertDescription>{deleteDocument.error.message}</AlertDescription>
                </Alert>
            )}
            <AlertDialogFooter>
                <AlertDialogCancel disabled={deleteDocument.isPending}>{t('common.cancel')}</AlertDialogCancel>
                <AlertDialogAction
                    variant="destructive"
                    disabled={deleteDocument.isPending}
                    onClick={() => deleteDocument.mutate(document.id, { onSuccess: onDeleted })}
                >
                    {deleteDocument.isPending && <Spinner data-icon="inline-start" />}
                    {t('documents.deleteAction')}
                </AlertDialogAction>
            </AlertDialogFooter>
        </>
    )
}
