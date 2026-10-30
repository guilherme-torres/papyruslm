import { http, type ErrorMessages } from '@/api/client'

export type DocumentStatus = 'pending' | 'processing' | 'ready' | 'failed'

export interface NotebookDocument {
    id: string
    notebook_id: string
    filename: string
    mime_type: string
    size_bytes: number
    status: DocumentStatus
    created_at: string
}

const NOT_FOUND = 'Documento não encontrado.'

const UPLOAD_ERRORS: ErrorMessages = {
    404: 'Caderno não encontrado.',
    422: 'Formato de arquivo não suportado ou arquivo grande demais.',
    503: 'Não foi possível salvar o arquivo. Tente novamente mais tarde.',
}

const REPROCESS_ERRORS: ErrorMessages = {
    404: NOT_FOUND,
    409: 'Este documento já está na fila ou em processamento.',
}

export function listDocuments(notebookId: string, signal?: AbortSignal): Promise<NotebookDocument[]> {
    return http.get(`/notebooks/${notebookId}/documents`, {
        signal,
        errorMessages: { 404: 'Caderno não encontrado.' },
    })
}

export function uploadDocument(notebookId: string, file: File): Promise<NotebookDocument> {
    const body = new FormData()
    body.append('file', file)
    return http.post(`/notebooks/${notebookId}/documents`, body, { errorMessages: UPLOAD_ERRORS })
}

export function deleteDocument(id: string): Promise<void> {
    return http.delete(`/documents/${id}`, { errorMessages: { 404: NOT_FOUND } })
}

export function reprocessDocument(id: string): Promise<NotebookDocument> {
    return http.post(`/documents/${id}/reprocess`, undefined, { errorMessages: REPROCESS_ERRORS })
}
