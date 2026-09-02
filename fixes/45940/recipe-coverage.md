# Recipe coverage — TAT-3851

Recipe: `artifacts/recipe.json` · Run: `artifacts/recipe-run/` · Verdict: **pass** (exit 0, 30/30 nodes)

| AC | Proof mode | Primary evidence | Recipe nodes | Verdict | Rationale |
|----|-----------|------------------|--------------|---------|-----------|
| AC1 — Perps tab shows a "Top movers" section with a Gainers/Losers toggle | visual | `recipe-run/screenshots/evidence-ac1-top-movers-section.png` (capture-helper) | `gate-scroll-to-section`, `ac1-wait-section`, `ac1-wait-gainers-active`, `ac1-wait-losers-inactive`, `ac1-wait-pill-grid`, `ac1-read-gainers-order`, `ac1-screenshot-section` | PROVEN | Section, both toggle halves, and ranked pills are visible. Gainers is the filled control. Pills are content-width and wrap; labels (ticker + signed %) are fully visible. |
| AC2 — Toggling re-sorts the visible pills without a full page reload/flash | mixed | `recipe-run/screenshots/evidence-ac2-losers-selected.png` (capture-helper) | `ac2-press-losers`, `ac2-scroll-to-section`, `ac2-wait-losers-active`, `ac2-wait-gainers-inactive`, `ac2-wait-no-skeleton`, `ac2-wait-section-still-mounted`, `ac2-read-losers-order`, `ac2-screenshot-losers` | PROVEN | Losers is selected; the same section lists falling markets with negative changes. Skeleton asserted absent; list stays mounted. |
| AC3 — Header opens the market list pre-sorted by 24h price change in the selected direction | mixed | `recipe-run/screenshots/evidence-ac3-market-list-presorted.png` (capture-helper) | `ac3-scroll-to-header`, `ac3-press-header`, `ac3-wait-market-list`, `ac3-wait-sort-preset`, `ac3-screenshot-market-list` | PROVEN | Markets page opens with sort chip "Price change". List is ascending losers (SKR, OG, AAPL, ZORA, …), matching the Losers direction still selected. |
| AC4 — Section renders a skeleton while live data loads | state | `yarn jest … -t 'renders the loading skeleton while market data is loading'` | `ac4-skeleton-unit-test`, `ac4-assert-test-ran` | PROVEN | Stream is warm-cached in this slot, so the loading frame is not a reliable screenshot. The unit test asserts skeleton present and list absent while `isLoading` is true. |

Overall recipe coverage: 4/4 ACs PROVEN
