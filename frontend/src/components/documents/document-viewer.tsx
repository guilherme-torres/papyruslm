import { useQuery } from '@tanstack/react-query'
import { CircleAlertIcon } from 'lucide-react'
import type { NotebookDocument } from '@/api/documents'
import { TextSkeleton } from '@/components/documents/text-skeleton'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { documentContentQueryOptions } from '@/queries/documents'

interface DocumentViewerProps {
    notebookId: string
    document: NotebookDocument
}

export function DocumentViewer({ notebookId, document }: DocumentViewerProps) {
    const contentQuery = useQuery(documentContentQueryOptions(notebookId, document.id))

    if (contentQuery.isPending) return <TextSkeleton />

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
