import { createElement, useMemo, type ComponentProps } from 'react'
import { defaultComponents, Streamdown, type Components, type ExtraProps } from 'streamdown'
import type { Citation } from '@/api/messages'
import { CitationButton } from '@/components/chat/citation-button'
import { citationIndexFromHref, linkCitations } from '@/components/chat/citations'

interface AssistantMarkdownProps {
    content: string
    citations: Citation[]
    streaming?: boolean
    onOpenCitation?: (citation: Citation) => void
}

export function AssistantMarkdown({ content, citations, streaming = false, onOpenCitation }: AssistantMarkdownProps) {
    const citationsByIndex = useMemo(
        () => new Map(citations.map((citation) => [citation.index, citation])),
        [citations],
    )
    const markdown = useMemo(
        () => linkCitations(content, new Set(citationsByIndex.keys())),
        [content, citationsByIndex],
    )
    const components = useMemo<Components>(
        () => ({
            a: (props: ComponentProps<'a'> & ExtraProps) => {
                const index = citationIndexFromHref(props.href)
                const citation = index === null ? undefined : citationsByIndex.get(index)
                if (citation && onOpenCitation) return <CitationButton citation={citation} onOpen={onOpenCitation} />
                return createElement(defaultComponents.a, props)
            },
        }),
        [citationsByIndex, onOpenCitation],
    )

    return (
        <Streamdown
            mode={streaming ? 'streaming' : 'static'}
            isAnimating={streaming}
            components={components}
            className="text-sm leading-relaxed"
        >
            {markdown}
        </Streamdown>
    )
}
