#!/usr/bin/env sh
# Apply migrations, then serve. Seeding happens in the app lifespan when SEED_ON_STARTUP is true.
set -eu

alembic upgrade head
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}" ${UVICORN_EXTRA_ARGS:-}
