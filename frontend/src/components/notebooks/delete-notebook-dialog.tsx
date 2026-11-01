import { CircleAlertIcon, Trash2Icon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
    const { t } = useTranslation()
    const deleteNotebook = useDeleteNotebook()

    return (
        <>
            <AlertDialogHeader>
                <AlertDialogMedia className="bg-destructive/10 text-destructive">
                    <Trash2Icon />
                </AlertDialogMedia>
                <AlertDialogTitle>{t('notebooks.deleteTitle')}</AlertDialogTitle>
                <AlertDialogDescription className="wrap-break-word">
                    {t('notebooks.deleteDescription')}
                </AlertDialogDescription>
            </AlertDialogHeader>
            {deleteNotebook.isError && (
                <Alert variant="destructive">
                    <CircleAlertIcon />
                    <AlertTitle>{t('notebooks.deleteError')}</AlertTitle>
                    <AlertDescription>{deleteNotebook.error.message}</AlertDescription>
                </Alert>
            )}
            <AlertDialogFooter>
                <AlertDialogCancel disabled={deleteNotebook.isPending}>{t('common.cancel')}</AlertDialogCancel>
                <AlertDialogAction
                    variant="destructive"
                    disabled={deleteNotebook.isPending}
                    onClick={() => deleteNotebook.mutate(notebook.id, { onSuccess: onDeleted })}
                >
                    {deleteNotebook.isPending && <Spinner data-icon="inline-start" />}
                    {t('notebooks.deleteAction')}
                </AlertDialogAction>
            </AlertDialogFooter>
        </>
    )
}
