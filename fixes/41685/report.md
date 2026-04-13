# Report: TAT-2830 — Flip fee is not displayed

## Summary

The "Reverse position" modal in perps trading hardcoded the fee display as an em-dash (`—`) and the submit button as "Save". Fixed by computing the estimated fee (`2 * size * price * feeRate`) matching mobile's flip logic, and changing the button label to "Confirm".

## Root cause

`ui/components/app/perps/reverse-position/reverse-position-modal.tsx`:
- **Line 209**: Fee value was a hardcoded `—` string. The `currentPrice` prop was destructured as `_currentPrice` (intentionally unused), so no fee calculation existed. Mobile equivalent (`PerpsFlipPositionConfirmSheet.tsx:71-77`) computes `positionSize * 2 * markPrice * feeRate` because a flip is a single 2x order (1x close + 1x open opposite).
- **Line 239**: Button text used `t('save')` instead of `t('confirm')`.

## Changes

| File | Change |
|------|--------|
| `ui/components/app/perps/reverse-position/reverse-position-modal.tsx` | Compute estimated fee using `2 * size * currentPrice * PERPS_MARKET_ORDER_FEE_RATE`, display via `formatCurrencyWithMinThreshold`. Change button label from `t('save')` to `t('confirm')`. Add `data-testid` to fee value element. |
| `ui/components/app/perps/reverse-position/reverse-position-modal.test.tsx` | Update test for "Confirm" button label. Replace em-dash assertion with computed fee assertion (`$1.45 = 2 * 2.5 * 2900 * 0.0001`). Add `useFormatters` mock. |

## Test plan

- **Unit tests**: 21/21 pass (`yarn jest reverse-position-modal.test.tsx --no-coverage`)
- **Lint + types**: `yarn lint && yarn verify-locales --quiet && yarn circular-deps:check` all green
- **Recipe validation**: `validate-recipe.js` exits 0 — asserts fee value is `$0.22` (not `—`) and button text is "Confirm" (not "Save")

### Manual Gherkin steps

1. Open MetaMask Extension with perps enabled
2. Navigate to a market detail page (e.g. ETH)
3. Have an open position
4. Click "Modify" button, then "Reverse position"
5. **Verify**: Fees row shows a dollar amount (e.g. `$0.22`), not `—`
6. **Verify**: Submit button reads "Confirm", not "Save"

## Evidence

| Artifact | Description |
|----------|-------------|
| `before-ac1-fee-visible.png` | Screenshot showing `—` in Fees row before fix |
| `after-ac1-fee-visible.png` | Screenshot showing `$0.22` in Fees row after fix |
| `after-ac2-confirm-button.png` | Screenshot showing "Confirm" button after fix |
| `recipe.json` | Executable validation recipe |
| `recipe-coverage.md` | AC coverage matrix — 2/2 PROVEN |
| `trace.json` | Recipe execution trace |

## Ticket

[TAT-2830](https://consensyssoftware.atlassian.net/browse/TAT-2830)
