import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      retry: 1,
      refetchOnWindowFocus: true,
      refetchInterval: 15 * 60 * 1000,
    },
  },
})
