# Recipe coverage

| AC | Claim | Proof mode | Primary evidence | Recipe nodes | Verdict | Rationale |
| --- | --- | --- | --- | --- | --- | --- |
| AC1 | Funnel events for unfunded submit-click → deposit opened → deposit confirmed → order submitted | state | unit tests (`perps-order-entry-page.test.tsx`, `usePerpsDepositConfirmation.test.ts`, `perps-deposit-toast.test.tsx`, `unfunded-deposit-funnel.test.ts`) | none in live recipe | PROVEN | Live Segment capture returned no events on this webpack-dev slot. Click, deposit-opened, deposit-confirmed, and `trade_submitted_after_deposit` page wiring are covered by unit tests. Deposit confirmation itself cannot be opened here because EVM RPC is unhealthy (`Unable to connect to Ethereum` / Worker fetch Illegal invocation). |
| AC2 | Unfunded primary CTA is enabled with clarifying copy, hint, and labeled row Add funds | mixed | `after-ac2-unfunded-cta.png` (capture-helper snapshot) plus `ui.wait_for` on hint, button text, and `:not([disabled])` | `ac2-wait-hint`, `ac2-wait-cta`, `ac2-wait-enabled`, `ac2-screenshot-cta` | PROVEN | Baseline showed disabled Insufficient funds at $0.00. After: enabled Add funds to trade, hint, labeled row button. |
| AC3 | Unfunded conversion improved vs 4.8% post-launch | UNTESTABLE | production traffic | none | UNTESTABLE | Slot cannot measure post-launch conversion. The shipped mechanism is the enabled CTA plus funnel events. |

Overall recipe coverage: 2/3 ACs PROVEN (untestable: AC3, weak: 0, missing: 0)
