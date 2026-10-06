@../AGENTS.md

# Frontend

- Feature folders under `src/features`. Shared chrome lives in `src/components/layout`. shadcn primitives live in `src/components/ui`.
- Server state is TanStack Query. Do not copy patient lists into Zustand.
- Search, sort, and page live in the URL via TanStack Router search params validated with zod.
- API types come from `src/lib/api/schema.d.ts`. Do not hand-write response types that duplicate the contract.
- Read `frontend-design` and `design-taste-frontend` before a new screen. Read `apple-design` and `animation-vocabulary` before adding motion. `/welcome` follows the `landing-page-motion` skill.
