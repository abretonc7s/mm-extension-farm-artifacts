# Self-Review: TAT-3012

## Verdict: PASS

## Summary
When a perps position has a liquidation price ≤ $0 (possible with high leverage/cross margin), the extension showed "0%" for liquidation distance and "$0.00" for price. The fix adds `<= 0` guards in `liquidationDistancePercent()`, `formatLiquidationDistance()`, and display components, showing "--" instead. This matches mobile's `PERPS_CONSTANTS.FallbackDataDisplay` behavior.

## Type Check
- Result: PASS
- New errors: none

## Tests
- Result: PASS
- Details: 105 tests across 4 suites (marginUtils.test.ts, usePerpsMarginCalculations.test.ts, edit-margin-modal-content.test.tsx, perps-market-detail-page.test.tsx) — all pass.

## Test Quality
- Findings: none found

## Domain Anti-Patterns
- Findings: none found

## Mobile Comparison
- Status: ALIGNED
- Details: Mobile's `PerpsAdjustMarginView` uses `formatLiquidationDistance(distance, liquidationPrice)` with a `liquidationPrice === 0` guard returning `PERPS_CONSTANTS.FallbackDataDisplay` (`'--'`). Extension mirrors this pattern with `<= 0` (more defensive — handles negative prices that mobile only guards at 0). The fallback string `'--'` matches mobile exactly.

## LavaMoat Policy
- Status: N/A
- Details: No dependency changes

## Fix Quality
- Best approach: yes — minimal guards at the display layer, consistent with how mobile handles it
- Would not ship: none
- Test quality: good — tests cover negative and zero liquidation price for both `liquidationDistancePercent` and `usePerpsMarginCalculations` hook, with specific assertions. Reverting the `<= 0` to `=== 0` in marginUtils.ts would cause the negative-price test to fail.
- Brittleness: none

## Diff Quality
- Minimal: yes
- Debug code: none

## Recipe
- Present: yes
- Quality: good — 10/10 nodes pass, recipe-quality.json shows PASS verdict. Recipe tests normal-case live UI while edge cases (liq <= 0) are covered by unit tests. Could not re-run (no CDP port configured for this session), but worker's trace shows successful execution.

## Issues
