#!/usr/bin/env sh
# Apply migrations, then serve. Seeding happens in the app lifespan when SEED_ON_STARTUP is true.
# WEB_CONCURRENCY sets the number of uvicorn worker processes; --reload (dev) runs a single worker.
set -eu

alembic upgrade head

WORKERS="${WEB_CONCURRENCY:-2}"
EXTRA_ARGS="${UVICORN_EXTRA_ARGS:-}"
case "${EXTRA_ARGS}" in
  *--reload*) WORKER_ARGS="" ;;
  *) WORKER_ARGS="--workers ${WORKERS}" ;;
esac

# shellcheck disable=SC2086
# The request-logging middleware already writes one line per request, so uvicorn's access log is off.
# --limit-concurrency sheds load with a 503 instead of queueing without bound.
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}" \
  --proxy-headers --forwarded-allow-ips='*' \
  --no-access-log --timeout-keep-alive 5 --limit-concurrency 512 \
  ${WORKER_ARGS} ${EXTRA_ARGS}
