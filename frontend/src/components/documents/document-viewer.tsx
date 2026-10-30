import { useQuery } from '@tanstack/react-query'
import { CircleAlertIcon } from 'lucide-react'
import type { NotebookDocument } from '@/api/documents'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { documentContentQueryOptions } from '@/queries/documents'

interface DocumentViewerProps {
    notebookId: string
    document: NotebookDocument
}

const SKELETON_LINE_WIDTHS = ['w-full', 'w-11/12', 'w-full', 'w-4/5', 'w-full', 'w-2/3']

export function DocumentViewer({ notebookId, document }: DocumentViewerProps) {
    const contentQuery = useQuery(documentContentQueryOptions(notebookId, document.id))

    if (contentQuery.isPending) {
        return (
            <div aria-busy className="flex flex-col gap-2.5 p-4">
                {SKELETON_LINE_WIDTHS.map((width, index) => (
                    <Skeleton key={index} className={cn('h-4', width)} />
                ))}
            </div>
        )
    }

    if (contentQuery.isError) {
        return (
            <div className="p-4">
                <Alert variant="destructive">
                    <CircleAlertIcon />
                    <AlertTitle>Não foi possível abrir o documento</AlertTitle>
                    <AlertDescription>{contentQuery.error.message}</AlertDescription>
                    <AlertAction>
                        <Button variant="outline" size="sm" onClick={() => void contentQuery.refetch()}>
                            Tentar novamente
                        </Button>
                    </AlertAction>
                </Alert>
            </div>
        )
    }

    return (
        <ScrollArea className="min-h-0 flex-1">
            <p className="p-4 text-sm leading-relaxed wrap-break-word whitespace-pre-wrap">{contentQuery.data.text}</p>
        </ScrollArea>
    )
}
