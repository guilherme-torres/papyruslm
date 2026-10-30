import { http, type ErrorMessages, type Paginated, type PaginationParams } from '@/api/client'
import type { Tag } from '@/api/tags'

export interface Notebook {
    id: string
    name: string
    tags: Tag[]
}

export interface NotebookListItem extends Notebook {
    flashcards_total: number
    flashcards_due: number
}

export interface NotebookInput {
    name: string
    tags: string[]
}

export interface ListNotebooksParams extends PaginationParams {
    tags?: string[]
}

const NOT_FOUND = 'Caderno não encontrado.'

const SAVE_ERRORS: ErrorMessages = {
    404: NOT_FOUND,
    422: 'Verifique o nome e as tags do caderno.',
}

export function listNotebooks(params: ListNotebooksParams = {}, signal?: AbortSignal): Promise<Paginated<NotebookListItem>> {
    return http.get('/notebooks', { query: { ...params }, signal })
}

export function getNotebook(id: string, signal?: AbortSignal): Promise<Notebook> {
    return http.get(`/notebooks/${id}`, { signal, errorMessages: { 404: NOT_FOUND } })
}

export function createNotebook(input: NotebookInput): Promise<Notebook> {
    return http.post('/notebooks', input, { errorMessages: SAVE_ERRORS })
}

export function updateNotebook(id: string, input: NotebookInput): Promise<Notebook> {
    return http.put(`/notebooks/${id}`, input, { errorMessages: SAVE_ERRORS })
}

export function deleteNotebook(id: string): Promise<void> {
    return http.delete(`/notebooks/${id}`, { errorMessages: { 404: NOT_FOUND } })
}
