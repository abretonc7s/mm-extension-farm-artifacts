| # | AC (verbatim) | Proof mode | Primary evidence | Recipe nodes (IDs) | Visual file if any | Evidence verdict | Justification |
|---|---------------|------------|------------------|---------------------|--------------------|------------------|---------------|
| 1 | "Expected: max leverage displayed in market page header, as a pill similar to mobile" | mixed | screenshot plus DOM state assertion | `gate-read-btc-market-data`, `ac1-assert-header-max-leverage`, `ac1-screenshot-max-leverage-pill` | `after-evidence-ac1-max-leverage-pill.png` | PROVEN | `trace.json` shows BTC market data has `maxLeverage: "40x"` and the AC assertion passed with `pillText: "40x"` plus `headerIncludesPill: true`; direct screenshot inspection shows the `40x` pill visible beside `BTC-USD` in the market detail header. |

Overall recipe coverage: 1/1 ACs PROVEN (untestable: none, weak: 0, missing: 0)
