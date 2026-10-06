import { Label } from '@/components/ui/label'

type FormFieldProps = {
  id: string
  label: string
  error?: string
  hint?: string
  optional?: boolean
  children: (fieldProps: FieldAccessibilityProps) => React.ReactNode
}

export type FieldAccessibilityProps = {
  id: string
  'aria-invalid': boolean
  'aria-describedby': string | undefined
}

/** Wires label, hint, and error text to a control through aria attributes. */
export function FormField({ id, label, error, hint, optional, children }: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {optional ? <span className="text-muted-foreground font-normal"> (optional)</span> : null}
      </Label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })}
      {hint ? (
        <p id={hintId} className="text-muted-foreground text-xs">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
    </div>
  )
}
