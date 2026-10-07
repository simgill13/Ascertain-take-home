export const LANDING_COPY = {
  brand: 'Ascertain',
  eyebrow: 'Take-home submission by Sim Gill',
  headline: 'A patient dashboard, built by a team of agents.',
  subheadline:
    'FastAPI, PostgreSQL, and React, planned and reviewed by ten specialised coding agents that check their own work against the original brief. This page is the build log.',
  callToAction: 'Open dashboard',
  closingLine: 'The dashboard is one click away. The repository holds the rest.',
} as const

/** The three levels of the agent team, shown as the hero card stack. */
export const AGENT_LEVEL_CARDS = [
  {
    name: 'Master agent',
    meta: 'Level 0, the chat you are in',
    status: 'Orchestrates',
    tags: ['Reads the brief', 'Splits the work', 'Runs the review loop'],
    note: 'Follows the orchestrate-feature skill: delegate, review, verify, record evidence.',
  },
  {
    name: 'Builders',
    meta: 'Level 1, write code inside an ownership boundary',
    status: 'Builds',
    tags: ['database', 'backend', 'frontend', 'ci', 'scalability'],
    note: 'Each owns specific folders. The database agent alone edits models and migrations.',
  },
  {
    name: 'Reviewers',
    meta: 'Level 2, read-only, return findings',
    status: 'Reviews',
    tags: ['QA', 'design', 'product', 'readability', 'spec compliance'],
    note: 'Nothing is done until every reviewer passes and the spec check maps each requirement to evidence.',
  },
] as const

export const APPROACH_STEPS = [
  {
    title: 'Read the brief, verbatim',
    body: 'The assignment lives in docs/ASSIGNMENT.md unchanged. Every phase ends with a line-by-line compliance check against it, with a file, endpoint, or test as evidence.',
  },
  {
    title: 'Delegate to specialists',
    body: 'Schema first, then API, then UI. Builders cannot edit each other’s files; the backend agent asks the database agent for a column instead of adding one.',
  },
  {
    title: 'Review before done',
    body: 'Four read-only reviewers run after each phase. They found a search box that ate typed spaces, two screens that overflowed at 320px, and a drawer that dropped keyboard focus. All fixed before the phase closed.',
  },
  {
    title: 'Portable by design',
    body: 'One set of agents, skills, and rules works in Cursor, Claude Code, and Codex: AGENTS.md, .claude/agents, .agents/skills, and generated .codex/agents TOML.',
  },
] as const

export const AGENT_ROSTER = {
  builders: [
    { name: 'database-engineer', job: 'Schema, Alembic migrations, seed data, indexes' },
    { name: 'backend-engineer', job: 'Routers, Pydantic schemas, services, API tests' },
    { name: 'frontend-engineer', job: 'React screens, forms, this landing page' },
    { name: 'ci-engineer', job: 'GitHub Actions, OpenAPI contract, bundle budget, sharding rules' },
    {
      name: 'scalability-engineer',
      job: 'Capacity review to 1M users; specifies fixes for the builders',
    },
  ],
  reviewers: [
    { name: 'qa-engineer', job: 'Runs every suite, reports timings and flakes' },
    { name: 'design-reviewer', job: 'Responsive layout, WCAG 2.2 AA, reduced motion' },
    { name: 'product-reviewer', job: 'Walks ten coordinator and clinician journeys' },
    { name: 'readability-reviewer', job: 'Descriptive names, small functions, no filler' },
    { name: 'spec-compliance-reviewer', job: 'Maps the brief to evidence, lists gaps' },
  ],
  counts: { agents: 10, projectSkills: 9, vendoredSkills: 6, rules: 6 },
} as const

export const TECH_STACK = {
  backend: {
    title: 'Backend',
    items: [
      { name: 'Python 3.12 with uv', why: 'Fast, reproducible installs; one lockfile' },
      { name: 'FastAPI + Pydantic v2', why: 'Typed validation once, OpenAPI for free' },
      { name: 'SQLAlchemy 2 async + asyncpg', why: 'Non-blocking I/O with a tuned pool' },
      { name: 'PostgreSQL 16 + Alembic', why: 'Migrations are the schema; reversible' },
      { name: 'pytest + httpx', why: '33 tests against the real migrated schema' },
      { name: 'Template or LLM summaries', why: 'Works offline; Claude or OpenAI opt-in' },
    ],
  },
  frontend: {
    title: 'Frontend',
    items: [
      { name: 'React 19 + Vite + TypeScript strict', why: 'Route-level code splitting' },
      { name: 'TanStack Router + Query', why: 'URL-driven state, cached server data' },
      { name: 'Tailwind v4 + shadcn/ui', why: 'Accessible primitives, one token file' },
      { name: 'react-hook-form + zod', why: 'Client rules mirror the server; 422s map to fields' },
      { name: 'Generated API types', why: 'openapi-typescript keeps both sides in sync' },
      { name: 'Vitest + Playwright + axe', why: '26 unit, 23 end-to-end, a11y on every screen' },
    ],
  },
} as const

export const SCALE_MEASURES = {
  backend: [
    'Uvicorn runs WEB_CONCURRENCY worker processes; seeding takes a Postgres advisory lock so workers never double-insert',
    'Connection pool sized per worker with a 5 s statement timeout, so one slow query cannot hold the pool',
    'pg_trgm GIN indexes make name and email search index-backed; composite b-trees back every sort',
    'ETag on every GET: unchanged pages return 304 with no body',
    'Dashboard aggregates served from a 15 s cache, cleared on writes',
    'Per-client rate limit with RateLimit headers; readiness probe separate from liveness',
    'Request IDs on every response and log line; the summary endpoint releases its connection before calling an LLM',
  ],
  frontend: [
    'Initial JavaScript held to 140 KB gzipped by a CI budget; motion lives only in this page’s chunk',
    'Superseded searches are cancelled with AbortSignal; typing is debounced 250 ms',
    'Patient rows are virtualised and memoised; pages capped at 100 rows',
    'Hovering a patient prefetches the chart; stats respect the server cache TTL',
    'nginx keeps connections to the API alive, gzips responses, and serves hashed assets as immutable',
  ],
  honestLimits:
    'A single-node Compose deployment has no read replica, shared cache, CDN, or autoscaling. docs/SCALABILITY.md lists each as the next step.',
} as const

export const BUILDER = {
  name: 'Sim Gill',
  title: 'Staff Software Engineer',
  location: 'San Jose, CA',
  summary:
    'Ten-plus years shipping production web, mobile, backend, fintech, and AI platforms. Currently partnering with a frontier AI lab through G2i on evaluation-driven AI workflows.',
  highlights: [
    {
      heading: 'Principal Engineer, Stockpile (2020–2025)',
      body: 'Led React, React Native, and Node.js across a fintech platform. Roughly 300% MAU growth; Apple Pay integration lifted payment success 73% and cut payment tickets 49%; Plaid, Forter, and Prove integrations improved onboarding completion 62%.',
    },
    {
      heading: 'Senior Engineer, IPsoft Amelia (2018–2020)',
      body: 'Built conversational AI features; a Webpack 2 to 4 migration took builds from 37 minutes to about 6.',
    },
    {
      heading: 'AI and LLM implementation',
      body: 'OpenAI and Claude APIs, RAG, embeddings, agent workflows with tool calling, evaluation frameworks, and human-in-the-loop patterns. This repository is that approach applied to a take-home.',
    },
  ],
  links: [
    { label: 'simgill.io', href: 'https://simgill.io' },
    { label: 'GitHub', href: 'https://github.com/simgill13' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/Sim-G-Top-Candidate' },
  ],
} as const
