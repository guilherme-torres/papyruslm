import { MessagesSquareIcon } from 'lucide-react'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Panel } from '@/components/workspace/panel'

interface ChatPanelProps {
    selectedSourcesCount: number
    className?: string
}

function sourcesLabel(count: number): string {
    if (count === 0) return 'Nenhuma fonte selecionada'
    return count === 1 ? '1 fonte selecionada' : `${count} fontes selecionadas`
}

export function ChatPanel({ selectedSourcesCount, className }: ChatPanelProps) {
    return (
        <Panel title="Chat" className={className}>
            <Empty className="flex-1">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <MessagesSquareIcon />
                    </EmptyMedia>
                    <EmptyTitle>Converse com seus documentos</EmptyTitle>
                    <EmptyDescription>{sourcesLabel(selectedSourcesCount)}</EmptyDescription>
                </EmptyHeader>
            </Empty>
        </Panel>
    )
}
