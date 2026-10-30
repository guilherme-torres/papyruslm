import { useState } from 'react'
import type { NotebookDocument } from '@/api/documents'

export interface DocumentSelection {
    selectedIds: string[]
    readyCount: number
    isSelected: (documentId: string) => boolean
    toggle: (documentId: string, selected: boolean) => void
    setAll: (selected: boolean) => void
}

export function useDocumentSelection(documents: NotebookDocument[] | undefined): DocumentSelection {
    const [excludedIds, setExcludedIds] = useState<ReadonlySet<string>>(() => new Set())
    const readyIds = (documents ?? []).filter((document) => document.status === 'ready').map((document) => document.id)

    return {
        selectedIds: readyIds.filter((documentId) => !excludedIds.has(documentId)),
        readyCount: readyIds.length,
        isSelected: (documentId) => !excludedIds.has(documentId),
        toggle: (documentId, selected) =>
            setExcludedIds((current) => {
                const next = new Set(current)
                if (selected) next.delete(documentId)
                else next.add(documentId)
                return next
            }),
        setAll: (selected) => setExcludedIds(selected ? new Set() : new Set(readyIds)),
    }
}
