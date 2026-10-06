# Healthcare Dashboard — agent instructions

Read `docs/ASSIGNMENT.md` before changing product behavior. That file is the verbatim task. A part is done only when `scripts/verify.sh` passes for the checks that exist and `docs/PROGRESS.md` records evidence.

## Stack

- Backend: Python 3.12, uv, FastAPI, Pydantic v2, SQLAlchemy 2 async, Alembic, PostgreSQL 16. Layout: `backend/app/{main.py,config.py,database.py,models,schemas,routers,services,seed}`.
- Frontend: Vite, React 19, TypeScript strict, Tailwind v4, shadcn/ui, TanStack Router, TanStack Query, Zustand (theme and sidebar only), react-hook-form + zod, TanStack Virtual, `motion/react`.
- API contract: `backend/openapi.json` is committed. `frontend/src/lib/api/schema.d.ts` is generated from it. Refresh both in the same change as any router or schema edit.

## Ownership

| Area | Agent |
| --- | --- |
| `backend/app/models`, `backend/alembic`, `backend/app/seed`, `docs/DATA_MODEL.md` | `database-engineer` |
| `backend/app` except models and seed, backend tests | `backend-engineer` |
| `frontend/` | `frontend-engineer` |
| `.github/`, `scripts/verify.sh`, `scripts/export_openapi.py`, `backend/openapi.json`, `docs/CI.md` | `ci-engineer` |

Do not edit another agent's files. Ask that agent for the change.

## How to build a part

Follow the `orchestrate-feature` skill: read the assignment section, delegate schema then API then UI, run the review loop (`qa-engineer`, `design-reviewer`, `product-reviewer`, `readability-reviewer`), then `spec-compliance-reviewer`. Project skills override vendored design skills when they conflict, especially accessibility and reduced motion.

## Code

Names describe the value. No single-letter identifiers, including loop variables and caught errors. Functions stay small and return early. Comments explain why, not what. Routers stay thin; validation lives in Pydantic and zod; persistence lives in services.

## API errors

```json
{"detail": "Human readable summary", "errors": [{"field": "email", "message": "Enter a valid email address."}]}
```

Use 422 for validation, 404 when a patient or note is missing, 400 for a request that is well-formed but not allowed.

## Motion

Animate `transform` and `opacity` only, from `motion/react`. Scroll-linked and CSS 3D effects live in `frontend/src/features/landing/` and load only on `/welcome`. Every animated component honors `useReducedMotion`. Dashboard routes use motion under 200ms and never bind to scroll.
