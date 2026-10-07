import type { SearchSchemaInput } from '@tanstack/react-router'

import {
  PATIENT_SORT_FIELDS,
  PATIENT_STATUSES,
  type PatientSortField,
  type PatientStatus,
} from '@/features/patients/types'

// These parsers are hand-rolled on purpose: the router validates search params in the
// initial bundle, and pulling zod in here would add it to every page load.

export const PAGE_SIZES = [25, 50, 100] as const
export type PageSize = (typeof PAGE_SIZES)[number]
const SORT_ORDERS = ['asc', 'desc'] as const
export type SortOrder = (typeof SORT_ORDERS)[number]

const MAX_SEARCH_LENGTH = 100

export type PatientListSearch = {
  search?: string
  status?: PatientStatus
  sort: PatientSortField
  order: SortOrder
  page: number
  pageSize: PageSize
}

export const DEFAULT_PATIENT_LIST_SEARCH = {
  sort: 'last_name',
  order: 'asc',
  page: 1,
  pageSize: 25,
} as const satisfies Partial<PatientListSearch>

// The marker tells the router the input shape is looser than the parsed output.
type RawSearch = Record<string, unknown> & SearchSchemaInput

function oneOf<Option extends string | number>(
  value: unknown,
  options: readonly Option[],
): Option | undefined {
  return options.includes(value as Option) ? (value as Option) : undefined
}

function trimmedText(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim().slice(0, maxLength)
  return trimmed || undefined
}

function positiveInteger(value: unknown): number | undefined {
  const parsed = typeof value === 'string' ? Number(value) : value
  return typeof parsed === 'number' && Number.isInteger(parsed) && parsed >= 1 ? parsed : undefined
}

export function parsePatientListSearch(raw: RawSearch): PatientListSearch {
  const pageSize = oneOf(Number(raw.pageSize), PAGE_SIZES)
  return {
    search: trimmedText(raw.search, MAX_SEARCH_LENGTH),
    status: oneOf(raw.status, PATIENT_STATUSES),
    sort: oneOf(raw.sort, PATIENT_SORT_FIELDS) ?? DEFAULT_PATIENT_LIST_SEARCH.sort,
    order: oneOf(raw.order, SORT_ORDERS) ?? DEFAULT_PATIENT_LIST_SEARCH.order,
    page: positiveInteger(raw.page) ?? DEFAULT_PATIENT_LIST_SEARCH.page,
    pageSize: pageSize ?? DEFAULT_PATIENT_LIST_SEARCH.pageSize,
  }
}

export function hasActiveFilters(listSearch: PatientListSearch): boolean {
  return Boolean(listSearch.search || listSearch.status)
}

export const PATIENT_DETAIL_TABS = ['overview', 'notes', 'summary'] as const
export type PatientDetailTab = (typeof PATIENT_DETAIL_TABS)[number]

export type PatientDetailSearch = { tab: PatientDetailTab }

export const DEFAULT_PATIENT_DETAIL_SEARCH = {
  tab: 'overview',
} as const satisfies PatientDetailSearch

export function parsePatientDetailSearch(raw: RawSearch): PatientDetailSearch {
  return { tab: oneOf(raw.tab, PATIENT_DETAIL_TABS) ?? DEFAULT_PATIENT_DETAIL_SEARCH.tab }
}
