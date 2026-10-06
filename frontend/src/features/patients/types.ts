import type { components } from '@/lib/api/schema'

export type Patient = components['schemas']['PatientRead']
export type PatientInput = components['schemas']['PatientCreate']
export type PatientListResponse = components['schemas']['PatientListResponse']
export type PatientStats = components['schemas']['PatientStats']
export type PatientStatus = components['schemas']['PatientStatus']
export type BloodType = components['schemas']['BloodType']
export type PatientSortField = components['schemas']['PatientSortField']

export const PATIENT_STATUSES = [
  'active',
  'pending',
  'inactive',
  'discharged',
] as const satisfies readonly PatientStatus[]

export const BLOOD_TYPES = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
] as const satisfies readonly BloodType[]

export const PATIENT_SORT_FIELDS = [
  'last_name',
  'first_name',
  'age',
  'last_visit',
  'status',
  'created_at',
] as const satisfies readonly PatientSortField[]

export const STATUS_LABELS: Record<PatientStatus, string> = {
  active: 'Active',
  pending: 'Pending intake',
  inactive: 'Inactive',
  discharged: 'Discharged',
}

export const SORT_LABELS: Record<PatientSortField, string> = {
  last_name: 'Last name',
  first_name: 'First name',
  age: 'Age',
  last_visit: 'Last visit',
  status: 'Status',
  created_at: 'Date added',
}
