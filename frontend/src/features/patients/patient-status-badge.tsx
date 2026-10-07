import { STATUS_TINT, TINT_CLASS } from '@/features/patients/status-styles'
import { STATUS_LABELS, type PatientStatus } from '@/features/patients/types'
import { cn } from '@/lib/utils'

type PatientStatusBadgeProps = {
  status: PatientStatus
  className?: string
}

/** Tinted chip; the label text carries the meaning so color is never the only cue. */
export function PatientStatusBadge({ status, className }: PatientStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        TINT_CLASS[STATUS_TINT[status]],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
