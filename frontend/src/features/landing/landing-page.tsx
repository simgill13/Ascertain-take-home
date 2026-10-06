import { Link } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'

export function LandingPage() {
  return (
    <main className="grid min-h-dvh place-items-center p-6 text-center">
      <div>
        <h1 className="font-display text-4xl font-semibold tracking-tight">Northlight</h1>
        <p className="text-muted-foreground mt-3">Patient care, clearly organized.</p>
        <Button asChild size="lg" className="mt-6">
          <Link to="/">Open dashboard</Link>
        </Button>
      </div>
    </main>
  )
}
