import { SearchIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { LANDING_COPY } from '@/features/landing/landing-copy'

const ILLUSTRATIONS = [FindIllustration, ReadIllustration, WriteIllustration]

export function ValueProps() {
  return (
    <ul className="grid gap-10 md:grid-cols-3 md:gap-8">
      {LANDING_COPY.valueProps.map((valueProp, valuePropIndex) => {
        const Illustration = ILLUSTRATIONS[valuePropIndex] ?? FindIllustration
        return (
          <li key={valueProp.title} className="flex flex-col gap-4">
            <div
              className="bg-card flex h-36 flex-col justify-center rounded-xl border p-4"
              aria-hidden="true"
            >
              <Illustration />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold">{valueProp.title}</h2>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                {valueProp.body}
              </p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function FindIllustration() {
  return (
    <div className="space-y-2">
      <div className="bg-background text-muted-foreground flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
        <SearchIcon className="size-4" />
        <span>
          alv
          <span className="bg-foreground ml-px inline-block h-4 w-px align-middle" />
        </span>
      </div>
      <div className="flex items-center justify-between px-1 text-sm">
        <span className="font-medium">Alvarez, Maria</span>
        <span className="text-muted-foreground text-xs">13 days ago</span>
      </div>
    </div>
  )
}

function ReadIllustration() {
  return (
    <div className="space-y-2 text-sm">
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="secondary">Type 2 diabetes</Badge>
        <Badge variant="secondary">Hypertension</Badge>
        <Badge variant="destructive">Penicillin</Badge>
      </div>
      <p className="text-muted-foreground text-xs leading-relaxed">
        Maria Alvarez, 58, is an active patient of the practice. The chart holds 3 clinical notes…
      </p>
    </div>
  )
}

function WriteIllustration() {
  return (
    <div className="space-y-2 text-sm">
      <p className="text-muted-foreground text-xs">Oct 6, 2026, 4:17 PM</p>
      <p className="leading-relaxed">Phone check-in. Weight down 3 lb, breathing easier.</p>
      <div className="flex justify-end">
        <span className="bg-primary text-primary-foreground rounded-md px-2.5 py-1 text-xs font-medium">
          Add note
        </span>
      </div>
    </div>
  )
}
