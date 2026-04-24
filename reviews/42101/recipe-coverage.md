# Recipe Coverage — PR #42101

Recipe: `temp/tasks/review/42101-0424-182317/artifacts/recipe.json`
Live run: 17/17 nodes PASS (trace.json); auto-issue review: clean (0 warnings, 0 errors, 0 exceptions).

## Fixture state (setup)

`perpsGetAccountState` returned:
```
availableBalance:         "0"
availableToTradeBalance:  "29.6726825"
totalBalance:             "29.6726825"
marginUsed:               "0"
```
Matches AC1's target scenario exactly: HL unified account funded only by spot USDC (withdrawable=0, tradeable>0).

## Per-AC matrix

| # | AC (verbatim) | Target env | Recipe nodes | Screenshot | Visual verdict | Justification |
|---|---|---|---|---|---|---|
| 1 | "HyperLiquid unified accounts funded only by spot USDC are now recognized as tradeable; perps home shows funded balance, order entry is enabled." | fullscreen (home.html) | `setup-probe-account`, `setup-assert-tradeable-positive`, `ac1-nav-perps-home`, `ac1-read-home-available`, `ac1-assert-home-shows-tradeable`, `ac1-screenshot-home-funded`, `ac1-nav-order-entry`, `ac1-screenshot-market-detail`, `ac1-open-order-entry`, `ac1-wait-order-entry`, `ac1-read-submit-button`, `ac1-screenshot-order-entry` | `evidence-ac1-home-funded.png`, `evidence-ac1-market-detail-funded.png`, `evidence-ac1-order-entry-enabled.png` | **PROVEN** | Order-entry page renders "Available to trade: 29.67 USDC" and the primary "Open long ETH" button is visible, despite `availableBalance="0"`. Home perps tab shows Total balance $29.67 and market list, not the empty-balance CTA state. Both surfaces read `getTradeableBalance(account)` and behave as funded. |
| 2 | "Live updates flow through the existing PerpsStreamManager via the new spotState WS; no extension-side polling added." | N/A (negative arch claim) | n/a | n/a | **UNTESTABLE** | Negative claim about absence of polling. Validated by reading the PR diff: no new `setInterval`, no new extension-side polling hook, no new controller invocations — the new `availableToTradeBalance` field is pushed by `@metamask/perps-controller@^4.0.0` through the existing `usePerpsLiveAccount` channel. No extension-owned subscription is introduced. Code review only; cannot be proven via a live screenshot. |
| 3 | "Withdraw screens still display withdrawable-only balance (no behavioral regression)." | fullscreen (home.html) | `ac3-nav-withdraw`, `ac3-wait-withdraw`, `ac3-read-withdraw-available`, `ac3-screenshot-withdraw` | `evidence-ac3-withdraw-zero-balance.png` | **PROVEN** | On the same account that shows $29.67 tradeable on order-entry, the withdraw page renders "Available balance: $0.00" and the Withdraw button is disabled. Confirms `ui/pages/perps/perps-withdraw-page.tsx:97` still reads `account.availableBalance` and has NOT been rerouted through `getTradeableBalance`. No regression. |
| 4 | "Non-HyperLiquid / non-unified providers fall back to availableBalance unchanged." | N/A (no non-HL provider available in slot) | n/a | n/a | **UNTESTABLE** | Slot has only HyperLiquid mainnet active; swapping providers mid-run is out of scope for this fixture. Fallback is covered by the unit test added in `ui/components/app/perps/perps-view.test.tsx` ("falls back to availableBalance when availableToTradeBalance is absent" — asserts `HAS_PERP_BALANCE=true` when `availableBalance=100, availableToTradeBalance=undefined`) and by the `getTradeableBalance` implementation (`account?.availableToTradeBalance ?? account?.availableBalance ?? '0'`) which is a 1-line nullish coalesce. |

## Trace cross-check

All 17 drafted AC/plumbing nodes report `ok: true` in `trace.json`. The terminal `done` node reports `status: pass`. No drafted node is missing from the trace, no node failed.

## Forbidden-pattern scan

- `switch` with `default` routing around a primary assertion: none.
- `eval_sync` returning a "skip reason" string: none.
- `wait` > 500ms as a `wait_for` substitute: recipe uses only `wait_for` with test_id targets.
- DOM-only assertions for visual-ordering claims: none (no ordering claims).
- Node ID prefixes: all start with `setup-`, `ac1-`, `ac3-`, `teardown-`, or `done`. ✓
- Missing screenshot on a visual AC: AC1 and AC3 both have screenshots matching their claims. ✓

## Overall

Overall recipe coverage: **2/4 ACs PROVEN** (untestable: AC2 — no-polling negative claim, AC4 — no non-HL provider in slot; weak: 0, missing: 0).

Both untestable ACs are non-blocking: AC2 is a negative architectural claim verified by diff review (no polling code added), and AC4 is covered by the unit test added in this PR for the fallback branch.
