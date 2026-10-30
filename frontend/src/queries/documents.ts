import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    deleteDocument,
    listDocuments,
    reprocessDocument,
    uploadDocument,
    type DocumentStatus,
} from '@/api/documents'
import { documentKeys } from '@/queries/keys'

const PROCESSING_POLL_INTERVAL_MS = 2000

const IN_PROGRESS_STATUSES: DocumentStatus[] = ['pending', 'processing']

export function documentsQueryOptions(notebookId: string) {
    return queryOptions({
        queryKey: documentKeys.notebook(notebookId),
        queryFn: ({ signal }) => listDocuments(notebookId, signal),
        refetchInterval: (query) =>
            query.state.data?.some((document) => IN_PROGRESS_STATUSES.includes(document.status))
                ? PROCESSING_POLL_INTERVAL_MS
                : false,
    })
}

export function useUploadDocument(notebookId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (file: File) => uploadDocument(notebookId, file),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: documentKeys.notebook(notebookId) }),
    })
}

export function useDeleteDocument(notebookId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => deleteDocument(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: documentKeys.notebook(notebookId) }),
    })
}

export function useReprocessDocument(notebookId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => reprocessDocument(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: documentKeys.notebook(notebookId) }),
    })
}
