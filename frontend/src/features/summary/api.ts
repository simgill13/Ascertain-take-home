import { queryOptions } from '@tanstack/react-query'

import { apiClient, request } from '@/lib/api/client'
import type { components } from '@/lib/api/schema'

export type PatientSummary = components['schemas']['PatientSummary']

export const summaryKeys = {
  all: ['summary'] as const,
  forPatient: (patientId: string) => [...summaryKeys.all, patientId] as const,
}

export function summaryQueryOptions(patientId: string) {
  return queryOptions({
    queryKey: summaryKeys.forPatient(patientId),
    queryFn: (): Promise<PatientSummary> =>
      request(() =>
        apiClient.GET('/patients/{patient_id}/summary', {
          params: { path: { patient_id: patientId } },
        }),
      ),
    // The narrative depends on notes; invalidation on note changes keeps it fresh.
    staleTime: 5 * 60 * 1000,
  })
}
