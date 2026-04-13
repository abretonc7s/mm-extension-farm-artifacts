# Self-Review: TAT-2830

## Verdict: ISSUES

## Summary
Worker replaced the hardcoded em-dash fee placeholder with a calculated flip fee (`2 * size * price * PERPS_MARKET_ORDER_FEE_RATE`) and changed the submit button from "Save" to "Confirm". Fix is correct, minimal, and aligned with mobile. One weak test assertion flagged.

## Type Check
- Result: PASS
- New errors: none

## Tests
- Result: PASS
- Details: `reverse-position-modal.test.tsx` — 21/21 passed

## Test Quality
- Findings:
  - **reverse-position-modal.test.tsx:168** — Fee assertion `expect(feeValue.textContent).toMatch(/\$/u)` only checks for a `$` sign. Should assert the computed value (e.g. `$1.45` for `2 * 2.5 * 2900 * 0.0001`). Current assertion passes even if the 2x multiplier is removed or the formula is wrong. Easy fix: `expect(feeValue.textContent).toBe('-$1.45')` or at minimum `toContain('1.45')`.

## Domain Anti-Patterns
- Findings: none found

## Mobile Comparison
- Status: ALIGNED
- Details: Uses `formatCurrencyWithMinThreshold` (approved interim per map section 3). No new `.toFixed(2)`. 2x fee multiplier for flip matches mobile's calculation. Fee constant `PERPS_MARKET_ORDER_FEE_RATE` reused from `close-position-modal.tsx:301`.

## LavaMoat Policy
- Status: N/A
- Details: No new dependencies added, no policy changes needed.

## Fix Quality
- Best approach: yes — mirrors `close-position-modal.tsx` fee pattern with correct 2x multiplier for flip. Uses existing constant and formatter.
- Would not ship: none
- Test quality: weak — fee value assertion is too loose (see Test Quality above). 30-second fix.
- Brittleness: none — `useMemo` with correct deps, constant from shared file.

## Diff Quality
- Minimal: yes
- Debug code: none

## Recipe
- Present: yes
- Quality: good — seeds position via `perpsInjectPositions`, asserts both ACs (`perps-reverse-fee-value` contains `$`, confirm button text), captures screenshots. Cannot re-run (CDP_PORT is templated/unavailable in this session), but worker report says 14/14 nodes passed.

## Issues
- **reverse-position-modal.test.tsx:168** — Fee assertion too weak: `.toMatch(/\$/u)` only checks dollar sign presence. Should assert the actual computed value to catch formula regressions (e.g. missing 2x multiplier).
