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

export function messagesQueryOptions(notebookId: string, params: PaginationParams = {}) {
    return queryOptions({
        queryKey: messageKeys.list(notebookId, params),
        queryFn: ({ signal }) => listMessages(notebookId, params, signal),
        placeholderData: keepPreviousData,
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
    const controllerRef = useRef<AbortController | null>(null)

    useEffect(() => () => controllerRef.current?.abort(), [])

    const mutation = useMutation({
        mutationFn: async (input: AskQuestionInput): Promise<Message> => {
            controllerRef.current?.abort()
            const controller = new AbortController()
            controllerRef.current = controller
            setAnswer('')
            const events = askQuestion(notebookId, input, controller.signal)
            let result = await events.next()
            while (!result.done) {
                const text = result.value
                setAnswer((current) => current + text)
                result = await events.next()
            }
            return result.value
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: messageKeys.notebook(notebookId) }),
        onSettled: () => setAnswer(''),
    })

    const cancel = () => controllerRef.current?.abort()

    return { ...mutation, answer, cancel }
}
