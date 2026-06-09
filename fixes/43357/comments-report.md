# PR #43357 Comment Triage Report

| # | Author | File | Triage | Action |
|---|--------|------|--------|--------|
| 1 | cursor[bot] | usePerpsOrderForm.ts | REAL (fixed prior) | Fixed in 033330b — recap capped default when price resolves after mount |
| 2 | cursor[bot] | perps-slippage-config-modal.tsx | REAL (fixed prior) | Fixed in 033330b — modal awaits async onSave before closing |
| 3 | cursor[bot] | usePerpsLiveOrderBook.ts | REAL (fixed prior) | Fixed in 6d1ff88 — slippage hook uses manageStream: false |
| 4 | cursor[bot] | perps-order-entry-page.tsx | REAL (fixed prior) | Fixed in f6a5ff2acd — gate slippage UI on max-slippage loading |
| 5 | cursor[bot] | usePerpsOrderForm.ts:421 | REAL | Fixed in 7b62737608 — lock initial amount on manual edit |

## Summary

- Total comments: 5 inline review (5 REAL, 0 FALSE POSITIVE, 0 OUT OF SCOPE)
- Commit SHA for fixes: `7b62737608`
- Files changed: `ui/hooks/perps/usePerpsOrderForm.ts`, `ui/hooks/perps/usePerpsOrderForm.test.ts`, `jest.integration.config.js` (reverted unnecessary mapper)
- Recipe re-validation: SKIPPED (CDP unavailable — extension background unresponsive on port 6662)
- Merge-main status: clean (already up to date with origin/main)
