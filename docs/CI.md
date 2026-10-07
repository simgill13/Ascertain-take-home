# CI

Owned by `ci-engineer`. Every job has a matching `scripts/verify.sh` step so a failure can be reproduced locally with one command.

## Pull request checks

| Job | What it runs | Local |
| --- | --- | --- |
| pr-title | Conventional Commits title (`feat`, `fix`, `chore`, `docs`, `test`, `ci`, `refactor`) | n/a |
| lint-and-types | Ruff, mypy, ESLint, Prettier, `tsc` | `scripts/verify.sh lint` |
| backend-unit | pytest against a Postgres 16 service, `--durations=20` uploaded as an artifact | `scripts/verify.sh backend` |
| frontend-unit | Vitest + Testing Library, then `vite build` and the gzip bundle budget | `scripts/verify.sh frontend` and `scripts/verify.sh bundle` |
| api-contract | `backend/openapi.json` and `frontend/src/lib/api/schema.d.ts` must match the running app | `scripts/verify.sh contract` |
| e2e | Playwright journeys and axe checks against the dev servers, blob report uploaded | `scripts/verify.sh e2e` |
| docker-build | `docker compose build`, `up --wait`, `GET /health`, `GET /api/patients/stats` through nginx | `docker compose up --build` |

Dependabot groups weekly updates for uv, npm, and GitHub Actions. Actions are pinned to commit SHAs with the release tag in a comment.

## Timings

Measured locally on 2026-10-06 (Apple Silicon, warm caches). CI numbers go here once the first runs land.

| Suite | Tests | Wall clock |
| --- | --- | --- |
| pytest | 33 | 2.4s (1.1s is the one-time Alembic migration in the session fixture) |
| Vitest | 26 | 2.5s |
| Playwright (chromium, 1 worker) | 23 | 36s |

## Sharding decision

No sharding yet. The rules from the `ci-pipeline` skill:

- A job over 8 minutes gets split. The slowest suite is Playwright at 35 seconds, so every job is well under the threshold even with dependency installation.
- Playwright runs with `workers: 1` on purpose: the journeys create and delete real patients against one database and parallel workers would race on the shared list counts. Before sharding, the suite needs per-worker data isolation (a unique last-name prefix per worker and list assertions scoped to it).
- Next review point: when Playwright passes about 5 minutes serial, move to a 2-shard matrix with the blob reporter (already enabled in CI) and a merge-reports job.

## Flaky tests

None recorded. CI retries a failed Playwright test once (`retries: 1` when `CI` is set); local runs do not retry. A test that fails on first attempt twice in a row gets named here with a link to the fix.

## Quarantine

Empty.
