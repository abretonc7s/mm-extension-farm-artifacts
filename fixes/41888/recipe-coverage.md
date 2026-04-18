# Recipe Coverage Matrix — TAT-2831

| # | AC (verbatim) | Target env | Recipe nodes (IDs) | Screenshot filename | Visual verdict | Justification |
|---|--------------|------------|---------------------|---------------------|----------------|---------------|
| 1 | When the user has no perps balance (availableBalance = 0), the Long/Short submit button on the order entry screen (`data-testid="submit-order-button"`) must be disabled. | fullscreen (home.html) | `setup-inject-zero-balance`, `setup-wait-add-funds`, `ac1-screenshot-submit-button`, `ac1-assert-button-disabled` | `after-ac1-submit-button-state.png` | PROVEN | Screenshot shows "Add funds" button with 0.00 USDC balance. Assertion confirms `btn.disabled = true`. Before screenshot shows same state with `disabled = false` (bug). |

Overall recipe coverage: 1/1 ACs PROVEN (untestable: none, weak: 0, missing: 0)
