# Fix Report — TAT-2947

**Branch:** fix/tat-2947-fix-tpsl-sign-input
**PR:** #41919

## Root Cause

Three interrelated bugs:

1. **`formatRoePercent` stripped sign** (`utils.ts`): Used `Math.abs()` so the display always showed unsigned %.
2. **`isTP` flag inverted SL math** (`update-tpsl-modal-content.tsx`, `auto-close-section.tsx`): SL used `1 - ratio` instead of `1 + signedRatio`, so positive input created SL below entry but negative input created SL above entry — opposite of intent.
3. **Regex blocked `+`** (`update-tpsl-modal-content.tsx`, `order-entry/utils.ts`): Pattern only allowed optional `-`, not `+`.

## Fix

Adopted unified **signed RoE convention**: positive = profitable direction, negative = loss direction. Both TP and SL use the same formula.

- `formatRoePercent`: preserves sign (negative returned as `-N`)
- `percentToPriceForEdit` / `percentToPrice`: direction-aware only (long vs short), not TP/SL-aware
- `priceToPercentForEdit` / `priceToPercent`: returns actual signed RoE
- Input regex and `isSignedDecimalInput`: now accept `+` prefix
- SL preset buttons: pass `-percent` (negated) so presets labeled "-5%" still produce SL below entry
- `handleTpPercentChange` / `handleSlPercentChange`: treat `+` as intermediate state (clears price)

## Files Changed

- `ui/components/app/perps/utils.ts`
- `ui/components/app/perps/order-entry/utils.ts`
- `ui/components/app/perps/order-entry/components/auto-close-section/auto-close-section.tsx`
- `ui/components/app/perps/update-tpsl/update-tpsl-modal-content.tsx`
- `ui/components/app/perps/order-entry/utils.test.ts`
- `ui/components/app/perps/order-entry/components/auto-close-section/auto-close-section.test.tsx`
- `ui/components/app/perps/update-tpsl/update-tpsl-modal-content.test.tsx`

## Validation

- Recipe: 14/14 nodes passed (live CDP run)
- Unit tests: 170 tests passed across 4 test files
- Lint: no ESLint errors on changed files
- Circular deps: clean

## Evidence

See `recipe-coverage.md` for AC coverage matrix (3/3 PROVEN).
See `evidence-manifest.json` for before/after screenshot pairs.
