import { createFileRoute } from '@tanstack/react-router'
import { NotebookPage } from '@/pages/notebook'

export const Route = createFileRoute('/notebook/$notebookId')({
    component: NotebookPage,
})
