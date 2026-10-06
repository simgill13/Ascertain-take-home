@../AGENTS.md

# Backend

- Python 3.12, managed with uv. Run `uv run` from `backend/`.
- Routers parse and return schemas. Services own queries and business rules. Models and migrations belong to `database-engineer`.
- Async SQLAlchemy sessions come from `app.database.get_session`. Do not open a second engine.
- Every new or changed route must stay reflected in `backend/openapi.json` (ask `ci-engineer` to refresh it).
- Seed is idempotent: startup inserts the sample cohort only when `patients` is empty.
