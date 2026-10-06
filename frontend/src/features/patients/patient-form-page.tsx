import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeftIcon } from 'lucide-react'
import { toast } from 'sonner'

import { PageHeader } from '@/components/layout/page-header'
import { ErrorState } from '@/components/state/error-state'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { patientQueryOptions } from '@/features/patients/api'
import { PatientForm } from '@/features/patients/patient-form'
import {
  EMPTY_PATIENT_FORM,
  formValuesToPayload,
  patientToFormValues,
  type PatientFormValues,
} from '@/features/patients/patient-form-schema'
import type { Patient } from '@/features/patients/types'
import { usePatientMutations } from '@/features/patients/use-patient-mutations'

export function NewPatientPage() {
  const navigate = useNavigate()
  const { create } = usePatientMutations()

  const handleSubmit = async (values: PatientFormValues) => {
    const created = await create.mutateAsync(formValuesToPayload(values))
    toast.success(`${created.first_name} ${created.last_name} added`)
    await navigate({ to: '/patients/$patientId', params: { patientId: created.id } })
  }

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/patients">
          <ArrowLeftIcon aria-hidden="true" />
          All patients
        </Link>
      </Button>
      <PageHeader title="New patient" description="Create a chart for a new patient." />
      <div className="max-w-3xl">
        <PatientForm
          defaultValues={EMPTY_PATIENT_FORM}
          submitLabel="Create patient"
          onSubmit={handleSubmit}
          onCancel={() => void navigate({ to: '/patients' })}
          isSubmitting={create.isPending}
          submitError={create.error}
        />
      </div>
    </>
  )
}

export function EditPatientPage() {
  const { patientId } = useParams({ from: '/shell/patients/$patientId/edit' })
  const patientQuery = useQuery(patientQueryOptions(patientId))

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/patients/$patientId" params={{ patientId }}>
          <ArrowLeftIcon aria-hidden="true" />
          Back to chart
        </Link>
      </Button>
      {patientQuery.isPending ? (
        <div className="max-w-3xl space-y-4" aria-busy="true" aria-label="Loading patient">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-96" />
        </div>
      ) : patientQuery.isError ? (
        <ErrorState error={patientQuery.error} onRetry={() => void patientQuery.refetch()} />
      ) : (
        <EditPatientForm patient={patientQuery.data} />
      )}
    </>
  )
}

function EditPatientForm({ patient }: { patient: Patient }) {
  const navigate = useNavigate()
  const { update } = usePatientMutations()

  const handleSubmit = async (values: PatientFormValues) => {
    await update.mutateAsync({
      patientId: patient.id,
      payload: formValuesToPayload(values, patient),
    })
    toast.success('Patient updated')
    await navigate({ to: '/patients/$patientId', params: { patientId: patient.id } })
  }

  return (
    <>
      <PageHeader
        title={`Edit ${patient.first_name} ${patient.last_name}`}
        description="Changes apply to the chart immediately."
      />
      <div className="max-w-3xl">
        <PatientForm
          defaultValues={patientToFormValues(patient)}
          submitLabel="Save changes"
          onSubmit={handleSubmit}
          onCancel={() =>
            void navigate({ to: '/patients/$patientId', params: { patientId: patient.id } })
          }
          isSubmitting={update.isPending}
          submitError={update.error}
        />
      </div>
    </>
  )
}
