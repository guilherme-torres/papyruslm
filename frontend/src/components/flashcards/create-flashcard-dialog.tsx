import { useRef, useState, type RefObject } from 'react'
import { PlusIcon } from 'lucide-react'
import { FlashcardForm } from '@/components/flashcards/flashcard-form'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { toast } from '@/components/ui/toast'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useCreateFlashcard } from '@/queries/flashcards'

interface CreateFlashcardDialogProps {
    notebookId: string
    compact?: boolean
    onCreated?: () => void
}

export function CreateFlashcardDialog({ notebookId, compact = false, onCreated }: CreateFlashcardDialogProps) {
    const [open, setOpen] = useState(false)
    const frontRef = useRef<HTMLTextAreaElement>(null)

    const handleCreated = () => {
        setOpen(false)
        toast.add({ type: 'success', description: 'Flashcard criado.' })
        onCreated?.()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {compact ? (
                <Tooltip>
                    <TooltipTrigger
                        render={
                            <DialogTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Criar flashcard" />} />
                        }
                    >
                        <PlusIcon />
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Criar flashcard</TooltipContent>
                </Tooltip>
            ) : (
                <DialogTrigger render={<Button />}>
                    <PlusIcon data-icon="inline-start" />
                    Criar flashcard
                </DialogTrigger>
            )}
            <DialogContent initialFocus={frontRef}>
                <CreateFlashcardForm notebookId={notebookId} frontRef={frontRef} onCreated={handleCreated} />
            </DialogContent>
        </Dialog>
    )
}

interface CreateFlashcardFormProps {
    notebookId: string
    frontRef: RefObject<HTMLTextAreaElement | null>
    onCreated: () => void
}

function CreateFlashcardForm({ notebookId, frontRef, onCreated }: CreateFlashcardFormProps) {
    const createFlashcard = useCreateFlashcard(notebookId)

    return (
        <FlashcardForm
            title="Criar flashcard"
            description="Escreva a pergunta na frente e a resposta no verso."
            submitLabel="Criar flashcard"
            errorTitle="Não foi possível criar o flashcard"
            defaultValues={{ front: '', back: '' }}
            frontRef={frontRef}
            isPending={createFlashcard.isPending}
            error={createFlashcard.error}
            onSubmit={(values) => createFlashcard.mutate(values, { onSuccess: onCreated })}
        />
    )
}
