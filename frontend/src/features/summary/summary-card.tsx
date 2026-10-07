import { useQuery } from '@tanstack/react-query'
import { RefreshCwIcon, SparklesIcon } from 'lucide-react'

const GENERATOR_LABELS: Record<string, string> = {
  template: 'from the chart',
  anthropic: 'by Claude',
  openai: 'by OpenAI',
}

function describeGenerator(generatedBy: string): string {
  const providerName = generatedBy.replace(' (fallback)', '')
  const label = GENERATOR_LABELS[providerName] ?? `by ${providerName}`
  return generatedBy.endsWith('(fallback)') ? `${label} (fallback)` : label
}

import { ErrorState } from '@/components/state/error-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LoadingStatus } from '@/components/state/loading-status'
import { Skeleton } from '@/components/ui/skeleton'
import { summaryQueryOptions, type PatientSummary } from '@/features/summary/api'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'

type SummaryCardProps = {
  patientId: string
}

export function SummaryCard({ patientId }: SummaryCardProps) {
  const summaryQuery = useQuery(summaryQueryOptions(patientId))
  const summary = summaryQuery.data

  return (
    <Card id="summary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SparklesIcon className="text-primary size-4" aria-hidden="true" />
          Patient summary
        </CardTitle>
        <CardDescription>
          {summary
            ? `Generated ${formatDateTime(summary.generated_at)} ${describeGenerator(summary.generated_by)}.`
            : 'Synthesized from the profile and clinical notes.'}
        </CardDescription>
        <CardAction>
          <Button
            variant="ghost"
            size="sm"
            disabled={summaryQuery.isFetching}
            onClick={() => void summaryQuery.refetch()}
          >
            <RefreshCwIcon
              className={cn(summaryQuery.isFetching && 'animate-spin')}
              aria-hidden="true"
            />
            Refresh
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {summaryQuery.isPending ? (
          <LoadingStatus label="Loading summary" className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-4/5" />
          </LoadingStatus>
        ) : summaryQuery.isError ? (
          <ErrorState error={summaryQuery.error} onRetry={() => void summaryQuery.refetch()} />
        ) : (
          <SummaryBody summary={summaryQuery.data} />
        )}
      </CardContent>
    </Card>
  )
}

function SummaryBody({ summary }: { summary: PatientSummary }) {
  return (
    <div className="space-y-4">
      <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <SummaryFact label="Age" value={`${summary.identifiers.age}`} />
        <SummaryFact label="Blood type" value={summary.identifiers.blood_type ?? 'Unknown'} />
        <SummaryFact label="Notes" value={`${summary.clinical.note_count}`} />
      </dl>
      <div className="space-y-3 text-sm leading-relaxed" aria-live="polite">
        {summary.narrative.split('\n\n').map((paragraph, paragraphIndex) => (
          <p key={paragraphIndex}>{paragraph}</p>
        ))}
      </div>
      <div className="flex flex-wrap gap-6 text-sm">
        <SummaryTagGroup label="Conditions" tags={summary.clinical.conditions} />
        <SummaryTagGroup label="Allergies" tags={summary.clinical.allergies} allergy />
      </div>
    </div>
  )
}

function SummaryFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-1.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}

function SummaryTagGroup({
  label,
  tags,
  allergy = false,
}: {
  label: string
  tags: string[]
  allergy?: boolean
}) {
  return (
    <div>
      <p className="text-muted-foreground mb-1.5 text-xs font-medium tracking-wide uppercase">
        {label}
      </p>
      {tags.length === 0 ? (
        <p className="text-muted-foreground text-sm">None recorded</p>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <li key={tag}>
              <Badge variant={allergy ? 'destructive' : 'secondary'}>{tag}</Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
