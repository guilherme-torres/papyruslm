import { useState, type FormEvent, type RefObject } from 'react'
import { CircleAlertIcon } from 'lucide-react'
import type { UpdateFlashcardInput } from '@/api/flashcards'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'

export type FlashcardFormValues = UpdateFlashcardInput

interface FlashcardFormProps {
    title: string
    description: string
    submitLabel: string
    errorTitle: string
    defaultValues: FlashcardFormValues
    frontRef: RefObject<HTMLTextAreaElement | null>
    isPending: boolean
    error: Error | null
    onSubmit: (values: FlashcardFormValues) => void
}

export function FlashcardForm({
    title,
    description,
    submitLabel,
    errorTitle,
    defaultValues,
    frontRef,
    isPending,
    error,
    onSubmit,
}: FlashcardFormProps) {
    const [front, setFront] = useState(defaultValues.front)
    const [back, setBack] = useState(defaultValues.back)
    const [submitted, setSubmitted] = useState(false)
    const frontError = submitted && front.trim() === '' ? 'Informe a frente do flashcard.' : undefined
    const backError = submitted && back.trim() === '' ? 'Informe o verso do flashcard.' : undefined

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setSubmitted(true)
        if (front.trim() === '' || back.trim() === '') return
        onSubmit({ front: front.trim(), back: back.trim() })
    }

    return (
        <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <FieldGroup>
                <Field data-invalid={frontError !== undefined}>
                    <FieldLabel htmlFor="flashcard-front">Frente</FieldLabel>
                    <Textarea
                        id="flashcard-front"
                        ref={frontRef}
                        required
                        placeholder="A pergunta ou o termo"
                        className="max-h-48"
                        value={front}
                        onChange={(event) => setFront(event.target.value)}
                        aria-invalid={frontError !== undefined}
                    />
                    <FieldError>{frontError}</FieldError>
                </Field>
                <Field data-invalid={backError !== undefined}>
                    <FieldLabel htmlFor="flashcard-back">Verso</FieldLabel>
                    <Textarea
                        id="flashcard-back"
                        required
                        placeholder="A resposta ou a definição"
                        className="max-h-64"
                        value={back}
                        onChange={(event) => setBack(event.target.value)}
                        aria-invalid={backError !== undefined}
                    />
                    <FieldError>{backError}</FieldError>
                </Field>
            </FieldGroup>
            {error && (
                <Alert variant="destructive">
                    <CircleAlertIcon />
                    <AlertTitle>{errorTitle}</AlertTitle>
                    <AlertDescription>{error.message}</AlertDescription>
                </Alert>
            )}
            <DialogFooter>
                <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
                <Button type="submit" disabled={isPending}>
                    {isPending && <Spinner data-icon="inline-start" />}
                    {submitLabel}
                </Button>
            </DialogFooter>
        </form>
    )
}
