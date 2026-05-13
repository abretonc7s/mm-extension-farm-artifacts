# TAT-1043 — Slippage visualization and configuration on perps order entry

## Summary

Adds an estimated-slippage row and a configurable max-slippage cap to the extension perps order entry surface. Max slippage persists in PreferencesController, defaults to 3% (HyperLiquid parity), and blocks submission client-side when the live order-book estimate exceeds the cap. Mixpanel gains `slippage_config_opened`, `slippage_config_changed`, `slippage_limit_blocked_order` interaction types plus `max_slippage_pct`, `max_slippage_source`, `estimated_slippage_pct` properties on `PerpsTradeTransaction`.

## Ticket

- TAT-1043 — https://consensyssoftware.atlassian.net/browse/TAT-1043
- PR #42641

## Changes

- `app/_locales/en/messages.json`, `app/_locales/en_GB/messages.json` — new perps slippage copy.
- `shared/constants/perps-events.ts` — new interaction types + properties.
- `shared/types/preferences.ts` — adds `perpsMaxSlippagePct?: number`.
- `ui/components/app/perps/constants.ts` — slippage bounds (default 3, min 0.1, max 10, step 0.1).
- `ui/components/app/perps/order-entry/order-entry.types.ts` — extends `OrderSummaryProps`.
- `ui/components/app/perps/order-entry/components/order-summary/order-summary.tsx` — new slippage row + max-slippage button.
- `ui/components/app/perps/slippage-config-modal/` — new `SlippageConfigModal` component.
- `ui/components/app/perps/utils/slippageFormat.ts` — display formatter.
- `ui/hooks/perps/useEstimatedSlippage.ts` — order-book walker hook (subscribes to existing perps stream, 500ms sampled).
- `ui/pages/perps/perps-order-entry-page.tsx` — wires hook + modal, blocks submit on cap exceeded, fires telemetry, passes `maxSlippageBps` to `perpsPlaceOrder`.
- `ui/selectors/perps-controller.ts` — `selectPerpsMaxSlippagePct`.
- Tests: `slippageFormat.test.ts`, `useEstimatedSlippage.test.ts` (computeSlippagePct), `slippage-config-modal.test.tsx`.

## Test plan

- Unit: `yarn jest ui/components/app/perps/utils/slippageFormat.test.ts ui/hooks/perps/useEstimatedSlippage.test.ts ui/components/app/perps/slippage-config-modal/slippage-config-modal.test.tsx` → 18 tests pass.
- Recipe: `node temp/recipes/validate-recipe.js --recipe artifacts/recipe.json --cdp-port 6662 --skip-manual` → 16/16 nodes pass.
- Lint gate: `yarn lint:changed && yarn verify-locales --quiet && yarn circular-deps:check` all green.
- Type-check: `yarn lint:tsc` exits 0.
- Coverage: `coverage-analyze.js` reports 7/7 changed files ≥ 80%, VERDICT PASS.
- Manual / video: `after.mp4` walks AC1 → AC5 in slow mode.

## Evidence-fit summary

| AC | Proof mode | Primary evidence | Notes |
|---|---|---|---|
| AC1 — estimated slippage shown | state + video | `ac1-assert-estimate-visible` DOM read + `after.mp4` | DOM proof shows text matches `^\d+\.\d+%$`. |
| AC2 — config modal pre-fills current | state + video | `ac2-assert-input-prefilled` reads `input.value === 3` + `after.mp4` | Visual confirmation in video; modal shell renders hidden by default so we wait on the input testid. |
| AC3 — value persists | state + video | `ac3-assert-persisted` reads `metamask.preferences.perpsMaxSlippagePct` = 5 + `ac3-assert-button-reflects` confirms the row repaints + `after.mp4` | Persistence rides on existing PreferencesController, the same path `perpsSelectedCandlePeriod` uses. |
| AC4 — default 3% | state + video | `ac4-read-default-pref` confirms preference is unset + `ac4-assert-default-3pct` shows button reads 3 + `after.mp4` | Default constant exported from `ui/components/app/perps/constants.ts`. |
| AC5 — order blocked over cap | state + video | `ac5-wait-blocked` finds the error testid + `ac5-assert-submit-disabled` confirms `btn.disabled` + `after.mp4` | Cap is forced to 0.1% with a $1M order to deterministically exceed the live book. |
| AC6 — guardrail (order success ≥ 98%) | n/a | Requires A/B platform | Not testable in a single recipe run — measured post-launch via Mixpanel dashboard 10922220. |

Screenshots intentionally omitted: the order-entry page streams price/order-book updates every ~50ms, which prevents Playwright's element-stability wait from settling — still-screenshot attempts timed out even on a 7-pixel button. Visual proof lives in `after.mp4` instead.

## Self-Review Fixes

