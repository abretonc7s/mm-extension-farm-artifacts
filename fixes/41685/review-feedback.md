# Self-Review: TAT-2830

## Verdict: PASS

## Summary
Worker replaced the hardcoded em-dash fee placeholder with a computed estimated fee (`2 * size * price * PERPS_MARKET_ORDER_FEE_RATE`) and changed the submit button label from "Save" to "Confirm". Both changes are minimal, correct, and aligned with mobile's `PerpsFlipPositionConfirmSheet` logic.

## Type Check
- Result: PASS
- New errors: none

## Tests
- Result: PASS
- Details: 21/21 tests pass in `reverse-position-modal.test.tsx`

## Test Quality
- Findings: none found. Tests use specific value assertions (`$1.45`, `Confirm`), no "should" prefixes, proper AAA pattern.

## Domain Anti-Patterns
- Findings: none found. Imports stay within `ui/` boundaries, uses existing `PERPS_MARKET_ORDER_FEE_RATE` constant, `formatCurrencyWithMinThreshold` per project guidelines, new `data-testid` added.

## Mobile Comparison
- Status: ALIGNED
- Details: Mobile (`PerpsFlipPositionConfirmSheet.tsx:72-77`) uses `positionSize * 2 * (markPrice || price)` passed to `usePerpsOrderFees`. Extension uses `2 * sizeNum * currentPrice * PERPS_MARKET_ORDER_FEE_RATE` — same 2x notional logic with a simpler static fee rate. Pragmatic for this PR; dynamic maker/taker fees would be a follow-up enhancement.

## LavaMoat Policy
- Status: N/A
- Details: No new dependencies added

## Fix Quality
- Best approach: yes — minimal fix matching the existing `close-position-modal.tsx:301` pattern for fee computation
- Would not ship: none
- Test quality: good — fee test asserts exact computed value ($1.45), reverting the fix would break the test
- Brittleness: none — `PERPS_MARKET_ORDER_FEE_RATE` is a named constant used consistently across perps components

## Diff Quality
- Minimal: yes — only the necessary changes (2 imports, 1 useMemo, 1 format call, 1 label change, 1 testid)
- Debug code: none

## Recipe
- Present: yes
- Quality: good — injects mock position via `perpsInjectPositions`, asserts fee contains `$` and not `—`, asserts button text is `Confirm`, uses `call` for existing flows, screenshots for both ACs

## Issues

(none)
