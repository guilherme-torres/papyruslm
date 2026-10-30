import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CircleAlertIcon, Minimize2Icon } from 'lucide-react'
import { TextSkeleton } from '@/components/documents/text-skeleton'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Panel, PanelAction } from '@/components/workspace/panel'
import { citationSourceQueryOptions } from '@/queries/messages'

export interface CitationTarget {
    messageId: string
    index: number
}

interface CitationSourcePanelProps {
    notebookId: string
    target: CitationTarget
    onClose: () => void
    className?: string
}

export function CitationSourcePanel({ notebookId, target, onClose, className }: CitationSourcePanelProps) {
    const sourceQuery = useQuery(citationSourceQueryOptions(notebookId, target.messageId, target.index))
    const highlightRef = useRef<HTMLElement>(null)

    useEffect(() => {
        highlightRef.current?.scrollIntoView({ block: 'center' })
    }, [sourceQuery.data])

    return (
        <Panel
            title={sourceQuery.data?.document_name ?? 'Fonte'}
            className={className}
            action={
                <PanelAction label="Fechar fonte" onClick={onClose}>
                    <Minimize2Icon />
                </PanelAction>
            }
        >
            {sourceQuery.isPending && <TextSkeleton />}
            {sourceQuery.isError && (
                <div className="p-4">
                    <Alert variant="destructive">
                        <CircleAlertIcon />
                        <AlertTitle>Não foi possível abrir a fonte</AlertTitle>
                        <AlertDescription>{sourceQuery.error.message}</AlertDescription>
                        <AlertAction>
                            <Button variant="outline" size="sm" onClick={() => void sourceQuery.refetch()}>
                                Tentar novamente
                            </Button>
                        </AlertAction>
                    </Alert>
                </div>
            )}
            {sourceQuery.isSuccess && (
                <ScrollArea className="min-h-0 flex-1">
                    <p className="p-4 text-sm leading-relaxed wrap-break-word whitespace-pre-wrap">
                        {sourceQuery.data.before}
                        <mark ref={highlightRef} className="rounded-sm bg-primary/15 text-foreground">
                            {sourceQuery.data.highlight}
                        </mark>
                        {sourceQuery.data.after}
                    </p>
                </ScrollArea>
            )}
        </Panel>
    )
}
