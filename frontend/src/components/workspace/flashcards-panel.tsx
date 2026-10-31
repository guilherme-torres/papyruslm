import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CircleAlertIcon, GalleryVerticalEndIcon, PanelRightCloseIcon, PartyPopperIcon } from 'lucide-react'
import type { Flashcard, ReviewQuality } from '@/api/flashcards'
import { CreateFlashcardDialog } from '@/components/flashcards/create-flashcard-dialog'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { toast } from '@/components/ui/toast'
import { Panel, PanelAction } from '@/components/workspace/panel'
import { flashcardsQueryOptions, nextDueFlashcardQueryOptions, useReviewFlashcard } from '@/queries/flashcards'

interface FlashcardsPanelProps {
    notebookId: string
    onCollapse?: () => void
    className?: string
}

export function FlashcardsPanel({ notebookId, onCollapse, className }: FlashcardsPanelProps) {
    const nextDueQuery = useQuery(nextDueFlashcardQueryOptions(notebookId))
    const totalQuery = useQuery(flashcardsQueryOptions(notebookId, { limit: 1 }))

    return (
        <Panel
            title="Flashcards"
            className={className}
            action={
                <div className="flex items-center gap-1">
                    <CreateFlashcardDialog notebookId={notebookId} compact />
                    {onCollapse && (
                        <PanelAction label="Recolher painel de flashcards" onClick={onCollapse}>
                            <PanelRightCloseIcon />
                        </PanelAction>
                    )}
                </div>
            }
        >
            {nextDueQuery.isPending && <ReviewSkeleton />}
            {nextDueQuery.isError && (
                <div className="p-4">
                    <Alert variant="destructive">
                        <CircleAlertIcon />
                        <AlertTitle>Não foi possível carregar a revisão</AlertTitle>
                        <AlertDescription>{nextDueQuery.error.message}</AlertDescription>
                        <AlertAction>
                            <Button variant="outline" size="sm" onClick={() => void nextDueQuery.refetch()}>
                                Tentar novamente
                            </Button>
                        </AlertAction>
                    </Alert>
                </div>
            )}
            {nextDueQuery.isSuccess && nextDueQuery.data && (
                <ReviewCard key={nextDueQuery.data.id} notebookId={notebookId} flashcard={nextDueQuery.data} />
            )}
            {nextDueQuery.isSuccess && nextDueQuery.data === null && (
                <NothingToReview notebookId={notebookId} hasFlashcards={(totalQuery.data?.total ?? 0) > 0} />
            )}
        </Panel>
    )
}

interface ReviewOption {
    label: string
    quality: ReviewQuality
}

const REVIEW_OPTIONS: ReviewOption[] = [
    { label: 'Errei', quality: 1 },
    { label: 'Difícil', quality: 3 },
    { label: 'Bom', quality: 4 },
    { label: 'Fácil', quality: 5 },
]

interface ReviewCardProps {
    notebookId: string
    flashcard: Flashcard
}

function ReviewCard({ notebookId, flashcard }: ReviewCardProps) {
    const [revealed, setRevealed] = useState(false)
    const reviewFlashcard = useReviewFlashcard(notebookId)
    const pendingQuality = reviewFlashcard.isPending ? reviewFlashcard.variables.quality : undefined

    const review = (quality: ReviewQuality) =>
        reviewFlashcard.mutate(
            { id: flashcard.id, quality },
            { onError: (error) => toast.add({ type: 'error', title: 'Não foi possível registrar a revisão', description: error.message }) },
        )

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <ScrollArea className="min-h-0 flex-1">
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-medium text-muted-foreground">Frente</span>
                        <p className="text-base font-medium wrap-break-word whitespace-pre-wrap">{flashcard.front}</p>
                    </div>
                    {revealed && (
                        <>
                            <Separator />
                            <div className="flex flex-col gap-1.5">
                                <span className="text-xs font-medium text-muted-foreground">Verso</span>
                                <p className="text-sm leading-relaxed wrap-break-word whitespace-pre-wrap">{flashcard.back}</p>
                            </div>
                        </>
                    )}
                </div>
            </ScrollArea>
            <Separator />
            <div className="flex shrink-0 flex-col gap-2 p-3">
                {revealed ? (
                    <>
                        <p className="text-center text-xs text-muted-foreground">Como foi lembrar a resposta?</p>
                        <div role="group" aria-label="Avaliar revisão" className="grid grid-cols-4 gap-2">
                            {REVIEW_OPTIONS.map((option) => (
                                <Button
                                    key={option.quality}
                                    variant="outline"
                                    size="sm"
                                    disabled={reviewFlashcard.isPending}
                                    onClick={() => review(option.quality)}
                                >
                                    {pendingQuality === option.quality && <Spinner data-icon="inline-start" />}
                                    {option.label}
                                </Button>
                            ))}
                        </div>
                    </>
                ) : (
                    <Button onClick={() => setRevealed(true)}>Mostrar resposta</Button>
                )}
            </div>
        </div>
    )
}

interface NothingToReviewProps {
    notebookId: string
    hasFlashcards: boolean
}

function NothingToReview({ notebookId, hasFlashcards }: NothingToReviewProps) {
    return (
        <Empty className="flex-1">
            <EmptyHeader>
                <EmptyMedia variant="icon">{hasFlashcards ? <PartyPopperIcon /> : <GalleryVerticalEndIcon />}</EmptyMedia>
                <EmptyTitle>{hasFlashcards ? 'Revisão em dia' : 'Nenhum flashcard ainda'}</EmptyTitle>
                <EmptyDescription>
                    {hasFlashcards
                        ? 'Nenhum flashcard para revisar agora. Volte mais tarde ou crie novos flashcards.'
                        : 'Crie flashcards para revisar o conteúdo deste caderno com repetição espaçada.'}
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <CreateFlashcardDialog notebookId={notebookId} />
            </EmptyContent>
        </Empty>
    )
}

function ReviewSkeleton() {
    return (
        <div aria-busy className="flex flex-col gap-3 p-4">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-5 w-3/5" />
        </div>
    )
}
