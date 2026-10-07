import type { ErrorComponentProps } from '@tanstack/react-router'
import { RefreshCwIcon } from 'lucide-react'

import { ErrorState } from '@/components/state/error-state'
import { Button } from '@/components/ui/button'

/** Replaces the router's default red panel when a route throws while rendering. */
export function RouteErrorPage({ error, reset }: ErrorComponentProps) {
  return (
    <section className="mx-auto max-w-xl space-y-4 py-12">
      <ErrorState error={error} title="This screen could not be shown" onRetry={reset} />
      <Button variant="outline" onClick={() => window.location.reload()}>
        <RefreshCwIcon aria-hidden="true" />
        Reload the page
      </Button>
    </section>
  )
}
