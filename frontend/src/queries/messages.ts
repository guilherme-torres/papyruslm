import { useEffect, useRef, useState } from 'react'
import { keepPreviousData, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import type { PaginationParams } from '@/api/client'
import {
    askQuestion,
    clearMessages,
    getCitationSource,
    listMessages,
    type AskQuestionInput,
    type Message,
} from '@/api/messages'
import { messageKeys } from '@/queries/keys'

const LATEST_MESSAGES_LIMIT = 100

export function messagesQueryOptions(notebookId: string, params: PaginationParams = {}) {
    return queryOptions({
        queryKey: messageKeys.list(notebookId, params),
        queryFn: ({ signal }) => listMessages(notebookId, params, signal),
        placeholderData: keepPreviousData,
    })
}

export function latestMessagesQueryOptions(notebookId: string) {
    return queryOptions({
        queryKey: messageKeys.latest(notebookId),
        queryFn: async ({ signal }) => {
            const first = await listMessages(notebookId, { limit: LATEST_MESSAGES_LIMIT }, signal)
            if (first.total <= LATEST_MESSAGES_LIMIT) return first.items
            const offset = first.total - LATEST_MESSAGES_LIMIT
            const latest = await listMessages(notebookId, { limit: LATEST_MESSAGES_LIMIT, offset }, signal)
            return latest.items
        },
    })
}

export function citationSourceQueryOptions(notebookId: string, messageId: string, index: number) {
    return queryOptions({
        queryKey: messageKeys.citationSource(notebookId, messageId, index),
        queryFn: ({ signal }) => getCitationSource(notebookId, messageId, index, signal),
        staleTime: Infinity,
    })
}

export function useClearMessages(notebookId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: () => clearMessages(notebookId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: messageKeys.notebook(notebookId) }),
    })
}

export function useAskQuestion(notebookId: string) {
    const queryClient = useQueryClient()
    const [answer, setAnswer] = useState('')
    const [completedMessageId, setCompletedMessageId] = useState<string | null>(null)
    const controllerRef = useRef<AbortController | null>(null)

    useEffect(() => () => controllerRef.current?.abort(), [])

    const mutation = useMutation({
        mutationFn: async (input: AskQuestionInput): Promise<Message> => {
            controllerRef.current?.abort()
            const controller = new AbortController()
            controllerRef.current = controller
            setAnswer('')
            setCompletedMessageId(null)
            const events = askQuestion(notebookId, input, controller.signal)
            let result = await events.next()
            while (!result.done) {
                const text = result.value
                setAnswer((current) => current + text)
                result = await events.next()
            }
            setCompletedMessageId(result.value.id)
            return result.value
        },
        onSettled: async () => {
            await queryClient.invalidateQueries({ queryKey: messageKeys.notebook(notebookId) })
            setAnswer('')
        },
    })

    const cancel = () => controllerRef.current?.abort()

    return { ...mutation, answer, completedMessageId, cancel }
}

export type AskQuestionState = ReturnType<typeof useAskQuestion>
