| # | AC (verbatim) | Target env | Recipe nodes (IDs) | Screenshot filename | Visual verdict | Justification |
|---|---|---|---|---|---|---|
| 1 | When the user has no perps balance, the Long/Short button must be disabled or must show an error state prompting the user to deposit funds. | fullscreen | `ac1-wait-submit-disabled`, `ac1-assert-submit-label`, `ac1-screenshot-disabled-submit` | `after-evidence-ac1-disabled-add-funds.png` | PROVEN | The screenshot visibly shows the BTC order-entry screen with `Available to trade $0.00 USDC` and a disabled `Add funds` CTA at the bottom, matching the zero-balance disabled-state fix. `trace.json` records all three `ac1-` nodes as passing. |

Overall recipe coverage: 1/1 ACs PROVEN (untestable: none, weak: 0, missing: 0)
