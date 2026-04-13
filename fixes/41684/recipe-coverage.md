# Recipe Coverage Matrix — TAT-2830

| # | AC (verbatim) | Target env | Recipe nodes (IDs) | Screenshot filename | Visual verdict | Justification |
|---|---------------|------------|---------------------|---------------------|----------------|---------------|
| 1 | Flip fee is displayed (not em-dash) | fullscreen | ac1-assert-fee, ac1-screenshot-fee | after-ac1-fee-displayed.png | PROVEN | Fee row shows `-<$0.01` (formatted currency via `formatCurrencyWithMinThreshold`), not `—` |
| 2 | Button copy is "Confirm" (not "Save") | fullscreen | ac2-assert-confirm, ac2-screenshot-confirm | after-ac2-confirm-button.png | PROVEN | Submit button text reads "Confirm" |

## Forbidden pattern scan
1. No `switch` with `default` routing around assertions — N/A (no switch nodes)
2. No `eval_sync` returning skip-reason — N/A
3. No `wait` > 500ms — all waits use `wait_for` with timeouts
4. No DOM-only visual ordering claims — N/A
5. All node IDs properly prefixed: `setup-*`, `ac1-*`, `ac2-*`
6. Both ACs have screenshots
7. No UNTESTABLE `end` nodes

## Trace cross-check
Recipe run: 14/14 nodes PASS. Both `ac1-assert-fee` and `ac2-assert-confirm` passed with assertions verified.

Overall recipe coverage: 2/2 ACs PROVEN (untestable: none, weak: 0, missing: 0)
