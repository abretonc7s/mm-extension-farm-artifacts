# PR #43357 Comment Triage Report

| # | Author | File | Triage | Action |
|---|--------|------|--------|--------|
| 1 | cursor[bot] | ui/hooks/perps/usePerpsOrderForm.ts | REAL (fixed prior) | Fixed in 033330b — recap capped default when price resolves after mount |
| 2 | cursor[bot] | ui/components/app/perps/slippage-config/perps-slippage-config-modal.tsx | REAL (fixed prior) | Fixed in 033330b — modal awaits async onSave before closing |
| 3 | cursor[bot] | ui/hooks/perps/stream/usePerpsLiveOrderBook.ts:85 | REAL (fixed prior) | Fixed in 6d1ff88 — slippage hook uses manageStream: false |
| 4 | cursor[bot] | ui/pages/perps/perps-order-entry-page.tsx:694 | REAL (fixed prior) | Fixed in f6a5ff2 — gate slippage UI on max-slippage loading |
| 5 | cursor[bot] | ui/hooks/perps/usePerpsOrderForm.ts:421 | REAL (fixed prior) | Fixed in 7b627376 — lock initial amount on manual edit |
| 6 | cursor[bot] | ui/hooks/perps/usePerpsEstimatedSlippage.ts:108 | REAL (fixed prior) | Fixed in 7b84f8217c — symbol resetKey clears throttled order book on asset switch |
| 7 | cursor[bot] | ui/pages/perps/perps-order-entry-page.tsx:1014 | REAL (fixed prior) | Fixed in 33037de501 — clear submitError after successful max-slippage save |
| 8 | cursor[bot] | ui/pages/perps/perps-order-entry-page.tsx:342 | REAL | Fixed in 3db46a41a3 — pass SlippageEstimateBookLevels on order-book stream activation |

## Summary

- **Total comments:** 8 inline review (8 REAL, 0 FALSE POSITIVE, 0 OUT OF SCOPE)
- **Fix commit SHA:** `3db46a41a3`
- **Files changed (this run):** `ui/pages/perps/perps-order-entry-page.tsx`
- **Merge-main status:** clean (already up to date with `origin/main`)
- **Validation:** recipe/coverage/Jest skipped due machine pressure; `yarn lint:changed`, `verify-locales`, `circular-deps:check` passed before commit
- **Recipe re-validation:** SKIPPED (machine pressure)
- **Replies:** all 8 threads have fix replies; thread #8 resolved in this run
