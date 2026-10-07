# Ascertain patient dashboard

A patient management dashboard built for the Ascertain take-home: FastAPI + PostgreSQL on the back, React 19 + TypeScript on the front, with clinical notes, a generated patient summary, a scalability pass to 1M users, and a full test and CI setup. The `/welcome` page is the build log: how the agent team worked, the stack, the scaling techniques, and the author.

The repository is also built to be worked on by coding agents. `AGENTS.md`, the specialist agents in `.claude/agents/`, and the skills in `.agents/skills/` let Cursor, Claude Code, or Codex build, review, and verify changes against the original task in [docs/ASSIGNMENT.md](docs/ASSIGNMENT.md). See [docs/AGENT_TEAM.md](docs/AGENT_TEAM.md).

## Run it

Requires Docker.

```bash
cp .env.example .env          # optional; every value has a working default
docker compose up --build
```

| Service | URL |
| --- | --- |
| App | http://localhost:8080 (a first visit opens the welcome page once, then `/` is the dashboard) |
| Welcome page | http://localhost:8080/welcome |
| API | http://localhost:8000 |
| API docs (Swagger) | http://localhost:8000/docs |

The backend applies Alembic migrations on start and seeds 20 fictional patients with 35 notes when the database is empty. `docker compose down -v` resets the data.

If port 5432 is already taken on your machine, set `POSTGRES_PORT=5434` (or any free port) in `.env`; the containers talk to each other on the internal network regardless.

Hot reload for both services:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
# frontend on http://localhost:5173, backend on http://localhost:8000
```

## Run it without Docker

Needs Python 3.12 with [uv](https://docs.astral.sh/uv/), Node 24, and a PostgreSQL 16 server.

```bash
# database
createdb healthcare && createdb healthcare_test

# backend (terminal 1)
cd backend
echo 'DATABASE_URL=postgresql+asyncpg://postgres@localhost:5432/healthcare' > .env
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload --port 8000

# frontend (terminal 2)
cd frontend
npm ci
npm run dev                   # http://localhost:5173, proxies /api to the backend
```

## Verify

`scripts/verify.sh` runs the same checks as CI. Each section can run on its own.

```bash
scripts/verify.sh             # lint, types, backend unit, frontend unit, bundle budget, API contract
scripts/verify.sh e2e         # Playwright journeys and axe accessibility checks (needs browsers: npx --prefix frontend playwright install chromium)
```

| Suite | Count | Where |
| --- | --- | --- |
| pytest | 33 | `backend/tests/` |
| Vitest + Testing Library | 26 | `frontend/src/**/*.test.tsx` |
| Playwright + axe | 24 | `frontend/e2e/` |

## API

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/health` | liveness, `{"status": "ok"}` |
| GET | `/health/ready` | readiness, runs `SELECT 1`; 503 when the database is unreachable |
| GET | `/patients` | `search`, `status`, `sort` (`last_name`, `first_name`, `age`, `last_visit`, `status`, `created_at`), `order`, `page`, `page_size` (max 100) |
| GET | `/patients/stats` | counts by status, visits and new patients in the last 30 days, active patients without a visit in a year |
| POST | `/patients` | 201; validation errors return 422 |
| GET, PUT, DELETE | `/patients/{id}` | 404 when missing; DELETE cascades to notes |
| GET, POST | `/patients/{id}/notes` | newest first; a newer note advances `last_visit_at` |
| DELETE | `/patients/{id}/notes/{note_id}` | 404 when the note belongs to another patient |
| GET | `/patients/{id}/summary` | identifiers, clinical facts, and a narrative built from the notes |

Errors share one shape:

```json
{ "detail": "The request did not pass validation.", "errors": [{ "field": "email", "message": "Enter a valid email address." }] }
```

The OpenAPI document is committed at [backend/openapi.json](backend/openapi.json) and the frontend's request and response types are generated from it (`frontend/src/lib/api/schema.d.ts`). CI fails when either drifts from the running app.

## Scale

The app was reviewed against 100k registered users and 1M monthly visitors and the findings implemented: worker processes with a seed lock, tuned connection pools with statement timeouts, trigram and composite indexes, ETag/304, a stats cache, rate limiting, request IDs, a 150 KB gzipped bundle budget enforced in CI, request cancellation, and nginx keep-alive. Every GET carries `ETag` and `X-Request-ID`. Details and the honest single-node limits are in [docs/SCALABILITY.md](docs/SCALABILITY.md).

## Summary generation

`GET /patients/{id}/summary` uses a template by default and works offline. Set `SUMMARY_PROVIDER=anthropic` or `openai` with the matching API key in `.env` to have a model write the narrative; the API falls back to the template if the provider call fails.

## Project layout

```
backend/   FastAPI app: app/{routers,schemas,services,models,seed}, alembic/, tests/
frontend/  Vite + React: src/{features,components,routes,lib,stores}, e2e/
docs/      ASSIGNMENT.md (the task), ARCHITECTURE.md, DATA_MODEL.md, SCALABILITY.md, CI.md, PROGRESS.md, AGENT_TEAM.md
scripts/   verify.sh, export_openapi.py, sync_codex_agents.py
.agents/   skills shared by Cursor, Claude Code, and Codex
.claude/   agent definitions (also read by Cursor)
.codex/    generated Codex agent definitions
.cursor/   rules
```

Design decisions and trade-offs are in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Everything here is fictional sample data.
