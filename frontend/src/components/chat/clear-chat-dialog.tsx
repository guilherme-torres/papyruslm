import { useState } from 'react'
import { CircleAlertIcon, MessageSquareXIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useClearMessages } from '@/queries/messages'

interface ClearChatDialogProps {
    notebookId: string
    disabled: boolean
}

export function ClearChatDialog({ notebookId, disabled }: ClearChatDialogProps) {
    const [open, setOpen] = useState(false)

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger render={<Button variant="ghost" size="sm" disabled={disabled} />}>
                Limpar conversa
            </AlertDialogTrigger>
            <AlertDialogContent>
                <ClearChatConfirmation notebookId={notebookId} onCleared={() => setOpen(false)} />
            </AlertDialogContent>
        </AlertDialog>
    )
}

interface ClearChatConfirmationProps {
    notebookId: string
    onCleared: () => void
}

function ClearChatConfirmation({ notebookId, onCleared }: ClearChatConfirmationProps) {
    const clearMessages = useClearMessages(notebookId)

    return (
        <>
            <AlertDialogHeader>
                <AlertDialogMedia className="bg-destructive/10 text-destructive">
                    <MessageSquareXIcon />
                </AlertDialogMedia>
                <AlertDialogTitle>Limpar a conversa?</AlertDialogTitle>
                <AlertDialogDescription>
                    Todas as perguntas e respostas deste caderno serão apagadas. Os documentos e flashcards continuam
                    como estão.
                </AlertDialogDescription>
            </AlertDialogHeader>
            {clearMessages.isError && (
                <Alert variant="destructive">
                    <CircleAlertIcon />
                    <AlertTitle>Não foi possível limpar a conversa</AlertTitle>
                    <AlertDescription>{clearMessages.error.message}</AlertDescription>
                </Alert>
            )}
            <AlertDialogFooter>
                <AlertDialogCancel disabled={clearMessages.isPending}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                    variant="destructive"
                    disabled={clearMessages.isPending}
                    onClick={() => clearMessages.mutate(undefined, { onSuccess: onCleared })}
                >
                    {clearMessages.isPending && <Spinner data-icon="inline-start" />}
                    Limpar conversa
                </AlertDialogAction>
            </AlertDialogFooter>
        </>
    )
}
