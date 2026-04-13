# Self-Review: TAT-2830

## Verdict: PASS

## Summary
Worker replaced the hardcoded em-dash fee placeholder with a calculated estimated flip fee (`2 * size * price * PERPS_MARKET_ORDER_FEE_RATE`) and changed the submit button from "Save" to "Confirm". Both changes are correct, minimal, and aligned with mobile's approach.

## Type Check
- Result: PASS
- New errors: none in changed files (pre-existing errors in unrelated `app/scripts/controllers/` only)

## Tests
- Result: PASS
- Details: 21/21 tests pass in `reverse-position-modal.test.tsx`

## Test Quality
- Findings: none found
- No "should" in test names, AAA pattern respected, assertions are specific (exact fee value `-$1.45` computed from `2 * 2.5 * 2900 * 0.0001`)

## Domain Anti-Patterns
- Findings: none found
- Imports correct (internal only), no controller mutation, no LavaMoat impact, testID added on fee element

## Mobile Comparison
- Status: ALIGNED
- Details: Mobile's `PerpsFlipPositionConfirmSheet` (line 74) uses same 2x multiplier: `positionSize * 2 * (markPrice || price)`. Mobile passes this to `usePerpsOrderFees` for dynamic fee calc; extension uses hardcoded `PERPS_MARKET_ORDER_FEE_RATE` (matching close-position-modal pattern, with existing TODO for dynamic fees). Button text differs (mobile: "Flip", extension: "Confirm") — consistent with each platform's own patterns.

## LavaMoat Policy
- Status: N/A
- Details: No new external dependencies. Only internal imports added (`useFormatters`, `PERPS_MARKET_ORDER_FEE_RATE`).

## Fix Quality
- Best approach: yes — matches close-position-modal fee pattern exactly, uses existing constant and formatter
- Would not ship: none
- Test quality: good — fee assertion uses computed value that would fail if fix reverted
- Brittleness: none

## Diff Quality
- Minimal: yes — 2 files, 31 additions, 7 deletions. Only what's needed.
- Debug code: none

## Recipe
- Present: yes
- Quality: good — seeds position via `call` to `open-long-position`, asserts fee text is not placeholder, asserts button text is "Confirm", screenshots for both ACs, teardown closes modal

## Issues

(none)
