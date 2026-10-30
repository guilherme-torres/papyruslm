import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getRouteApi, useRouter } from '@tanstack/react-router'
import { CircleAlertIcon, NotebookTabsIcon, SearchXIcon, TagIcon } from 'lucide-react'
import { CreateNotebookDialog } from '@/components/notebooks/create-notebook-dialog'
import { NotebookCard, NotebookCardSkeleton } from '@/components/notebooks/notebook-card'
import { PagePagination } from '@/components/page-pagination'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { notebooksQueryOptions } from '@/queries/notebooks'
import { tagsQueryOptions } from '@/queries/tags'

const route = getRouteApi('/')

const PAGE_SIZE = 12

function notebooksLabel(total: number): string {
    return total === 1 ? '1 caderno' : `${total} cadernos`
}

export function Home() {
    const { page = 1, tags = [] } = route.useSearch()
    const navigate = route.useNavigate()
    const router = useRouter()
    const notebooksQuery = useQuery(
        notebooksQueryOptions({ limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE, tags }),
    )
    const tagsQuery = useQuery(tagsQueryOptions())

    const total = notebooksQuery.data?.total ?? 0
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
    const isFiltering = tags.length > 0
    const isEmptyLibrary = notebooksQuery.isSuccess && total === 0 && !isFiltering
    const availableTags = tagsQuery.data ?? []

    useEffect(() => {
        if (notebooksQuery.isSuccess && !notebooksQuery.isPlaceholderData && page > totalPages) {
            void navigate({ search: (previous) => ({ ...previous, page: undefined }), replace: true })
        }
    }, [navigate, notebooksQuery.isPlaceholderData, notebooksQuery.isSuccess, page, totalPages])

    const changeTags = (selected: string[]) =>
        navigate({ search: (previous) => ({ ...previous, tags: selected.length > 0 ? selected : undefined, page: undefined }) })

    const changePage = (target: number) =>
        navigate({ search: (previous) => ({ ...previous, page: target > 1 ? target : undefined }) })

    const hrefForPage = (target: number) =>
        router.buildLocation({ to: '/', search: (previous) => ({ ...previous, page: target > 1 ? target : undefined }) }).href

    return (
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="font-heading text-3xl font-medium">Meus cadernos</h1>
                    <p className="text-sm text-muted-foreground">
                        {notebooksQuery.isSuccess ? notebooksLabel(total) : 'Carregando cadernos…'}
                    </p>
                </div>
                {!isEmptyLibrary && <CreateNotebookDialog />}
            </div>

            {!isEmptyLibrary && availableTags.length > 0 && (
                <div role="group" aria-label="Filtrar cadernos por tag" className="flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                        <TagIcon />
                        Tags
                    </span>
                    <ToggleGroup
                        multiple
                        variant="outline"
                        size="sm"
                        className="flex-wrap"
                        value={tags}
                        onValueChange={(selected: string[]) => changeTags(selected)}
                    >
                        {availableTags.map((tag) => (
                            <ToggleGroupItem key={tag.id} value={tag.name}>
                                {tag.name}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                    {isFiltering && (
                        <Button variant="ghost" size="sm" onClick={() => changeTags([])}>
                            Limpar filtro
                        </Button>
                    )}
                </div>
            )}

            {notebooksQuery.isPending && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }, (_, index) => (
                        <NotebookCardSkeleton key={index} />
                    ))}
                </div>
            )}

            {notebooksQuery.isError && (
                <Alert variant="destructive">
                    <CircleAlertIcon />
                    <AlertTitle>Não foi possível carregar os cadernos</AlertTitle>
                    <AlertDescription>{notebooksQuery.error.message}</AlertDescription>
                    <AlertAction>
                        <Button variant="outline" size="sm" onClick={() => void notebooksQuery.refetch()}>
                            Tentar novamente
                        </Button>
                    </AlertAction>
                </Alert>
            )}

            {isEmptyLibrary && (
                <Empty className="border">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <NotebookTabsIcon />
                        </EmptyMedia>
                        <EmptyTitle>Nenhum caderno ainda</EmptyTitle>
                        <EmptyDescription>
                            Crie um caderno para reunir documentos, fazer perguntas sobre eles e revisar com flashcards.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <CreateNotebookDialog />
                    </EmptyContent>
                </Empty>
            )}

            {notebooksQuery.isSuccess && total === 0 && isFiltering && (
                <Empty className="border">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <SearchXIcon />
                        </EmptyMedia>
                        <EmptyTitle>Nenhum caderno encontrado</EmptyTitle>
                        <EmptyDescription>Nenhum caderno tem as tags selecionadas.</EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button variant="outline" onClick={() => changeTags([])}>
                            Limpar filtro
                        </Button>
                    </EmptyContent>
                </Empty>
            )}

            {notebooksQuery.isSuccess && total > 0 && (
                <div className="flex flex-col gap-6">
                    <ul
                        aria-busy={notebooksQuery.isPlaceholderData}
                        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        {notebooksQuery.data.items.map((notebook) => (
                            <li key={notebook.id}>
                                <NotebookCard notebook={notebook} />
                            </li>
                        ))}
                    </ul>
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
