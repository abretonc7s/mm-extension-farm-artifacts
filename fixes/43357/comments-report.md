# PR #43357 Comment Triage Report

| # | Author | File | Triage | Action |
|---|--------|------|--------|--------|
| 1 | cursor[bot] | ui/hooks/perps/usePerpsOrderForm.ts | REAL | Already fixed in 033330b — only lock initial amount after valid price; re-apply capped default when price loads |
| 2 | cursor[bot] | ui/components/app/perps/slippage-config/perps-slippage-config-modal.tsx | REAL | Already fixed in 033330b — modal awaits async onSave and only closes after persist succeeds |
| 3 | cursor[bot] | ui/hooks/perps/stream/usePerpsLiveOrderBook.ts | REAL | Already fixed in 6d1ff88 — usePerpsEstimatedSlippage passes manageStream: false |
| 4 | cursor[bot] | ui/pages/perps/perps-order-entry-page.tsx | REAL | Already fixed in f6a5ff2 — order entry waits for max-slippage loading before cap display and submit blocking |
| 5 | cursor[bot] | ui/hooks/perps/usePerpsOrderForm.ts | REAL | Already fixed in 7b627376 — manual amount edits set hasSetInitialAmount to prevent price-load overwrite |
| 6 | cursor[bot] | ui/hooks/perps/usePerpsEstimatedSlippage.ts:90 | REAL | Fixed in 7b84f8217c — symbol resetKey clears throttled order book on asset switch |

## Final Summary

- **Total comments:** 6 (6 REAL, 0 FALSE POSITIVE, 0 OUT OF SCOPE)
- **Fix commit SHA:** `7b84f8217c7b30581afe61325f29aa719763cf17`
- **Files changed (this run):** `ui/hooks/perps/usePerpsEstimatedSlippage.ts`, `ui/hooks/perps/usePerpsEstimatedSlippage.test.ts`
- **Merge-main status:** clean (auto-merge of `origin/main` at `d67b6d92`)
- **Recipe re-validation:** SKIPPED — CDP runtime unhealthy (stateHooks unavailable after rebuild); recipe launcher timed out at 180s
