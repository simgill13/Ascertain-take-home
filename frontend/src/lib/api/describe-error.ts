import { ApiError, NetworkError } from '@/lib/api/client'

export type DescribedError = { title: string; message: string }

export function describeError(error: unknown): DescribedError {
  if (error instanceof NetworkError) {
    return { title: 'Connection problem', message: error.message }
  }
  if (error instanceof ApiError && error.isNotFound) {
    return { title: 'Not found', message: error.message }
  }
  if (error instanceof ApiError) {
    return { title: 'The server rejected the request', message: error.message }
  }
  return {
    title: 'Something went wrong',
    message: error instanceof Error ? error.message : 'An unexpected error occurred.',
  }
}
