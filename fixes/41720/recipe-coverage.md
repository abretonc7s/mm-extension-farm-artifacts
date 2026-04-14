# Recipe Coverage Matrix — TAT-2794

## AC Source
Derived from ticket description (Acceptance Criteria field: _Not specified_, inferred from description).

## Coverage Matrix

| # | AC (verbatim) | Target env | Recipe nodes (IDs) | Screenshot filename | Visual verdict | Justification |
|---|---------------|------------|---------------------|---------------------|----------------|---------------|
| 1 | Position card must show both USD P&L value (e.g., +$0.87) AND percentage P&L (ROE%) together — e.g., `+$0.87 (26.00%)` | fullscreen (home.html) | `ac1-wait-position-card`, `ac1-assert-roe-element`, `ac1-screenshot-position-card` | `after-ac1-position-card-roe.png` | PROVEN | Screenshot shows ETH position row displaying `+$0.88 (26.30%)` — both USD P&L and ROE% visible |
| 2 | The percentage value must use formatNumber with appropriate precision (% suffix, parentheses) | fullscreen (home.html) | `ac2-assert-roe-format`, `ac2-screenshot-roe-format` | `after-ac2-roe-format.png` | PROVEN | Screenshot shows `(26.30%)` — percentage format with 2 decimal places confirmed; recipe assertion verified `hasPercent: true` on the DOM element |

## Forbidden Pattern Scan (step 7a)
1. No `switch` with `default` routing around AC assertions ✓
2. No `eval_sync` returning skip-reason string ✓
3. No `wait` > 500ms ✓
4. No DOM-only assertions for visual ordering ✓
5. All node IDs start with `setup-`, `ac1-`, `ac2-`, or `teardown-` ✓
6. Both ACs have screenshot nodes ✓
7. No `end` with "UNTESTABLE" when flow can build state ✓

## Trace Confirmation
All nodes in trace.json passed: `setup-navigate`, `ac1-wait-position-card`, `ac1-assert-roe-element`, `ac1-screenshot-position-card`, `ac2-assert-roe-format`, `ac2-screenshot-roe-format`, `teardown-end`.

Overall recipe coverage: 2/2 ACs PROVEN (untestable: none, weak: 0, missing: 0)
