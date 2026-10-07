import { Link } from '@tanstack/react-router'
import { useVirtualizer } from '@tanstack/react-virtual'
import { memo, useRef } from 'react'

import { AvatarInitials } from '@/components/avatar-initials'
import { LoadingStatus } from '@/components/state/loading-status'
import { Skeleton } from '@/components/ui/skeleton'
import { PatientStatusBadge } from '@/features/patients/patient-status-badge'
import type { Patient } from '@/features/patients/types'
import { formatAge, formatDate, formatRelativeDate } from '@/lib/format'
import { cn } from '@/lib/utils'

const ESTIMATED_ROW_HEIGHT = 64
const OVERSCAN_ROWS = 8
const SKELETON_ROW_COUNT = 8
const CONDITIONS_SHOWN = 2

const ROW_GRID =
  'grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 sm:grid-cols-[minmax(0,2.2fr)_0.8fr_1.3fr_minmax(0,1.6fr)_1fr]'

type PatientTableProps = {
  patients: Patient[]
  isLoading: boolean
  className?: string
}

export function PatientTable({ patients, isLoading, className }: PatientTableProps) {
  const scrollParent = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: patients.length,
    getScrollElement: () => scrollParent.current,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    overscan: OVERSCAN_ROWS,
  })

  if (isLoading) {
    return <PatientTableSkeleton />
  }

  return (
    <div className={cn('overflow-hidden rounded-lg border', className)}>
      <div
        role="table"
        aria-label="Patients"
        aria-rowcount={patients.length + 1}
        className="flex h-full flex-col"
      >
        <div role="rowgroup">
          <div
            role="row"
            className={cn(
              ROW_GRID,
              'text-foreground hidden border-b px-4 py-3 text-[13px] font-medium sm:grid',
            )}
          >
            <span role="columnheader">Patient</span>
            <span role="columnheader">Age</span>
            <span role="columnheader">Last visit</span>
            <span role="columnheader">Conditions</span>
            <span role="columnheader">Status</span>
          </div>
        </div>

        <div ref={scrollParent} role="rowgroup" className="max-h-[65dvh] overflow-auto">
          <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const patient = patients[virtualRow.index]
              if (!patient) return null
              return (
                <div
                  key={patient.id}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  className="absolute top-0 left-0 w-full"
                  style={{ transform: `translateY(${virtualRow.start}px)` }}
                >
                  <PatientRow patient={patient} rowIndex={virtualRow.index + 2} />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// Rows re-render on every scroll tick of the virtualizer; memo keeps unchanged rows static.
const PatientRow = memo(function PatientRow({
  patient,
  rowIndex,
}: {
  patient: Patient
  rowIndex: number
}) {
  const hiddenConditionCount = patient.conditions.length - CONDITIONS_SHOWN
  return (
    <div
      role="row"
      aria-rowindex={rowIndex}
      className={cn(
        ROW_GRID,
        'hover:bg-background items-center border-b px-4 py-3 text-sm transition-colors',
      )}
    >
      <div role="cell" className="flex min-w-0 items-center gap-3">
        <AvatarInitials firstName={patient.first_name} lastName={patient.last_name} />
        <div className="min-w-0">
          <Link
            to="/patients/$patientId"
            params={{ patientId: patient.id }}
            className="block truncate font-medium hover:underline focus-visible:underline focus-visible:outline-offset-[-2px]"
          >
            {patient.first_name} {patient.last_name}
          </Link>
          <p className="text-muted-foreground truncate text-xs">
            <span className="sm:hidden">
              {formatAge(patient.age)} · {formatRelativeDate(patient.last_visit_at)}
            </span>
            <span className="hidden sm:inline">DOB {formatDate(patient.date_of_birth)}</span>
          </p>
        </div>
      </div>
      <div role="cell" className="hidden sm:block">
        {formatAge(patient.age)}
      </div>
      <div role="cell" className="hidden sm:block">
        {patient.last_visit_at ? (
          <time dateTime={patient.last_visit_at}>
            {formatDate(patient.last_visit_at)}
            <span className="text-muted-foreground block text-xs">
              {formatRelativeDate(patient.last_visit_at)}
            </span>
          </time>
        ) : (
          <span className="text-muted-foreground">{formatRelativeDate(null)}</span>
        )}
      </div>
      <div role="cell" className="text-muted-foreground hidden min-w-0 truncate sm:block">
        {patient.conditions.length === 0
          ? '—'
          : patient.conditions.slice(0, CONDITIONS_SHOWN).join(', ') +
            (hiddenConditionCount > 0 ? ` +${hiddenConditionCount}` : '')}
      </div>
      <div role="cell" className="justify-self-end sm:justify-self-start">
        <PatientStatusBadge status={patient.status} />
      </div>
    </div>
  )
})

function PatientTableSkeleton() {
  return (
    <LoadingStatus label="Loading patients" className="overflow-hidden rounded-lg border">
      {Array.from({ length: SKELETON_ROW_COUNT }, (_unused, rowIndex) => (
        <div
          key={rowIndex}
          className={cn(ROW_GRID, 'items-center border-b px-4 py-3 last:border-0')}
        >
          <div className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="h-4 w-36" />
          </div>
          <Skeleton className="hidden h-4 w-14 sm:block" />
          <Skeleton className="hidden h-4 w-24 sm:block" />
          <Skeleton className="hidden h-4 w-32 sm:block" />
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
      ))}
    </LoadingStatus>
  )
}
