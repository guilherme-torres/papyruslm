import type { PaginationParams } from '@/api/client'
import type { ListNotebooksParams } from '@/api/notebooks'

export const tagKeys = {
    all: ['tags'] as const,
}

export const notebookKeys = {
    all: ['notebooks'] as const,
    lists: () => [...notebookKeys.all, 'list'] as const,
    list: (params: ListNotebooksParams) => [...notebookKeys.lists(), params] as const,
    detail: (id: string) => [...notebookKeys.all, 'detail', id] as const,
}

export const flashcardKeys = {
    all: ['flashcards'] as const,
    notebook: (notebookId: string) => [...flashcardKeys.all, notebookId] as const,
    list: (notebookId: string, params: PaginationParams) => [...flashcardKeys.notebook(notebookId), 'list', params] as const,
    nextDue: (notebookId: string) => [...flashcardKeys.notebook(notebookId), 'next-due'] as const,
}

export const documentKeys = {
    all: ['documents'] as const,
    notebook: (notebookId: string) => [...documentKeys.all, notebookId] as const,
    list: (notebookId: string) => [...documentKeys.notebook(notebookId), 'list'] as const,
    content: (notebookId: string, documentId: string) => [...documentKeys.notebook(notebookId), 'content', documentId] as const,
}

export const messageKeys = {
    all: ['messages'] as const,
    notebook: (notebookId: string) => [...messageKeys.all, notebookId] as const,
    list: (notebookId: string, params: PaginationParams) => [...messageKeys.notebook(notebookId), 'list', params] as const,
    latest: (notebookId: string) => [...messageKeys.notebook(notebookId), 'latest'] as const,
    citationSource: (notebookId: string, messageId: string, index: number) =>
        [...messageKeys.notebook(notebookId), 'citation', messageId, index] as const,
}
