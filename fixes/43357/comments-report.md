# PR #43357 Comment Triage Report

PR: feat(perps): add configurable slippage controls
Branch: TAT-1043-feat-add-perps-slippage-config

## Triage

| # | Author | File:Line | Triage | Action |
|---|--------|-----------|--------|--------|
| 1 | cursor[bot] | ui/hooks/perps/usePerpsOrderForm.ts:411 | REAL (resolved prior) | Default amount recap — already fixed, thread resolved |
| 2 | cursor[bot] | ui/components/app/perps/slippage-config/perps-slippage-config-modal.tsx:148 | REAL (resolved prior) | Modal closes before persist — already fixed, thread resolved |
| 3 | cursor[bot] | ui/hooks/perps/stream/usePerpsLiveOrderBook.ts:85 | REAL (resolved prior) | Slippage hook kills order book — already fixed, thread resolved |
| 4 | cursor[bot] | ui/pages/perps/perps-order-entry-page.tsx:702 | REAL (resolved prior) | Max slippage defaults while loading — already fixed, thread resolved |
| 5 | cursor[bot] | ui/hooks/perps/usePerpsOrderForm.ts:421 | REAL (resolved prior) | Price load resets user amount — already fixed, thread resolved |
| 6 | cursor[bot] | ui/hooks/perps/usePerpsEstimatedSlippage.ts:108 | REAL (resolved prior) | Throttled book stale after symbol — already fixed, thread resolved |
| 7 | cursor[bot] | ui/pages/perps/perps-order-entry-page.tsx:1031 | REAL (resolved prior) | Stale slippage submit error — already fixed, thread resolved |
| 8 | cursor[bot] | ui/pages/perps/perps-order-entry-page.tsx:345 | REAL (resolved prior) | Order book depth not requested — already fixed, thread resolved |
| 9 | cursor[bot] | ui/pages/perps/perps-order-entry-page.tsx:702 | REAL (resolved prior) | Stale slippage ignores readiness — already fixed, thread resolved |
| 10 | cursor[bot] | ui/pages/perps/perps-order-entry-page.tsx:1773 | REAL (resolved prior) | Clears slippage error too broadly — already fixed, thread resolved |
| 11 | cursor[bot] | ui/pages/perps/perps-order-entry-page.tsx:713 | REAL (resolved prior) | Pending slippage max shows incorrectly — already fixed, thread resolved |
| 12 | cursor[bot] | ui/pages/perps/perps-order-entry-page.tsx:680 | REAL (resolved prior) | Slippage direction desyncs from form — already fixed, thread resolved |
| 13 | cursor[bot] | ui/hooks/perps/usePerpsOrderForm.ts:421 | REAL (resolved prior) | Prefill locks after low balance — already fixed, thread resolved |
| 14 | cursor[bot] | ui/pages/perps/perps-order-entry-page.tsx:754 | REAL (resolved prior) | Submit before slippage estimate ready — already fixed, thread resolved |
| 15 | cursor[bot] | ui/pages/perps/perps-order-entry-page.tsx:1814 | REAL (resolved prior) | Modal saves before preference loads — already fixed, thread resolved |
| 16 | cursor[bot] | ui/hooks/perps/usePerpsOrderForm.ts:417 | REAL (resolved prior) | Leverage ignored in amount recap — already fixed, thread resolved |

## Summary

- **Inline review comments:** 16, all from `cursor[bot]`. **All 16 review threads are already `isResolved=true`** — addressed by prior family runs (latest fix commit `50af04c4d7` on this branch). No new code change required this run.
- **Conversation comments:** 11 from `abretonc7s`, all automated farmslot run summaries — informational, not actionable review feedback.
- **REQUEST_CHANGES reviews:** none.
- **No unresolved actionable review comments remain.**

## This run's primary contribution

Merged latest `origin/main` (`748e345458`) into the branch and resolved 4 merge conflicts:

- `jest.integration.config.js` — comment-only conflict; kept main's descriptive stub comment.
- `test/mocks/metamask-perps-controller.js` — unioned both export sets (slippage config exports + market-category exports).
- `ui/pages/perps/perps-layout.test.tsx` — kept branch's `...jest.requireActual` mock pattern (resolves through moduleNameMapper to stub, which now exports `MARKET_CATEGORIES`).
- `ui/pages/perps/perps-order-entry-page.tsx` — unioned imports (slippage-config + compliance gate).

## Validation (post-merge: branch + origin/main)

- **lint:changed:** PASS (no uncommitted changed files)
- **verify-locales:** PASS (`No invalid entries!`)
- **circular-deps:check:** PASS
- **Unit tests (conflict-touched files):** PASS — `perps-layout.test.tsx` + `perps-order-entry-page.test.tsx` (85), `usePerpsOrderForm.test.ts` + `perps-market-detail-page.test.tsx` (120)
- **Coverage (changed files):** VERDICT PASS — new code 95% (193/203 lines); warnings pre-existing only
- **Recipe re-validation:** PASS — inherited recipe ran green against merged state (extension reloaded via CDP first). `artifacts/recipe-run/summary.json` = `pass`
- **Merge-main status:** conflicts-resolved (4 files)

## Finalization

- **Total comments:** 16 inline (16 REAL — all already resolved in prior family runs, 0 FALSE POSITIVE, 0 OUT OF SCOPE) + 11 conversation (automated farmslot summaries, non-actionable).
- **Review-fix commit:** none required this run (zero unresolved comments).
- **Pushed commit (merge):** `93f1ff5ef1` — `Merge remote-tracking branch 'origin/main' into TAT-1043-feat-add-perps-slippage-config`.
- **Files changed this run (conflict resolutions only):** `jest.integration.config.js`, `test/mocks/metamask-perps-controller.js`, `ui/pages/perps/perps-layout.test.tsx`, `ui/pages/perps/perps-order-entry-page.tsx`.
- **Recipe re-validation:** PASS.
- **CI parity:** lint:changed / verify-locales / circular-deps all PASS; unit tests PASS; coverage VERDICT PASS.
