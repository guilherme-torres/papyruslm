import { QueryClientProvider } from '@tanstack/react-query'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/query-client'
import { Home } from '@/pages/home'

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Home />
            <TanStackRouterDevtools />
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    )
}
