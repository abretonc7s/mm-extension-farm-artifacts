# Recipe coverage — TAT-3851

Recipe: `artifacts/recipe.json` · Run: `artifacts/recipe-run/` · Verdict: **pass** (exit 0, 30/30 nodes)

| AC | Proof mode | Primary evidence | Recipe nodes | Verdict | Rationale |
|----|-----------|------------------|--------------|---------|-----------|
| AC1 — Perps tab shows a "Top movers" section with a Gainers/Losers toggle | visual | `evidence-ac1-top-movers-section.png` (capture-helper) | `gate-scroll-to-section`, `ac1-wait-section`, `ac1-wait-gainers-active`, `ac1-wait-losers-inactive`, `ac1-wait-pill-grid`, `ac1-read-gainers-order`, `ac1-screenshot-section` | PROVEN | Section, both toggle halves, and the eight ranked pills are visible on the Perps tab. `aria-pressed=true` on Gainers / `false` on Losers proves the default direction from the accessibility tree, not from styling. The screenshot shows a 2-column × 4-row grid of green (positive) changes in descending order. |
| AC2 — Toggling re-sorts the visible pills without a full page reload/flash | mixed | `evidence-ac2-losers-selected.png` (capture-helper) | `ac2-press-losers`, `ac2-scroll-to-section`, `ac2-wait-losers-active`, `ac2-wait-gainers-inactive`, `ac2-wait-no-skeleton`, `ac2-wait-section-still-mounted`, `ac2-read-losers-order`, `ac2-screenshot-losers` | PROVEN | Pressing Losers swaps both `aria-pressed` states. `perps-top-movers-skeleton` is asserted **absent** (`visible: false`) and `perps-top-movers-list` **present** across the switch — together these prove the grid never fell back to a loading state, which is what a reload/flash would produce. The screenshot shows an entirely different, all-red descending ranking in the same on-screen section. |
| AC3 — Header is clickable, navigating to the market list pre-sorted by 24h price change in the selected direction | mixed | `evidence-ac3-market-list-presorted.png` (capture-helper) | `ac3-scroll-to-header`, `ac3-press-header`, `ac3-wait-market-list`, `ac3-wait-sort-preset`, `ac3-screenshot-market-list` | PROVEN | The header press lands on `parent-selector-perps-market-list`, and `sort-dropdown-button` is asserted to read "Price change" rather than the default "Volume". The screenshot shows the list opening ascending (ZORA −18.82%, SKR −17.43%, HYPE −8.55% …), matching the Losers direction the user had selected — proving the direction carries, not just the field. |
| AC4 — Section renders a skeleton while live data loads | state | `yarn jest … -t 'renders the loading skeleton while market data is loading'` | `ac4-skeleton-unit-test`, `ac4-assert-test-ran` | PROVEN | The stream is warm-cached in this slot, so the initial-loading frame is not reliably reproducible on screen; a screenshot would be theatre. The test asserts `perps-top-movers-skeleton` present **and** `perps-top-movers-list` absent while `isInitialLoading` is true. `assert_output contains "1 passed"` on stderr guards against `jest -t` exiting 0 with zero matched tests. |

## Would reverting the change fail this recipe?

Yes, at every AC:

- Remove `PerpsTopMovers` from `perps-view.tsx` → `gate-scroll-to-section` and `ac1-wait-section` time out.
- Remove the `aria-pressed` toggle wiring → `ac1-wait-gainers-active` / `ac2-wait-losers-active` time out.
- Remount the section on direction change (e.g. keying it on `direction`) → `ac2-wait-no-skeleton` sees the skeleton and fails.
- Revert the `sort` / `direction` search-param handling in `ui/pages/perps/market-list/index.tsx` → `ac3-wait-sort-preset` reads "Volume" and times out.
- Remove the skeleton branch → the AC4 jest case fails.

Overall recipe coverage: 4/4 ACs PROVEN (untestable: none, weak: 0, missing: 0)
