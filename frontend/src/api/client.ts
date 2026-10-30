const BASE_URL = '/api/v1'

const FALLBACK_ERROR_MESSAGE = 'Ocorreu um erro inesperado. Tente novamente.'
const NETWORK_ERROR_MESSAGE = 'Não foi possível conectar ao servidor.'

type QueryValue = string | number | boolean | null | undefined | readonly (string | number | boolean)[]

export type QueryParams = Record<string, QueryValue>

export type ErrorMessages = Partial<Record<number, string>>

const DEFAULT_ERROR_MESSAGES: ErrorMessages = {
    400: 'A requisição é inválida.',
    404: 'O recurso solicitado não foi encontrado.',
    409: 'A operação não pode ser realizada no estado atual.',
    413: 'O arquivo enviado é grande demais.',
    422: 'Os dados enviados são inválidos.',
    500: 'Ocorreu um erro inesperado no servidor.',
    503: 'O serviço está indisponível no momento. Tente novamente mais tarde.',
}

export interface RequestOptions {
    query?: QueryParams
    signal?: AbortSignal
    errorMessages?: ErrorMessages
}

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface SendOptions extends RequestOptions {
    method: Method
    body?: unknown
    accept: string
}

export interface PaginationParams {
    limit?: number
    offset?: number
}

export interface Paginated<T> {
    total: number
    limit: number
    offset: number
    items: T[]
}

export interface ServerSentEvent {
    event: string
    data: string
}

export class ApiError extends Error {
    readonly status: number

    constructor(status: number, message: string) {
        super(message)
        this.name = 'ApiError'
        this.status = status
    }
}

function buildUrl(path: string, query: QueryParams = {}): string {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(query)) {
        if (value === null || value === undefined) continue
        const values: readonly unknown[] = Array.isArray(value) ? value : [value]
        for (const item of values) params.append(key, String(item))
    }
    const search = params.toString()
    return search ? `${BASE_URL}${path}?${search}` : `${BASE_URL}${path}`
}

function buildBody(body: unknown, headers: Headers): BodyInit | undefined {
    if (body === undefined) return undefined
    if (body instanceof FormData) return body
    headers.set('Content-Type', 'application/json')
    return JSON.stringify(body)
}

function isAbortError(error: unknown): boolean {
    return error instanceof DOMException && error.name === 'AbortError'
}

function toApiError(error: unknown): unknown {
    if (isAbortError(error) || error instanceof ApiError) return error
    return new ApiError(0, NETWORK_ERROR_MESSAGE)
}

function errorMessageFor(status: number, errorMessages: ErrorMessages = {}): string {
    return errorMessages[status] ?? DEFAULT_ERROR_MESSAGES[status] ?? FALLBACK_ERROR_MESSAGE
}

async function send(path: string, { method, query, body, signal, errorMessages, accept }: SendOptions): Promise<Response> {
    const headers = new Headers({ Accept: accept })
    let response: Response
    try {
        response = await fetch(buildUrl(path, query), {
            method,
            headers,
            body: buildBody(body, headers),
            signal,
        })
    } catch (error) {
        throw toApiError(error)
    }
    if (!response.ok) throw new ApiError(response.status, errorMessageFor(response.status, errorMessages))
    return response
}

async function request<T>(path: string, method: Method, body: unknown, options: RequestOptions = {}): Promise<T> {
    const response = await send(path, { ...options, method, body, accept: 'application/json' })
    if (response.status === 204) return undefined as T
    try {
        return (await response.json()) as T
    } catch (error) {
        if (isAbortError(error)) throw error
        throw new ApiError(response.status, FALLBACK_ERROR_MESSAGE)
    }
}

function parseEvent(block: string): ServerSentEvent | null {
    let event = 'message'
    const data: string[] = []
    for (const line of block.split(/\r?\n/)) {
        if (!line || line.startsWith(':')) continue
        const separator = line.indexOf(':')
        const field = separator === -1 ? line : line.slice(0, separator)
        const value = separator === -1 ? '' : line.slice(separator + 1).replace(/^ /, '')
        if (field === 'event') event = value
        if (field === 'data') data.push(value)
    }
    return data.length > 0 ? { event, data: data.join('\n') } : null
}

async function* stream(path: string, body: unknown, options: RequestOptions = {}): AsyncGenerator<ServerSentEvent> {
    const response = await send(path, { ...options, method: 'POST', body, accept: 'text/event-stream' })
    if (!response.body) throw new ApiError(response.status, FALLBACK_ERROR_MESSAGE)
    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
    let buffer = ''
    try {
        while (true) {
            const { done, value } = await reader.read().catch((error: unknown) => {
                throw toApiError(error)
            })
            if (done) break
            buffer += value
            const blocks = buffer.split(/\r?\n\r?\n/)
            buffer = blocks.pop() ?? ''
            for (const block of blocks) {
                const event = parseEvent(block)
                if (event) yield event
            }
        }
        const last = parseEvent(buffer)
        if (last) yield last
    } finally {
        await reader.cancel().catch(() => undefined)
    }
}

export const http = {
    get: <T>(path: string, options?: RequestOptions) => request<T>(path, 'GET', undefined, options),
    post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>(path, 'POST', body, options),
    put: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>(path, 'PUT', body, options),
    delete: (path: string, options?: RequestOptions) => request<void>(path, 'DELETE', undefined, options),
    stream,
}
