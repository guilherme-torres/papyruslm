import { GalleryVerticalEndIcon, PanelRightCloseIcon } from 'lucide-react'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Panel, PanelAction } from '@/components/workspace/panel'

interface FlashcardsPanelProps {
    onCollapse?: () => void
    className?: string
}

export function FlashcardsPanel({ onCollapse, className }: FlashcardsPanelProps) {
    return (
        <Panel
            title="Flashcards"
            className={className}
            action={
                onCollapse && (
                    <PanelAction label="Recolher painel de flashcards" side="left" onClick={onCollapse}>
                        <PanelRightCloseIcon />
                    </PanelAction>
                )
            }
        >
            <Empty className="flex-1">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <GalleryVerticalEndIcon />
                    </EmptyMedia>
                    <EmptyTitle>Flashcards</EmptyTitle>
                    <EmptyDescription>Revise o conteúdo deste caderno com flashcards.</EmptyDescription>
                </EmptyHeader>
            </Empty>
        </Panel>
    )
}
