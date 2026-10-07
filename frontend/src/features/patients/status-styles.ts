import type { PatientStatus } from '@/features/patients/types'

export type Tint = 'green' | 'amber' | 'red' | 'blue' | 'violet' | 'grey'

export const TINT_CLASS: Record<Tint, string> = {
  green: 'bg-tint-green text-tint-green-foreground',
  amber: 'bg-tint-amber text-tint-amber-foreground',
  red: 'bg-tint-red text-tint-red-foreground',
  blue: 'bg-tint-blue text-tint-blue-foreground',
  violet: 'bg-tint-violet text-tint-violet-foreground',
  grey: 'bg-tint-grey text-tint-grey-foreground',
}

export const STATUS_TINT: Record<PatientStatus, Tint> = {
  active: 'green',
  pending: 'amber',
  inactive: 'grey',
  discharged: 'violet',
}

/** Order used wherever patients are grouped by status: work that needs attention first. */
export const STATUS_GROUP_ORDER: PatientStatus[] = ['pending', 'active', 'inactive', 'discharged']
