import { ArrowDownAZIcon, ArrowUpAZIcon, SearchIcon, XIcon } from 'lucide-react'
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
import type { PatientListSearch } from '@/features/patients/search-params'
import {
  PATIENT_SORT_FIELDS,
  PATIENT_STATUSES,
  SORT_LABELS,
  STATUS_LABELS,
  type PatientSortField,
  type PatientStatus,
} from '@/features/patients/types'
import { useDebouncedCallback } from '@/hooks/use-debounced-callback'

const SEARCH_DEBOUNCE_MS = 250
const ALL_STATUSES = 'all'

type PatientListToolbarProps = {
  search: PatientListSearch
  onChange: (next: Partial<PatientListSearch>) => void
  resultCount: number
  isFetching: boolean
}

export function PatientListToolbar({
  search,
  onChange,
  resultCount,
  isFetching,
}: PatientListToolbarProps) {
  const [searchText, setSearchText] = useState(search.search ?? '')
  const [lastUrlSearch, setLastUrlSearch] = useState(search.search)
  const commitSearch = useDebouncedCallback(
    (value: string) => onChange({ search: value.trim() || undefined, page: 1 }),
    SEARCH_DEBOUNCE_MS,
  )

  // When the URL changes from elsewhere (back button, "clear filters"), adopt its value.
  if (search.search !== lastUrlSearch) {
    setLastUrlSearch(search.search)
    setSearchText(search.search ?? '')
  }

  const hasFilters = Boolean(search.search || search.status)

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
              value={search.status ?? ALL_STATUSES}
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
                value={search.sort}
                onValueChange={(value) => onChange({ sort: value as PatientSortField, page: 1 })}
              >
                <SelectTrigger id="patient-sort" className="w-full sm:w-40">
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
                aria-label={
                  search.order === 'asc'
                    ? 'Sorted ascending. Switch to descending'
                    : 'Sorted descending. Switch to ascending'
                }
                onClick={() =>
                  onChange({ order: search.order === 'asc' ? 'desc' : 'asc', page: 1 })
                }
              >
                {search.order === 'asc' ? <ArrowDownAZIcon /> : <ArrowUpAZIcon />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="text-muted-foreground flex items-center gap-3 text-sm" aria-live="polite">
        <span>
          {isFetching
            ? 'Updating…'
            : `${resultCount.toLocaleString('en-US')} ${resultCount === 1 ? 'patient' : 'patients'}`}
        </span>
        {hasFilters ? (
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
