import { ArrowDownWideNarrowIcon, ArrowUpNarrowWideIcon, SearchIcon, XIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { hasActiveFilters, type PatientListSearch } from '@/features/patients/search-params'
import {
  PATIENT_SORT_FIELDS,
  PATIENT_STATUSES,
  SORT_LABELS,
  STATUS_LABELS,
  type PatientSortField,
  type PatientStatus,
} from '@/features/patients/types'
import { useDebouncedCallback } from '@/hooks/use-debounced-callback'
import { formatCount } from '@/lib/format'

const SEARCH_DEBOUNCE_MS = 250
const ALL_STATUSES = 'all'
// Newest first is the useful default for date sorts; names and status read best ascending.
const DESCENDING_BY_DEFAULT: ReadonlySet<PatientSortField> = new Set(['last_visit', 'created_at'])

type PatientListToolbarProps = {
  listSearch: PatientListSearch
  onChange: (changes: Partial<PatientListSearch>) => void
  resultCount: number | null
  isFetching: boolean
}

export function PatientListToolbar({
  listSearch,
  onChange,
  resultCount,
  isFetching,
}: PatientListToolbarProps) {
  const [searchText, setSearchText] = useState(listSearch.search ?? '')
  const [lastUrlSearch, setLastUrlSearch] = useState(listSearch.search)
  const commitSearch = useDebouncedCallback(
    (value: string) => onChange({ search: value.trim() || undefined, page: 1 }),
    SEARCH_DEBOUNCE_MS,
  )

  // When the URL changes from elsewhere (back button, "clear filters"), adopt its value.
  // A commit of the user's own typing is left alone so a trailing space is not eaten mid-phrase.
  if (listSearch.search !== lastUrlSearch) {
    setLastUrlSearch(listSearch.search)
    if ((listSearch.search ?? '') !== searchText.trim()) {
      setSearchText(listSearch.search ?? '')
    }
  }

  return (
    <div className="mb-4 flex flex-col gap-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1">
          <Label htmlFor="patient-search">Search</Label>
          <div className="relative mt-1.5">
            <SearchIcon
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              id="patient-search"
              type="search"
              placeholder="Name or email"
              value={searchText}
              autoComplete="off"
              className="pl-9"
              onChange={(event) => {
                setSearchText(event.target.value)
                commitSearch(event.target.value)
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:flex sm:items-end">
          <div>
            <Label htmlFor="patient-status-filter">Status</Label>
            <Select
              value={listSearch.status ?? ALL_STATUSES}
              onValueChange={(value) =>
                onChange({
                  status: value === ALL_STATUSES ? undefined : (value as PatientStatus),
                  page: 1,
                })
              }
            >
              <SelectTrigger id="patient-status-filter" className="mt-1.5 w-full sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_STATUSES}>All statuses</SelectItem>
                {PATIENT_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="patient-sort">Sort by</Label>
            <div className="mt-1.5 flex gap-1">
              <Select
                value={listSearch.sort}
                onValueChange={(value) => {
                  const sort = value as PatientSortField
                  onChange({
                    sort,
                    order: DESCENDING_BY_DEFAULT.has(sort) ? 'desc' : 'asc',
                    page: 1,
                  })
                }}
              >
                <SelectTrigger id="patient-sort" className="min-w-0 flex-1 sm:w-40 sm:flex-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PATIENT_SORT_FIELDS.map((field) => (
                    <SelectItem key={field} value={field}>
                      {SORT_LABELS[field]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                aria-label={
                  listSearch.order === 'asc'
                    ? 'Sorted ascending. Switch to descending'
                    : 'Sorted descending. Switch to ascending'
                }
                onClick={() =>
                  onChange({ order: listSearch.order === 'asc' ? 'desc' : 'asc', page: 1 })
                }
              >
                {listSearch.order === 'asc' ? (
                  <ArrowUpNarrowWideIcon />
                ) : (
                  <ArrowDownWideNarrowIcon />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="text-muted-foreground flex items-center gap-3 text-sm" aria-live="polite">
        <span>
          {isFetching
            ? 'Updating…'
            : resultCount === null
              ? ''
              : formatCount(resultCount, 'patient')}
        </span>
        {hasActiveFilters(listSearch) ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-7"
            onClick={() => onChange({ search: undefined, status: undefined, page: 1 })}
          >
            <XIcon aria-hidden="true" />
            Clear filters
          </Button>
        ) : null}
      </div>
    </div>
  )
}
