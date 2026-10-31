import { createFileRoute } from '@tanstack/react-router'
import { parsePage } from '@/lib/search-params'
import { FlashcardsPage } from '@/pages/flashcards'

export interface FlashcardsSearch {
    page?: number
}

export const Route = createFileRoute('/notebooks/$notebookId_/flashcards')({
    validateSearch: (search: Record<string, unknown>): FlashcardsSearch => ({
        page: parsePage(search.page),
    }),
    component: FlashcardsPage,
})
