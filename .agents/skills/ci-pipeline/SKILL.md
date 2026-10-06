---
name: ci-pipeline
description: Defines pull request checks, local verify.sh parity, OpenAPI contract refresh, and when to shard tests. Use when editing GitHub Actions or judging slow suites.
---

# CI pipeline

## Checks on every pull request

| Job | Local step |
| --- | --- |
| pr-title | Conventional Commits title: feat, fix, chore, docs, test, ci, refactor |
| lint-and-types | `scripts/verify.sh lint` |
| backend-unit | `scripts/verify.sh backend` with pytest `--durations=20` |
| frontend-unit | `scripts/verify.sh frontend` |
| api-contract | `scripts/verify.sh contract` |
| e2e | `scripts/verify.sh e2e` |
| docker-build | `docker compose build` and `GET /health` |

Pin every action to a SHA and comment the tag. Set `concurrency` to the workflow plus the ref, and cancel in-progress runs on pull requests. Cache uv, npm, and Playwright browsers.

## Contract

```bash
uv run --directory backend python ../scripts/export_openapi.py
npx --prefix frontend openapi-typescript ../backend/openapi.json -o src/lib/api/schema.d.ts
```

Commit both files. The contract job fails on a diff.

## Sharding

Measure first. Record the numbers in `docs/CI.md`.

- A job over 8 minutes gets split.
- pytest: add `pytest-xdist -n auto` first. If the job is still over 8 minutes, split with `pytest-split` and stored durations.
- Playwright: move to `--shard=i/n` with the blob reporter and a merge-reports job. Start at 2 shards. Add one shard per additional 5 minutes of serial runtime.
- Vitest: `--shard` only after the job exceeds 3 minutes.
- Retry failed tests once in CI only. Quarantine a test that flakes twice by naming it in `docs/CI.md` and skipping it with a linked reason. Do not retry locally.

Target: pull request wall clock under 10 minutes.
