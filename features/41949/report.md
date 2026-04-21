# TAT-2802 — Keyboard-first order entry UX

**Ticket**: [TAT-2802](https://consensyssoftware.atlassian.net/browse/TAT-2802)
**Branch**: `feat/tat-2802-keyboard-order-entry-ux`

## Summary

Order entry now auto-focuses the primary input on every perps order screen, auto-selects the existing value on focus, gates submit with inline validation, and shows a contextual `min $10` placeholder plus a `Minimum order size $10` button copy until the size is valid. Pressing Enter from the primary input submits when the button is enabled. Applies uniformly to Trade, Limit, Add/Remove margin, TP/SL, and Position close screens. Leverage input is also keyboard-driven: select-on-focus plus ArrowUp/ArrowDown stepping (clamped to `minLeverage..maxLeverage`).

## Changes

Production code:
- `ui/pages/perps/perps-order-entry-page.tsx` — min-order-size gate on market orders; disabled submit + error-mode button copy when size is below `PERPS_MIN_MARKET_ORDER_USD`; placeholder wiring for size input; root rendered as `<form onSubmit={handleFormSubmit}>` with the primary button set to `type="submit"` so browsers trigger Enter-to-submit natively (disabled buttons block submission per HTML spec).
- `ui/components/app/perps/order-entry/order-entry.tsx` — threads `autoFocus` + `inputRef` through to children; coordinates size-vs-limit focus on order-type switch.
- `ui/components/app/perps/order-entry/order-entry.types.ts` — types for new focus/ref props.
- `ui/components/app/perps/order-entry/components/amount-input/amount-input.tsx` — `autoFocus`, select-all on focus, `placeholder` prop forwarded to `TextField`.
- `ui/components/app/perps/order-entry/components/limit-price-input/limit-price-input.tsx` — `autoFocus` + select-all on focus.
- `ui/components/app/perps/edit-margin/edit-margin-modal-content.tsx` — auto-focus + select-all on margin input; Enter-to-save via `inputProps.onKeyDown`.
- `ui/components/app/perps/update-tpsl/update-tpsl-modal-content.tsx` — auto-focus TP trigger input; select-all for TP and SL; Enter-to-save wired into all four TP/SL inputs, guarded by `isSaving || hasInvalidTPSL`.
- `ui/components/app/perps/close-position/close-position-modal.tsx` — auto-focus the Close button on mount.
- `ui/components/app/perps/order-entry/components/leverage-slider/leverage-slider.tsx` — select-on-focus plus ArrowUp/ArrowDown step handler (clamp to `minLeverage..maxLeverage`); wired `onFocus` and `inputProps.onKeyDown` on the existing `TextField`. Existing `parseInt`/`isNaN` usages migrated to `Number.parseInt`/`Number.isNaN` to clear sonar diagnostics.
- `app/_locales/en/messages.json`, `app/_locales/en_GB/messages.json` — added `perpsMinOrderSize` and `perpsSizePlaceholderMin` with `$1` substitution.

Tests:
- Added focus / select-all / placeholder coverage to amount-input, limit-price-input, edit-margin, update-tpsl, close-position, and perps-order-entry-page test suites. Updated 3 pre-existing tests that asserted the full-width `Open Long ETH` copy with an empty amount (now needs a pre-typed value).
- Added `keyboard submission` describe blocks to perps-order-entry-page, edit-margin, and update-tpsl test suites (Enter submits when valid; Enter is ignored when disabled / invalid / below-min; non-Enter keys ignored).

## Test plan

- `yarn jest <file> --no-coverage` on each changed test file — 230/230 pass (adds 8 Enter-to-submit cases across three suites).
- `node temp/.agent/coverage-analyze.js` — VERDICT PASS (new code above 80%; existing edit-margin 48% is a pre-existing WARNING).
- `yarn lint:changed && yarn verify-locales --quiet && yarn circular-deps:check` — passes.
- Recipe bundle live-validated against CDP 6662 (16/16 main-workflow nodes pass, non-gating review). Main orchestrator: `temp/.task/feat/tat-2802-0420-210839/artifacts/recipe.json` (18 nodes). AC-focused subflow bundle: `temp/agentic/recipes/domains/tat-2802/flows/` (9 subflows). Covers AC1 (market + limit auto-focus), AC2 (select-on-focus), AC3 (`min $10` placeholder), AC5 (disabled&lt;$10 / enabled≥$10), AC6 (`Minimum order size $10` copy), AC7 (Enter-to-submit: UI-success proof via market-detail redirect + live Long position + route lock to `#/perps/market/ETH`; negative coverage reuses a single state-agnostic subflow for empty + below-min).

## Evidence

- `evidence-min-order-empty.png` — empty size → disabled button reading "Minimum order size $10", placeholder "min $10".
- `evidence-valid-amount.png` — after entering $15, button enables and reads "Open Long ETH".
- `evidence-limit-autofocus.png` — switching to limit auto-focuses the limit price input.
- `evidence-enter-submit-redirect.png` — pressing Enter from the focused size input with a valid $15 submits the order and redirects to the ETH market detail page with the new Long position visible.
- `after.mp4` — not captured; capture-helper stream aborted with SCStreamErrorDomain Code=-3805 in this slot (see `/tmp/farmslot-record-20608.log`). Visual ACs fully covered by screenshots + recipe assertions.

## Notes

- `PERPS_MIN_MARKET_ORDER_USD = 10` is the existing constant; no magic numbers introduced.
- Reverse-position and remove-margin screens intentionally unchanged (ticket scope).
