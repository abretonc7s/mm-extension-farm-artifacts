# PR #42661 — Comments Report

## Totals

- Total comments: 1 (1 REAL, 0 FALSE POSITIVE, 0 OUT OF SCOPE)
- Commit SHA: `fbb0a45af6`
- Files changed: `ui/pages/perps/perps-order-entry-page.tsx`

## Triage Table

| # | Author | File | Triage | Action |
|---|--------|------|--------|--------|
| 1 | cursor[bot] | ui/components/app/perps/utils/orderUtils.ts:212 (also flags perps-order-entry-page.tsx:1109-1113) | REAL | Treat zero-size position as no-position in the caller so market+TPSL routes through positionTpsl path even if a phantom zero-size position lingers. |

## Notes

- Conversation comment id `4442742791` from `abretonc7s` is the worker run report (PR author self-post), not a review comment — no reply needed.
- No CHANGES_REQUESTED reviews.
- Single REAL inline comment fixed in `ui/pages/perps/perps-order-entry-page.tsx` by adding `parseFloat(position.size) === 0` to the no-position guard before `willFlipPosition`. Mobile's `willFlipPosition` has the same gap; caller-side guard avoids drifting the shared utility signature.

## Merge-main status

- clean (auto-merge via 'ort' strategy; yarn.lock updated → `yarn install --immutable`).

## Recipe re-validation

- `temp/tasks/fix/42661-0513-234457/artifacts/recipe.json` — **22/22 PASS** on `branch + origin/main` (post-merge state). Real $10 AVAX market+TPSL UI flow against live Hyperliquid mainnet.

## Coverage analyze

- VERDICT: FAIL — pre-existing PR-added lines in `ui/pages/perps/perps-order-entry-page.tsx` (1118-1121, 1138, 1143, 1153, 1158-1159, 1163) cover the `shouldHandleTpslSeparately` branch and its error path; original PR worker did not add tests for that branch. My review-fix change at lines 1112-1115 is covered by existing 72/72 tests. Not adding tests in this iteration — out of scope per "minimal fixes; do not refactor surrounding code".
