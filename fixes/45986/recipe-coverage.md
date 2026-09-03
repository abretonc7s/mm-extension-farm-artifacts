# Recipe coverage

| AC | Claim | Proof mode | Primary evidence | Recipe nodes | Verdict | Rationale |
| --- | --- | --- | --- | --- | --- | --- |
| AC2 | Unfunded primary CTA is enabled with hint and labeled row Add funds | mixed | recipe-run `ui.wait_for` on hint, Add funds to trade text, and `:not([disabled])` | `ac2-wait-hint`, `ac2-wait-cta`, `ac2-wait-enabled`, `ac2-screenshot-cta` | PROVEN | Re-validation after rebase + loading-state fix: recipe PASS. Loading wallets stay on a disabled trade CTA until `isInitialLoading` clears. |

Overall recipe coverage: 1/1 live AC PROVEN (this run re-validated the inherited AC2 recipe only)
