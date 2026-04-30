# Self-Review: TAT-3075

## Verdict: PASS

## Summary
Worker replaced the always-true `shouldDisplayOrderInMarketDetailsOrders` predicate with the mobile-aligned rule that excludes reduce-only orders associated with the full position (positionTPSL or full-size match). This removes the duplicate row from the Market Detail orders list while the auto-close section continues to render via `position.takeProfitPrice` / `stopLossPrice`. Tests, types, and recipe coverage all pass; behavior matches mobile.

## Type Check
- Result: PASS
- New errors: none (`yarn lint:tsc` exit 0, empty output)

## Tests
- Result: PASS
- Details: `yarn jest ui/components/app/perps/utils/orderUtils.test.ts ui/pages/perps/perps-market-detail-page.test.tsx --no-coverage` — 112/112 pass. Inverted assertions in `orderUtils.test.ts:149` and `:288` correctly capture the new exclusion behavior, and the new case at `:300` covers the size-match-without-isPositionTpsl branch.

## Test Quality
- Findings: none found. No "should" in names. Assertions specific (`toBe(false)`, `toHaveLength(0)`, `result[0].orderId`). No raw i18n string duplication. Inverted cases (lines 149, 288) and the new size-match case (line 300) actually fail if the predicate is reverted, so they prove the fix.

## Domain Anti-Patterns
- Findings: none found. Diff is utility-level + comment, no boundary crossings, no controller mutation, no DS regressions, no new testIDs needed (no UI elements added/removed), no service-worker concerns.

## Mobile Comparison
- Status: ALIGNED
- Details: Extension `shouldDisplayOrderInMarketDetailsOrders` (`ui/components/app/perps/utils/orderUtils.ts:182-190`) now matches mobile `app/components/UI/Perps/utils/orderUtils.ts:290-299` byte-for-byte in semantics: non-reduce-only → true; otherwise `!isOrderAssociatedWithFullPosition`. `isOrderAssociatedWithFullPosition` was already aligned in a prior change.

## LavaMoat Policy
- Status: N/A
- Details: No `package.json`/`yarn.lock`/policy file changes.

## Fix Quality
- Best approach: yes — reuses the existing `isOrderAssociatedWithFullPosition` helper (covers both `isPositionTpsl` flag and size-match fallback) instead of re-implementing the check, and inverts the predicate body that was previously a stub. Pragmatic fix == long-term fix here; auto-close section already reads `position.takeProfitPrice`/`stopLossPrice` so no plumbing needed.
- Would not ship: none.
- Test quality: good — failure paths covered (partial close still shown at `orderUtils.test.ts:319`, no-position branch at `:54`, size mismatch at `:105`). Tests would fail if the predicate body were reverted to `() => true`.
- Brittleness: none. No module-level state, no import-time evaluation, no mock coupling. Tolerance constants were already extracted (`FULL_POSITION_SIZE_TOLERANCE`).

## Diff Quality
- Minimal: yes — 3 files, +45/-17, all directly related to the fix or its docs/comments. JSDoc on both `shouldDisplayOrderInMarketDetailsOrders` and `normalizeMarketDetailsOrders` updated to describe new behavior.
- Debug code: none. No `console.log`, no commented-out code, no orphan TODOs.

## Recipe
- Present: yes
- Quality: good — `recipe-quality.json` verdict PASS; `trace.json` shows 15/15 AC nodes ok + `done`. Seeds its own data via `stateHooks.getPerpsStreamManager().positions.pushData` / `orders.pushData` (no funded testnet account required). Disjoint-DOM asserts prove TP/SL appears in exactly one section. Recipe could not be re-run during self-review because `CDP_PORT` is empty in the task block; relying on worker's recorded `trace.json` and screenshots (`after-ac1-*.png`, `after-ac2-*.png`).

## Issues
(none)
