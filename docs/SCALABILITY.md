# Scalability

Target used for the review: 100k registered users, 1M monthly visitors, bursts of a few thousand concurrent sessions, and a `patients` table in the hundreds of thousands of rows.

The `scalability-engineer` agent reviewed the running code against this target (checklist in `.agents/skills/scale-review/SKILL.md`). Its findings were implemented by the owning builders. This page records what is in place, with the file that proves it, and what a single-node deployment still lacks.

## API and database

| Technique | Where | Setting |
| --- | --- | --- |
| Multiple worker processes | `backend/scripts/start.sh` | `WEB_CONCURRENCY` (default 2 in compose); `--reload` forces one process in dev |
| Seed safe under many workers | `backend/app/seed/seed.py` | `pg_advisory_xact_lock` serialises workers; the second one sees a populated table |
| Connection pool per worker | `backend/app/database.py`, `config.py` | `DB_POOL_SIZE=10`, `DB_MAX_OVERFLOW=10`, 10 s checkout timeout, 30 min recycle |
| Statement and idle timeouts | `backend/app/database.py` | 5 s statement timeout and 10 s idle-in-transaction timeout via asyncpg `server_settings`; a slow query or a stuck transaction gives up instead of holding the pool |
| Load shedding | `backend/scripts/start.sh` | `--limit-concurrency 512` answers 503 beyond that instead of queueing; `--timeout-keep-alive 5`; uvicorn access log off because the middleware logs each request |
| Postgres headroom | `docker-compose.yml` | `max_connections=200`, `shared_buffers=256MB`; budget is workers x (pool + overflow) |
| Trigram search indexes | `backend/alembic/versions/0002_search_and_sort_indexes.py` | `pg_trgm` GIN on first name, last name, email, and `first_name || ' ' || last_name`; `test_search_uses_trigram_index` asserts the plan |
| Sort indexes | same revision | composite b-trees including the `(last_name, first_name, id)` tiebreakers, plus `(status, last_visit_at DESC NULLS LAST)` |
| Offset cap | `backend/app/schemas/patient.py` | pages beyond 100,000 rows return 422; keyset pagination is the next step |
| ETag / 304 | `backend/app/middleware/etag.py` | weak ETag on every 200 GET; `If-None-Match` returns 304 with no body; `Cache-Control: private, no-cache` |
| Hot-read cache | `backend/app/services/patients.py` | `/patients/stats` served from a 15 s in-process cache, cleared on patient and note writes |
| Rate limiting | `backend/app/middleware/rate_limit.py` | sliding window, `RATE_LIMIT_PER_MINUTE=600` per worker, `RateLimit-*` and `Retry-After` headers, `/health*` exempt |
| Compression | `frontend/nginx.conf` | gzip level 5 with `Vary`, for JSON and static text |
| Readiness vs liveness | `backend/app/routers/health.py` | `/health` is dependency-free; `/health/ready` runs `SELECT 1` through the pool and is what compose polls |
| Request IDs | `backend/app/middleware/request_id.py` | `X-Request-ID` honoured or generated, echoed on the response, printed in every log line and in nginx access logs |
| Summary endpoint | `backend/app/services/summary/service.py`, `providers.py` | commits the session before the LLM call so no connection is held; one shared `httpx.AsyncClient` with 20 max connections and a 10 s timeout; newest 12 notes only |
| Bounded note reads | `backend/app/services/notes.py` | newest 500 notes per chart; the total still reports the true count |

## Browser and edge

| Technique | Where | Setting |
| --- | --- | --- |
| Bundle budget in CI | `frontend/scripts/check-bundle-budget.mjs`, `scripts/verify.sh bundle` | initial JS 140 KB gzipped against a 150 KB budget; route chunks under 60 KB; landing exempt |
| Shell kept light | `frontend/src/features/patients/search-params.ts`, `components/layout/app-shell.tsx` | hand-rolled search param parsers keep zod out of the shell; the toaster is lazy-loaded |
| Route-level code splitting | `frontend/src/routes/router.tsx` | every route is a lazy chunk; `motion` only ships with `/welcome` |
| Request cancellation | `frontend/src/features/patients/api.ts` | TanStack Query's `AbortSignal` is forwarded to `openapi-fetch`, so a superseded search is cancelled |
| Debounced search | `frontend/src/features/patients/patient-list-toolbar.tsx` | 250 ms, with `keepPreviousData` so rows never flash empty |
| Virtualised list | `frontend/src/features/patients/patient-table.tsx` | TanStack Virtual, memoised rows, page size capped at 100 |
| Prefetch on intent | `frontend/src/routes/router.tsx` | hovering a patient link prefetches the chart query |
| Cache lifetimes | `frontend/src/features/patients/api.ts` | stats 15 s (matches the server TTL), patient detail 60 s, lists 30 s |
| Keep-alive to the API | `frontend/nginx.conf` | `upstream api { keepalive 32 }` and `Connection ""`, 4096 worker connections |
| Immutable assets | `frontend/nginx.conf` | hashed `/assets/` served with a one-year `immutable` header; `index.html` is `no-cache` |

## Honest limits of a single node

These are not in the Compose deployment and are the next steps for a multi-instance rollout:

- Read replicas for `GET` traffic once the table passes roughly 500k rows.
- A shared store (Redis) for rate-limit counters and the stats cache; today both are per worker process.
- A CDN in front of nginx for `/assets` and fonts.
- A load balancer and autoscaling for the API; the seed lock and stateless workers already allow it.
- PgBouncer in transaction mode once instance count times pool size approaches Postgres limits.
- Keyset pagination for deep pages (`last_name, first_name, id` cursor).
- TLS termination, WAF, backups and PITR, metrics and tracing export, and a load test (k6) against the Compose stack to turn these capacity arguments into measured numbers.
