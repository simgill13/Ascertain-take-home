import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeftIcon, PencilIcon } from 'lucide-react'

import { ErrorState } from '@/components/state/error-state'
import { LoadingStatus } from '@/components/state/loading-status'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { NotesSection } from '@/features/notes/notes-section'
import { patientQueryOptions } from '@/features/patients/api'
import { DeletePatientButton } from '@/features/patients/delete-patient-button'
import { PatientStatusBadge } from '@/features/patients/patient-status-badge'
import type { Patient } from '@/features/patients/types'
import { SummaryCard } from '@/features/summary/summary-card'
import { ApiError } from '@/lib/api/client'
import { formatAge, formatDate, formatRelativeDate } from '@/lib/format'
import { NotFoundPage } from '@/routes/not-found-page'

const SKELETON_CARD_COUNT = 3

export function PatientDetailPage() {
  const { patientId } = useParams({ from: '/shell/patients/$patientId' })
  const patientQuery = useQuery(patientQueryOptions(patientId))

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/patients">
          <ArrowLeftIcon aria-hidden="true" />
          All patients
        </Link>
      </Button>

      {patientQuery.isPending ? (
        <PatientDetailSkeleton />
      ) : patientQuery.isError ? (
        <PatientLoadError error={patientQuery.error} onRetry={() => void patientQuery.refetch()} />
      ) : (
        <PatientDetail patient={patientQuery.data} />
      )}
    </>
  )
}

function PatientDetail({ patient }: { patient: Patient }) {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {patient.first_name} {patient.last_name}
            </h1>
            <PatientStatusBadge status={patient.status} />
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            {formatAge(patient.age)} · Born {formatDate(patient.date_of_birth)}
            {patient.blood_type ? ` · Blood type ${patient.blood_type}` : ''}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button asChild variant="outline">
            <Link to="/patients/$patientId/edit" params={{ patientId: patient.id }}>
              <PencilIcon aria-hidden="true" />
              Edit
            </Link>
          </Button>
          <DeletePatientButton patient={patient} />
        </div>
      </header>

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
                <TagList
                  tags={patient.allergies}
                  emptyLabel="No known allergies"
                  variant="allergy"
                />
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

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <div className="min-w-0 xl:col-span-2">
          <SummaryCard patientId={patient.id} />
        </div>
        <div className="min-w-0 xl:col-span-3">
          <NotesSection patientId={patient.id} />
        </div>
      </div>
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
      <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</dt>
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
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {Array.from({ length: SKELETON_CARD_COUNT }, (_unused, cardIndex) => (
          <Skeleton key={cardIndex} className="h-44" />
        ))}
      </div>
    </LoadingStatus>
  )
}
