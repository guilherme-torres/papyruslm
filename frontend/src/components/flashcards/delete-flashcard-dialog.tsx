import { CircleAlertIcon, Trash2Icon } from 'lucide-react'
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
    const deleteFlashcard = useDeleteFlashcard(flashcard.notebook_id)

    return (
        <>
            <AlertDialogHeader>
                <AlertDialogMedia className="bg-destructive/10 text-destructive">
                    <Trash2Icon />
                </AlertDialogMedia>
                <AlertDialogTitle>Excluir este flashcard?</AlertDialogTitle>
                <AlertDialogDescription className="line-clamp-3 wrap-break-word">
                    Este flashcard será excluído e sairá das suas revisões. Essa ação não pode ser desfeita.
                </AlertDialogDescription>
            </AlertDialogHeader>
            {deleteFlashcard.isError && (
                <Alert variant="destructive">
                    <CircleAlertIcon />
                    <AlertTitle>Não foi possível excluir o flashcard</AlertTitle>
                    <AlertDescription>{deleteFlashcard.error.message}</AlertDescription>
                </Alert>
            )}
            <AlertDialogFooter>
                <AlertDialogCancel disabled={deleteFlashcard.isPending}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                    variant="destructive"
                    disabled={deleteFlashcard.isPending}
                    onClick={() => deleteFlashcard.mutate(flashcard.id, { onSuccess: onDeleted })}
                >
                    {deleteFlashcard.isPending && <Spinner data-icon="inline-start" />}
                    Excluir flashcard
                </AlertDialogAction>
            </AlertDialogFooter>
        </>
    )
}
