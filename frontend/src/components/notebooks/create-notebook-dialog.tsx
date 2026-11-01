import { useRef, useState, type RefObject } from 'react'
import { PlusIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NotebookForm } from '@/components/notebooks/notebook-form'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { useCreateNotebook } from '@/queries/notebooks'

export function CreateNotebookDialog() {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const nameRef = useRef<HTMLInputElement>(null)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button />}>
                <PlusIcon data-icon="inline-start" />
                {t('notebooks.create')}
            </DialogTrigger>
            <DialogContent initialFocus={nameRef}>
                <CreateNotebookForm nameRef={nameRef} onCreated={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    )
}

interface CreateNotebookFormProps {
    nameRef: RefObject<HTMLInputElement | null>
    onCreated: () => void
}

function CreateNotebookForm({ nameRef, onCreated }: CreateNotebookFormProps) {
    const { t } = useTranslation()
    const createNotebook = useCreateNotebook()

    return (
        <NotebookForm
            title={t('notebooks.create')}
            description={t('notebooks.createDescription')}
            submitLabel={t('notebooks.create')}
            errorTitle={t('notebooks.createError')}
            defaultValues={{ name: t('notebooks.defaultName'), tags: [] }}
            nameRef={nameRef}
            isPending={createNotebook.isPending}
            error={createNotebook.error}
            onSubmit={(input) => createNotebook.mutate(input, { onSuccess: onCreated })}
        />
    )
}
