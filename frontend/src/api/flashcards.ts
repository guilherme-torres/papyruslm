import { http, type ErrorMessages, type Paginated, type PaginationParams } from '@/api/client'

export interface Flashcard {
    id: string
    notebook_id: string
    front: string
    back: string
    due_date: string
}

export interface CreateFlashcardInput {
    notebook_id: string
    front: string
    back: string
}

export interface UpdateFlashcardInput {
    front: string
    back: string
}

export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5

const NOT_FOUND = 'Flashcard não encontrado.'
const NOTEBOOK_NOT_FOUND = 'Caderno não encontrado.'
const INVALID_CONTENT = 'Preencha a frente e o verso do flashcard.'

const CREATE_ERRORS: ErrorMessages = { 404: NOTEBOOK_NOT_FOUND, 422: INVALID_CONTENT }
const UPDATE_ERRORS: ErrorMessages = { 404: NOT_FOUND, 422: INVALID_CONTENT }
const REVIEW_ERRORS: ErrorMessages = {
    404: NOT_FOUND,
    409: 'Este flashcard ainda não está disponível para revisão.',
    422: 'Avaliação de revisão inválida.',
}

export function listFlashcards(notebookId: string, params: PaginationParams = {}, signal?: AbortSignal): Promise<Paginated<Flashcard>> {
    return http.get(`/notebooks/${notebookId}/flashcards`, {
        query: { ...params },
        signal,
        errorMessages: { 404: NOTEBOOK_NOT_FOUND },
    })
}

export function findNextDueFlashcard(notebookId: string, signal?: AbortSignal): Promise<Flashcard | null> {
    return http.get(`/notebooks/${notebookId}/flashcards/next-due`, {
        signal,
        errorMessages: { 404: NOTEBOOK_NOT_FOUND },
    })
}

export function createFlashcard(input: CreateFlashcardInput): Promise<Flashcard> {
    return http.post('/flashcards', input, { errorMessages: CREATE_ERRORS })
}

export function updateFlashcard(id: string, input: UpdateFlashcardInput): Promise<Flashcard> {
    return http.put(`/flashcards/${id}`, input, { errorMessages: UPDATE_ERRORS })
}

export function reviewFlashcard(id: string, quality: ReviewQuality): Promise<Flashcard> {
    return http.post(`/flashcards/${id}/review`, { review_quality: quality }, { errorMessages: REVIEW_ERRORS })
}

export function deleteFlashcard(id: string): Promise<void> {
    return http.delete(`/flashcards/${id}`, { errorMessages: { 404: NOT_FOUND } })
}
