import { cn } from '@/lib/utils'

type Fact = {
  label: string
  value: React.ReactNode
}

type FactGridProps = {
  facts: Fact[]
  className?: string
}

/** Small grey label above its value, the record-header pattern used across the app. */
export function FactGrid({ facts, className }: FactGridProps) {
  return (
    <dl className={cn('flex flex-wrap gap-x-8 gap-y-3', className)}>
      {facts.map((fact) => (
        <div key={fact.label} className="min-w-0">
          <dt className="text-muted-foreground text-xs">{fact.label}</dt>
          <dd className="mt-0.5 text-sm font-medium">{fact.value}</dd>
        </div>
      ))}
    </dl>
  )
}
