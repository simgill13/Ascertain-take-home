import { QueryClient } from '@tanstack/react-query'

import { ApiError } from '@/lib/api/client'

const MAX_RETRIES = 2

function shouldRetry(failureCount: number, error: unknown) {
  // Client errors will not succeed on retry; network and server errors might.
  if (error instanceof ApiError && error.status < 500) return false
  return failureCount < MAX_RETRIES
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: shouldRetry,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  })
}
