import { useEffect, useRef } from 'react'
import type { DocumentStatus, NotebookDocument } from '@/api/documents'
import { toast } from '@/components/ui/toast'

const IN_PROGRESS_STATUSES: ReadonlySet<DocumentStatus> = new Set(['pending', 'processing'])

export function useFailedDocumentToasts(documents: NotebookDocument[] | undefined) {
    const previousStatuses = useRef(new Map<string, DocumentStatus>())

    useEffect(() => {
        if (!documents) return
        for (const document of documents) {
            const previousStatus = previousStatuses.current.get(document.id)
            if (document.status === 'failed' && previousStatus && IN_PROGRESS_STATUSES.has(previousStatus)) {
                toast.add({
                    type: 'error',
                    title: 'Falha ao processar documento',
                    description: `Não foi possível extrair o texto de “${document.filename}”. Use o botão de reprocessar para tentar de novo.`,
                })
            }
        }
        previousStatuses.current = new Map(documents.map((document) => [document.id, document.status]))
    }, [documents])
}
