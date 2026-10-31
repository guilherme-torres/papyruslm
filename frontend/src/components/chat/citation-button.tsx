import { useCallback, useState } from 'react'
import { ArrowRightIcon } from 'lucide-react'
import type { Citation } from '@/api/messages'
import { Button } from '@/components/ui/button'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'

interface CitationButtonProps {
    citation: Citation
    onOpen: (citation: Citation) => void
}

export function CitationButton({ citation, onOpen }: CitationButtonProps) {
    return (
        <HoverCard>
            <HoverCardTrigger
                delay={150}
                closeDelay={100}
                render={
                    <Button
                        variant="secondary"
                        size="xs"
                        className="mx-0.5 align-baseline tabular-nums"
                        aria-label={`Fonte ${citation.index}: ${citation.document_name}`}
                        onClick={() => onOpen(citation)}
                    />
                }
            >
                {citation.index}
            </HoverCardTrigger>
            <HoverCardContent className="flex w-80 flex-col gap-2">
                <div className="flex min-w-0 items-center gap-2 font-medium">
                    <span className="truncate">{citation.document_name}</span>
                </div>
                <CitationExcerpt text={citation.excerpt} />
                <Button
                    variant="link"
                    size="sm"
                    className="h-auto self-end px-0 underline decoration-dotted hover:decoration-solid"
                    onClick={() => onOpen(citation)}
                >
                    Ir para a fonte
                    <ArrowRightIcon data-icon="inline-end" />
                </Button>
            </HoverCardContent>
        </HoverCard>
    )
}

function CitationExcerpt({ text }: { text: string }) {
    const [hasMoreBelow, setHasMoreBelow] = useState(false)

    const updateFade = useCallback((element: HTMLElement | null) => {
        if (!element) return
        setHasMoreBelow(element.scrollHeight - element.scrollTop - element.clientHeight > 1)
    }, [])

    return (
        <p
            ref={updateFade}
            onScroll={(event) => updateFade(event.currentTarget)}
            data-more-below={hasMoreBelow}
            className="max-h-60 overflow-y-auto overscroll-contain pr-1 whitespace-pre-line text-muted-foreground data-[more-below=true]:mask-b-from-75%"
        >
            {text}
        </p>
    )
}
