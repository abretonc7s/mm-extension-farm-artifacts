# PR #43357 Comment Triage Report

| # | Author | File | Triage | Action |
|---|--------|------|--------|--------|
| 1 | cursor[bot] | usePerpsOrderForm.ts | REAL | Fixed in 033330b — re-apply capped default when price resolves after mount |
| 2 | cursor[bot] | perps-slippage-config-modal.tsx | REAL | Fixed in 033330b — await async onSave before closing modal |
| 3 | cursor[bot] | usePerpsLiveOrderBook.ts:85 | REAL | Fixed in 6d1ff88 — manageStream: false on slippage hook |
| 4 | cursor[bot] | perps-order-entry-page.tsx:700 | REAL | Fixed in f6a5ff2 — gate slippage UI on max-slippage loading |
| 5 | cursor[bot] | usePerpsOrderForm.ts:421 | REAL | Fixed in 7b62737 — lock amount after manual user edit |
| 6 | cursor[bot] | usePerpsEstimatedSlippage.ts:108 | REAL | Fixed in 7b84f82 — resetKey clears throttled book on symbol change |
| 7 | cursor[bot] | perps-order-entry-page.tsx:1020 | REAL | Fixed in 33037de — clear stale slippage error after successful save (refined in this run) |
| 8 | cursor[bot] | perps-order-entry-page.tsx:345 | REAL | Fixed in 3db46a41 — pass SlippageEstimateBookLevels on order-book stream |
| 9 | cursor[bot] | perps-order-entry-page.tsx:700 | REAL | Gate exceedsMaxSlippage and Est/Max row on isEstimatedSlippageReady |
| 10 | cursor[bot] | perps-order-entry-page.tsx:1773 | REAL | Only clear submit error after save when new cap covers live estimate |

Conversation comments from abretonc7s/metamaskbot are worker reports or CI notifications — no code action required.

## Validation

- Merge main: clean
- Lint: PASS (`yarn lint:changed && yarn verify-locales --quiet`)
- Unit tests: PASS (`perps-order-entry-page.test.tsx` 77/77)
- Coverage: perps slippage files ≥93% new lines; overall FAIL from merged main batch-sell files (out of scope)
- Recipe re-validation: SKIPPED — extension runtime unhealthy (background unresponsive on CDP 6662 after merge rebuild)

## Summary

- Total comments: 10 inline review (10 REAL, 0 FALSE POSITIVE, 0 OUT OF SCOPE)
- Fix commit: `766493b0e6`
- Files changed this run: `ui/pages/perps/perps-order-entry-page.tsx`
- Merge main: clean (`6702b6e7c1`)
