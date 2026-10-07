#!/usr/bin/env bash
# Local equivalent of the pull request checks.
# Usage: scripts/verify.sh [lint|backend|frontend|bundle|contract|e2e|all]
set -euo pipefail

REPOSITORY_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${REPOSITORY_ROOT}"

SECTION="${1:-all}"

run_lint() {
  echo "== lint and types =="
  if [[ -f backend/pyproject.toml ]]; then
    uv run --directory backend ruff check app tests
    uv run --directory backend ruff format --check app tests
    uv run --directory backend mypy app
  fi
  if [[ -f frontend/package.json ]]; then
    npm --prefix frontend run lint
    npm --prefix frontend run typecheck
    npm --prefix frontend run format:check
  fi
}

run_backend() {
  echo "== backend unit =="
  if [[ -f backend/pyproject.toml ]]; then
    uv run --directory backend pytest --durations=20
  fi
}

run_frontend() {
  echo "== frontend unit =="
  if [[ -f frontend/package.json ]]; then
    npm --prefix frontend test -- --run
  fi
}

run_bundle() {
  echo "== bundle budget =="
  if [[ -f frontend/package.json ]]; then
    npm --prefix frontend run build >/dev/null
    node frontend/scripts/check-bundle-budget.mjs
  fi
}

run_contract() {
  echo "== api contract =="
  if [[ -f backend/pyproject.toml && -f backend/openapi.json ]]; then
    uv run --directory backend python ../scripts/export_openapi.py --check
    local generated="frontend/src/lib/api/schema.d.ts"
    local candidate="${generated}.check"
    trap 'rm -f "${candidate}"' RETURN
    (cd frontend && npx openapi-typescript ../backend/openapi.json -o "../${candidate}" >/dev/null)
    if ! cmp -s "${generated}" "${candidate}"; then
      echo "${generated} is stale. Run 'npm --prefix frontend run generate:api' and commit the result."
      diff -u "${generated}" "${candidate}" || true
      exit 1
    fi
    echo "schema.d.ts is current"
  fi
}

run_e2e() {
  echo "== e2e =="
  if [[ -f frontend/playwright.config.ts ]]; then
    npm --prefix frontend run test:e2e
  else
    echo "Playwright is not configured yet."
  fi
}

case "${SECTION}" in
  lint) run_lint ;;
  backend) run_backend ;;
  frontend) run_frontend ;;
  bundle) run_bundle ;;
  contract) run_contract ;;
  e2e) run_e2e ;;
  all)
    # e2e needs running servers and Playwright browsers; run it explicitly with `verify.sh e2e`.
    run_lint
    run_backend
    run_frontend
    run_bundle
    run_contract
    ;;
  *)
    echo "Unknown section: ${SECTION}" >&2
    exit 2
    ;;
esac
