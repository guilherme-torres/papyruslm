import { ApiError, http, type Paginated, type PaginationParams } from '@/api/client'

export type MessageRole = 'user' | 'assistant'

export interface Citation {
    index: number
    document_id: string
    document_name: string
    start: number
    end: number
    excerpt: string
}

export interface Message {
    id: string
    notebook_id: string
    role: MessageRole
    content: string
    citations: Citation[]
    model: string | null
    created_at: string
}

export interface CitationSource {
    document_id: string
    document_name: string
    before: string
    highlight: string
    after: string
}

export interface AskQuestionInput {
    question: string
    document_ids?: string[]
}

const NOTEBOOK_NOT_FOUND = 'Caderno não encontrado.'
const ANSWER_ERROR = 'Não foi possível gerar a resposta. Tente novamente.'

export function listMessages(notebookId: string, params: PaginationParams = {}, signal?: AbortSignal): Promise<Paginated<Message>> {
    return http.get(`/notebooks/${notebookId}/messages`, {
        query: { ...params },
        signal,
        errorMessages: { 404: NOTEBOOK_NOT_FOUND },
    })
}

export function clearMessages(notebookId: string): Promise<void> {
    return http.delete(`/notebooks/${notebookId}/messages`, { errorMessages: { 404: NOTEBOOK_NOT_FOUND } })
}

export function getCitationSource(notebookId: string, messageId: string, index: number, signal?: AbortSignal): Promise<CitationSource> {
    return http.get(`/notebooks/${notebookId}/messages/${messageId}/citations/${index}/source`, {
        signal,
        errorMessages: { 404: 'Não foi possível localizar o trecho citado.' },
    })
}

export async function* askQuestion(notebookId: string, input: AskQuestionInput, signal?: AbortSignal): AsyncGenerator<string, Message> {
    const events = http.stream(`/notebooks/${notebookId}/chat`, input, {
        signal,
        errorMessages: {
            404: NOTEBOOK_NOT_FOUND,
            422: 'Escreva uma pergunta antes de enviar.',
            500: ANSWER_ERROR,
        },
    })
    for await (const { event, data } of events) {
        if (event === 'delta') yield (JSON.parse(data) as { text: string }).text
        if (event === 'done') return JSON.parse(data) as Message
        if (event === 'error') break
    }
    throw new ApiError(500, ANSWER_ERROR)
}
