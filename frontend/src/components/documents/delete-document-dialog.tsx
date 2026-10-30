import { CircleAlertIcon, Trash2Icon } from 'lucide-react'
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
    const deleteDocument = useDeleteDocument(notebookId)

    return (
        <>
            <AlertDialogHeader>
                <AlertDialogMedia className="bg-destructive/10 text-destructive">
                    <Trash2Icon />
                </AlertDialogMedia>
                <AlertDialogTitle>Excluir este documento?</AlertDialogTitle>
                <AlertDialogDescription className="wrap-break-word">
                    “{document.filename}” deixará de ser uma fonte de consulta deste caderno. Essa ação não pode ser
                    desfeita.
                </AlertDialogDescription>
            </AlertDialogHeader>
            {deleteDocument.isError && (
                <Alert variant="destructive">
                    <CircleAlertIcon />
                    <AlertTitle>Não foi possível excluir o documento</AlertTitle>
                    <AlertDescription>{deleteDocument.error.message}</AlertDescription>
                </Alert>
            )}
            <AlertDialogFooter>
                <AlertDialogCancel disabled={deleteDocument.isPending}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                    variant="destructive"
                    disabled={deleteDocument.isPending}
                    onClick={() => deleteDocument.mutate(document.id, { onSuccess: onDeleted })}
                >
                    {deleteDocument.isPending && <Spinner data-icon="inline-start" />}
                    Excluir documento
                </AlertDialogAction>
            </AlertDialogFooter>
        </>
    )
}
