# Learnings — TAT-2965

- **Investigation vs fix time**: Investigation took ~5 minutes (read the market detail page file, found `handleBackClick` immediately). Fix was one line. Most time was process overhead (recipe writing, recording, lint, tests).

- **Key file to know**: `ui/pages/perps/perps-market-detail-page.tsx:671` — `handleBackClick` is the only back navigation entrypoint on the market detail page. Also `ui/pages/perps/market-list/index.tsx:237` has `navigate(-1)` for the market list back button — this was already correct.

- **Recipe runner artifact paths**: Screenshots go to `temp/agentic/recipes/test-artifacts/screenshots/` with timestamps, not to the task artifacts directory. Need to manually copy them. The task-relative artifacts dir only receives `summary.json`, `trace.json`, `workflow.mmd`, etc.

- **navigate(-1) is the standard pattern**: The market-list `handleBack` already used `navigate(-1)` — if I had checked the sibling component first, I would have spotted the inconsistency immediately.
