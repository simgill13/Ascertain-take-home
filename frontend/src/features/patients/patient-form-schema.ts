import { z } from 'zod'

import {
  BLOOD_TYPES,
  PATIENT_STATUSES,
  type Patient,
  type PatientInput,
} from '@/features/patients/types'

const MAX_AGE_YEARS = 130
const MIN_PHONE_DIGITS = 7
const MAX_TAGS = 50

const requiredText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(max, `${label} must be ${max} characters or fewer.`)

const optionalText = (max: number) => z.string().trim().max(max)

export const UNKNOWN_BLOOD_TYPE = 'unknown'

function ageInYears(dateOfBirth: Date, today: Date): number {
  const hadBirthday =
    today.getMonth() > dateOfBirth.getMonth() ||
    (today.getMonth() === dateOfBirth.getMonth() && today.getDate() >= dateOfBirth.getDate())
  return today.getFullYear() - dateOfBirth.getFullYear() - (hadBirthday ? 0 : 1)
}

export const patientFormSchema = z.object({
  first_name: requiredText('First name', 100),
  last_name: requiredText('Last name', 100),
  date_of_birth: z
    .string()
    .min(1, 'Date of birth is required.')
    .refine(
      (value) => !Number.isNaN(new Date(`${value}T00:00:00`).getTime()),
      'Enter a valid date.',
    )
    .refine(
      (value) => new Date(`${value}T00:00:00`) <= new Date(),
      'Date of birth cannot be in the future.',
    )
    .refine(
      (value) => ageInYears(new Date(`${value}T00:00:00`), new Date()) <= MAX_AGE_YEARS,
      `Date of birth implies an age over ${MAX_AGE_YEARS}.`,
    ),
  email: z.union([z.literal(''), z.email('Enter a valid email address.')]),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone number is required.')
    .max(30, 'Phone number must be 30 characters or fewer.')
    .refine(
      (value) => (value.match(/\d/g) ?? []).length >= MIN_PHONE_DIGITS,
      `Phone number needs at least ${MIN_PHONE_DIGITS} digits.`,
    ),
  address_line1: requiredText('Street address', 200),
  address_line2: optionalText(200),
  city: requiredText('City', 100),
  state: requiredText('State', 50).min(2, 'State must be at least 2 characters.'),
  postal_code: requiredText('Postal code', 20).min(3, 'Postal code must be at least 3 characters.'),
  blood_type: z.enum([UNKNOWN_BLOOD_TYPE, ...BLOOD_TYPES]),
  status: z.enum(PATIENT_STATUSES),
  allergies: z
    .array(z.string().trim().min(1).max(120))
    .max(MAX_TAGS, `Add at most ${MAX_TAGS} allergies.`),
  conditions: z
    .array(z.string().trim().min(1).max(120))
    .max(MAX_TAGS, `Add at most ${MAX_TAGS} conditions.`),
})

export type PatientFormValues = z.infer<typeof patientFormSchema>

export const EMPTY_PATIENT_FORM: PatientFormValues = {
  first_name: '',
  last_name: '',
  date_of_birth: '',
  email: '',
  phone: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  postal_code: '',
  blood_type: UNKNOWN_BLOOD_TYPE,
  status: 'active',
  allergies: [],
  conditions: [],
}

export function patientToFormValues(patient: Patient): PatientFormValues {
  return {
    first_name: patient.first_name,
    last_name: patient.last_name,
    date_of_birth: patient.date_of_birth,
    email: patient.email ?? '',
    phone: patient.phone,
    address_line1: patient.address_line1,
    address_line2: patient.address_line2 ?? '',
    city: patient.city,
    state: patient.state,
    postal_code: patient.postal_code,
    blood_type: patient.blood_type ?? UNKNOWN_BLOOD_TYPE,
    status: patient.status,
    allergies: patient.allergies,
    conditions: patient.conditions,
  }
}

/** PUT replaces the whole record, so the visit date the form does not edit is carried over. */
export function formValuesToPayload(
  values: PatientFormValues,
  existing?: Pick<Patient, 'last_visit_at'>,
): PatientInput {
  return {
    first_name: values.first_name,
    last_name: values.last_name,
    date_of_birth: values.date_of_birth,
    email: values.email === '' ? null : values.email,
    phone: values.phone,
    address_line1: values.address_line1,
    address_line2: values.address_line2 === '' ? null : values.address_line2,
    city: values.city,
    state: values.state,
    postal_code: values.postal_code,
    blood_type: values.blood_type === UNKNOWN_BLOOD_TYPE ? null : values.blood_type,
    status: values.status,
    allergies: values.allergies,
    conditions: values.conditions,
    last_visit_at: existing?.last_visit_at ?? null,
  }
}
