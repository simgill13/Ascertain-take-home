# Progress

Evidence is a file path, endpoint, or test name. Update this after each phase.

| Phase | Status | Evidence |
| --- | --- | --- |
| 0 Agentic scaffold | done | `AGENTS.md`, `.claude/agents/*.md`, `.agents/skills/*`, `.cursor/rules/*.mdc`, `.codex/agents/*.toml`, `docs/AGENT_TEAM.md` |
| 1 Backend foundation | done | `GET /health` in `backend/app/routers/health.py`; `backend/alembic/versions/0001_initial_schema.py`; `backend/app/seed/`; `tests/test_health.py`, `tests/test_seed.py` pass; `backend/Dockerfile` |
| 2 Frontend foundation | done | `frontend/vite.config.ts`, `eslint.config.js`, `src/components/layout/app-shell.tsx`, `src/routes/router.tsx` (lazy routes for `/`, `/patients`, `/patients/$patientId`, `/welcome`, 404), `src/stores/ui-store.ts` theme toggle; `npm run build` splits one chunk per route |
| 3 Patients | done | `backend/app/routers/patients.py` (list/get/create/update/delete/stats), `tests/test_patients.py` (12 tests); `frontend/src/features/patients/*` list with URL search params, TanStack Virtual rows, debounced search; `backend/openapi.json` contract + generated `frontend/src/lib/api/schema.d.ts` |
| 4 Notes and summary | done | `backend/app/routers/notes.py`, `services/summary/providers.py` (template, Anthropic, OpenAI with fallback), `tests/test_notes.py` (9 tests); `frontend/src/features/notes/*`, `features/summary/summary-card.tsx` |
| 5 Patient form | done | `frontend/src/features/patients/patient-form.tsx`, `patient-form-schema.ts` (zod mirrors backend rules), `components/form/tag-input.tsx`; server 422 `errors` mapped with `setError`; network failure renders `ErrorState` with retry; `delete-patient-button.tsx` |
| 6 Containers | pending | |
| 7 Tests and CI | pending | |
| 8 Landing page | pending | |
| 9 Review and docs | pending | |
