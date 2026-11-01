import { CircleAlertIcon, Trash2Icon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Flashcard } from '@/api/flashcards'
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
import { useDeleteFlashcard } from '@/queries/flashcards'

interface DeleteFlashcardDialogProps {
    flashcard: Flashcard
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function DeleteFlashcardDialog({ flashcard, open, onOpenChange }: DeleteFlashcardDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <DeleteFlashcardConfirmation flashcard={flashcard} onDeleted={() => onOpenChange(false)} />
            </AlertDialogContent>
        </AlertDialog>
    )
}

interface DeleteFlashcardConfirmationProps {
    flashcard: Flashcard
    onDeleted: () => void
}

function DeleteFlashcardConfirmation({ flashcard, onDeleted }: DeleteFlashcardConfirmationProps) {
    const { t } = useTranslation()
    const deleteFlashcard = useDeleteFlashcard(flashcard.notebook_id)

    return (
        <>
            <AlertDialogHeader>
                <AlertDialogMedia className="bg-destructive/10 text-destructive">
                    <Trash2Icon />
                </AlertDialogMedia>
                <AlertDialogTitle>{t('flashcards.deleteTitle')}</AlertDialogTitle>
                <AlertDialogDescription className="line-clamp-3 wrap-break-word">
                    {t('flashcards.deleteDescription')}
                </AlertDialogDescription>
            </AlertDialogHeader>
            {deleteFlashcard.isError && (
                <Alert variant="destructive">
                    <CircleAlertIcon />
                    <AlertTitle>{t('flashcards.deleteError')}</AlertTitle>
                    <AlertDescription>{deleteFlashcard.error.message}</AlertDescription>
                </Alert>
            )}
            <AlertDialogFooter>
                <AlertDialogCancel disabled={deleteFlashcard.isPending}>{t('common.cancel')}</AlertDialogCancel>
                <AlertDialogAction
                    variant="destructive"
                    disabled={deleteFlashcard.isPending}
                    onClick={() => deleteFlashcard.mutate(flashcard.id, { onSuccess: onDeleted })}
                >
                    {deleteFlashcard.isPending && <Spinner data-icon="inline-start" />}
                    {t('flashcards.deleteAction')}
                </AlertDialogAction>
            </AlertDialogFooter>
        </>
    )
}
