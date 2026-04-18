# Recipe Coverage Matrix — TAT-2831

| # | AC (verbatim) | Target env | Recipe nodes (IDs) | Screenshot filename | Visual verdict | Justification |
|---|--------------|------------|---------------------|---------------------|----------------|---------------|
| 1 | When the user has no perps balance (availableBalance = 0), the Long/Short submit button on the order entry screen (`data-testid="submit-order-button"`) must be disabled. | fullscreen (home.html) | `setup-inject-zero-balance`, `setup-wait-add-funds`, `ac1-screenshot-submit-button`, `ac1-assert-button-disabled` | `after-ac1-submit-button-state.png` | PROVEN | Screenshot shows "Add funds" button with 0.00 USDC balance. Assertion confirms `btn.disabled = true`. Before screenshot shows same state with `disabled = false` (bug). |
| 2 | When the user has no perps balance, the market-detail page (`data-testid="perps-market-detail-page"`) must still show Long/Short CTAs (`perps-long-cta-button`, `perps-short-cta-button`) and must NOT show `perps-add-funds-cta-button`. | fullscreen (home.html) | `ac2-nav-market-detail`, `ac2-wait-page-load`, `ac2-inject-zero-balance`, `ac2-wait-cta-buttons`, `ac2-screenshot-market-detail`, `ac2-assert-buttons-restored` | `after-ac2-market-detail-cta-state.png` | PROVEN | After screenshot shows Long/Short buttons side-by-side at zero balance. Before screenshot shows single "Add funds" CTA (old blocking behavior). Assertion confirms `hasLong=true, hasShort=true, hasAddFunds=false`. |

Overall recipe coverage: 2/2 ACs PROVEN (untestable: none, weak: 0, missing: 0)
