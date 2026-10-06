import createClient from 'openapi-fetch'

import type { paths } from '@/lib/api/schema'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

export type FieldError = { field: string; message: string }
export type ErrorResponse = { detail: string; errors: FieldError[] }

export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: FieldError[]

  constructor(status: number, body: Partial<ErrorResponse> | undefined) {
    super(body?.detail ?? `Request failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = body?.errors ?? []
  }

  get isValidationError() {
    return this.status === 422
  }

  get isNotFound() {
    return this.status === 404
  }
}

export class NetworkError extends Error {
  constructor(cause: unknown) {
    super('Could not reach the server. Check your connection and try again.')
    this.name = 'NetworkError'
    this.cause = cause
  }
}

export const apiClient = createClient<paths>({ baseUrl: API_BASE_URL })

/**
 * Normalize openapi-fetch results into either data or a thrown error.
 * Throwing lets TanStack Query handle retries and error states uniformly.
 */
function unwrap<Data>(result: { data?: Data; error?: unknown; response: Response }): Data {
  if (result.response.ok) {
    return result.data as Data
  }
  throw new ApiError(result.response.status, result.error as Partial<ErrorResponse> | undefined)
}

export async function request<Data>(
  call: () => Promise<{ data?: Data; error?: unknown; response: Response }>,
): Promise<Data> {
  try {
    const result = await call()
    return unwrap(result)
  } catch (caught) {
    if (caught instanceof ApiError) throw caught
    throw new NetworkError(caught)
  }
}
