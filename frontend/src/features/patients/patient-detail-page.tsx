import { useParams } from '@tanstack/react-router'

import { PageHeader } from '@/components/layout/page-header'

export function PatientDetailPage() {
  const { patientId } = useParams({ from: '/shell/patients/$patientId' })
  return (
    <>
      <PageHeader title="Patient" description={`Record ${patientId}`} />
      <p className="text-muted-foreground text-sm">Patient details arrive in the next phase.</p>
    </>
  )
}
