import { useRef, type RefObject } from 'react'
import type { Flashcard } from '@/api/flashcards'
import { FlashcardForm } from '@/components/flashcards/flashcard-form'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useUpdateFlashcard } from '@/queries/flashcards'

interface EditFlashcardDialogProps {
    flashcard: Flashcard
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditFlashcardDialog({ flashcard, open, onOpenChange }: EditFlashcardDialogProps) {
    const frontRef = useRef<HTMLTextAreaElement>(null)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent initialFocus={frontRef}>
                <EditFlashcardForm flashcard={flashcard} frontRef={frontRef} onSaved={() => onOpenChange(false)} />
            </DialogContent>
        </Dialog>
    )
}

interface EditFlashcardFormProps {
    flashcard: Flashcard
    frontRef: RefObject<HTMLTextAreaElement | null>
    onSaved: () => void
}

function EditFlashcardForm({ flashcard, frontRef, onSaved }: EditFlashcardFormProps) {
    const updateFlashcard = useUpdateFlashcard(flashcard.notebook_id)

    return (
        <FlashcardForm
            title="Editar flashcard"
            description="Altere a frente e o verso do flashcard."
            submitLabel="Salvar alterações"
            errorTitle="Não foi possível salvar o flashcard"
            defaultValues={{ front: flashcard.front, back: flashcard.back }}
            frontRef={frontRef}
            isPending={updateFlashcard.isPending}
            error={updateFlashcard.error}
            onSubmit={(input) => updateFlashcard.mutate({ id: flashcard.id, input }, { onSuccess: onSaved })}
        />
    )
}
