# Recipe Coverage Matrix — TAT-2893

| # | AC (verbatim) | Target env | Recipe nodes (IDs) | Screenshot filename | Visual verdict | Justification |
|---|---------------|------------|---------------------|---------------------|----------------|---------------|
| 1 | When user inputs an order size whose margin exceeds the available balance, the submit button must be disabled. | fullscreen | ac1-enter-large-amount, ac1-wait-button-disabled | after-ac1-button-disabled.png | PROVEN | Screenshot shows $999,999,999 entered, button grayed out with "Insufficient funds" text. Margin $333M >> $25.30 available. |
| 2 | When the order size exceeds available margin, the submit button text must change to "Insufficient funds". | fullscreen | ac2-check-button-text | after-ac1-button-disabled.png | PROVEN | Same screenshot — button text reads "Insufficient funds". ext_check_dom assertion passed for text match. |
| 3 | When the order size is within available margin, the submit button must remain enabled with the normal label. | fullscreen | ac3-enter-small-amount, ac3-wait-button-enabled, ac3-check-button-text | after-ac3-button-enabled.png | PROVEN | Screenshot shows $1 entered, button reads "Open Long ETH", is enabled. Margin $0.33 < $25.30 available. |

## Forbidden Pattern Scan
1. No `switch` with `default` routing around assertions — N/A (no switch nodes)
2. No `eval_sync` returning skip-reason strings — N/A
3. No `wait` > 500ms substituting for `wait_for` — N/A (no `wait` actions)
4. No DOM-only assertions for visual ordering — N/A (no z-index/portal claims)
5. All node IDs prefixed `ac<N>-` or `setup-` — PASS
6. All ACs have screenshots — PASS (ac1+ac2 share one, ac3 has one)
7. No `end` node with "UNTESTABLE" — PASS

Overall recipe coverage: 3/3 ACs PROVEN (untestable: none, weak: 0, missing: 0)
