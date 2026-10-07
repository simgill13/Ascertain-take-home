import { Link } from '@tanstack/react-router'
import { useVirtualizer } from '@tanstack/react-virtual'
import { memo, useRef } from 'react'

import { LoadingStatus } from '@/components/state/loading-status'
import { Skeleton } from '@/components/ui/skeleton'
import { PatientStatusBadge } from '@/features/patients/patient-status-badge'
import type { Patient } from '@/features/patients/types'
import { formatAge, formatDate, formatRelativeDate } from '@/lib/format'
import { cn } from '@/lib/utils'

const ESTIMATED_ROW_HEIGHT = 64
const OVERSCAN_ROWS = 8
const SKELETON_ROW_COUNT = 8

const ROW_GRID =
  'grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 sm:grid-cols-[minmax(0,2fr)_1fr_1.2fr_1fr]'

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
              'bg-muted/60 text-muted-foreground hidden border-b px-4 py-2 text-xs font-medium tracking-wide uppercase sm:grid',
            )}
          >
            <span role="columnheader">Name</span>
            <span role="columnheader">Age</span>
            <span role="columnheader">Last visit</span>
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
                  role="row"
                  aria-rowindex={virtualRow.index + 2}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  className="absolute top-0 left-0 w-full"
                  style={{ transform: `translateY(${virtualRow.start}px)` }}
                >
                  <PatientRow patient={patient} />
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
const PatientRow = memo(function PatientRow({ patient }: { patient: Patient }) {
  return (
    <div
      className={cn(
        ROW_GRID,
        'hover:bg-accent/40 items-center border-b px-4 py-3 transition-colors',
      )}
    >
      <div role="cell" className="min-w-0">
        <Link
          to="/patients/$patientId"
          params={{ patientId: patient.id }}
          className="block truncate font-medium hover:underline focus-visible:underline"
        >
          {patient.last_name}, {patient.first_name}
        </Link>
        <p className="text-muted-foreground truncate text-xs sm:hidden">
          {formatAge(patient.age)} · {formatRelativeDate(patient.last_visit_at)}
        </p>
      </div>
      <div role="cell" className="hidden text-sm sm:block">
        {formatAge(patient.age)}
      </div>
      <div role="cell" className="hidden text-sm sm:block">
        {patient.last_visit_at ? (
          <time dateTime={patient.last_visit_at}>
            {formatRelativeDate(patient.last_visit_at)}
            <span className="text-muted-foreground"> · {formatDate(patient.last_visit_at)}</span>
          </time>
        ) : (
          <span className="text-muted-foreground">{formatRelativeDate(null)}</span>
        )}
      </div>
      <div role="cell" className="justify-self-end sm:justify-self-start">
        <PatientStatusBadge status={patient.status} />
      </div>
    </div>
  )
})

function PatientTableSkeleton() {
  return (
    <LoadingStatus
      label="Loading patients"
      className="space-y-px overflow-hidden rounded-lg border"
    >
      {Array.from({ length: SKELETON_ROW_COUNT }, (_unused, rowIndex) => (
        <div
          key={rowIndex}
          className={cn(ROW_GRID, 'items-center border-b px-4 py-3 last:border-0')}
        >
          <Skeleton className="h-4 w-40" />
          <Skeleton className="hidden h-4 w-16 sm:block" />
          <Skeleton className="hidden h-4 w-24 sm:block" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      ))}
    </LoadingStatus>
  )
}
