# TAT-3012: Liquidation distance shows as 0% when liquidation price is <$0

## Summary
When a perps position has a liquidation price ≤ $0 (possible with very high leverage or cross margin), the extension displayed "0%" for liquidation distance and "$0.00" for liquidation price instead of "--". Fixed by adding guards for negative/zero liquidation prices in the formatting functions, matching mobile behavior.

## Root cause
`liquidationDistancePercent()` in `ui/hooks/perps/marginUtils.ts:104-109` only guarded `liquidationPrice === 0` but not negative values. When `estimateLiquidationPrice()` clamped a negative result to 0 via `Math.max(0, estimated)`, the distance returned 0, formatted as "0%". Mobile's equivalent passes the liquidation price to the format function and returns "--" when it's 0.

## Changes
- `ui/hooks/perps/marginUtils.ts` — Changed `liquidationPrice === 0` guard to `liquidationPrice <= 0` in `liquidationDistancePercent()`
- `ui/components/app/perps/edit-margin/edit-margin-modal-content.tsx` — Updated `formatLiquidationDistance()` to accept optional `liquidationPrice` param and return "--" when ≤ 0; added `anchorLiquidationPrice <= 0` guard in `liquidationPriceDisplay`; guarded estimated price display for ≤ 0
- `ui/pages/perps/perps-market-detail-page.tsx` — Added `> 0` guard for liquidation price display, showing "--" when ≤ 0
- `ui/hooks/perps/marginUtils.test.ts` — Added tests for negative liquidation price in `liquidationDistancePercent` and `estimateLiquidationPrice`
- `ui/hooks/perps/usePerpsMarginCalculations.test.ts` — Added tests for negative and zero liquidation price positions

## Test plan
- **Unit tests**: 29/29 passing (marginUtils.test.ts, usePerpsMarginCalculations.test.ts)
- **Lint**: `yarn lint:changed && yarn verify-locales --quiet && yarn circular-deps:check` — all pass
- **Recipe**: 10/10 nodes pass — navigates to market detail, opens add-margin modal, verifies liq distance is valid
- **Coverage**: PASS — new code meets 80% threshold

### Manual Gherkin steps
1. Open Extension and navigate to Perps tab
2. Open a position with very high leverage such that liquidation price is ≤ $0
3. Observe the liquidation distance on the market detail page — should show "--"
4. Open "Add margin" modal — liquidation distance and price should show "--"
5. Open "Remove margin" modal — same fields should show "--"

## Evidence
- `before.mp4` — Recipe run against buggy code
- `after.mp4` — Recipe run against fixed code
- `after-evidence-ac1-add-margin-distance.png.png` — Add margin modal showing valid liq distance
- `after-evidence-ac3-market-detail-liq-price.png.png` — Market detail page showing position info

## Ticket
[TAT-3012](https://consensyssoftware.atlassian.net/browse/TAT-3012)
