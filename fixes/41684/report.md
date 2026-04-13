# Report — TAT-2830: Flip fee is not displayed

## Summary

The Reverse Position modal displayed a hardcoded em-dash (`—`) for the fee value and used "Save" as the submit button label. Fixed by calculating the flip fee as `2 * size * price * PERPS_MARKET_ORDER_FEE_RATE` (matching mobile and the close-position modal) and changing the button text to "Confirm".

## Root cause

`ui/components/app/perps/reverse-position/reverse-position-modal.tsx`:
- Line 208 (pre-fix): Fee value hardcoded as `—` instead of calculated from position data
- Line 238 (pre-fix): `t('save')` instead of `t('confirm')`
- `currentPrice` prop received but aliased as `_currentPrice` (unused)

## Changes

| File | Change |
|------|--------|
| `ui/components/app/perps/reverse-position/reverse-position-modal.tsx` | Calculate flip fee using `useMemo`, display via `formatCurrencyWithMinThreshold`, change button from Save→Confirm, add `data-testid` for fee value |
| `ui/components/app/perps/reverse-position/reverse-position-modal.test.tsx` | Update test names and assertions for fee display and Confirm button text |

## Test plan

- **Unit tests**: 21/21 pass (`reverse-position-modal.test.tsx`)
- **Type check**: `yarn lint:tsc` clean
- **Locales**: `yarn verify-locales --quiet` — no invalid entries
- **Circular deps**: `yarn circular-deps:check` passed
- **Recipe validation**: 14/14 nodes pass (CDP on port 6665)

### Manual steps
1. Open perps tab, navigate to a market with an open position (e.g. ETH)
2. Click Modify → Reverse Position
3. Verify the Fees row shows a calculated dollar value (e.g. `-<$0.01`)
4. Verify the submit button says "Confirm"

## Evidence

- `after-ac1-fee-displayed.png` — fee row shows formatted currency
- `after-ac2-confirm-button.png` — button says "Confirm"
- `after.mp4` — full recipe run recording
- `recipe-coverage.md` — 2/2 ACs PROVEN

## Ticket

[TAT-2830](https://consensyssoftware.atlassian.net/browse/TAT-2830)
