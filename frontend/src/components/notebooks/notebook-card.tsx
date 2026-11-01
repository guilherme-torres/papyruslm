import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { EllipsisVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { NotebookListItem } from '@/api/notebooks'
import { DeleteNotebookDialog } from '@/components/notebooks/delete-notebook-dialog'
import { EditNotebookDialog } from '@/components/notebooks/edit-notebook-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface NotebookCardProps {
    notebook: NotebookListItem
}

export function NotebookCard({ notebook }: NotebookCardProps) {
    const { t } = useTranslation()
    const [editOpen, setEditOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)

    return (
        <>
            <Tooltip>
                <TooltipTrigger
                    render={
                        <Card className="relative h-full transition-colors hover:bg-muted/40 has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ring/50" />
                    }
                >
                    <CardHeader>
                        <CardTitle className="min-w-0 truncate">
                            <Link
                                to="/notebook/$notebookId"
                                params={{ notebookId: notebook.id }}
                                className="outline-none after:absolute after:inset-0"
                            >
                                {notebook.name}
                            </Link>
                        </CardTitle>
                        <CardAction className="relative z-10">
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    render={<Button variant="ghost" size="icon-sm" aria-label={t('notebooks.options')} />}
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
                        </CardAction>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-row flex-wrap content-start gap-1.5">
                        {notebook.tags.map((tag) => (
                            <Badge key={tag.id} variant="secondary">
                                {tag.name}
                            </Badge>
                        ))}
                    </CardContent>
                    <CardFooter className="flex items-center justify-between gap-2 text-muted-foreground">
                        <span>{t('notebooks.flashcardCount', { count: notebook.flashcards_total })}</span>
                        {notebook.flashcards_due > 0 && <Badge>{t('notebooks.dueCount', { count: notebook.flashcards_due })}</Badge>}
                    </CardFooter>
                </TooltipTrigger>
                <TooltipContent side="bottom">{notebook.name}</TooltipContent>
            </Tooltip>
            <EditNotebookDialog notebook={notebook} open={editOpen} onOpenChange={setEditOpen} />
            <DeleteNotebookDialog notebook={notebook} open={deleteOpen} onOpenChange={setDeleteOpen} />
        </>
    )
}

export function NotebookCardSkeleton() {
    return (
        <Card className="h-full">
            <CardHeader>
                <Skeleton className="h-5 w-3/4" />
            </CardHeader>
            <CardContent className="flex flex-1 flex-row gap-1.5">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-12" />
            </CardContent>
            <CardFooter>
                <Skeleton className="h-4 w-24" />
            </CardFooter>
        </Card>
    )
}
