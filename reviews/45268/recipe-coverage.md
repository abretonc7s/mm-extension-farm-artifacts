# Recipe Coverage

Skipped (tier: light).

| # | Review claim | Verdict | Rationale |
|---|--------------|---------|-----------|
| 1 | Upgrade to perps-controller v11 and fix the widened error/order type compile breaks | UNTESTABLE | Recipe and browser validation are skipped at light tier; validated statically instead. |
| 2 | New `ORDER_*` codes map to `perpsOrderFailed` and cancel flows remap that key | UNTESTABLE | Recipe and browser validation are skipped at light tier; validated statically instead. |
| 3 | `EXCHANGE_ACCOUNT_NOT_FOUND` has dedicated “Add funds to start trading.” copy | UNTESTABLE | Recipe and browser validation are skipped at light tier; validated statically instead. |
| 4 | The widened handler preserves a Market/Limit-only toggle | UNTESTABLE | Recipe and browser validation are skipped at light tier; validated with focused unit tests instead. |
| 5 | Real TP/SL children with `parentOrderId` suppress duplicate synthetic rows | UNTESTABLE | Recipe and browser validation are skipped at light tier; validated with focused unit tests instead. |
| 6 | Perps home renders controller-backed content under v11 | UNTESTABLE | Browser validation is skipped at light tier. |
| 7 | ETH market detail streams price/chart/funding/open-interest data | UNTESTABLE | Browser validation is skipped at light tier. |
| 8 | Selecting Limit reveals the price field and recomputes order values | UNTESTABLE | Browser validation is skipped at light tier; related unit tests pass. |
| 9 | Switching back to Market hides the limit-price field | UNTESTABLE | Browser validation is skipped at light tier; related unit tests pass. |

Overall recipe coverage: 0/9 review claims PROVEN (untestable: 1-9 — tier: light, weak: 0, missing: 0)
