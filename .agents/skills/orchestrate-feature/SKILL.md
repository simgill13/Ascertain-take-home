---
name: orchestrate-feature
description: Playbook for the master agent to implement one assignment part by delegating to builder agents, running the review loop, and recording evidence. Use when starting or finishing a phase of the healthcare dashboard.
---

# Orchestrate a feature

1. Read the relevant section of `docs/ASSIGNMENT.md` and the current row in `docs/PROGRESS.md`.
2. Split the work. Schema and seed changes go to `database-engineer` first. API and services go to `backend-engineer`. UI goes to `frontend-engineer`. Workflow and contract changes go to `ci-engineer`.
3. Builders do not edit outside their ownership table in `AGENTS.md`.
4. When the builders finish, run the review loop. Reviewers are read-only and return findings:
   - `qa-engineer` runs the checks.
   - `design-reviewer` reviews screens that changed.
   - `product-reviewer` walks the journeys that changed.
   - `readability-reviewer` reads the diff.
5. Send findings back to the owning builder. Repeat until the reviewers report no blocking findings.
6. Run `spec-compliance-reviewer` against `docs/ASSIGNMENT.md`.
7. Update the phase row in `docs/PROGRESS.md` with status and evidence. Do not mark a phase done when a required check failed.
