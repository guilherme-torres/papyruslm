import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/api/client'

const MAX_QUERY_RETRIES = 2

function shouldRetry(failureCount: number, error: Error): boolean {
    if (failureCount >= MAX_QUERY_RETRIES) return false
    if (!(error instanceof ApiError)) return true
    return error.status === 0 || error.status >= 500
}

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: shouldRetry },
        mutations: { retry: false },
    },
})