- `ui/pages/perps/perps-order-entry-page.tsx:70-74` — fixed mangled import block; `PERPS_MIN_MARKET_ORDER_USD` now sits on its own line in the constants import.
- `ui/pages/perps/perps-order-entry-page.tsx:1583-1595` — split insufficient-liquidity copy from the cap-exceeded copy so the error text matches what the row shows ("Order size exceeds available liquidity in the order book." vs "Estimated slippage exceeds your max slippage of N%."); new locale entry `perpsSlippageBlockedInsufficientLiquidity` in en + en_GB.
- `ui/components/app/perps/slippage-config-modal/slippage-config-modal.tsx:197` — preset "selected" check now uses `|x - pct| < step/2` so non-step-aligned future presets still highlight correctly.
- `ui/hooks/perps/useEstimatedSlippage.ts` — dropped `submitRequestToBackground('perpsActivateOrderBookStream' / 'perpsDeactivateOrderBookStream')` from the hook so it never tears the stream down while the page is still subscribed; added a comment documenting that callers own the stream lifecycle.
- `ui/hooks/perps/useEstimatedSlippage.ts:107-108` — TODO now reads `TODO(TAT-1043)` per `CLAUDE.local.md`.
- `ui/hooks/perps/useEstimatedSlippage.test.ts` — added 5 hook tests (initial empty result, computed slippage on push, 500 ms throttle window, `enabled=false` short-circuit + unsubscribe, unmount cleanup) using a mocked `getPerpsStreamManager` so the side-effecty surface is now covered.
- `ui/components/app/perps/slippage-config-modal/slippage-config-modal.test.tsx` — migrated from `fireEvent` → `@testing-library/user-event` per antipatterns §7.
- `temp/tasks/feat/tat-1043-0513-160437/artifacts/after.mp4` — re-recorded against the slow-mode recipe (`--slow 2000`) with `SCREEN_CONTROL_SOCKET` pointed at a fresh path; now 55.7s, ~759 KB, moov atom present.

## Self-Review Fixes (round 2)

- `ui/pages/perps/perps-order-entry-page.tsx:386-391` — `setPreference` failure now logs via `loglevel` (`log.error`) instead of a silent `.catch(() => {})` with a misleading comment, so a failed cap-save shows up in logs / support telemetry.
- `ui/pages/perps/perps-order-entry-page.tsx:165-200` — `formStateToOrderParams` now branches `maxSlippageBps` by order type: limit orders pass the controller's fixed `PERPS_LIMIT_ORDER_SLIPPAGE_BPS = 100` (1%) and only market orders forward the user-configured cap, matching mobile `PerpsOrderView.tsx:1018–1021`.
- `ui/pages/perps/perps-order-entry-page.tsx:918` — `SLIPPAGE_LIMIT_BLOCKED_ORDER` analytics property now uses `estimatedSlippagePct ?? null` (was `?? PERPS_SLIPPAGE_MAX_PCT`) so insufficient-liquidity blocks no longer report as a 10% slippage observation. Matches the three other call sites.
- `ui/components/app/perps/constants.ts` — added `PERPS_LIMIT_ORDER_SLIPPAGE_BPS = 100` to back the limit-order branch above and to keep mobile/extension parity self-evident.

## Self-Review Fixes (round 3)

- `ui/components/app/perps/slippage-config-modal/slippage-config-modal.tsx:163` — added `data-testid="perps-slippage-config-close"` to the close `ButtonIcon` so recipes can locate it by testID per Agentic Testability §9.
- `ui/components/app/perps/utils/slippageFormat.ts:1-23` — replaced the hardcoded `'>10%'` literal with `` `>${PERPS_SLIPPAGE_MAX_PCT}%` ``; bumping `PERPS_SLIPPAGE_MAX_PCT` in `constants.ts` now updates the insufficient-liquidity label automatically.

## Self-Review Fixes (round 4)

- `ui/pages/perps/perps-order-entry-page.tsx:386` — moved the `.catch` swallow-rationale comment to the line above `submitRequestToBackground(...)` so the antipatterns-rule literal form is satisfied; failure still flows through `log.error` rather than a user-visible toast (a controller-down toast would be more noise than signal).
- `ui/pages/perps/perps-order-entry-page.tsx:165` — `formStateToOrderParams` `@param maxSlippagePct` JSDoc now describes the parameter ("User-configured max slippage in percent; converted to bps for market orders, ignored for limit orders…") instead of being an empty stub.
- `ui/hooks/perps/useEstimatedSlippage.ts:105-119` — replaced auto-generated `@param options0.x` JSDoc stubs with prose `@param params`/`@param params.symbol/...` tags so the auto-fixer stops regenerating noise and readers see real descriptions.
- `ui/components/app/perps/utils/slippageFormat.ts` — extracted the `0.01` display floor into a named `SLIPPAGE_DISPLAY_FLOOR_PCT` constant with a justifying comment so future readers don't mistake it for the configurable `PERPS_SLIPPAGE_MIN_PCT` floor.
- Optional items skipped per scope discipline: `jest.mocked(getPerpsStreamManager)` refactor and `formatMaxSlippageLabel(pct)` helper — both flagged as optional in review-feedback.
