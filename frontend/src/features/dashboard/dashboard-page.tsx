import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  ActivityIcon,
  CalendarClockIcon,
  ChevronDownIcon,
  UserPlusIcon,
  UsersIcon,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'

import { AvatarInitials } from '@/components/avatar-initials'
import { ErrorState } from '@/components/state/error-state'
import { LoadingStatus } from '@/components/state/loading-status'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { patientListQueryOptions, patientStatsQueryOptions } from '@/features/patients/api'
import { PatientDrawer } from '@/features/patients/patient-drawer'
import { PatientStatusBadge } from '@/features/patients/patient-status-badge'
import {
  DEFAULT_PATIENT_LIST_SEARCH,
  type PatientListSearch,
} from '@/features/patients/search-params'
import {
  STATUS_GROUP_ORDER,
  STATUS_TINT,
  TINT_CLASS,
  type Tint,
} from '@/features/patients/status-styles'
import {
  STATUS_LABELS,
  type Patient,
  type PatientStats,
  type PatientStatus,
} from '@/features/patients/types'
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs'
import { formatAge, formatDate, formatRelativeDate } from '@/lib/format'
import { cn } from '@/lib/utils'

// The overview reads the first page of the roster, newest visit first, and groups it by status.
const OVERVIEW_SEARCH: PatientListSearch = {
  ...DEFAULT_PATIENT_LIST_SEARCH,
  sort: 'last_visit',
  order: 'desc',
  pageSize: 100,
}

const todayFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

export function DashboardPage() {
  useBreadcrumbs([{ label: 'Patient statuses' }])
  const statsQuery = useQuery(patientStatsQueryOptions())
  const rosterQuery = useQuery(patientListQueryOptions(OVERVIEW_SEARCH))
  const [previewPatient, setPreviewPatient] = useState<Patient | null>(null)

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-sm">
          <span className="text-muted-foreground">Today </span>
          <span className="font-medium">{todayFormatter.format(new Date())}</span>
        </p>
        <Button asChild>
          <Link to="/patients/new">
            <UserPlusIcon aria-hidden="true" />
            New patient
          </Link>
        </Button>
      </div>

      {statsQuery.isError ? (
        <ErrorState error={statsQuery.error} onRetry={() => void statsQuery.refetch()} />
      ) : (
        <MetricTiles stats={statsQuery.data} />
      )}

      <section className="mt-8" aria-labelledby="roster-heading">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="roster-heading" className="text-muted-foreground text-sm">
            {rosterQuery.data
              ? `Showing ${rosterQuery.data.items.length} of ${rosterQuery.data.total} patients`
              : 'Patients by status'}
          </h2>
          <Button asChild variant="link" size="sm" className="h-auto p-0">
            <Link to="/patients">View all patients</Link>
          </Button>
        </div>

        {rosterQuery.isError ? (
          <ErrorState error={rosterQuery.error} onRetry={() => void rosterQuery.refetch()} />
        ) : rosterQuery.isPending ? (
          <LoadingStatus label="Loading patients">
            <Skeleton className="h-64" />
          </LoadingStatus>
        ) : (
          <GroupedPatientTable patients={rosterQuery.data.items} onSelect={setPreviewPatient} />
        )}
      </section>

      <PatientDrawer patient={previewPatient} onClose={() => setPreviewPatient(null)} />
    </>
  )
}

type Metric = {
  label: string
  value: number | undefined
  icon: LucideIcon
  tint: Tint
  search: PatientListSearch
}

