import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2Icon } from 'lucide-react'
import { useForm, type UseFormSetError } from 'react-hook-form'
import { z } from 'zod'

import { FormField } from '@/components/form/form-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { NoteInput } from '@/features/notes/api'
import { ApiError } from '@/lib/api/client'
import { toDateTimeLocalValue } from '@/lib/format'

const MAX_NOTE_LENGTH = 5000

const noteFormSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Write something before saving the note.')
    .max(MAX_NOTE_LENGTH, `Keep notes under ${MAX_NOTE_LENGTH} characters.`),
  notedAt: z
    .string()
    .min(1, 'Choose when this was observed.')
    .refine((value) => new Date(value) <= new Date(), 'Note time cannot be in the future.'),
})

type NoteFormValues = z.infer<typeof noteFormSchema>

const emptyNoteValues = (): NoteFormValues => ({
  content: '',
  notedAt: toDateTimeLocalValue(new Date()),
})

type NoteFormProps = {
  onSubmit: (payload: NoteInput) => Promise<unknown>
  isSubmitting: boolean
}

export function NoteForm({ onSubmit, isSubmitting }: NoteFormProps) {
  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: emptyNoteValues(),
  })
  const { errors } = form.formState

  const submit = form.handleSubmit(async (values) => {
    try {
      await onSubmit({ content: values.content, noted_at: new Date(values.notedAt).toISOString() })
      form.reset(emptyNoteValues())
    } catch (error) {
      if (error instanceof ApiError && error.isValidationError) {
        applyServerFieldErrors(error, form.setError)
      }
    }
  })

  return (
    <form onSubmit={submit} noValidate className="space-y-3" aria-label="Add a clinical note">
      <FormField id="note-content" label="Note" error={errors.content?.message}>
        {(fieldProps) => (
          <Textarea
            {...fieldProps}
            rows={4}
            placeholder="What was observed, decided, or planned?"
            {...form.register('content')}
          />
        )}
      </FormField>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <FormField id="note-time" label="Observed at" error={errors.notedAt?.message}>
            {(fieldProps) => (
              <Input {...fieldProps} type="datetime-local" {...form.register('notedAt')} />
            )}
          </FormField>
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : null}
          Add note
        </Button>
      </div>
    </form>
  )
}

const SERVER_FIELD_TO_FORM_FIELD: Record<string, keyof NoteFormValues> = {
  content: 'content',
  noted_at: 'notedAt',
}

function applyServerFieldErrors(error: ApiError, setError: UseFormSetError<NoteFormValues>) {
  for (const fieldError of error.fieldErrors) {
    const formField = SERVER_FIELD_TO_FORM_FIELD[fieldError.field]
    if (formField) {
      setError(formField, { type: 'server', message: fieldError.message })
    }
  }
}
