import { z } from 'zod'

import { PATIENT_SORT_FIELDS, PATIENT_STATUSES } from '@/features/patients/types'

export const PAGE_SIZES = [25, 50, 100] as const
export type PageSize = (typeof PAGE_SIZES)[number]

export const patientListSearchSchema = z.object({
  search: z.string().trim().max(100).optional().catch(undefined),
  status: z.enum(PATIENT_STATUSES).optional().catch(undefined),
  sort: z.enum(PATIENT_SORT_FIELDS).default('last_name').catch('last_name'),
  order: z.enum(['asc', 'desc']).default('asc').catch('asc'),
  page: z.number().int().min(1).default(1).catch(1),
  pageSize: z
    .union([z.literal(25), z.literal(50), z.literal(100)])
    .default(25)
    .catch(25),
})

export type PatientListSearch = z.infer<typeof patientListSearchSchema>

export const DEFAULT_PATIENT_LIST_SEARCH = {
  sort: 'last_name',
  order: 'asc',
  page: 1,
  pageSize: 25,
} as const satisfies Partial<PatientListSearch>
