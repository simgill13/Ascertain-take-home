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
import { cn } from '@/lib/utils'

const SEARCH_DEBOUNCE_MS = 250
// Newest first is the useful default for date sorts; names and status read best ascending.
const DESCENDING_BY_DEFAULT: ReadonlySet<PatientSortField> = new Set(['last_visit', 'created_at'])

type StatusTab = { value: PatientStatus | undefined; label: string }
const STATUS_TABS: StatusTab[] = [
  { value: undefined, label: 'All patients' },
  ...PATIENT_STATUSES.map((status) => ({ value: status, label: STATUS_LABELS[status] })),
]

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
    <div className="mb-4 space-y-4">
      <div className="flex flex-col gap-3 border-b lg:flex-row lg:items-end lg:justify-between">
        <StatusTabs
          value={listSearch.status}
          onChange={(status) => onChange({ status, page: 1 })}
        />

        <div className="flex items-center gap-2 pb-3 lg:pb-2">
          <Label htmlFor="patient-sort" className="sr-only">
            Sort by
          </Label>
          <Select
            value={listSearch.sort}
            onValueChange={(value) => {
              const sort = value as PatientSortField
              onChange({ sort, order: DESCENDING_BY_DEFAULT.has(sort) ? 'desc' : 'asc', page: 1 })
            }}
          >
            <SelectTrigger id="patient-sort" size="sm" className="bg-secondary w-44 border-0">
              <span className="text-muted-foreground">Sort</span>
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
            variant="secondary"
            size="icon-sm"
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
            {listSearch.order === 'asc' ? <ArrowUpNarrowWideIcon /> : <ArrowDownWideNarrowIcon />}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <Label htmlFor="patient-search" className="sr-only">
            Search
          </Label>
          <SearchIcon
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            id="patient-search"
            type="search"
            placeholder="Search by name or email"
            value={searchText}
            autoComplete="off"
            className="bg-background pl-9"
            onChange={(event) => {
              setSearchText(event.target.value)
              commitSearch(event.target.value)
            }}
          />
        </div>
        <div className="text-muted-foreground flex items-center gap-3 text-sm">
          <span aria-live="polite">
            {isFetching
              ? 'Updating…'
              : resultCount === null
                ? ''
                : `Showing ${formatCount(resultCount, 'patient')}`}
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
    </div>
  )
}

function StatusTabs({
  value,
  onChange,
}: {
  value: PatientStatus | undefined
  onChange: (status: PatientStatus | undefined) => void
}) {
  return (
    <div role="tablist" aria-label="Filter by status" className="-mb-px flex gap-1 overflow-x-auto">
      {STATUS_TABS.map((tab) => {
        const selected = tab.value === value
        return (
          <button
            key={tab.label}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.value)}
            className={cn(
              'hover:text-foreground min-h-10 shrink-0 border-b-2 px-3 text-sm transition-colors',
              selected
                ? 'border-foreground text-foreground font-medium'
                : 'text-muted-foreground border-transparent',
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
