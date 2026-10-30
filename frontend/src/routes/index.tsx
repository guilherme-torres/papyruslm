import { createFileRoute } from '@tanstack/react-router'
import { Home } from '@/pages/home'

export interface HomeSearch {
    page?: number
    tags?: string[]
}

function parsePage(value: unknown): number | undefined {
    const page = Number(value)
    return Number.isInteger(page) && page > 1 ? page : undefined
}

function parseTags(value: unknown): string[] | undefined {
    const values: unknown[] = Array.isArray(value) ? value : [value]
    const tags = values.filter((tag): tag is string => typeof tag === 'string' && tag.trim() !== '')
    return tags.length > 0 ? tags : undefined
}

export const Route = createFileRoute('/')({
    validateSearch: (search: Record<string, unknown>): HomeSearch => ({
        page: parsePage(search.page),
        tags: parseTags(search.tags),
    }),
    component: Home,
})
