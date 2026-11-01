import { useRef, useState, type RefObject } from 'react'
import { PlusIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const frontRef = useRef<HTMLTextAreaElement>(null)

    const handleCreated = () => {
        setOpen(false)
        toast.add({ type: 'success', description: t('flashcards.created') })
        onCreated?.()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {compact ? (
                <Tooltip>
                    <TooltipTrigger
                        render={
                            <DialogTrigger render={<Button variant="ghost" size="icon-sm" aria-label={t('flashcards.create')} />} />
                        }
                    >
                        <PlusIcon />
                    </TooltipTrigger>
                    <TooltipContent side="bottom">{t('flashcards.create')}</TooltipContent>
                </Tooltip>
            ) : (
                <DialogTrigger render={<Button />}>
                    <PlusIcon data-icon="inline-start" />
                    {t('flashcards.create')}
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
    const { t } = useTranslation()
    const createFlashcard = useCreateFlashcard(notebookId)

    return (
        <FlashcardForm
            title={t('flashcards.create')}
            description={t('flashcards.createDescription')}
            submitLabel={t('flashcards.create')}
            errorTitle={t('flashcards.createError')}
            defaultValues={{ front: '', back: '' }}
            frontRef={frontRef}
            isPending={createFlashcard.isPending}
            error={createFlashcard.error}
            onSubmit={(values) => createFlashcard.mutate(values, { onSuccess: onCreated })}
        />
    )
}
