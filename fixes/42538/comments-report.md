# PR #42538 — Comments Report

## Summary

- Total comments: 5 (0 REAL, 0 FALSE POSITIVE, 5 OUT OF SCOPE — all CI/bot status)
- Inline review comments: 0
- REQUEST_CHANGES reviews: 0
- Commit SHA: `80e1935ef5`
- Files changed: `ui/pages/perps/perps-order-entry-page.tsx`, `ui/pages/perps/perps-order-entry-page.test.tsx`
- Recipe re-validation: PASS (10/10)
- Merge-main status: clean

## Comment Triage

| # | Author | Type | File | Triage | Action |
|---|--------|------|------|--------|--------|
| 1 | github-actions[bot] | Bot | conversation | OUT OF SCOPE | CLA signature notice |
| 2 | abretonc7s | User | conversation | OUT OF SCOPE | Worker self-summary; not actionable feedback |
| 3 | metamaskbotv2[bot] | Bot | conversation | OUT OF SCOPE | CODEOWNERS routing notice |
| 4 | sonarqubecloud[bot] | Bot | conversation | OUT OF SCOPE | Quality Gate Passed status |
| 5 | metamaskbotv2[bot] | Bot | conversation | OUT OF SCOPE | Build status notice |

## Recipe Re-validation

- Recipe `artifacts/recipe.json` updated AC2 assertion from `disabled=false` to `disabled=true` plus minimum-order copy match — aligns with PR description (submit disabled + "Order size must be at least $10" at startup).
- Result: 10/10 PASS.

## Local Edits Applied

`ui/pages/perps/perps-order-entry-page.tsx` — `isBelowMinOrderSize` now treats empty input in `new` mode as below-min so submit is disabled at startup with the minimum-order copy. `modify` mode keeps empty input as not-below-min.

`ui/pages/perps/perps-order-entry-page.test.tsx` — specs updated to assert disabled state + minimum-order text on startup; sub-minimum entry spec retitled.

These match the PR description's "single source of truth for the minimum-order requirement" intent.
