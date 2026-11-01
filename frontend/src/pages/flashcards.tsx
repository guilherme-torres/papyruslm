import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getRouteApi, Link, useRouter } from '@tanstack/react-router'
import { ArrowLeftIcon, CircleAlertIcon, GalleryVerticalEndIcon, NotebookTabsIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ApiError } from '@/api/client'
import { CreateFlashcardDialog } from '@/components/flashcards/create-flashcard-dialog'
import { FlashcardListItem, FlashcardListItemSkeleton } from '@/components/flashcards/flashcard-list-item'
import { PagePagination } from '@/components/page-pagination'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { ItemGroup } from '@/components/ui/item'
import { Skeleton } from '@/components/ui/skeleton'
import { flashcardsQueryOptions } from '@/queries/flashcards'
import { notebookQueryOptions } from '@/queries/notebooks'

const route = getRouteApi('/notebook/$notebookId_/flashcards')

const PAGE_SIZE = 20

export function FlashcardsPage() {
    const { t } = useTranslation()
    const { notebookId } = route.useParams()
    const { page = 1 } = route.useSearch()
    const navigate = route.useNavigate()
    const router = useRouter()
    const notebookQuery = useQuery(notebookQueryOptions(notebookId))
    const flashcardsQuery = useQuery(
        flashcardsQueryOptions(notebookId, { limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
    )

    const total = flashcardsQuery.data?.total ?? 0
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
    const isEmpty = flashcardsQuery.isSuccess && total === 0

    useEffect(() => {
        if (flashcardsQuery.isSuccess && !flashcardsQuery.isPlaceholderData && page > totalPages) {
            void navigate({ search: { page: totalPages > 1 ? totalPages : undefined }, replace: true })
        }
    }, [flashcardsQuery.isPlaceholderData, flashcardsQuery.isSuccess, navigate, page, totalPages])

    if (notebookQuery.error instanceof ApiError && notebookQuery.error.status === 404) {
        return <NotebookNotFound />
    }

    const changePage = (target: number) => navigate({ search: { page: target > 1 ? target : undefined } })

    const hrefForPage = (target: number) =>
        router.buildLocation({
            to: '/notebook/$notebookId/flashcards',
            params: { notebookId },
            search: { page: target > 1 ? target : undefined },
        }).href

    const goToFirstPage = () => navigate({ search: { page: undefined } })

    return (
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex min-w-0 items-start gap-2">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={t('flashcards.backToNotebook')}
                        nativeButton={false}
                        render={<Link to="/notebook/$notebookId" params={{ notebookId }} />}
                    >
                        <ArrowLeftIcon />
                    </Button>
                    <div className="flex min-w-0 flex-col gap-1">
                        <h1 className="font-heading text-3xl font-medium">{t('common.flashcards')}</h1>
                        {notebookQuery.isSuccess ? (
                            <p className="truncate text-sm text-muted-foreground">
                                {notebookQuery.data.name}
                                {flashcardsQuery.isSuccess && ` · ${t('flashcards.count', { count: total })}`}
                            </p>
                        ) : (
                            <Skeleton className="h-5 w-48" />
                        )}
                    </div>
                </div>
                {!isEmpty && <CreateFlashcardDialog notebookId={notebookId} onCreated={goToFirstPage} />}
            </div>

            {flashcardsQuery.isPending && (
                <ItemGroup aria-busy>
                    {Array.from({ length: 5 }, (_, index) => (
                        <FlashcardListItemSkeleton key={index} />
                    ))}
                </ItemGroup>
            )}

            {flashcardsQuery.isError && (
                <Alert variant="destructive">
                    <CircleAlertIcon />
                    <AlertTitle>{t('flashcards.loadError')}</AlertTitle>
                    <AlertDescription>{flashcardsQuery.error.message}</AlertDescription>
                    <AlertAction>
                        <Button variant="outline" size="sm" onClick={() => void flashcardsQuery.refetch()}>
                            {t('common.retry')}
                        </Button>
                    </AlertAction>
                </Alert>
            )}

            {isEmpty && (
                <Empty className="border">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <GalleryVerticalEndIcon />
                        </EmptyMedia>
                        <EmptyTitle>{t('flashcards.emptyTitle')}</EmptyTitle>
                        <EmptyDescription>
                            {t('flashcards.emptyDescription')}
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <CreateFlashcardDialog notebookId={notebookId} />
                    </EmptyContent>
                </Empty>
            )}

            {flashcardsQuery.isSuccess && total > 0 && (
                <div className="flex flex-col gap-6">
                    <ItemGroup aria-busy={flashcardsQuery.isPlaceholderData} className="gap-3">
                        {flashcardsQuery.data.items.map((flashcard) => (
                            <FlashcardListItem key={flashcard.id} flashcard={flashcard} />
                        ))}
                    </ItemGroup>
                    <PagePagination
                        page={Math.min(page, totalPages)}
                        totalPages={totalPages}
                        hrefFor={hrefForPage}
                        onPageChange={changePage}
                    />
                </div>
            )}
        </main>
    )
}

function NotebookNotFound() {
    const { t } = useTranslation()
    return (
        <main className="mx-auto flex w-full max-w-4xl flex-col px-4 py-10 sm:px-6">
            <Empty className="border">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <NotebookTabsIcon />
                    </EmptyMedia>
                    <EmptyTitle>{t('common.notebookNotFound')}</EmptyTitle>
                    <EmptyDescription>{t('flashcards.notebookNotFoundDescription')}</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <Button variant="outline" nativeButton={false} render={<Link to="/" />}>
                        {t('common.backToNotebooks')}
                    </Button>
                </EmptyContent>
            </Empty>
        </main>
    )
}
