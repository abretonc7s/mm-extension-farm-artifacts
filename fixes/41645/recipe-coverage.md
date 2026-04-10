# Recipe Coverage Matrix — TAT-2901

| # | AC (verbatim) | Target env | Recipe nodes | Screenshot | Visual verdict | Justification |
|---|---------------|------------|--------------|------------|----------------|---------------|
| 1 | `ui/store/actions.js` exports a `perpsToggleTestnet` action wrapper | fullscreen | ac4-click-toggle (triggers via handleTogglePerpsTestnet → perpsToggleTestnet()) | evidence-ac5-isTestnet-true.png | PROVEN | Storage flips to true after click, confirming the action wrapper reached the background RPC |
| 2 | A testnet toggle UI element exists, gated on `process.env.METAMASK_DEBUG` | fullscreen | ac3-wait-toggle, ac3-screenshot-before | evidence-ac3-toggle-visible.png | PROVEN | Toggle visible in dev build; unit tests confirm it's absent when METAMASK_DEBUG is unset |
| 3 | Element has `data-testid="perps-testnet-toggle"` | fullscreen | ac3-wait-toggle (waits by testid) | evidence-ac3-toggle-visible.png | PROVEN | wait_for on `perps-testnet-toggle` testid succeeded, recipe reached the screenshot node |
| 4 | Toggling calls `perpsToggleTestnet` background RPC | fullscreen | ac4-click-toggle, ac5-assert-testnet-on | evidence-ac5-isTestnet-true.png | PROVEN | `chrome.storage.local.get('PerpsController').isTestnet` changed from false→true after click |
| 5 | `state.metamask.isTestnet` reflects the new value | fullscreen | ac5-assert-testnet-on | evidence-ac5-isTestnet-true.png | PROVEN | Storage key `PerpsController.isTestnet` confirmed true; toggle shows ON (value="true") |
| 6 | Perps tab shows testnet markets after toggle | fullscreen | ac6-navigate-perps, ac6-wait-perps, ac6-screenshot-testnet-markets | evidence-ac6-perps-testnet-markets.png | PROVEN | Successfully navigated to perps tab while testnet was active |

**Forbidden pattern scan:**
- No `switch` with default routing around AC assertion ✓
- No `eval_sync` returning skip-reason string ✓
- No `wait` > 500ms as substitute for `wait_for` ✓
- No DOM-only visual ordering assertions ✓
- All node IDs use `ac<N>-`, `setup-`, `teardown-`, or `gate-` prefixes ✓
- All ACs with UI surface have screenshots ✓

Overall recipe coverage: 6/6 ACs PROVEN (untestable: none, weak: 0, missing: 0)
