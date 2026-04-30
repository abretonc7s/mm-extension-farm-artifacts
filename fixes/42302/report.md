# TAT-3015 Report

## Summary
Fixed the Perps home single-position RoE mismatch by making the unrealized P&L summary row use the same position RoE value rendered by the position card when exactly one position is open. Multi-position and zero-position summary behavior remains on the account aggregate.

## Root cause
`ui/components/app/perps/perps-balance-dropdown/perps-balance-dropdown.tsx:71-91` rendered summary RoE from `usePerpsLiveAccount()`, while `ui/components/app/perps/position-card/position-card.tsx:49-52` rendered card RoE from the positions stream. `ui/components/app/perps/perps-view.tsx:87-91` subscribed to both streams independently and only passed `hasPositions`, so a fresh single-position update could reach the card before the account aggregate reached the summary.

## Changes
- `ui/components/app/perps/perps-balance-dropdown/perps-balance-dropdown.tsx` — added an optional `singlePosition` prop and uses its ratio-form RoE for the summary when provided.
- `ui/components/app/perps/perps-view.tsx` — passes the only open position to the balance dropdown when `positions.length === 1`.
- `ui/components/app/perps/perps-balance-dropdown/perps-balance-dropdown.test.tsx` — covers the dropdown preferring single-position RoE over stale account RoE.
- `ui/components/app/perps/perps-view.test.tsx` — covers the integrated Perps view rendering matching summary/card RoE from the same single-position value.

## Test plan
Automated results:
- `node validate-recipe.js --recipe .../recipe.json --cdp-port 6661 --skip-manual` — pass, 8/8 nodes.
- `yarn lint:changed && yarn verify-locales --quiet && yarn circular-deps:check` — pass.
- `yarn jest ui/components/app/perps/perps-balance-dropdown/perps-balance-dropdown.test.tsx ui/components/app/perps/perps-view.test.tsx --no-coverage` — pass, 43 passed / 4 skipped.
- `node temp/runtime/coverage-analyze.js` — `VERDICT: PASS`.

Manual Gherkin:
- Given the wallet is unlocked on the Perps tab
- And exactly one ETH position is open
- When the position stream updates RoE before the account aggregate catches up
- Then the unrealized P&L summary row RoE matches the ETH position card RoE
- And the summary row does not display the stale account RoE

## Evidence
- `before.mp4` — recipe fails on buggy code with summary `1.00%` and card `42.00%`.
- `after.mp4` — recipe passes on fixed code.
- `after-ac1-roe-sync-1777564915393.png` — visible summary/card match.
- `after-ac2-position-source-1777564915490.png` — visible proof after stale account cache injection.
- `recipe-coverage.md` — 2/2 ACs proven.

## Ticket
TAT-3015: https://consensyssoftware.atlassian.net/browse/TAT-3015
