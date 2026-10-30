import { useRef, type RefObject } from 'react'
import type { Notebook } from '@/api/notebooks'
import { NotebookForm } from '@/components/notebooks/notebook-form'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useUpdateNotebook } from '@/queries/notebooks'

interface EditNotebookDialogProps {
    notebook: Notebook
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditNotebookDialog({ notebook, open, onOpenChange }: EditNotebookDialogProps) {
    const nameRef = useRef<HTMLInputElement>(null)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent initialFocus={nameRef}>
                <EditNotebookForm notebook={notebook} nameRef={nameRef} onSaved={() => onOpenChange(false)} />
            </DialogContent>
        </Dialog>
    )
}

interface EditNotebookFormProps {
    notebook: Notebook
    nameRef: RefObject<HTMLInputElement | null>
    onSaved: () => void
}

function EditNotebookForm({ notebook, nameRef, onSaved }: EditNotebookFormProps) {
    const updateNotebook = useUpdateNotebook()

    return (
        <NotebookForm
            title="Editar caderno"
            description="Altere o nome e as tags do caderno."
            submitLabel="Salvar alterações"
            errorTitle="Não foi possível salvar o caderno"
            defaultValues={{ name: notebook.name, tags: notebook.tags.map((tag) => tag.name) }}
            nameRef={nameRef}
            isPending={updateNotebook.isPending}
            error={updateNotebook.error}
            onSubmit={(input) => updateNotebook.mutate({ id: notebook.id, input }, { onSuccess: onSaved })}
        />
    )
}
