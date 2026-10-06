import { PageHeader } from '@/components/layout/page-header'

export function PatientListPage() {
  return (
    <>
      <PageHeader title="Patients" description="Search, sort, and open a chart." />
      <p className="text-muted-foreground text-sm">The patient list arrives in the next phase.</p>
    </>
  )
}
