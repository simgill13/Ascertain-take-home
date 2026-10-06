import { describe, expect, it } from 'vitest'

import {
  EMPTY_PATIENT_FORM,
  formValuesToPayload,
  patientFormSchema,
  type PatientFormValues,
} from '@/features/patients/patient-form-schema'

const VALID_VALUES: PatientFormValues = {
  ...EMPTY_PATIENT_FORM,
  first_name: 'Ada',
  last_name: 'Lovelace',
  date_of_birth: '1990-05-04',
  phone: '(503) 555-0100',
  address_line1: '1 Test Street',
  city: 'Portland',
  state: 'OR',
  postal_code: '97201',
}

function failingFields(values: PatientFormValues): string[] {
  const parsed = patientFormSchema.safeParse(values)
  if (parsed.success) return []
  return [...new Set(parsed.error.issues.map((issue) => String(issue.path[0])))]
}

describe('patientFormSchema', () => {
  it('accepts a complete patient', () => {
    expect(patientFormSchema.safeParse(VALID_VALUES).success).toBe(true)
  })

  it('requires the personal and address fields', () => {
    expect(failingFields(EMPTY_PATIENT_FORM)).toEqual([
      'first_name',
      'last_name',
      'date_of_birth',
      'phone',
      'address_line1',
      'city',
      'state',
      'postal_code',
    ])
  })

  it('rejects a date of birth in the future', () => {
    expect(failingFields({ ...VALID_VALUES, date_of_birth: '2999-01-01' })).toEqual([
      'date_of_birth',
    ])
  })

  it('allows a blank email but rejects a malformed one', () => {
    expect(failingFields({ ...VALID_VALUES, email: '' })).toEqual([])
    expect(failingFields({ ...VALID_VALUES, email: 'not-an-email' })).toEqual(['email'])
  })

  it('requires at least seven digits in a phone number', () => {
    expect(failingFields({ ...VALID_VALUES, phone: '555-01' })).toEqual(['phone'])
  })
})

describe('formValuesToPayload', () => {
  it('turns blanks into nulls and keeps the existing visit date', () => {
    const payload = formValuesToPayload(
      { ...VALID_VALUES, email: '', address_line2: '', blood_type: 'unknown' },
      { last_visit_at: '2026-09-01T10:00:00Z' },
    )

    expect(payload.email).toBeNull()
    expect(payload.address_line2).toBeNull()
    expect(payload.blood_type).toBeNull()
    expect(payload.last_visit_at).toBe('2026-09-01T10:00:00Z')
  })

  it('sends a chosen blood type through unchanged', () => {
    expect(formValuesToPayload({ ...VALID_VALUES, blood_type: 'O-' }).blood_type).toBe('O-')
  })
})
