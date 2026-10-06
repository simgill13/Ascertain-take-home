import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2Icon } from 'lucide-react'
import { Controller, useForm, type UseFormSetError } from 'react-hook-form'

import { FormField } from '@/components/form/form-field'
import { TagInput } from '@/components/form/tag-input'
import { ErrorState } from '@/components/state/error-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  patientFormSchema,
  UNKNOWN_BLOOD_TYPE,
  type PatientFormValues,
} from '@/features/patients/patient-form-schema'
import { BLOOD_TYPES, PATIENT_STATUSES, STATUS_LABELS } from '@/features/patients/types'
import { ApiError } from '@/lib/api/client'

type PatientFormProps = {
  defaultValues: PatientFormValues
  submitLabel: string
  onSubmit: (values: PatientFormValues) => Promise<unknown>
  onCancel: () => void
  isSubmitting: boolean
  submitError: unknown
}

export function PatientForm({
  defaultValues,
  submitLabel,
  onSubmit,
  onCancel,
  isSubmitting,
  submitError,
}: PatientFormProps) {
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues,
    mode: 'onTouched',
  })
  const { errors } = form.formState
  const errorMessage = (field: keyof PatientFormValues) => errors[field]?.message

  const submit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch (error) {
      if (error instanceof ApiError && error.isValidationError) {
        applyServerFieldErrors(error, form.setError)
      }
      // Other errors are rendered from `submitError` by the parent with a retry.
    }
  })

  const showNonFieldError =
    submitError && !(submitError instanceof ApiError && submitError.isValidationError)

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
          <CardDescription>Name, date of birth, and how to reach the patient.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField id="first_name" label="First name" error={errorMessage('first_name')}>
            {(fieldProps) => (
              <Input {...fieldProps} autoComplete="given-name" {...form.register('first_name')} />
            )}
          </FormField>
          <FormField id="last_name" label="Last name" error={errorMessage('last_name')}>
            {(fieldProps) => (
              <Input {...fieldProps} autoComplete="family-name" {...form.register('last_name')} />
            )}
          </FormField>
          <FormField id="date_of_birth" label="Date of birth" error={errorMessage('date_of_birth')}>
            {(fieldProps) => (
              <Input
                {...fieldProps}
                type="date"
                autoComplete="bday"
                {...form.register('date_of_birth')}
              />
            )}
          </FormField>
          <FormField id="phone" label="Phone" error={errorMessage('phone')}>
            {(fieldProps) => (
              <Input {...fieldProps} type="tel" autoComplete="tel" {...form.register('phone')} />
            )}
          </FormField>
          <FormField id="email" label="Email" optional error={errorMessage('email')}>
            {(fieldProps) => (
              <Input
                {...fieldProps}
                type="email"
                autoComplete="email"
                {...form.register('email')}
              />
            )}
          </FormField>
          <div className="sm:col-span-2">
            <FormField
              id="address_line1"
              label="Street address"
              error={errorMessage('address_line1')}
            >
              {(fieldProps) => (
                <Input
                  {...fieldProps}
                  autoComplete="address-line1"
                  {...form.register('address_line1')}
                />
              )}
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <FormField
              id="address_line2"
              label="Apartment, suite, or unit"
              optional
              error={errorMessage('address_line2')}
            >
              {(fieldProps) => (
                <Input
                  {...fieldProps}
                  autoComplete="address-line2"
                  {...form.register('address_line2')}
                />
              )}
            </FormField>
          </div>
          <FormField id="city" label="City" error={errorMessage('city')}>
            {(fieldProps) => (
              <Input {...fieldProps} autoComplete="address-level2" {...form.register('city')} />
            )}
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField id="state" label="State" error={errorMessage('state')}>
              {(fieldProps) => (
                <Input {...fieldProps} autoComplete="address-level1" {...form.register('state')} />
              )}
            </FormField>
            <FormField id="postal_code" label="Postal code" error={errorMessage('postal_code')}>
              {(fieldProps) => (
                <Input
                  {...fieldProps}
                  autoComplete="postal-code"
                  {...form.register('postal_code')}
                />
              )}
            </FormField>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Medical information</CardTitle>
          <CardDescription>Blood type, record status, allergies, and conditions.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={form.control}
            name="blood_type"
            render={({ field }) => (
              <FormField id="blood_type" label="Blood type" error={errorMessage('blood_type')}>
                {(fieldProps) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id={fieldProps.id}
                      aria-invalid={fieldProps['aria-invalid']}
                      aria-describedby={fieldProps['aria-describedby']}
                      className="w-full"
                      onBlur={field.onBlur}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UNKNOWN_BLOOD_TYPE}>Unknown</SelectItem>
                      {BLOOD_TYPES.map((bloodType) => (
                        <SelectItem key={bloodType} value={bloodType}>
                          {bloodType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </FormField>
            )}
          />
          <Controller
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormField id="status" label="Status" error={errorMessage('status')}>
                {(fieldProps) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id={fieldProps.id}
                      aria-invalid={fieldProps['aria-invalid']}
                      aria-describedby={fieldProps['aria-describedby']}
                      className="w-full"
                      onBlur={field.onBlur}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PATIENT_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </FormField>
            )}
          />
          <Controller
            control={form.control}
            name="allergies"
            render={({ field }) => (
              <FormField
                id="allergies"
                label="Allergies"
                hint="Press Enter or type a comma after each allergy."
                error={errorMessage('allergies')}
              >
                {(fieldProps) => (
                  <TagInput
                    id={fieldProps.id}
                    value={field.value}
                    onChange={field.onChange}
                    describedBy={fieldProps['aria-describedby']}
                    invalid={fieldProps['aria-invalid']}
                    placeholder="e.g. Penicillin"
                    variant="allergy"
                  />
                )}
              </FormField>
            )}
          />
          <Controller
            control={form.control}
            name="conditions"
            render={({ field }) => (
              <FormField
                id="conditions"
                label="Conditions"
                hint="Press Enter or type a comma after each condition."
                error={errorMessage('conditions')}
              >
                {(fieldProps) => (
                  <TagInput
                    id={fieldProps.id}
                    value={field.value}
                    onChange={field.onChange}
                    describedBy={fieldProps['aria-describedby']}
                    invalid={fieldProps['aria-invalid']}
                    placeholder="e.g. Hypertension"
                  />
                )}
              </FormField>
            )}
          />
        </CardContent>
      </Card>

      {showNonFieldError ? (
        <ErrorState
          error={submitError}
          title="The patient was not saved"
          onRetry={() => void submit()}
        />
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : null}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

const FORM_FIELDS = Object.keys(patientFormSchema.shape) as Array<keyof PatientFormValues>

function isFormField(candidate: string): candidate is keyof PatientFormValues {
  return (FORM_FIELDS as string[]).includes(candidate)
}

function applyServerFieldErrors(error: ApiError, setError: UseFormSetError<PatientFormValues>) {
  for (const fieldError of error.fieldErrors) {
    // Server locations may be nested, e.g. "allergies.2"; map them to the top-level field.
    const topLevelField = fieldError.field.split('.')[0] ?? ''
    if (isFormField(topLevelField)) {
      setError(topLevelField, { type: 'server', message: fieldError.message })
    }
  }
}
