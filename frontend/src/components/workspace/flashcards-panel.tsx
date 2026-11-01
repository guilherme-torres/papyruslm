import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CircleAlertIcon, GalleryVerticalEndIcon, PanelRightCloseIcon, PartyPopperIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
    const { t } = useTranslation()
    const nextDueQuery = useQuery(nextDueFlashcardQueryOptions(notebookId))
    const totalQuery = useQuery(flashcardsQueryOptions(notebookId, { limit: 1 }))

    return (
        <Panel
            title={t('common.flashcards')}
            className={className}
            action={
                <div className="flex items-center gap-1">
                    <CreateFlashcardDialog notebookId={notebookId} compact />
                    {onCollapse && (
                        <PanelAction label={t('flashcards.collapsePanel')} onClick={onCollapse}>
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
                        <AlertTitle>{t('flashcards.reviewLoadError')}</AlertTitle>
                        <AlertDescription>{nextDueQuery.error.message}</AlertDescription>
                        <AlertAction>
                            <Button variant="outline" size="sm" onClick={() => void nextDueQuery.refetch()}>
                                {t('common.retry')}
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
    labelKey: 'flashcards.again' | 'flashcards.hard' | 'flashcards.good' | 'flashcards.easy'
    quality: ReviewQuality
}

const REVIEW_OPTIONS: ReviewOption[] = [
    { labelKey: 'flashcards.again', quality: 1 },
    { labelKey: 'flashcards.hard', quality: 3 },
    { labelKey: 'flashcards.good', quality: 4 },
    { labelKey: 'flashcards.easy', quality: 5 },
]

interface ReviewCardProps {
    notebookId: string
    flashcard: Flashcard
}

function ReviewCard({ notebookId, flashcard }: ReviewCardProps) {
    const { t } = useTranslation()
    const [revealed, setRevealed] = useState(false)
    const reviewFlashcard = useReviewFlashcard(notebookId)
    const pendingQuality = reviewFlashcard.isPending ? reviewFlashcard.variables.quality : undefined

    const review = (quality: ReviewQuality) =>
        reviewFlashcard.mutate(
            { id: flashcard.id, quality },
            { onError: (error) => toast.add({ type: 'error', title: t('flashcards.reviewError'), description: error.message }) },
        )

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <ScrollArea className="min-h-0 flex-1">
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-medium text-muted-foreground">{t('flashcards.front')}</span>
                        <p className="text-base font-medium wrap-break-word whitespace-pre-wrap">{flashcard.front}</p>
                    </div>
                    {revealed && (
                        <>
                            <Separator />
                            <div className="flex flex-col gap-1.5">
                                <span className="text-xs font-medium text-muted-foreground">{t('flashcards.back')}</span>
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
                        <p className="text-center text-xs text-muted-foreground">{t('flashcards.howWasIt')}</p>
                        <div role="group" aria-label={t('flashcards.rateReview')} className="grid grid-cols-4 gap-2">
                            {REVIEW_OPTIONS.map((option) => (
                                <Button
                                    key={option.quality}
                                    variant="outline"
                                    size="sm"
                                    disabled={reviewFlashcard.isPending}
                                    onClick={() => review(option.quality)}
                                >
                                    {pendingQuality === option.quality && <Spinner data-icon="inline-start" />}
                                    {t(option.labelKey)}
                                </Button>
                            ))}
                        </div>
                    </>
                ) : (
                    <Button onClick={() => setRevealed(true)}>{t('flashcards.showAnswer')}</Button>
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
    const { t } = useTranslation()
    return (
        <Empty className="flex-1">
            <EmptyHeader>
                <EmptyMedia variant="icon">{hasFlashcards ? <PartyPopperIcon /> : <GalleryVerticalEndIcon />}</EmptyMedia>
                <EmptyTitle>{hasFlashcards ? t('flashcards.upToDateTitle') : t('flashcards.emptyTitle')}</EmptyTitle>
                <EmptyDescription>
                    {hasFlashcards
                        ? t('flashcards.upToDateDescription')
                        : t('flashcards.emptyDescription')}
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
