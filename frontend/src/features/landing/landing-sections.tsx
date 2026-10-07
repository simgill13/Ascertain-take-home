import { ArrowUpRightIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  AGENT_ROSTER,
  APPROACH_STEPS,
  BUILDER,
  SCALE_MEASURES,
  TECH_STACK,
} from '@/features/landing/landing-copy'
import { TINT_CLASS } from '@/features/patients/status-styles'
import { cn } from '@/lib/utils'

export function SectionHeading({ title, lede }: { title: string; lede?: string }) {
  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      {lede ? <p className="text-muted-foreground mt-3 leading-relaxed">{lede}</p> : null}
    </div>
  )
}

export function ApproachSection() {
  return (
    <section className="border-t">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 lg:py-28">
        <SectionHeading
          title="How it was built"
          lede="Agents are only as good as the loop around them. This one is written down, so any developer with Cursor, Claude Code, or Codex can pick up the repository and get the same behaviour."
        />
        <ol className="mt-12 grid gap-10 md:grid-cols-2">
          {APPROACH_STEPS.map((step, stepIndex) => (
            <li key={step.title} className="flex gap-4">
              <span
                aria-hidden="true"
                className="bg-lavender text-lavender-foreground grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold tabular-nums"
              >
                {stepIndex + 1}
              </span>
              <div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function AgentRosterSection() {
  const { builders, reviewers, counts } = AGENT_ROSTER
  return (
    <section className="border-t">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 lg:py-28">
        <SectionHeading
          title="The agent team"
          lede={`${counts.agents} agents, ${counts.projectSkills} project skills, ${counts.vendoredSkills} vendored design skills, and ${counts.rules} rules. Builders write; reviewers only read and report.`}
        />
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <RosterColumn title="Builders" tint="green" agents={builders} />
          <RosterColumn title="Reviewers" tint="violet" agents={reviewers} />
        </div>
      </div>
    </section>
  )
}

function RosterColumn({
  title,
  tint,
  agents,
}: {
  title: string
  tint: 'green' | 'violet'
  agents: ReadonlyArray<{ name: string; job: string }>
}) {
  return (
    <div className="bg-card rounded-xl border">
      <div className="flex items-center gap-2 border-b px-5 py-3">
        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', TINT_CLASS[tint])}>
          {title}
        </span>
        <span className="text-muted-foreground text-xs">{agents.length} agents</span>
      </div>
      <ul className="divide-y">
        {agents.map((agent) => (
          <li key={agent.name} className="grid gap-1 px-5 py-3 sm:grid-cols-[13rem_1fr] sm:gap-4">
            <code className="text-sm font-medium">{agent.name}</code>
            <span className="text-muted-foreground text-sm">{agent.job}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function TechStackSection() {
  return (
    <section className="border-t">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 lg:py-28">
        <SectionHeading
          title="Backend versus frontend"
          lede="Each choice is in docs/ARCHITECTURE.md with the option that was not taken. The short version:"
        />
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {[TECH_STACK.backend, TECH_STACK.frontend].map((column) => (
            <div key={column.title}>
              <h3 className="text-muted-foreground mb-4 text-sm font-medium">{column.title}</h3>
              <ul className="divide-y rounded-xl border">
                {column.items.map((item) => (
                  <li key={item.name} className="px-5 py-3">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-muted-foreground text-sm">{item.why}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ScaleSection() {
  return (
    <section className="border-t">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 lg:py-28">
        <SectionHeading
          title="Built to scale to a million users"
          lede="A scalability agent reviewed the running code against a target of 100k registered users and 1M monthly visitors, then the builders implemented its findings."
        />
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <ScaleList title="API and database" items={SCALE_MEASURES.backend} />
          <ScaleList title="Browser and edge" items={SCALE_MEASURES.frontend} />
        </div>
        <p className="text-muted-foreground mt-8 max-w-3xl text-sm leading-relaxed">
          {SCALE_MEASURES.honestLimits}
        </p>
      </div>
    </section>
  )
}

function ScaleList({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <div>
      <h3 className="text-muted-foreground mb-4 text-sm font-medium">{title}</h3>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-relaxed">
            <span
              aria-hidden="true"
              className="bg-tint-green-foreground mt-2 size-1.5 shrink-0 rounded-full"
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function BuilderSection() {
  return (
    <section className="border-t">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div>
            <p className="text-muted-foreground text-sm">Built by</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight">{BUILDER.name}</h2>
            <p className="text-muted-foreground mt-1">
              {BUILDER.title}, {BUILDER.location}
            </p>
            <p className="mt-5 text-sm leading-relaxed">{BUILDER.summary}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {BUILDER.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/70 inline-flex min-h-9 items-center gap-1 rounded-md px-3 text-sm font-medium transition-colors"
                  >
                    {link.label}
                    <ArrowUpRightIcon className="size-3.5" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <ul className="divide-y rounded-xl border">
            {BUILDER.highlights.map((highlight) => (
              <li key={highlight.heading} className="px-5 py-4">
                <h3 className="text-sm font-semibold">{highlight.heading}</h3>
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                  {highlight.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-10 flex flex-wrap gap-2">
          {[
            'TypeScript',
            'Python',
            'React',
            'React Native',
            'FastAPI',
            'PostgreSQL',
            'AWS',
            'LLMs and RAG',
          ].map((skill) => (
            <Badge key={skill} variant="secondary">
              {skill}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  )
}
