import { useState, type DragEvent } from 'react'
import { CircleAlertIcon, CircleCheckIcon, PlusIcon, UploadIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { toast } from '@/components/ui/toast'
import { useUploadDocument } from '@/queries/documents'

const ACCEPTED_EXTENSIONS = '.pdf,.docx,.txt,.md,.markdown'
const UPLOAD_ERROR = 'Não foi possível enviar o arquivo.'

type UploadStatus = 'uploading' | 'done' | 'error'

interface UploadItem {
    key: string
    name: string
    status: UploadStatus
    error?: string
}

interface UploadDocumentsDialogProps {
    notebookId: string
}

export function UploadDocumentsDialog({ notebookId }: UploadDocumentsDialogProps) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button variant="outline" className="w-full" />}>
                <PlusIcon data-icon="inline-start" />
                Adicionar documento
            </DialogTrigger>
            <DialogContent>
                <UploadDocumentsForm notebookId={notebookId} onUploaded={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    )
}

interface UploadDocumentsFormProps {
    notebookId: string
    onUploaded: () => void
}

function uploadedMessage(count: number): string {
    return count === 1
        ? 'Documento adicionado. O processamento já começou.'
        : `${count} documentos adicionados. O processamento já começou.`
}

function UploadDocumentsForm({ notebookId, onUploaded }: UploadDocumentsFormProps) {
    const uploadDocument = useUploadDocument(notebookId)
    const [items, setItems] = useState<UploadItem[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const isUploading = items.some((item) => item.status === 'uploading')

    async function uploadFiles(files: File[]) {
        if (files.length === 0 || isUploading) return
        const batch = files.map((file, index): UploadItem => ({
            key: `${Date.now()}-${index}-${file.name}`,
            name: file.name,
            status: 'uploading',
        }))
        setItems(batch)
        const results = await Promise.allSettled(files.map((file) => uploadDocument.mutateAsync(file)))
        const finished = batch.map((item, index): UploadItem => {
            const result = results[index]
            if (result.status === 'fulfilled') return { ...item, status: 'done' }
            return { ...item, status: 'error', error: result.reason instanceof Error ? result.reason.message : UPLOAD_ERROR }
        })
        setItems(finished)
        if (finished.every((item) => item.status === 'done')) {
            toast.add({ type: 'success', description: uploadedMessage(files.length) })
            onUploaded()
        }
    }

    function handleDragOver(event: DragEvent<HTMLLabelElement>) {
        event.preventDefault()
        if (!isUploading) setIsDragging(true)
    }

    function handleDrop(event: DragEvent<HTMLLabelElement>) {
        event.preventDefault()
        setIsDragging(false)
        void uploadFiles([...event.dataTransfer.files])
    }

    return (
        <>
            <DialogHeader>
                <DialogTitle>Adicionar documentos</DialogTitle>
                <DialogDescription>
                    Os documentos são processados em segundo plano e viram fontes de consulta assim que ficam prontos.
                </DialogDescription>
            </DialogHeader>
            <label
                htmlFor="document-files"
                data-dragging={isDragging}
                onDragOver={handleDragOver}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-10 text-center transition-colors hover:bg-muted/50 has-focus-visible:border-ring has-focus-visible:ring-3 has-focus-visible:ring-ring/50 has-disabled:pointer-events-none has-disabled:opacity-50 data-[dragging=true]:border-primary data-[dragging=true]:bg-primary/5"
            >
                <span className="mb-1 flex size-10 items-center justify-center rounded-lg bg-muted text-foreground">
                    <UploadIcon className="size-5" />
                </span>
                <span className="font-medium">Arraste arquivos para cá ou clique para escolher</span>
                <span className="text-muted-foreground">PDF e Word até 50 MB · Markdown e texto até 10 MB</span>
                <input
                    id="document-files"
                    type="file"
                    multiple
                    accept={ACCEPTED_EXTENSIONS}
                    disabled={isUploading}
                    className="sr-only"
                    onChange={(event) => {
                        void uploadFiles([...(event.target.files ?? [])])
                        event.target.value = ''
                    }}
                />
            </label>
            {items.length > 0 && (
                <ul aria-label="Arquivos enviados" className="flex flex-col gap-2">
                    {items.map((item) => (
                        <li key={item.key} className="flex items-start gap-2">
                            <span className="flex h-5 shrink-0 items-center">
                                {item.status === 'uploading' && <Spinner aria-label="Enviando" />}
                                {item.status === 'done' && <CircleCheckIcon className="size-4 text-primary" />}
                                {item.status === 'error' && <CircleAlertIcon className="size-4 text-destructive" />}
                            </span>
                            <span className="flex min-w-0 flex-col gap-0.5">
                                <span className="truncate">{item.name}</span>
                                {item.error && <span className="text-destructive">{item.error}</span>}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
            <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>Fechar</DialogClose>
            </DialogFooter>
        </>
    )
}
