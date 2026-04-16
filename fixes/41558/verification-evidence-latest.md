# Verification Evidence — Latest

## Code Quality

- `eslint` passed on the latest touched parity files:
  - `ui/pages/perps/perps-market-detail-page.tsx`
  - `ui/pages/perps/perps-order-entry-page.tsx`
  - `ui/pages/perps/perps-withdraw-page.tsx`
  - `ui/hooks/perps/usePerpsOrderForm.ts`
  - `ui/hooks/perps/usePerpsOrderFees.ts`
  - `ui/hooks/perps/usePerpsLiquidationPrice.ts`
  - `ui/components/app/perps/edit-margin/edit-margin-modal-content.tsx`
  - `ui/components/app/perps/close-position/close-position-modal.tsx`
  - `ui/components/app/perps/order-entry/components/order-summary/order-summary.tsx`
  - `app/scripts/messenger-client-init/perps-controller-init.ts`
  - `app/scripts/messenger-client-init/perps-controller-init.test.ts`

- `lsp_diagnostics` returned `0` errors for:
  - `ui/pages/perps/perps-market-detail-page.tsx`
  - `ui/pages/perps/perps-order-entry-page.tsx`
  - `ui/pages/perps/perps-withdraw-page.tsx`
  - `ui/hooks/perps/usePerpsOrderForm.ts`
  - `ui/hooks/perps/usePerpsOrderFees.ts`
  - `ui/components/app/perps/edit-margin/edit-margin-modal-content.tsx`

## Tests

- Targeted Jest slice passed:
  - `ui/hooks/perps/usePerpsOrderFees.test.ts`
  - `ui/components/app/perps/edit-margin/edit-margin-modal-content.test.tsx`
  - `ui/components/app/perps/close-position/close-position-modal.test.tsx`
  - `ui/hooks/perps/usePerpsOrderForm.test.ts`
  - `ui/pages/perps/perps-order-entry-page.test.tsx`
  - `app/scripts/messenger-client-init/perps-controller-init.test.ts`
- Result:
  - `6` test suites passed
  - `208` tests passed
- Console baseline:
  - no violations

## Parity Evidence

- Extension composed parity recipe: passing `15/15`
- Current same-window BTC / ETH comparison in the matrix shows:
  - BTC market/order effectively aligned
  - ETH market/order effectively aligned
  - remaining deltas are small live-value / estimate drift

## Diff Scope

- Current tracked diff scope: `20` files
- Current changed files:
  - `.gitignore`
  - `app/scripts/messenger-client-init/perps-controller-init.test.ts`
  - `app/scripts/messenger-client-init/perps-controller-init.ts`
  - `ui/components/app/perps/edit-margin/edit-margin-modal-content.tsx`
  - `ui/components/app/perps/order-entry/components/auto-close-section/auto-close-section.tsx`
  - `ui/components/app/perps/order-entry/components/close-amount-section/close-amount-section.tsx`
  - `ui/components/app/perps/order-entry/components/order-summary/order-summary.tsx`
  - `ui/components/app/perps/perps-balance-dropdown/perps-balance-dropdown.test.tsx`
  - `ui/components/app/perps/perps-balance-dropdown.tsx`
  - `ui/components/app/perps/reverse-position/reverse-position-modal.test.tsx`
  - `ui/components/app/perps/reverse-position/reverse-position-modal.tsx`
  - `ui/components/app/perps/update-tpsl/update-tpsl-modal-content.tsx`
  - `ui/hooks/perps/usePerpsOrderFees.test.ts`
  - `ui/hooks/perps/usePerpsOrderFees.ts`
  - `ui/hooks/perps/usePerpsOrderForm.test.ts`
  - `ui/hooks/perps/usePerpsOrderForm.ts`
  - `ui/pages/perps/perps-market-detail-page.tsx`
  - `ui/pages/perps/perps-order-entry-page.test.tsx`
  - `ui/pages/perps/perps-order-entry-page.tsx`
  - `ui/pages/perps/perps-withdraw-page.tsx`

## Notes

- Temporary parity debug logging has been removed from the code.
- The current verification state reflects the cleaned branch, not the earlier debug-instrumented state.
- `rg "PerpsParityDebug"` over `ui` and `app/scripts` returned no matches.
