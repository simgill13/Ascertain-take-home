# Progress

Evidence is a file path, endpoint, or test name. Update this after each phase.

| Phase | Status | Evidence |
| --- | --- | --- |
| 0 Agentic scaffold | done | `AGENTS.md`, `.claude/agents/*.md`, `.agents/skills/*`, `.cursor/rules/*.mdc`, `.codex/agents/*.toml`, `docs/AGENT_TEAM.md` |
| 1 Backend foundation | done | `GET /health` in `backend/app/routers/health.py`; `backend/alembic/versions/0001_initial_schema.py`; `backend/app/seed/`; `tests/test_health.py`, `tests/test_seed.py` pass; `backend/Dockerfile` |
| 2 Frontend foundation | done | `frontend/vite.config.ts`, `eslint.config.js`, `src/components/layout/app-shell.tsx`, `src/routes/router.tsx` (lazy routes for `/`, `/patients`, `/patients/$patientId`, `/welcome`, 404), `src/stores/ui-store.ts` theme toggle; `npm run build` splits one chunk per route |
| 3 Patients | pending | |
| 4 Notes and summary | pending | |
| 5 Patient form | pending | |
| 6 Containers | pending | |
| 7 Tests and CI | pending | |
| 8 Landing page | pending | |
| 9 Review and docs | pending | |
