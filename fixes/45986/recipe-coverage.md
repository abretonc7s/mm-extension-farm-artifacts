# Recipe coverage

| AC | Claim | Proof mode | Primary evidence | Recipe nodes | Verdict | Rationale |
| --- | --- | --- | --- | --- | --- | --- |
| AC2 | Unfunded primary CTA is enabled with hint and labeled row Add funds | mixed | recipe-run `ui.wait_for` on hint, Add funds to trade text, and `:not([disabled])` | `ac2-wait-hint`, `ac2-wait-cta`, `ac2-wait-enabled`, `ac2-screenshot-cta` | PROVEN | Re-validation after row-CTA loading-state fix: recipe PASS. Loading wallets keep the icon-only add-funds control until `isInitialLoading` clears. |

Overall recipe coverage: 1/1 live AC PROVEN
