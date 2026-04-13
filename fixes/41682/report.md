# Report: TAT-2830 — Flip fee is not displayed

## Summary

The "Reverse position" modal in perps hardcoded an em-dash (`—`) for the Fees row and used "Save" as the submit button label. Fixed by calculating the estimated flip fee (2x position notional × taker fee rate) and changing the button copy to "Confirm".

## Root cause

`ui/components/app/perps/reverse-position/reverse-position-modal.tsx:209` — the Fees value was hardcoded as `—`. The `currentPrice` prop was received but aliased to `_currentPrice` (unused), so no fee calculation was possible. Additionally, line 238 used `t('save')` instead of `t('confirm')` for the submit button.

## Changes

- `ui/components/app/perps/reverse-position/reverse-position-modal.tsx` — Added fee calculation using `2 * sizeNum * currentPrice * PERPS_MARKET_ORDER_FEE_RATE`, imported `useFormatters` and `PERPS_MARKET_ORDER_FEE_RATE`, added `data-testid="perps-reverse-fee-value"`, changed button text from `t('save')` to `t('confirm')`.
- `ui/components/app/perps/reverse-position/reverse-position-modal.test.tsx` — Added `useFormatters` mock, updated fee assertion to check for calculated value (`-$1.45`), updated button test name.

## Test plan

- **Unit tests**: 21/21 passing (`yarn jest reverse-position-modal.test.tsx`)
- **Lint**: `yarn lint:tsc` passes, `yarn lint:eslint` 0 errors
- **Locales**: `yarn verify-locales --quiet` passes
- **Circular deps**: `yarn circular-deps:check` passes
- **Recipe**: `validate-recipe.js` 11/11 nodes pass — asserts fee text is not `—` and button text is "Confirm"

## Evidence

- `after-ac1-fee-displayed.png` — screenshot showing Fees row with `-<$0.01`
- `after-ac2-confirm-button.png` — screenshot showing "Confirm" button
- `trace.json` — recipe execution trace (all nodes passed)
- `recipe-coverage.md` — 2/2 ACs PROVEN

## Ticket

[TAT-2830](https://consensyssoftware.atlassian.net/browse/TAT-2830)
