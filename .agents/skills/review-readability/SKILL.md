---
name: review-readability
description: Checklist for simple, human-readable code with descriptive names and no filler. Use when reviewing a diff for slop or unclear naming.
---

# Readability review

Read the diff. Flag only concrete problems.

## Names

```python
# Reject
for p in patients:
    if p.s == "a":
        out.append(p)

# Prefer
for patient in patients:
    if patient.status == PatientStatus.ACTIVE:
        active_patients.append(patient)
```

- No single-letter names, including `i`, `j`, `e`, `x`, and `_`.
- If a value is unused, name the intent (`unused_session`) or drop it.
- Prefer domain words: `patient`, `note`, `visit`, `page_size`. Avoid `data`, `item`, `obj`, `temp`, `flag`, `result` when a sharper name exists.

## Shape

- One job per function. Split when a reader has to scroll to find the outcome.
- Return early on invalid input.
- Delete unused branches, unused exports, and wrappers that only forward arguments.
- Comments explain a constraint or a tradeoff. Delete comments that restate the next line.

Report `file:line`, the offending name or block, and the replacement.
