# TAT-3312 — Extension 'insufficient funds' error when size slider is at 100%

## Summary
On the perps order-entry screen, moving the size slider (or percentage input) to 100% produced a false "Insufficient funds" error and a disabled submit button. The 100% USD amount was rounded **up** with `toFixed(2)`, pushing the required margin a sub-cent above the available balance. Flooring the amount to 2 decimals (matching mobile) fixes it.

## Root cause
`ui/components/app/perps/order-entry/components/amount-input/amount-input.tsx:148` — `formatAmount = (value) => value.toFixed(2)` rounds half-up. At 100% the size is `maxSize = availableBalance * leverage` (amount-input.tsx:263-265 / 288-291 / 313). When `maxSize` has a 3rd decimal ≥ 5, `toFixed(2)` rounds the amount above `maxSize`. The order page then computes `marginRequired = amount / leverage` and flags `isInsufficientFunds = marginRequired > availableBalance` (`ui/pages/perps/perps-order-entry-page.tsx:597-608`), so the button text becomes `insufficientFundsSend` and the button is disabled (`perps-order-entry-page.tsx:1434-1435, 630-645`).

Reproduced live: balance `21.3816765` USDC, default leverage `3` → maxSize `64.1450295` → `toFixed(2)` = `64.15` (rounds up) → margin `64.15/3 = 21.3833 > 21.3817` → false "Insufficient funds".

Mobile (source of truth) floors the max/percentage amount with `Math.floor` in `usePerpsOrderForm` (`metamask-mobile-ref/app/components/UI/Perps/hooks/usePerpsOrderForm.ts:322-339`); the extension diverged by rounding.

## Changes
- `ui/components/app/perps/order-entry/components/amount-input/amount-input.tsx` — `formatAmount` now floors to 2 decimals (`Math.floor(value * 100) / 100`) instead of rounding up, so the computed size never exceeds `availableBalance * leverage`.
- `ui/components/app/perps/order-entry/components/amount-input/amount-input.test.tsx` — added two regression tests asserting the 100% amount floors to `64.14` (via percentage input and via slider) and that `amount / leverage <= availableBalance`.

## Test plan
**Automated**
- `yarn jest amount-input.test.tsx order-entry.test.tsx --no-coverage` → 76/76 pass (incl. 2 new TAT-3312 tests).
- `yarn lint:changed && yarn verify-locales --quiet` → clean.
- Coverage analyze → PASS (97% on changed file, ≥80% threshold).
- Verify recipe (`recipe.json`) on the fixed build → `summary.json` status=pass, 8/8 nodes ok.
- Baseline recipe (`recipe-baseline.json`) on the buggy build → status=pass (confirms the buggy "Insufficient funds" before the fix).

**Manual (Gherkin)**
```
Given I am on the ETH perps order-entry screen with a funded account
When I set the size to 100% (slider or % input)
Then the submit button shows "Open long ETH" and is enabled
And no "Insufficient funds" error is shown
```

## Evidence
- `before-evidence-ac1-submit-insufficient.png` — buggy: $64.15, disabled "Insufficient funds".
- `after-ac1-submit-actionable.png` — fixed: $64.14, enabled "Open long ETH".
- `before.mp4`, `after.mp4` — full slider-to-100% flow before/after.
- `recipe.json`, `recipe-baseline.json`, `recipe-run/` (summary.json, trace.json), `recipe-coverage.md`, `recipe-quality.json`, `evidence-manifest.json`.

(Media is for the gateway to upload; Arthur decides which to embed.)

## Ticket
- TAT-3312 — https://consensyssoftware.atlassian.net/browse/TAT-3312
