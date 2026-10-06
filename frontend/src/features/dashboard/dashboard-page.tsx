import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ActivityIcon, CalendarClockIcon, UserPlusIcon, UsersIcon } from 'lucide-react'

import { PageHeader } from '@/components/layout/page-header'
import { ErrorState } from '@/components/state/error-state'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { patientListQueryOptions, patientStatsQueryOptions } from '@/features/patients/api'
import { PatientStatusBadge } from '@/features/patients/patient-status-badge'
import { DEFAULT_PATIENT_LIST_SEARCH } from '@/features/patients/search-params'
import { STATUS_LABELS, type PatientStats, type PatientStatus } from '@/features/patients/types'
import { formatRelativeDate } from '@/lib/format'
import { cn } from '@/lib/utils'

const RECENT_VISITS_SEARCH = {
  ...DEFAULT_PATIENT_LIST_SEARCH,
  sort: 'last_visit',
  order: 'desc',
} as const
const RECENT_VISITS_SHOWN = 6

const STATUS_BAR_CLASS: Record<PatientStatus, string> = {
  active: 'bg-status-active',
  pending: 'bg-status-pending',
  inactive: 'bg-status-inactive',
  discharged: 'bg-status-discharged',
}

export function DashboardPage() {
  const statsQuery = useQuery(patientStatsQueryOptions())
  const recentVisitsQuery = useQuery(patientListQueryOptions(RECENT_VISITS_SEARCH))

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Today at Northlight Family Practice."
        actions={
          <Button asChild>
            <Link to="/patients/new">
              <UserPlusIcon aria-hidden="true" />
              New patient
            </Link>
          </Button>
        }
      />

      {statsQuery.isError ? (
        <ErrorState error={statsQuery.error} onRetry={() => void statsQuery.refetch()} />
      ) : (
        <StatCards stats={statsQuery.data} />
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Patients by status</CardTitle>
          </CardHeader>
          <CardContent>
            {statsQuery.data ? (
              <StatusChart stats={statsQuery.data} />
            ) : (
              <Skeleton className="h-40" aria-label="Loading status chart" />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent visits</CardTitle>
            <CardAction>
              <Button asChild variant="link" size="sm" className="h-auto p-0">
                <Link to="/patients" search={RECENT_VISITS_SEARCH}>
                  View all
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {recentVisitsQuery.isError ? (
              <ErrorState
                error={recentVisitsQuery.error}
                onRetry={() => void recentVisitsQuery.refetch()}
              />
            ) : recentVisitsQuery.isPending ? (
              <Skeleton className="h-40" aria-label="Loading recent visits" />
            ) : (
              <ul className="divide-y">
                {recentVisitsQuery.data.items
                  .filter((patient) => patient.last_visit_at)
                  .slice(0, RECENT_VISITS_SHOWN)
                  .map((patient) => (
                    <li key={patient.id} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="min-w-0">
                        <Link
                          to="/patients/$patientId"
                          params={{ patientId: patient.id }}
                          className="block truncate text-sm font-medium hover:underline"
                        >
                          {patient.first_name} {patient.last_name}
                        </Link>
                        <p className="text-muted-foreground text-xs">
                          {formatRelativeDate(patient.last_visit_at)}
                        </p>
                      </div>
                      <PatientStatusBadge status={patient.status} />
                    </li>
                  ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function StatCards({ stats }: { stats: PatientStats | undefined }) {
  const cards = [
    { label: 'Total patients', value: stats?.total, icon: UsersIcon },
    { label: 'Visits in last 30 days', value: stats?.visits_last_30_days, icon: ActivityIcon },
    { label: 'New in last 30 days', value: stats?.new_last_30_days, icon: UserPlusIcon },
    {
      label: 'Active, no visit in a year',
      value: stats?.without_recent_visit,
      icon: CalendarClockIcon,
    },
  ]
  return (
    <ul className="grid grid-cols-2 gap-4 xl:grid-cols-4" aria-label="Practice totals">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <li key={card.label}>
            <Card className="h-full gap-2 py-4">
              <CardContent className="flex items-start justify-between gap-2 px-4">
                <div>
                  <p className="text-muted-foreground text-xs font-medium">{card.label}</p>
                  <p className="font-display mt-1 text-3xl font-semibold tabular-nums">
                    {card.value === undefined ? (
                      <Skeleton className="mt-1 h-8 w-12" />
                    ) : (
                      card.value.toLocaleString('en-US')
                    )}
                  </p>
                </div>
                <Icon className="text-muted-foreground size-5 shrink-0" aria-hidden="true" />
              </CardContent>
            </Card>
          </li>
        )
      })}
    </ul>
  )
}

function StatusChart({ stats }: { stats: PatientStats }) {
  const largestCount = Math.max(1, ...stats.by_status.map((statusCount) => statusCount.count))
  return (
    <ul className="space-y-3" aria-label="Patient count by status">
      {stats.by_status.map((statusCount) => {
        const widthPercent = Math.round((statusCount.count / largestCount) * 100)
        return (
          <li key={statusCount.status} className="text-sm">
            <div className="mb-1 flex items-center justify-between">
              <span>{STATUS_LABELS[statusCount.status]}</span>
              <span className="text-muted-foreground tabular-nums">{statusCount.count}</span>
            </div>
            <div
              role="img"
              aria-label={`${STATUS_LABELS[statusCount.status]}: ${statusCount.count} of ${stats.total}`}
              className="bg-muted h-2.5 overflow-hidden rounded-full"
            >
              <div
                className={cn(
                  'h-full rounded-full transition-[width] duration-200',
                  STATUS_BAR_CLASS[statusCount.status],
                )}
                style={{ width: `${widthPercent}%` }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
