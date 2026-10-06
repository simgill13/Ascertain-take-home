import { AlertCircleIcon, RefreshCwIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { describeError } from '@/lib/api/describe-error'

type ErrorStateProps = {
  error: unknown
  onRetry?: () => void
  title?: string
}

export function ErrorState({ error, onRetry, title }: ErrorStateProps) {
  const described = describeError(error)
  return (
    <div
      role="alert"
      className="border-destructive/30 bg-destructive/5 flex flex-col items-start gap-3 rounded-lg border p-4 sm:flex-row sm:items-center"
    >
      <AlertCircleIcon className="text-destructive size-5 shrink-0" aria-hidden="true" />
      <div className="flex-1">
        <p className="font-medium">{title ?? described.title}</p>
        <p className="text-muted-foreground text-sm">{described.message}</p>
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCwIcon aria-hidden="true" />
          Try again
        </Button>
      ) : null}
    </div>
  )
}
