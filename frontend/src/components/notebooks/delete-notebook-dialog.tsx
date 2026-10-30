import { CircleAlertIcon, Trash2Icon } from 'lucide-react'
import type { Notebook } from '@/api/notebooks'
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
import { useDeleteNotebook } from '@/queries/notebooks'

interface DeleteNotebookDialogProps {
    notebook: Notebook
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function DeleteNotebookDialog({ notebook, open, onOpenChange }: DeleteNotebookDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <DeleteNotebookConfirmation notebook={notebook} onDeleted={() => onOpenChange(false)} />
            </AlertDialogContent>
        </AlertDialog>
    )
}

interface DeleteNotebookConfirmationProps {
    notebook: Notebook
    onDeleted: () => void
}

function DeleteNotebookConfirmation({ notebook, onDeleted }: DeleteNotebookConfirmationProps) {
    const deleteNotebook = useDeleteNotebook()

    return (
        <>
            <AlertDialogHeader>
                <AlertDialogMedia className="bg-destructive/10 text-destructive">
                    <Trash2Icon />
                </AlertDialogMedia>
                <AlertDialogTitle>Excluir este caderno?</AlertDialogTitle>
                <AlertDialogDescription className="wrap-break-word">
                    O caderno será excluído junto com seus flashcards, documentos e conversas. Essa
                    ação não pode ser desfeita.
                </AlertDialogDescription>
            </AlertDialogHeader>
            {deleteNotebook.isError && (
                <Alert variant="destructive">
                    <CircleAlertIcon />
                    <AlertTitle>Não foi possível excluir o caderno</AlertTitle>
                    <AlertDescription>{deleteNotebook.error.message}</AlertDescription>
                </Alert>
            )}
            <AlertDialogFooter>
                <AlertDialogCancel disabled={deleteNotebook.isPending}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                    variant="destructive"
                    disabled={deleteNotebook.isPending}
                    onClick={() => deleteNotebook.mutate(notebook.id, { onSuccess: onDeleted })}
                >
                    {deleteNotebook.isPending && <Spinner data-icon="inline-start" />}
                    Excluir caderno
                </AlertDialogAction>
            </AlertDialogFooter>
        </>
    )
}
