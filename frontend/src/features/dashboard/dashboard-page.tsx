import { PageHeader } from '@/components/layout/page-header'

export function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" description="Today at Northlight Family Practice." />
      <p className="text-muted-foreground text-sm">Patient overview arrives in the next phase.</p>
    </>
  )
}
