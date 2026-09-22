# TAT-3853 report

Unfunded Extension trade-screen users were staring at a disabled Insufficient funds button. The primary CTA now says Add funds to trade, stays enabled, and is backed by funnel events.

## Ticket

[TAT-3853](https://consensyssoftware.atlassian.net/browse/TAT-3853) — Investigate and improve deposit conversion for unfunded trade-screen users.

## Changes

- `ui/pages/perps/perps-order-entry-page.tsx` — treat displayed-zero balance as unfunded, enable the primary CTA, hint, funnel click + post-deposit order event
- `ui/components/app/perps/order-entry/components/amount-input/amount-input.tsx` — labeled Add funds on the available-to-trade row at $0
- `ui/components/app/perps/hooks/usePerpsDepositConfirmation.ts` — `deposit_flow_opened`
- `ui/components/app/perps/perps-deposit-toast.tsx` — `deposit_confirmed`
- `ui/components/app/perps/utils/unfunded-deposit-funnel.ts` — session flag to join the funnel
- `shared/constants/perps-events.ts`, locales, tests

## Evidence fit

| AC | Mode | Evidence | Omitted |
| --- | --- | --- | --- |
| AC1 funnel events | state | unit tests | live Segment capture (collector empty on webpack-dev) |
| AC2 enabled CTA + copy | mixed | `before-ac2-unfunded-cta.png`, `after-ac2-unfunded-cta.png` | later recipe-run screenshots that raced to Account 1 |
| AC3 4.8% conversion | UNTESTABLE | production | n/a |

## Test plan

1. Open `#/perps/trade/BTC` on a zero-balance account.
2. Confirm the footer is enabled Add funds to trade, the hint is visible, and the row shows a labeled Add funds button.
3. Click it (geo-block if ineligible; otherwise deposit confirmation when EVM RPC is healthy).
4. `yarn jest` on the files listed in the commit.

Recipe: `temp/tasks/feat/tat-3853-0902-223539/artifacts/recipe.json` passed.

## Self-Review Fixes
- `app/_locales/en_GB/messages.json:7248` — copied `perpsAddFundsHint` and `perpsAddFundsToTrade` from `en` so `yarn verify-locales --quiet` passes
- `temp/tasks/feat/tat-3853-0902-223539/artifacts/recipe.json:51` — select the fixture unfunded wallet (dev6) by address instead of assuming Account 2 has a zero Perps balance
- `ui/pages/perps/perps-order-entry-page.test.tsx` — cover dust below `PERPS_UNFUNDED_BALANCE_THRESHOLD_USDC` so reverting the threshold to `<= 0` fails
- `ui/pages/perps/perps-order-entry-page.test.tsx` — assert `trade_submitted_after_deposit` on a successful order after `markUnfundedDepositFunnel()`
- `ui/components/app/perps/order-entry/components/amount-input/amount-input.tsx:428` — `ariaLabel={t('addFunds')}` on the funded + icon branch
