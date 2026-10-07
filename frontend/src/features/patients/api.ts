import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import type { PatientListSearch } from '@/features/patients/search-params'
import type {
  Patient,
  PatientInput,
  PatientListResponse,
  PatientStats,
} from '@/features/patients/types'
import { apiClient, request } from '@/lib/api/client'

const PATIENT_DETAIL_STALE_MS = 60_000
// Matches the server-side stats cache TTL so the client never asks sooner than the API recomputes.
const STATS_STALE_MS = 15_000

export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (search: PatientListSearch) => [...patientKeys.lists(), search] as const,
  details: () => [...patientKeys.all, 'detail'] as const,
  detail: (patientId: string) => [...patientKeys.details(), patientId] as const,
  stats: () => [...patientKeys.all, 'stats'] as const,
}

export function fetchPatientList(
  search: PatientListSearch,
  signal?: AbortSignal,
): Promise<PatientListResponse> {
  return request(() =>
    apiClient.GET('/patients', {
      signal,
      params: {
        query: {
          search: search.search,
          status: search.status,
          sort: search.sort,
          order: search.order,
          page: search.page,
          page_size: search.pageSize,
        },
      },
    }),
  )
}

export function patientListQueryOptions(search: PatientListSearch) {
  return queryOptions({
    queryKey: patientKeys.list(search),
    // The signal cancels a superseded search when the user keeps typing.
    queryFn: ({ signal }) => fetchPatientList(search, signal),
    placeholderData: keepPreviousData,
  })
}

export function patientQueryOptions(patientId: string) {
  return queryOptions({
    queryKey: patientKeys.detail(patientId),
    queryFn: ({ signal }): Promise<Patient> =>
      request(() =>
        apiClient.GET('/patients/{patient_id}', {
          signal,
          params: { path: { patient_id: patientId } },
        }),
      ),
    staleTime: PATIENT_DETAIL_STALE_MS,
  })
}

export function patientStatsQueryOptions() {
  return queryOptions({
    queryKey: patientKeys.stats(),
    queryFn: ({ signal }): Promise<PatientStats> =>
      request(() => apiClient.GET('/patients/stats', { signal })),
    staleTime: STATS_STALE_MS,
  })
}

export function createPatient(payload: PatientInput): Promise<Patient> {
  return request(() => apiClient.POST('/patients', { body: payload }))
}

export function updatePatient(patientId: string, payload: PatientInput): Promise<Patient> {
  return request(() =>
    apiClient.PUT('/patients/{patient_id}', {
      params: { path: { patient_id: patientId } },
      body: payload,
    }),
  )
}

export function deletePatient(patientId: string): Promise<void> {
  return request(() =>
    apiClient.DELETE('/patients/{patient_id}', { params: { path: { patient_id: patientId } } }),
  ).then(() => undefined)
}
