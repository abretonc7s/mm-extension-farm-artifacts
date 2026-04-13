## Summary

Fixed the perps order-entry screen so a new order with zero available perps balance no longer shows an enabled Long/Short submit action. The page now disables the primary CTA and relabels it to `Add funds`, matching the deposit-oriented recovery path expected by the ticket.

## Root cause

`ui/pages/perps/perps-order-entry-page.tsx:401-405` already computed `availableBalance`, but the submit gating path at `:436-443` did not use that value, and the CTA label selection at `:992-1008` always returned the trade label for new orders. That left zero-balance accounts showing an enabled `Open Long/Short` button. The mobile equivalent (`metamask-mobile-1/app/components/UI/Perps/Views/PerpsOrderView/PerpsOrderView.tsx:1236-1249`, `:1801-1807`) already derives an insufficient-funds CTA from available balance, so the extension had drifted from the source-of-truth behavior.

## Changes

- `ui/pages/perps/perps-order-entry-page.tsx` — added a zero-available-balance guard for `mode=new`, disabled the submit CTA in that state, and switched the label to `Add funds`.
- `ui/pages/perps/perps-order-entry-page.test.tsx` — added coverage for the zero-balance new-order state asserting both disabled CTA behavior and the `Add funds` label.

## Test plan

Automated:
- `node validate-recipe.js --recipe temp/.task/fix/tat-2831-0413-1929/artifacts/recipe.json --cdp-port 6664 --skip-manual` — pass before final capture and after self-review
- `yarn jest ui/pages/perps/perps-order-entry-page.test.tsx --no-coverage` — pass in a clean detached worktree
- `yarn lint && yarn verify-locales --quiet && yarn circular-deps:check` — pass in a clean detached worktree after normalizing unrelated baseline image lint noise there

Manual Gherkin:
- `Given` the wallet is unlocked and the user is on a perps market order-entry screen
- `And` the perps account has zero available balance
- `When` the user opens a new Long or Short order
- `Then` the primary CTA is disabled and prompts the user to add funds instead of submitting a trade

## Evidence

- `before.mp4`
- `after.mp4`
- `before-ac1-disabled-add-funds.png`
- `after-ac1-disabled-add-funds.png`
- `after-evidence-ac1-disabled-add-funds.png`
- `recipe-coverage.md`
- `evidence-manifest.json`

## Ticket

- `TAT-2831` — <https://consensyssoftware.atlassian.net/browse/TAT-2831>
