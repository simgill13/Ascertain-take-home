---
name: spec-compliance-check
description: Checks the healthcare dashboard against the verbatim assignment, requirement by requirement, with file or test evidence. Use before claiming a part is complete.
---

# Spec compliance check

Source of truth: `docs/ASSIGNMENT.md`. Do not grade the README instead of the code.

Extract the task list when useful:

```bash
python .agents/skills/spec-compliance-check/scripts/list_requirements.py
```

Record each requirement in this shape:

| Requirement | Status | Evidence |
| --- | --- | --- |
| GET /health returns {"status": "ok"} | met | backend/app/routers/health.py, backend/tests/test_health.py |

Status is `met`, `partial`, or `missing`. Evidence is a path, endpoint, or test. A stretch goal is `met` only when the implementation exists.

Finish with the gaps a builder still needs to close.
