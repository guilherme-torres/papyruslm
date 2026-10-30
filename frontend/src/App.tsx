import { QueryClientProvider } from '@tanstack/react-query'
import { Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AppHeader } from '@/components/app-header'
import { Toaster } from '@/components/ui/toast'
import { TooltipProvider } from '@/components/ui/tooltip'
import { queryClient } from '@/lib/query-client'

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <Toaster>
                    <div className="flex h-svh flex-col bg-background text-foreground">
                        <AppHeader />
                        <div className="min-h-0 flex-1 overflow-y-auto">
                            <Outlet />
                        </div>
                    </div>
                </Toaster>
            </TooltipProvider>
            <TanStackRouterDevtools />
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    )
}
