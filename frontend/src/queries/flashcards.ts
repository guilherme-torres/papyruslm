import { keepPreviousData, queryOptions, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import type { PaginationParams } from '@/api/client'
import {
    createFlashcard,
    deleteFlashcard,
    findNextDueFlashcard,
    listFlashcards,
    reviewFlashcard,
    updateFlashcard,
    type CreateFlashcardInput,
    type ReviewQuality,
    type UpdateFlashcardInput,
} from '@/api/flashcards'
import { flashcardKeys, notebookKeys } from '@/queries/keys'

export type CreateNotebookFlashcardInput = Omit<CreateFlashcardInput, 'notebook_id'>

export interface UpdateFlashcardVariables {
    id: string
    input: UpdateFlashcardInput
}

export interface ReviewFlashcardVariables {
    id: string
    quality: ReviewQuality
}

export function flashcardsQueryOptions(notebookId: string, params: PaginationParams = {}) {
    return queryOptions({
        queryKey: flashcardKeys.list(notebookId, params),
        queryFn: ({ signal }) => listFlashcards(notebookId, params, signal),
        placeholderData: keepPreviousData,
    })
}

export function nextDueFlashcardQueryOptions(notebookId: string) {
    return queryOptions({
        queryKey: flashcardKeys.nextDue(notebookId),
        queryFn: ({ signal }) => findNextDueFlashcard(notebookId, signal),
    })
}

function invalidateNotebookFlashcards(queryClient: QueryClient, notebookId: string) {
    return Promise.all([
        queryClient.invalidateQueries({ queryKey: flashcardKeys.notebook(notebookId) }),
        queryClient.invalidateQueries({ queryKey: notebookKeys.all }),
    ])
}

export function useCreateFlashcard(notebookId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (input: CreateNotebookFlashcardInput) => createFlashcard({ ...input, notebook_id: notebookId }),
        onSuccess: () => invalidateNotebookFlashcards(queryClient, notebookId),
    })
}

export function useUpdateFlashcard(notebookId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, input }: UpdateFlashcardVariables) => updateFlashcard(id, input),
        onSuccess: () => invalidateNotebookFlashcards(queryClient, notebookId),
    })
}

export function useReviewFlashcard(notebookId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, quality }: ReviewFlashcardVariables) => reviewFlashcard(id, quality),
        onSuccess: () => invalidateNotebookFlashcards(queryClient, notebookId),
    })
}

export function useDeleteFlashcard(notebookId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => deleteFlashcard(id),
        onSuccess: () => invalidateNotebookFlashcards(queryClient, notebookId),
    })
}
