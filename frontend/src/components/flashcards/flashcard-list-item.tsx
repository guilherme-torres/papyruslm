import { useState } from 'react'
import { EllipsisVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Flashcard } from '@/api/flashcards'
import { DeleteFlashcardDialog } from '@/components/flashcards/delete-flashcard-dialog'
import { EditFlashcardDialog } from '@/components/flashcards/edit-flashcard-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'
import { Skeleton } from '@/components/ui/skeleton'

const MS_PER_DAY = 24 * 60 * 60 * 1000

function daysUntil(date: Date, now: number): number {
    const today = new Date(now)
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const startOfDueDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    return Math.round((startOfDueDay.getTime() - startOfToday.getTime()) / MS_PER_DAY)
}

interface FlashcardListItemProps {
    flashcard: Flashcard
}

export function FlashcardListItem({ flashcard }: FlashcardListItemProps) {
    const { t } = useTranslation()
    const [editOpen, setEditOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [renderedAt] = useState(() => Date.now())
    const dueDate = new Date(flashcard.due_date)
    const isDue = dueDate.getTime() <= renderedAt
    const daysLeft = daysUntil(dueDate, renderedAt)

    return (
        <>
            <Item variant="outline" role="listitem" className="flex-nowrap items-start">
                <ItemContent className="min-w-0">
                    <ItemTitle className="line-clamp-2 wrap-break-word">{flashcard.front}</ItemTitle>
                    <ItemDescription className="wrap-break-word">{flashcard.back}</ItemDescription>
                </ItemContent>
                <ItemActions>
                    {isDue ? (
                        <Badge>{t('flashcards.due')}</Badge>
                    ) : (
                        <Badge variant="outline">{daysLeft <= 0 ? t('flashcards.reviewToday') : t('flashcards.reviewIn', { count: daysLeft })}</Badge>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={<Button variant="ghost" size="icon-sm" aria-label={t('flashcards.options')} />}
                        >
                            <EllipsisVerticalIcon />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-auto">
                            <DropdownMenuGroup>
                                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                                    <PencilIcon />
                                    {t('common.edit')}
                                </DropdownMenuItem>
                                <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
                                    <Trash2Icon />
                                    {t('common.delete')}
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </ItemActions>
            </Item>
            <EditFlashcardDialog flashcard={flashcard} open={editOpen} onOpenChange={setEditOpen} />
            <DeleteFlashcardDialog flashcard={flashcard} open={deleteOpen} onOpenChange={setDeleteOpen} />
        </>
    )
}

export function FlashcardListItemSkeleton() {
    return (
        <Item variant="outline" className="flex-nowrap items-start">
            <ItemContent>
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-11/12" />
            </ItemContent>
            <ItemActions>
                <Skeleton className="h-5 w-24" />
            </ItemActions>
        </Item>
    )
}
