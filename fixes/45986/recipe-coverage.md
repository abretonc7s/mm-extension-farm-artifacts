# Recipe coverage

| AC | Claim | Proof mode | Primary evidence | Recipe nodes | Verdict | Rationale |
| --- | --- | --- | --- | --- | --- | --- |
| AC1 | Funnel events for unfunded submit-click → deposit opened → deposit confirmed → order submitted | state | unit tests (`perps-order-entry-page.test.tsx`, `usePerpsDepositConfirmation.test.ts`, `perps-deposit-toast.test.tsx`, `unfunded-deposit-funnel.test.ts`) plus `mm-harness check diff` jest pass | none in live recipe | PROVEN | Live Segment is not collected on this webpack-dev slot. Click, deposit-opened, deposit-confirmed, and `trade_submitted_after_deposit` stay covered by unit tests. |
| AC2 | Unfunded primary CTA is enabled with clarifying copy, hint, and labeled row Add funds | mixed | `recipe-run/screenshots/after-ac2-unfunded-cta.png` (capture-helper) plus `ui.wait_for` on hint, button text, and `:not([disabled])` | `ac2-wait-hint`, `ac2-wait-cta`, `ac2-wait-enabled`, `ac2-screenshot-cta` | PROVEN | After rebase onto origin/main the unfunded BTC trade screen still shows 0.00 USDC, a labeled Add funds row control, the hint, and an enabled Add funds to trade footer. |
| AC3 | Unfunded conversion improved vs 4.8% post-launch | UNTESTABLE | production traffic | none | UNTESTABLE | Slot cannot measure post-launch conversion. |

Overall recipe coverage: 2/3 ACs PROVEN (untestable: AC3, weak: 0, missing: 0)
