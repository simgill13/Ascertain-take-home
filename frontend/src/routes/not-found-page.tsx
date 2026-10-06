import { Link } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <section className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">404</p>
      <h1 className="font-display mt-2 text-3xl font-semibold">This page does not exist</h1>
      <p className="text-muted-foreground mt-3">
        The link may be out of date, or the patient record may have been removed.
      </p>
      <div className="mt-6 flex gap-2">
        <Button asChild>
          <Link to="/">Go to dashboard</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/patients">Browse patients</Link>
        </Button>
      </div>
    </section>
  )
}
