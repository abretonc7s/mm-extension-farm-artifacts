| # | Review claim (verbatim) | Target env | Recipe nodes | Screenshot | Verdict | Justification |
|---|---|---|---|---|---|---|
| 1 | "Confirm a row of category pills renders under the Withdraw / Add funds buttons — `All` plus each category present in live market data (currently Crypto, Stocks, Commodities)." | fullscreen | none | none | UNTESTABLE | Static-only execution contract; no current runtime evidence was permitted. |
| 2 | "Narrow the window until the pills overflow and confirm the row scrolls horizontally instead of wrapping or clipping." | fullscreen | none | none | UNTESTABLE | Static-only execution contract. Source now clips overflow into More, so the PR claim is stale. |
| 3 | "Click `Crypto`. The market list opens at `#/perps/market-list?filter=crypto` with the filter dropdown already reading `Crypto`." | fullscreen | none | none | UNTESTABLE | Static-only execution contract. The route remains, but FilterSelect was replaced by an active category pill. |
| 4 | "Go back, then Tab to a pill and press Enter — it navigates the same way a click does." | fullscreen | none | none | UNTESTABLE | Static-only execution contract; unit evidence exists but no current browser keyboard run was permitted. |

Overall recipe coverage: 0/4 review claims PROVEN (untestable: 1-4 static-code skip, weak: 0, missing: 0)
