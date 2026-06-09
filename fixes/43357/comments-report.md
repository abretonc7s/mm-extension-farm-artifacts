# PR #43357 Comment Triage Report

| # | Author | File | Triage | Action |
|---|--------|------|--------|--------|
| 1 | cursor[bot] | ui/hooks/perps/usePerpsOrderForm.ts | REAL (fixed prior) | Fixed in 033330b — recap capped default when price resolves after mount |
| 2 | cursor[bot] | ui/components/app/perps/slippage-config/perps-slippage-config-modal.tsx | REAL (fixed prior) | Fixed in 033330b — modal awaits async onSave before closing |
| 3 | cursor[bot] | ui/hooks/perps/stream/usePerpsLiveOrderBook.ts:85 | REAL (fixed prior) | Fixed in 6d1ff88 — slippage hook uses manageStream: false |
| 4 | cursor[bot] | ui/pages/perps/perps-order-entry-page.tsx:700 | REAL (fixed prior) | Fixed in f6a5ff2 — gate slippage UI on max-slippage loading |
| 5 | cursor[bot] | ui/hooks/perps/usePerpsOrderForm.ts:421 | REAL (fixed prior) | Fixed in 7b62737 — lock amount after manual user edit |
| 6 | cursor[bot] | ui/hooks/perps/usePerpsEstimatedSlippage.ts:108 | REAL (fixed prior) | Fixed in 7b84f82 — resetKey clears throttled book on symbol change |
| 7 | cursor[bot] | ui/pages/perps/perps-order-entry-page.tsx:1020 | REAL (fixed prior) | Fixed in 33037de — clear stale slippage error after successful save |
| 8 | cursor[bot] | ui/pages/perps/perps-order-entry-page.tsx:345 | REAL (fixed prior) | Fixed in 3db46a41 — pass SlippageEstimateBookLevels on order-book stream |
| 9 | cursor[bot] | ui/pages/perps/perps-order-entry-page.tsx:700 | REAL (fixed prior) | Fixed in 766493b0 — gate exceedsMaxSlippage on isEstimatedSlippageReady |
| 10 | cursor[bot] | ui/pages/perps/perps-order-entry-page.tsx:1773 | REAL (fixed prior) | Fixed in 766493b0 — only clear submit error when new cap covers estimate |
| 11 | cursor[bot] | ui/pages/perps/perps-order-entry-page.tsx:713 | REAL | Fixed in 35b7ff77bc — show resolved max percent while estimate loads |

Conversation comments from bots/abretonc7s are worker reports or CI notifications — no code action required.

## Summary

- **Total comments:** 11 inline review (11 REAL, 0 FALSE POSITIVE, 0 OUT OF SCOPE)
- **Fix commit SHA:** `35b7ff77bc`
- **Files changed (this run):**
  - `ui/pages/perps/perps-order-entry-page.tsx`
  - `ui/pages/perps/perps-order-entry-page.test.tsx`
- **Recipe re-validation:** SKIPPED — extension runtime unhealthy on CDP 6662 (`stateHooks` unavailable after rebuild/reopen)
- **Merge-main status:** clean (already up to date with `origin/main`)
- **Lint:** PASS (`yarn lint:changed && yarn verify-locales --quiet`)
- **Unit tests:** PASS (`perps-order-entry-page.test.tsx` 78/78)
- **Coverage:** overall FAIL from merged main batch-sell files (out of scope); perps slippage changed files ≥93% new-line coverage
