import { useQuery } from '@tanstack/react-query'
import { Link, useParams, useSearch } from '@tanstack/react-router'
import { MoreHorizontalIcon, PencilIcon, SparklesIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'

import { FactGrid } from '@/components/fact-grid'
import { ErrorState } from '@/components/state/error-state'
import { LoadingStatus } from '@/components/state/loading-status'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { NotesSection } from '@/features/notes/notes-section'
import { patientQueryOptions } from '@/features/patients/api'
import { DeletePatientDialog } from '@/features/patients/delete-patient-button'
import { PatientStatusBadge } from '@/features/patients/patient-status-badge'
import { PATIENT_DETAIL_TABS, type PatientDetailTab } from '@/features/patients/search-params'
import type { Patient } from '@/features/patients/types'
import { summaryQueryOptions } from '@/features/summary/api'
import { SummaryCard } from '@/features/summary/summary-card'
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs'
import { ApiError } from '@/lib/api/client'
import { formatAge, formatDate, formatRelativeDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { NotFoundPage } from '@/routes/not-found-page'

const SKELETON_CARD_COUNT = 3

const TAB_LABELS: Record<PatientDetailTab, string> = {
  overview: 'Overview',
  notes: 'Notes',
  summary: 'Summary',
}

export function PatientDetailPage() {
  const { patientId } = useParams({ from: '/shell/patients/$patientId' })
  const { tab } = useSearch({ from: '/shell/patients/$patientId' })
  const patientQuery = useQuery(patientQueryOptions(patientId))
  const patientName = patientQuery.data
    ? `${patientQuery.data.first_name} ${patientQuery.data.last_name}`
    : 'Patient'
  useBreadcrumbs([{ label: 'All patients', to: '/patients' }, { label: patientName }])

  if (patientQuery.isPending) return <PatientDetailSkeleton />
  if (patientQuery.isError) {
    return (
      <PatientLoadError error={patientQuery.error} onRetry={() => void patientQuery.refetch()} />
    )
  }
  return <PatientDetail patient={patientQuery.data} activeTab={tab} />
}

function PatientDetail({ patient, activeTab }: { patient: Patient; activeTab: PatientDetailTab }) {
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">
                {patient.first_name} {patient.last_name}
              </h1>
              <PatientStatusBadge status={patient.status} />
            </div>
            <p className="text-muted-foreground mt-0.5 text-xs">Patient name</p>
          </div>
          <FactGrid
            facts={[
              { label: 'DOB', value: formatDate(patient.date_of_birth) },
              { label: 'Age', value: formatAge(patient.age) },
              { label: 'Blood type', value: patient.blood_type ?? 'Unknown' },
              { label: 'Phone', value: patient.phone },
              { label: 'Email', value: patient.email ?? 'Not provided' },
              { label: 'Last visit', value: formatRelativeDate(patient.last_visit_at) },
            ]}
          />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <SummaryPill patient={patient} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="More actions">
                <MoreHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/patients/$patientId/edit" params={{ patientId: patient.id }}>
                  <PencilIcon aria-hidden="true" />
                  Edit patient
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
                <Trash2Icon aria-hidden="true" />
                Delete patient
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <DetailTabs patientId={patient.id} activeTab={activeTab} />

      {activeTab === 'overview' ? <OverviewTab patient={patient} /> : null}
      {activeTab === 'notes' ? <NotesSection patientId={patient.id} /> : null}
      {activeTab === 'summary' ? <SummaryCard patientId={patient.id} /> : null}

      <DeletePatientDialog patient={patient} open={deleteOpen} onOpenChange={setDeleteOpen} />
    </div>
  )
}

/** Lavender pill that mirrors the summary state and jumps to the summary tab. */
function SummaryPill({ patient }: { patient: Patient }) {
  const summaryQuery = useQuery({ ...summaryQueryOptions(patient.id), enabled: false })
  const label = summaryQuery.isFetching ? 'Generating summary' : 'Summary'
  return (
    <Button
      asChild
      variant="ghost"
      className="bg-lavender text-lavender-foreground hover:bg-lavender/80 hover:text-lavender-foreground rounded-full"
    >
      <Link
        to="/patients/$patientId"
        params={{ patientId: patient.id }}
        search={{ tab: 'summary' }}
      >
        <SparklesIcon aria-hidden="true" />
        {label}
      </Link>
    </Button>
  )
}

function DetailTabs({ patientId, activeTab }: { patientId: string; activeTab: PatientDetailTab }) {
  return (
    <nav aria-label="Patient sections" className="border-b">
      <ul className="-mb-px flex gap-1">
        {PATIENT_DETAIL_TABS.map((tab) => (
          <li key={tab}>
            <Link
              to="/patients/$patientId"
              params={{ patientId }}
              search={{ tab }}
              replace
              activeOptions={{ exact: true, includeSearch: true }}
              className={cn(
                'hover:text-foreground flex min-h-10 items-center border-b-2 px-3 text-sm transition-colors',
                tab === activeTab
                  ? 'border-foreground text-foreground font-medium'
                  : 'text-muted-foreground border-transparent',
              )}
            >
              {TAB_LABELS[tab]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function OverviewTab({ patient }: { patient: Patient }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card role="region" aria-label="Contact">
        <CardHeader>
          <CardTitle>Contact</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3 text-sm">
            <DetailItem label="Phone">
              <a href={`tel:${patient.phone}`} className="hover:underline">
                {patient.phone}
              </a>
            </DetailItem>
            <DetailItem label="Email">
              {patient.email ? (
                <a href={`mailto:${patient.email}`} className="break-all hover:underline">
                  {patient.email}
                </a>
              ) : (
                <span className="text-muted-foreground">Not provided</span>
              )}
            </DetailItem>
            <DetailItem label="Address">
              <address className="not-italic">
                {patient.address_line1}
                {patient.address_line2 ? <br /> : null}
                {patient.address_line2}
                <br />
                {patient.city}, {patient.state} {patient.postal_code}
              </address>
            </DetailItem>
          </dl>
        </CardContent>
      </Card>

      <Card role="region" aria-label="Clinical">
        <CardHeader>
          <CardTitle>Clinical</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3 text-sm">
            <DetailItem label="Conditions">
              <TagList tags={patient.conditions} emptyLabel="No conditions recorded" />
            </DetailItem>
            <DetailItem label="Allergies">
              <TagList tags={patient.allergies} emptyLabel="No known allergies" variant="allergy" />
            </DetailItem>
            <DetailItem label="Blood type">
              {patient.blood_type ?? <span className="text-muted-foreground">Unknown</span>}
            </DetailItem>
          </dl>
        </CardContent>
      </Card>

      <Card role="region" aria-label="Visits">
        <CardHeader>
          <CardTitle>Visits</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3 text-sm">
            <DetailItem label="Last visit">
              {formatRelativeDate(patient.last_visit_at)}
              {patient.last_visit_at ? (
                <span className="text-muted-foreground">
                  {' '}
                  · {formatDate(patient.last_visit_at)}
                </span>
              ) : null}
            </DetailItem>
            <DetailItem label="Patient since">{formatDate(patient.created_at)}</DetailItem>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}

/** A missing chart gets the 404 page; retry only helps when the server could not be reached. */
export function PatientLoadError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  if (error instanceof ApiError && error.isNotFound) {
    return <NotFoundPage />
  }
  return <ErrorState error={error} onRetry={onRetry} />
}

function DetailItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  )
}

function TagList({
  tags,
  emptyLabel,
  variant = 'default',
}: {
  tags: string[]
  emptyLabel: string
  variant?: 'default' | 'allergy'
}) {
  if (tags.length === 0) {
    return <span className="text-muted-foreground">{emptyLabel}</span>
  }
  return (
    <ul className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <li key={tag}>
          <Badge variant={variant === 'allergy' ? 'destructive' : 'secondary'}>{tag}</Badge>
        </li>
      ))}
    </ul>
  )
}

function PatientDetailSkeleton() {
  return (
    <LoadingStatus label="Loading patient" className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-10 w-72" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {Array.from({ length: SKELETON_CARD_COUNT }, (_unused, cardIndex) => (
          <Skeleton key={cardIndex} className="h-44" />
        ))}
      </div>
    </LoadingStatus>
  )
}
