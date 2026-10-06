---
name: verify-all
description: Runs the local equivalent of the pull request checks via scripts/verify.sh. Use before claiming implementation work is done.
---

# Verify all

From the repository root:

```bash
scripts/verify.sh
```

Run one section while iterating:

```bash
scripts/verify.sh lint
scripts/verify.sh backend
scripts/verify.sh frontend
scripts/verify.sh contract
scripts/verify.sh e2e
```

A failing section is a failed verification. Do not report the phase done. Paste the command and the failing tail into the handoff so the owning builder can fix it.
