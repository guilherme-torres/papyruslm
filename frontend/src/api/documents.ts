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

export interface DocumentContent {
    document_id: string
    text: string
}

const NOT_FOUND = 'documentNotFound'

const UPLOAD_ERRORS: ErrorMessages = {
    404: 'notebookNotFound',
    422: 'documentUnsupported',
    503: 'documentStorage',
}

const REPROCESS_ERRORS: ErrorMessages = {
    404: NOT_FOUND,
    409: 'documentBusy',
}

export function listDocuments(notebookId: string, signal?: AbortSignal): Promise<NotebookDocument[]> {
    return http.get(`/notebooks/${notebookId}/documents`, {
        signal,
        errorMessages: { 404: 'notebookNotFound' },
    })
}

export function getDocumentContent(id: string, signal?: AbortSignal): Promise<DocumentContent> {
    return http.get(`/documents/${id}/content`, {
        signal,
        errorMessages: { 404: 'documentTextUnavailable' },
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
