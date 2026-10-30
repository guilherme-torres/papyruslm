import { useRef, useState, type RefObject } from 'react'
import { PlusIcon } from 'lucide-react'
import { NotebookForm } from '@/components/notebooks/notebook-form'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { useCreateNotebook } from '@/queries/notebooks'

const DEFAULT_NOTEBOOK_NAME = 'Caderno sem título'

export function CreateNotebookDialog() {
    const [open, setOpen] = useState(false)
    const nameRef = useRef<HTMLInputElement>(null)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button />}>
                <PlusIcon data-icon="inline-start" />
                Criar caderno
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
    const createNotebook = useCreateNotebook()

    return (
        <NotebookForm
            title="Criar caderno"
            description="Dê um nome ao caderno e organize-o com tags, se quiser."
            submitLabel="Criar caderno"
            errorTitle="Não foi possível criar o caderno"
            defaultValues={{ name: DEFAULT_NOTEBOOK_NAME, tags: [] }}
            nameRef={nameRef}
            isPending={createNotebook.isPending}
            error={createNotebook.error}
            onSubmit={(input) => createNotebook.mutate(input, { onSuccess: onCreated })}
        />
    )
}
