# Self-Review: TAT-2947

## Verdict: PASS

## Summary
Worker adopted a unified signed RoE% convention — positive = profit, negative = loss — fixing three interrelated bugs: `formatRoePercent` stripping the sign, TP/SL formulas using an `isTP` flag that created inverted behavior, and regex blocking `+` prefix. The fix is correct and aligns with mobile's signed convention in `calculateRoEForPrice`.

## Type Check
- Result: PASS
- New errors: none

## Tests
- Result: PASS
- Details: 170 tests across 4 files (utils.test.ts, order-entry/utils.test.ts, auto-close-section.test.tsx, update-tpsl-modal-content.test.tsx) — all pass.

## Test Quality
- Findings: none found
- No "should" in any new/modified test names. Assertions are value-specific (`.toHaveValue('-100')`, `.toHaveBeenCalledWith('44550')`, `toBeCloseTo(2375, 0)`). New tests cover `+` prefix acceptance and positive SL RoE (SL above entry for lock-in-profit). Failure paths covered via existing rejection tests. Tests would fail if fix were reverted.

## Domain Anti-Patterns
- Findings: none found
- No import boundary violations (all changes in `ui/components/app/perps/`). No controller state mutations. No `console.log`, `as any`, or commented-out code. No new `toFixed()` additions. No `eslint-disable` usage. No new interactive elements without testID (no UI additions).
- Minor pre-existing inconsistency: `update-tpsl-modal-content.tsx` uses inline regex `/^[+-]?\d*(?:\.\d*)?$/u` where `auto-close-section.tsx` calls the shared `isSignedDecimalInput()` utility. Worker correctly updated both but did not unify them — pre-existing pattern, not introduced by this PR.

## Mobile Comparison
- Status: ALIGNED
- Details: Mobile's `calculateRoEForPrice` returns signed RoE (negative for loss direction) — identical convention. Mobile's `calculatePriceForRoE` uses `isProfit` flag but resolves to the same arithmetic: for long SL with negative RoE, `basePrice * (1 - -priceChangeRatio)` = `basePrice * (1 + priceChangeRatio)`, matching the extension's new `1 + priceChangeRatio` formula for long.
- Pre-existing divergence (not introduced here): mobile caps SL loss at `leverage * 99` percent to prevent negative prices; extension has no equivalent cap.

## LavaMoat Policy
- Status: OK
- Details: No dependency changes; no policy files need updating.

## Fix Quality
- Best approach: yes — the unified signed convention is cleaner than the `isTP` flag approach and eliminates the class of inversion bugs entirely. Mobile uses the same semantic.
- Would not ship: none
- Test quality: good — assertions verify exact computed prices, not just "truthy". Tests would fail on revert.
- Brittleness: none — no module-level constants, no frozen values, no mock coupling issues.

## Diff Quality
- Minimal: yes — 7 files, all directly relevant. No reformatting noise, no unrelated changes.
- Debug code: none

## Recipe
- Present: yes
- Quality: good — 3/3 ACs proven via live CDP run. `recipe-quality.json` verdict `pass`. Assertions check actual `accepted` field and numeric price comparison (SL < entry), not just DOM presence. Revert-detection confirmed.

## Issues
(none)
