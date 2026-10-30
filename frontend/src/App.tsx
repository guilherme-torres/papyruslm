import { QueryClientProvider } from '@tanstack/react-query'
import { Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AppHeader } from '@/components/app-header'
import { TooltipProvider } from '@/components/ui/tooltip'
import { queryClient } from '@/lib/query-client'

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <div className="flex min-h-svh flex-col bg-background text-foreground">
                    <AppHeader />
                    <Outlet />
                </div>
            </TooltipProvider>
            <TanStackRouterDevtools />
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    )
}
