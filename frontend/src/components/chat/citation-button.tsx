import { ArrowRightIcon, FileTextIcon } from 'lucide-react'
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
                    <FileTextIcon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{citation.document_name}</span>
                </div>
                <p className="line-clamp-5 text-muted-foreground">{citation.excerpt}</p>
                <Button variant="outline" size="sm" className="self-start" onClick={() => onOpen(citation)}>
                    Ir para a fonte
                    <ArrowRightIcon data-icon="inline-end" />
                </Button>
            </HoverCardContent>
        </HoverCard>
    )
}
