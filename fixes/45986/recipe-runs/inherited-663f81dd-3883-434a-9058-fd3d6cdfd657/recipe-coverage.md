# Recipe coverage

Proof target → node → evidence for this re-validation run (`90e908ada2` on `origin/main`).

| AC | Claim | Proof mode | Primary evidence | Recipe nodes | Verdict | Rationale |
| --- | --- | --- | --- | --- | --- | --- |
| AC1 | Funnel events for unfunded submit-click → deposit opened → deposit confirmed → order submitted | state | unit tests (`perps-order-entry-page.test.tsx`, `usePerpsDepositConfirmation.test.ts`, `perps-deposit-toast.test.tsx`, `unfunded-deposit-funnel.test.ts`); `check diff` jest pass | none in live recipe | PROVEN | Live recipe does not assert Segment. Click, deposit-opened, deposit-confirmed, and `trade_submitted_after_deposit` wiring remain in unit tests. |
| AC2 | Unfunded primary CTA is enabled with clarifying copy, hint, and labeled row Add funds | mixed | `artifacts/recipe-run/screenshots/after-ac2-unfunded-cta.png` (capture-helper) plus `ui.wait_for` on hint, button text, and `:not([disabled])` | `ac2-wait-hint`, `ac2-wait-cta`, `ac2-wait-enabled`, `ac2-screenshot-cta` | PROVEN | PNG shows 0.00 USDC, labeled row Add funds, hint, enabled footer Add funds to trade. All 13 recipe nodes passed. |
| AC3 | Unfunded conversion improved vs 4.8% post-launch | UNTESTABLE | production traffic | none | UNTESTABLE | Slot cannot measure post-launch conversion. Shipped mechanism is the enabled CTA plus funnel events. |

Overall recipe coverage: 2/3 ACs PROVEN (untestable: AC3, weak: 0, missing: 0)
