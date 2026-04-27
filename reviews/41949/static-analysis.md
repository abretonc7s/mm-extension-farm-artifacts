# Static Analysis

## `yarn lint:tsc`

Result: FAIL.

Observed tail output shows existing-looking Gator permissions type errors outside the PR diff, including:
- `ui/components/multichain/pages/gator-permissions/components/review-gator-permission-item.tsx`: missing exported `GatorPermissionStatus`
- Multiple Gator permission tests/fixtures with `status` not assignable to `PermissionInfoWithMetadata`
- A permissions-controller messenger tuple mismatch involving `customNetworkClientId`

No reported TypeScript errors in the PR's changed perps or `metaRPCClientFactory` files appeared in the captured tail.

## Affected Jest Suites

Result: PASS.

Command:
`yarn jest app/scripts/lib/metaRPCClientFactory.test.js ui/components/app/perps/close-position/close-position-modal.test.tsx ui/components/app/perps/edit-margin/edit-margin-modal-content.test.tsx ui/components/app/perps/order-entry/components/amount-input/amount-input.test.tsx ui/components/app/perps/order-entry/components/leverage-slider/leverage-slider.test.tsx ui/components/app/perps/order-entry/components/limit-price-input/limit-price-input.test.tsx ui/components/app/perps/update-tpsl/update-tpsl-modal-content.test.tsx ui/pages/perps/perps-order-entry-page.test.tsx --no-coverage`

Evidence: 8 suites passed, 228 tests passed.

## Domain Anti-pattern Scan

Result: no dependency or LavaMoat policy concerns; no `chrome.runtime.getBackgroundPage()` usage; new interactive surfaces have `data-testid` coverage.

Findings to carry into review:
- Acceptance criteria gap: the linked ticket requires the empty size placeholder to reflect the relevant constraint, but the live UI and `AmountInput` default still show `0.00`; the minimum is communicated through submit-button copy instead.
- Acceptance criteria risk: live Tab traversal from the size input went to token amount, then the amount slider. That is deterministic and keyboard-reachable, but it does not match the ticket example of size -> leverage -> TP/SL and may need product confirmation.
- No state migration, controller metadata, or LavaMoat policy updates are required by this diff.
