import { Link } from '@tanstack/react-router'
import { Separator } from '@/components/ui/separator'

export function AppHeader() {
    return (
        <header className="flex flex-col">
            <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
                <Link to="/" className="flex items-center gap-2 font-heading text-lg font-medium">
                    PapyrusLM
                </Link>
            </div>
            <Separator />
        </header>
    )
}
