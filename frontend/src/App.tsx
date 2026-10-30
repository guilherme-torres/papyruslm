import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Home } from '@/pages/home'

const queryClient = new QueryClient()

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Home />
            <TanStackRouterDevtools />
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    )
}
