import type { MouseEvent } from 'react'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination'

interface PagePaginationProps {
    page: number
    totalPages: number
    hrefFor: (page: number) => string
    onPageChange: (page: number) => void
}

type PageSlot = { type: 'page'; page: number } | { type: 'gap'; key: string }

function pageSlots(page: number, totalPages: number): PageSlot[] {
    const pages = [...new Set([1, page - 1, page, page + 1, totalPages])]
        .filter((candidate) => candidate >= 1 && candidate <= totalPages)
        .sort((a, b) => a - b)
    return pages.flatMap((candidate, index): PageSlot[] => {
        const previous = pages[index - 1]
        const slot: PageSlot = { type: 'page', page: candidate }
        return previous !== undefined && candidate - previous > 1 ? [{ type: 'gap', key: `gap-${candidate}` }, slot] : [slot]
    })
}

export function PagePagination({ page, totalPages, hrefFor, onPageChange }: PagePaginationProps) {
    if (totalPages <= 1) return null

    const handleClick = (target: number) => (event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault()
        if (target >= 1 && target <= totalPages && target !== page) onPageChange(target)
    }

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        text="Anterior"
                        aria-label="Ir para a página anterior"
                        aria-disabled={page === 1}
                        href={hrefFor(Math.max(1, page - 1))}
                        onClick={handleClick(page - 1)}
                    />
                </PaginationItem>
                {pageSlots(page, totalPages).map((slot) =>
                    slot.type === 'gap' ? (
                        <PaginationItem key={slot.key}>
                            <PaginationEllipsis />
                        </PaginationItem>
                    ) : (
                        <PaginationItem key={slot.page}>
                            <PaginationLink
                                isActive={slot.page === page}
                                aria-label={`Ir para a página ${slot.page}`}
                                href={hrefFor(slot.page)}
                                onClick={handleClick(slot.page)}
                            >
                                {slot.page}
                            </PaginationLink>
                        </PaginationItem>
                    ),
                )}
                <PaginationItem>
                    <PaginationNext
                        text="Próxima"
                        aria-label="Ir para a próxima página"
                        aria-disabled={page === totalPages}
                        href={hrefFor(Math.min(totalPages, page + 1))}
                        onClick={handleClick(page + 1)}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    )
}
