import { keepPreviousData, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    createNotebook,
    deleteNotebook,
    getNotebook,
    listNotebooks,
    updateNotebook,
    type ListNotebooksParams,
    type NotebookInput,
} from '@/api/notebooks'
import { documentKeys, flashcardKeys, messageKeys, notebookKeys, tagKeys } from '@/queries/keys'

export interface UpdateNotebookVariables {
    id: string
    input: NotebookInput
}

export function notebooksQueryOptions(params: ListNotebooksParams = {}) {
    return queryOptions({
        queryKey: notebookKeys.list(params),
        queryFn: ({ signal }) => listNotebooks(params, signal),
        placeholderData: keepPreviousData,
    })
}

export function notebookQueryOptions(id: string) {
    return queryOptions({
        queryKey: notebookKeys.detail(id),
        queryFn: ({ signal }) => getNotebook(id, signal),
    })
}

export function useCreateNotebook() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (input: NotebookInput) => createNotebook(input),
        onSuccess: () =>
            Promise.all([
                queryClient.invalidateQueries({ queryKey: notebookKeys.all }),
                queryClient.invalidateQueries({ queryKey: tagKeys.all }),
            ]),
    })
}

export function useUpdateNotebook() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, input }: UpdateNotebookVariables) => updateNotebook(id, input),
        onSuccess: () =>
            Promise.all([
                queryClient.invalidateQueries({ queryKey: notebookKeys.all }),
                queryClient.invalidateQueries({ queryKey: tagKeys.all }),
            ]),
    })
}

export function useDeleteNotebook() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => deleteNotebook(id),
        onSuccess: (_data, id) => {
            queryClient.removeQueries({ queryKey: flashcardKeys.notebook(id) })
            queryClient.removeQueries({ queryKey: documentKeys.notebook(id) })
            queryClient.removeQueries({ queryKey: messageKeys.notebook(id) })
            return Promise.all([
                queryClient.invalidateQueries({ queryKey: notebookKeys.all }),
                queryClient.invalidateQueries({ queryKey: tagKeys.all }),
            ])
        },
    })
}