function MetricTiles({ stats }: { stats: PatientStats | undefined }) {
  const metrics: Metric[] = [
    {
      label: 'Pending intake',
      value: stats?.by_status.find((entry) => entry.status === 'pending')?.count,
      icon: UsersIcon,
      tint: 'amber',
      search: { ...DEFAULT_PATIENT_LIST_SEARCH, status: 'pending' },
    },
    {
      label: 'Visits in last 30 days',
      value: stats?.visits_last_30_days,
      icon: ActivityIcon,
      tint: 'green',
      search: OVERVIEW_SEARCH,
    },
    {
      label: 'New in last 30 days',
      value: stats?.new_last_30_days,
      icon: UserPlusIcon,
      tint: 'blue',
      search: { ...DEFAULT_PATIENT_LIST_SEARCH, sort: 'created_at', order: 'desc' },
    },
    {
      label: 'Active, no visit in a year',
      value: stats?.without_recent_visit,
      icon: CalendarClockIcon,
      tint: 'violet',
      search: {
        ...DEFAULT_PATIENT_LIST_SEARCH,
        status: 'active',
        sort: 'last_visit',
        order: 'asc',
      },
    },
  ]

  return (
    <ul
      className="grid grid-cols-2 divide-x divide-y rounded-lg border sm:grid-cols-4 sm:divide-y-0"
      aria-label="Practice totals"
    >
      {metrics.map((metric) => {
        const Icon = metric.icon
        return (
          <li key={metric.label} className="min-w-0 p-5">
            <span
              aria-hidden="true"
              className={cn('grid size-9 place-items-center rounded-md', TINT_CLASS[metric.tint])}
            >
              <Icon className="size-4" />
            </span>
            <div className="mt-4 text-2xl font-semibold tabular-nums">
              {metric.value === undefined ? (
                <Skeleton className="h-7 w-10" />
              ) : (
                metric.value.toLocaleString('en-US')
              )}
            </div>
            <Link
              to="/patients"
              search={metric.search}
              className="text-muted-foreground mt-0.5 block text-sm hover:underline focus-visible:underline"
            >
              {metric.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

const GROUP_ROW_GRID =
  'grid grid-cols-[1fr_auto] items-center gap-x-4 sm:grid-cols-[minmax(0,2fr)_0.7fr_1.2fr_minmax(0,1.5fr)]'

function GroupedPatientTable({
  patients,
  onSelect,
}: {
  patients: Patient[]
  onSelect: (patient: Patient) => void
}) {
  const [collapsed, setCollapsed] = useState<Set<PatientStatus>>(new Set())

  const toggleGroup = (status: PatientStatus) => {
    setCollapsed((previous) => {
      const next = new Set(previous)
      if (next.has(status)) next.delete(status)
      else next.add(status)
      return next
    })
  }

  const groups = STATUS_GROUP_ORDER.map((status) => ({
    status,
    patients: patients.filter((patient) => patient.status === status),
  })).filter((group) => group.patients.length > 0)

  return (
    <div className="overflow-hidden rounded-lg border">
      <div
        className={cn(
          GROUP_ROW_GRID,
          'text-muted-foreground hidden border-b px-4 py-2.5 text-xs font-medium sm:grid',
        )}
      >
        <span>Patient</span>
        <span>Age</span>
        <span>Last visit</span>
        <span>Conditions</span>
      </div>

      {groups.map((group) => {
        const isCollapsed = collapsed.has(group.status)
        const panelId = `group-${group.status}`
        return (
          <section key={group.status} aria-label={STATUS_LABELS[group.status]}>
            <h3 className="bg-background border-b">
              <button
                type="button"
                aria-expanded={!isCollapsed}
                aria-controls={panelId}
                onClick={() => toggleGroup(group.status)}
                className="flex min-h-10 w-full items-center gap-2 px-4 py-2 text-left text-sm font-medium"
              >
                <ChevronDownIcon
                  aria-hidden="true"
                  className={cn(
                    'text-muted-foreground size-4 transition-transform duration-150',
                    isCollapsed && '-rotate-90',
                  )}
                />
                <span
                  className={cn(
                    'rounded-md px-2 py-0.5 text-xs',
                    TINT_CLASS[STATUS_TINT[group.status]],
                  )}
                >
                  {STATUS_LABELS[group.status]}
                </span>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {group.patients.length}
                </span>
              </button>
            </h3>
            {isCollapsed ? null : (
              <ul id={panelId}>
                {group.patients.map((patient) => (
                  <li key={patient.id} className="border-b last:border-0">
                    <button
                      type="button"
                      onClick={() => onSelect(patient)}
                      className={cn(
                        GROUP_ROW_GRID,
                        'hover:bg-background w-full px-4 py-3 text-left text-sm transition-colors',
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <AvatarInitials
                          firstName={patient.first_name}
                          lastName={patient.last_name}
                        />
                        <span className="min-w-0">
                          <span className="block truncate font-medium">
                            {patient.first_name} {patient.last_name}
                          </span>
                          <span className="text-muted-foreground block truncate text-xs">
                            {patient.conditions[0] ?? `DOB ${formatDate(patient.date_of_birth)}`}
                          </span>
                        </span>
                      </span>
                      <span className="hidden sm:block">{formatAge(patient.age)}</span>
                      <span className="hidden sm:block">
                        {formatRelativeDate(patient.last_visit_at)}
                      </span>
                      <span className="text-muted-foreground hidden min-w-0 truncate sm:block">
                        {patient.conditions.length > 1
                          ? patient.conditions.slice(1).join(', ')
                          : '—'}
                      </span>
                      <span className="sm:hidden">
                        <PatientStatusBadge status={patient.status} />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )
}
