import { useRef, useState, type FormEvent } from 'react'
import { ArrowUpIcon, SquareIcon } from 'lucide-react'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupTextarea } from '@/components/ui/input-group'

interface ChatComposerProps {
    selectedSourcesCount: number
    isAnswering: boolean
    onSubmit: (question: string) => void
    onStop: () => void
}

function sourcesLabel(count: number): string {
    if (count === 0) return 'Nenhuma fonte selecionada'
    return count === 1 ? '1 fonte' : `${count} fontes`
}

export function ChatComposer({ selectedSourcesCount, isAnswering, onSubmit, onStop }: ChatComposerProps) {
    const [question, setQuestion] = useState('')
    const formRef = useRef<HTMLFormElement>(null)
    const hasSources = selectedSourcesCount > 0
    const canSend = question.trim() !== '' && hasSources && !isAnswering

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!canSend) return
        onSubmit(question.trim())
        setQuestion('')
    }

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="shrink-0 p-3">
            <InputGroup className="mx-auto max-w-3xl">
                <InputGroupTextarea
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault()
                            formRef.current?.requestSubmit()
                        }
                    }}
                    placeholder={hasSources ? 'Pergunte algo sobre os documentos' : 'Selecione ao menos uma fonte para perguntar'}
                    aria-label="Pergunta"
                    className="max-h-40 min-h-14"
                />
                <InputGroupAddon align="block-end">
                    <InputGroupText>{sourcesLabel(selectedSourcesCount)}</InputGroupText>
                    {isAnswering ? (
                        <InputGroupButton
                            variant="default"
                            size="icon-sm"
                            className="ml-auto"
                            aria-label="Parar resposta"
                            onClick={onStop}
                        >
                            <SquareIcon />
                        </InputGroupButton>
                    ) : (
                        <InputGroupButton
                            type="submit"
                            variant="default"
                            size="icon-sm"
                            className="ml-auto"
                            aria-label="Enviar pergunta"
                            disabled={!canSend}
                        >
                            <ArrowUpIcon />
                        </InputGroupButton>
                    )}
                </InputGroupAddon>
            </InputGroup>
        </form>
    )
}
