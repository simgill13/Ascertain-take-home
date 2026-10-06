import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import type { PatientListSearch } from '@/features/patients/search-params'
import type {
  Patient,
  PatientInput,
  PatientListResponse,
  PatientStats,
} from '@/features/patients/types'
import { apiClient, request } from '@/lib/api/client'

export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (search: PatientListSearch) => [...patientKeys.lists(), search] as const,
  details: () => [...patientKeys.all, 'detail'] as const,
  detail: (patientId: string) => [...patientKeys.details(), patientId] as const,
  stats: () => [...patientKeys.all, 'stats'] as const,
}

export function fetchPatientList(search: PatientListSearch): Promise<PatientListResponse> {
  return request(() =>
    apiClient.GET('/patients', {
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
    queryFn: () => fetchPatientList(search),
    placeholderData: keepPreviousData,
  })
}

export function patientQueryOptions(patientId: string) {
  return queryOptions({
    queryKey: patientKeys.detail(patientId),
    queryFn: (): Promise<Patient> =>
      request(() =>
        apiClient.GET('/patients/{patient_id}', { params: { path: { patient_id: patientId } } }),
      ),
  })
}

export function patientStatsQueryOptions() {
  return queryOptions({
    queryKey: patientKeys.stats(),
    queryFn: (): Promise<PatientStats> => request(() => apiClient.GET('/patients/stats')),
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
