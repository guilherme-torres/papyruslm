import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const LINE_WIDTHS = ['w-full', 'w-11/12', 'w-full', 'w-4/5', 'w-full', 'w-2/3']

export function TextSkeleton() {
    return (
        <div aria-busy className="flex flex-col gap-2.5 p-4">
            {LINE_WIDTHS.map((width, index) => (
                <Skeleton key={index} className={cn('h-4', width)} />
            ))}
        </div>
    )
}
