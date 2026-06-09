# TAT-1043 Implementation Report

## Summary

Extension perps order entry now shows estimated slippage, lets users configure a persisted max slippage (default 3%), and blocks market-order submit when the live estimate exceeds the cap. Feature is opt-in via remote flag `perps-slippage-config2`.

## Self-Review Fixes

- `ui/components/app/perps/order-entry/components/order-summary/order-summary.tsx:68` — Replaced invalid `Box as="button"` with a native `<button>` so `lint:tsc` passes.
- `ui/components/app/perps/slippage-config/perps-slippage-config-modal.tsx:181` — Moved layout props from `Modal` to `ModalContent` (`Display.Flex`, `ModalContentSize.Sm`) matching `perps-candle-period-modal`.
- `ui/pages/perps/perps-order-entry-page.tsx:988` — Removed redundant `orderMode !== 'close'` guard; `exceedsMaxSlippage` already implies market new/modify with amount.
- `ui/pages/perps/perps-order-entry-page.tsx:1761` — `setMaxSlippage` failures now surface `somethingWentWrong` via `setSubmitError`; analytics fire only after successful persist.
- `ui/hooks/perps/usePerpsMaxSlippage.ts:32` — Documented intentional fallback to default when the initial controller read fails.
- `ui/pages/perps/perps-order-entry-page.test.tsx:464` — Updated for default `$10` testnet amount prefill from `TRADING_DEFAULTS`.
- `ui/pages/perps/perps-order-entry-page.test.tsx:871` — Widened mock with `as const` for `user_configured` slippage source.
- `artifacts/recipe.json` — AC4 now runs after order size + slippage row wait so default `Max: 3%` is assertable.
- `artifacts/recipe-coverage.md` — Added visual/mixed AC coverage matrix.
- `ui/pages/perps/perps-order-entry-page.tsx:682,993-994` — Kept `.toFixed(2)` for estimated/max slippage display to match mobile `PerpsOrderView` parity.

## Self-Review Fixes (round 2)

- `ui/pages/perps/perps-order-entry-page.test.tsx:895` — Assert slippage submit error via `tEn('perpsSlippageExceedsMax', …)` with `bpsToPercent` args instead of a brittle regex.
- `artifacts/evidence-manifest.json` — Added manifest linking `recipe-run/*.png` screenshots to AC1–AC5 visual/mixed proof.

## Self-Review Fixes (round 3)

- `ui/components/app/perps/utils/slippageCalculation.ts:4` — Import `BASIS_POINTS_DIVISOR` from `@metamask/perps-controller` instead of a local duplicate.
- `ui/hooks/perps/usePerpsMaxSlippage.ts:5` — Derive `MaxSlippageSource` from `PERPS_EVENT_VALUE.MAX_SLIPPAGE_SOURCE` to stay coupled to controller analytics literals.
- `ui/hooks/perps/usePerpsMaxSlippage.test.ts` — Add unit tests for default fallback, user-configured resolution, controller-read error fallback, and `setMaxSlippage` persistence.
- `ui/components/app/perps/order-entry/components/order-summary/order-summary.tsx:93` — Add `sr-only` + `aria-live="polite"` exceed label using `perpsSlippageExceeded` for screen-reader users.
- `ui/components/app/perps/order-entry/components/order-summary/order-summary.test.tsx` — Assert exceed indicator exposes the screen-reader message.
