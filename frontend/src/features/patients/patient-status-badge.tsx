import { Badge } from '@/components/ui/badge'
import { STATUS_LABELS, type PatientStatus } from '@/features/patients/types'
import { cn } from '@/lib/utils'

const STATUS_DOT_CLASS: Record<PatientStatus, string> = {
  active: 'bg-status-active',
  pending: 'bg-status-pending',
  inactive: 'bg-status-inactive',
  discharged: 'bg-status-discharged',
}

type PatientStatusBadgeProps = {
  status: PatientStatus
  className?: string
}

/** Status is always shown as a colored dot plus a text label, never color alone. */
export function PatientStatusBadge({ status, className }: PatientStatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn('gap-1.5 font-normal', className)}>
      <span
        aria-hidden="true"
        className={cn('size-2 shrink-0 rounded-full', STATUS_DOT_CLASS[status])}
      />
      {STATUS_LABELS[status]}
    </Badge>
  )
}
