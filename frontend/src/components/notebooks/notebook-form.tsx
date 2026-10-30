import { useState, type FormEvent, type RefObject } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CircleAlertIcon } from 'lucide-react'
import type { NotebookInput } from '@/api/notebooks'
import { TagCombobox } from '@/components/notebooks/tag-combobox'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { tagsQueryOptions } from '@/queries/tags'

const NOTEBOOK_NAME_MAX_LENGTH = 255

interface NotebookFormProps {
    title: string
    description: string
    submitLabel: string
    errorTitle: string
    defaultValues: NotebookInput
    nameRef: RefObject<HTMLInputElement | null>
    isPending: boolean
    error: Error | null
    onSubmit: (input: NotebookInput) => void
}

export function NotebookForm({
    title,
    description,
    submitLabel,
    errorTitle,
    defaultValues,
    nameRef,
    isPending,
    error,
    onSubmit,
}: NotebookFormProps) {
    const [name, setName] = useState(defaultValues.name)
    const [tags, setTags] = useState(defaultValues.tags)
    const [submitted, setSubmitted] = useState(false)
    const tagsQuery = useQuery(tagsQueryOptions())
    const nameError = submitted && name.trim() === '' ? 'Informe o nome do caderno.' : undefined

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setSubmitted(true)
        if (name.trim() === '') return
        onSubmit({ name: name.trim(), tags })
    }

    return (
        <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <FieldGroup>
                <Field data-invalid={nameError !== undefined}>
                    <FieldLabel htmlFor="notebook-name">Nome</FieldLabel>
                    <Input
                        id="notebook-name"
                        ref={nameRef}
                        autoFocus
                        required
                        maxLength={NOTEBOOK_NAME_MAX_LENGTH}
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        onFocus={(event) => event.currentTarget.select()}
                        aria-invalid={nameError !== undefined}
                    />
                    <FieldError>{nameError}</FieldError>
                </Field>
                <Field>
                    <FieldLabel htmlFor="notebook-tags">Tags</FieldLabel>
                    <TagCombobox
                        id="notebook-tags"
                        options={tagsQuery.data?.map((tag) => tag.name) ?? []}
                        value={tags}
                        onValueChange={setTags}
                        disabled={isPending}
                    />
                    <FieldDescription>Escolha tags existentes ou digite o nome de uma nova.</FieldDescription>
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
