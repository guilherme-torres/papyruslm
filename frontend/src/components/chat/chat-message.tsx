import type { Citation } from '@/api/messages'
import { AssistantMarkdown } from '@/components/chat/assistant-markdown'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import { Message, MessageContent, MessageFooter } from '@/components/ui/message'

interface UserMessageProps {
    content: string
}

export function UserMessage({ content }: UserMessageProps) {
    return (
        <Message align="end">
            <MessageContent>
                <Bubble align="end" variant="muted">
                    <BubbleContent className="whitespace-pre-wrap">{content}</BubbleContent>
                </Bubble>
            </MessageContent>
        </Message>
    )
}

interface AssistantMessageProps {
    content: string
    citations: Citation[]
    model?: string | null
    streaming?: boolean
    onOpenCitation?: (citation: Citation) => void
}

export function AssistantMessage({ content, citations, model, streaming = false, onOpenCitation }: AssistantMessageProps) {
    return (
        <Message>
            <MessageContent className="gap-2">
                <AssistantMarkdown
                    content={content}
                    citations={citations}
                    streaming={streaming}
                    onOpenCitation={onOpenCitation}
                />
                {model && <MessageFooter className="px-0 text-xs text-muted-foreground">Respondido com {model}</MessageFooter>}
            </MessageContent>
        </Message>
    )
}

export function ThinkingMessage() {
    return (
        <Message>
            <MessageContent>
                <span role="status" className="shimmer text-sm text-muted-foreground">
                    Lendo as fontes…
                </span>
            </MessageContent>
        </Message>
    )
}
