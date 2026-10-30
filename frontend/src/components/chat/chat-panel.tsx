import { useQuery } from '@tanstack/react-query'
import { CircleAlertIcon, MessagesSquareIcon } from 'lucide-react'
import type { Citation } from '@/api/messages'
import { AssistantMessage, ThinkingMessage, UserMessage } from '@/components/chat/chat-message'
import { ChatComposer } from '@/components/chat/chat-composer'
import { ClearChatDialog } from '@/components/chat/clear-chat-dialog'
import type { CitationTarget } from '@/components/documents/citation-source-panel'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import {
    MessageScroller,
    MessageScrollerButton,
    MessageScrollerContent,
    MessageScrollerItem,
    MessageScrollerProvider,
    MessageScrollerViewport,
} from '@/components/ui/message-scroller'
import { Skeleton } from '@/components/ui/skeleton'
import { Panel } from '@/components/workspace/panel'
import { latestMessagesQueryOptions, type AskQuestionState } from '@/queries/messages'

export interface ChatPanelProps {
    notebookId: string
    chat: AskQuestionState
    selectedDocumentIds: string[]
    onOpenCitation: (target: CitationTarget) => void
    className?: string
}

function isAbortError(error: Error | null): boolean {
    return error?.name === 'AbortError'
}

export function ChatPanel({ notebookId, chat, selectedDocumentIds, onOpenCitation, className }: ChatPanelProps) {
    const messagesQuery = useQuery(latestMessagesQueryOptions(notebookId))
    const messages = messagesQuery.data ?? []
    const answerSaved = chat.completedMessageId !== null && messages.some((message) => message.id === chat.completedMessageId)
    const pendingQuestion = chat.isPending && !answerSaved ? chat.variables?.question : undefined
    const showAnswerError = chat.isError && !isAbortError(chat.error)

    const openCitation = (messageId: string) => (citation: Citation) =>
        onOpenCitation({ messageId, index: citation.index })

    const ask = (question: string) => chat.mutate({ question, document_ids: selectedDocumentIds })

    return (
        <Panel
            title="Chat"
            className={className}
            action={<ClearChatDialog notebookId={notebookId} disabled={messages.length === 0 || chat.isPending} />}
        >
            <div className="flex min-h-0 flex-1 flex-col">
                {messagesQuery.isPending && (
                    <div aria-busy className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
                        <Skeleton className="h-9 w-2/5 self-end" />
                        <Skeleton className="h-24 w-4/5" />
                    </div>
                )}
                {messagesQuery.isError && (
                    <div className="p-4">
                        <Alert variant="destructive">
                            <CircleAlertIcon />
                            <AlertTitle>Não foi possível carregar a conversa</AlertTitle>
                            <AlertDescription>{messagesQuery.error.message}</AlertDescription>
                            <AlertAction>
                                <Button variant="outline" size="sm" onClick={() => void messagesQuery.refetch()}>
                                    Tentar novamente
                                </Button>
                            </AlertAction>
                        </Alert>
                    </div>
                )}
                {messagesQuery.isSuccess && messages.length === 0 && pendingQuestion === undefined && (
                    <Empty className="flex-1">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <MessagesSquareIcon />
                            </EmptyMedia>
                            <EmptyTitle>Converse com seus documentos</EmptyTitle>
                            <EmptyDescription>
                                Faça uma pergunta e a resposta virá com citações para as fontes selecionadas.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                )}
                {messagesQuery.isSuccess && (messages.length > 0 || pendingQuestion !== undefined) && (
                    <MessageScrollerProvider autoScroll defaultScrollPosition="end">
                        <MessageScroller>
                            <MessageScrollerViewport>
                                <MessageScrollerContent
                                    aria-busy={chat.isPending}
                                    className="mx-auto w-full max-w-3xl gap-6 px-4 py-6"
                                >
                                    {messages.map((message) => (
                                        <MessageScrollerItem
                                            key={message.id}
                                            messageId={message.id}
                                            scrollAnchor={message.role === 'user'}
                                        >
                                            {message.role === 'user' ? (
                                                <UserMessage content={message.content} />
                                            ) : (
                                                <AssistantMessage
                                                    content={message.content}
                                                    citations={message.citations}
                                                    model={message.model}
                                                    onOpenCitation={openCitation(message.id)}
                                                />
                                            )}
                                        </MessageScrollerItem>
                                    ))}
                                    {pendingQuestion !== undefined && (
                                        <MessageScrollerItem messageId="pending-question" scrollAnchor>
                                            <UserMessage content={pendingQuestion} />
                                        </MessageScrollerItem>
                                    )}
                                    {pendingQuestion !== undefined && (
                                        <MessageScrollerItem messageId="pending-answer">
                                            {chat.answer ? (
                                                <AssistantMessage content={chat.answer} citations={[]} streaming />
                                            ) : (
                                                <ThinkingMessage />
                                            )}
                                        </MessageScrollerItem>
                                    )}
                                    {showAnswerError && (
                                        <MessageScrollerItem messageId="answer-error">
                                            <Alert variant="destructive">
                                                <CircleAlertIcon />
                                                <AlertTitle>Não foi possível responder</AlertTitle>
                                                <AlertDescription>{chat.error?.message}</AlertDescription>
                                            </Alert>
                                        </MessageScrollerItem>
                                    )}
                                </MessageScrollerContent>
                            </MessageScrollerViewport>
                            <MessageScrollerButton />
                        </MessageScroller>
                    </MessageScrollerProvider>
                )}
            </div>
            <ChatComposer
                selectedSourcesCount={selectedDocumentIds.length}
                isAnswering={chat.isPending}
                onSubmit={ask}
                onStop={chat.cancel}
            />
        </Panel>
    )
}
