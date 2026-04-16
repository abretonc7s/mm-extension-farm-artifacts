# Recipe Coverage Matrix

| # | AC (verbatim) | Target env | Recipe nodes (IDs) | Screenshot filename | Visual verdict | Justification |
|---|---------------|------------|---------------------|---------------------|----------------|---------------|
| 1 | "PnL should not be double-counted in total balance display in PerpsBalanceDropdown — accountValue should use totalBalance directly without adding unrealizedPnl" | fullscreen | ac1-wait-balance-dropdown, ac1-eval-balance-state, ac1-screenshot-balance-dropdown | evidence-ac1-perps-balance-dropdown.png | PROVEN | Screenshot shows Total balance: $11,246.78 which matches totalBalance (11246.784) from eval_ref. Unrealized P&L (+$0.07) shown separately. If double-counted, total would be ~$11,246.85. |
| 2 | "PnL should not be double-counted in total balance display in PerpsMarketBalanceActions — accountValue should use totalBalance directly without adding unrealizedPnl" | fullscreen | (none) | (none) | UNTESTABLE | PerpsMarketBalanceActions is not imported by any page component — not rendered in any live route. Code change is identical to AC1 (same 1-line fix). Verified via code review only. |
| 3 | "PerpsBalanceDropdown should show PerpsControlBarSkeleton while usePerpsLiveAccount reports isInitialLoading" | fullscreen | (none) | (none) | UNTESTABLE | isInitialLoading is a transient hook state that cannot be triggered externally via CDP. Covered by unit test (perps-balance-dropdown.test.tsx: "renders loading skeleton when account data is still loading"). |

Overall recipe coverage: 1/3 ACs PROVEN (untestable: AC2 — component not rendered in live routes, AC3 — transient hook state)
