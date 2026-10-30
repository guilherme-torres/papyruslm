import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface PanelProps {
    title: string
    action?: ReactNode
    className?: string
    children: ReactNode
}

export function Panel({ title, action, className, children }: PanelProps) {
    return (
        <section
            aria-label={title}
            className={cn(
                'flex min-h-0 flex-col overflow-hidden rounded-xl bg-card text-card-foreground ring-1 ring-foreground/10',
                className,
            )}
        >
            <header className="flex h-12 shrink-0 items-center justify-between gap-2 pr-2 pl-4">
                <h2 className="min-w-0 truncate font-heading text-sm font-medium">{title}</h2>
                {action}
            </header>
            <Separator />
            <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </section>
    )
}

interface PanelActionProps {
    label: string
    side?: 'left' | 'right' | 'top' | 'bottom'
    onClick: () => void
    children: ReactNode
}

export function PanelAction({ label, side = 'bottom', onClick, children }: PanelActionProps) {
    return (
        <Tooltip>
            <TooltipTrigger render={<Button variant="ghost" size="icon-sm" aria-label={label} onClick={onClick} />}>
                {children}
            </TooltipTrigger>
            <TooltipContent side={side}>{label}</TooltipContent>
        </Tooltip>
    )
}

interface CollapsedPanelProps {
    label: string
    expandLabel: string
    side: 'left' | 'right'
    onExpand: () => void
    icon: ReactNode
}

export function CollapsedPanel({ label, expandLabel, side, onExpand, icon }: CollapsedPanelProps) {
    return (
        <section
            aria-label={label}
            className="flex w-12 shrink-0 flex-col items-center rounded-xl bg-card py-2 text-card-foreground ring-1 ring-foreground/10"
        >
            <PanelAction label={expandLabel} side={side === 'left' ? 'right' : 'left'} onClick={onExpand}>
                {icon}
            </PanelAction>
        </section>
    )
}
