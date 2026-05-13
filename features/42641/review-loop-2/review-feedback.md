# Self-Review: TAT-1043

## Verdict: ISSUES

## Summary
Worker added an estimated-slippage row + a configurable max-slippage cap to the perps order entry surface, persisted via PreferencesController, with telemetry, locale strings, a hook, modal, and submit-blocking. Functionality is correct, tests + recipe pass, and mobile parity is intentionally documented. A handful of cheap nitpicks (auto-generated JSDoc stubs, catch-comment placement, a hardcoded display threshold) should be cleaned before ship.

## Type Check
- Result: PASS
- New errors: none

## Tests
- Result: PASS
- Details: 7 affected suites (`slippageFormat`, `useEstimatedSlippage`, `slippage-config-modal`, `order-summary`, `constants`, `perps-controller` selector, `perps-order-entry-page`) → 178 tests pass.

## Test Quality
- Findings: none material. No `should` names, `userEvent` used, AAA pattern observed, assertions specific (`toBeCloseTo`, `toHaveBeenCalledWith(5)`, `toBe('>10%')`). Tests assert behavior that flips on revert (e.g. `computeSlippagePct` levels math, throttle window, unsubscribe). One small nit:
  - **ui/hooks/perps/useEstimatedSlippage.test.ts:1** — relies on `require('../../providers/perps')` after `jest.mock`; cleaner pattern is `jest.mocked(getPerpsStreamManager)`, but acceptable.

## Domain Anti-Patterns
- Findings:
  - **ui/pages/perps/perps-order-entry-page.tsx:386-391** — `setPreference` `.catch(...)` only `log.error`s; per antipatterns §"Error handling" the exemption requires the explanatory comment **on the line above the `catch`**. Comment is inside the block, not above. Either lift the comment above the `.catch(` line or add a user-visible state (toast / banner) on persistence failure — otherwise a stale cap on next session is silent to the user.

## Mobile Comparison
- Status: DIVERGES (intentional)
- Details: Mobile `PerpsOrderView.tsx:1018-1021` passes `ORDER_SLIPPAGE_CONFIG.DefaultMarketSlippageBps` (300) / `DefaultLimitSlippageBps` (100) — fixed values. Extension forwards user-configurable cap for market, fixed 100 bps for limit. Divergence is acknowledged with `TODO(TAT-1043)` in `useEstimatedSlippage.ts` ("extension-first implementation. Port to mobile in the follow-up story"). Limit-order slippage parity restored via `PERPS_LIMIT_ORDER_SLIPPAGE_BPS`. Formatting parity: no `.toFixed(N)` or `{min:2,max:2}` used on currency — slippage `.toFixed(2)` is a percent, not a price/value, so the perps decimals rule does not apply.

## LavaMoat Policy
- Status: N/A
- Details: No `package.json` / `yarn.lock` / `lavamoat/browserify/**` changes.

## Fix Quality
- Best approach: yes — persistence via `submitRequestToBackground('setPreference', ...)` mirrors the established `perpsSelectedCandlePeriod` path; selector lives next to existing perps selectors; hook subscribes to the existing stream rather than activating a new one; `computeSlippagePct` is exported pure for unit testing.
- Would not ship: none of the issues below would block, but several are easy-fix nits.
- Test quality: good — failure paths (`enabled=false` unsubscribe, throttle drop, insufficient liquidity, malformed levels, out-of-range modal input) are covered.
- Brittleness: low. One small concern: `useEstimatedSlippage` resets `lastSampleAtRef` only when `symbol`/`enabled` change, not when `notionalUsd` changes. A rapidly typed amount can re-render against the previous orderBook snapshot for up to 500 ms — acceptable, but worth a comment if behavior changes later.

## Diff Quality
- Minimal: yes — every file change maps to an AC. The `order-summary.tsx` import reordering is alphabetical and incidental; no unrelated reformatting elsewhere.
- Debug code: none — no `console.log`, no commented-out alternatives. The `loglevel` import is intentional and used in the catch.

## Recipe
- Present: yes
- Quality: good — recipe re-ran on CDP 6662, **16/16 passed in 2028 ms**. AC nodes (`ac1-*` through `ac5-*`) all green; teardown resets preference. Recipe seeds its own state (`setup-clear-pref`, `setup-set-amount`, `ac5-set-tiny-max` + `ac5-set-large-amount`) — not relying on pre-existing wallet shape. Uses `call` for `perps/prime-perps-state`. Assertions are specific (testID checks, `input.value === 3`, `metamask.preferences.perpsMaxSlippagePct === 5`). `recipe-quality.json` verdict: pass. `[auto-issues] review — 1 unexpected event(s)` is informational, not gating.

## Visual Evidence
- Status: OK — `evidence-manifest.json` declares `after.mp4` as the preferred-mode video covering AC1–AC5; file present (759 KB). Manifest gate (FAIL_EMPTY / MISSING) returns no findings. Note in manifest documents why still screenshots were skipped (50 ms order-book stream prevents Playwright element-stability from settling).

## Issues
- **ui/pages/perps/perps-order-entry-page.tsx:166-171** — `formStateToOrderParams` JSDoc adds `@param maxSlippagePct` with no description. Either describe it (e.g. "User-configured max slippage in percent, converted to bps for market orders") or drop the stub. Empty `@param` tag is the same noise as no JSDoc.
- **ui/hooks/perps/useEstimatedSlippage.ts:1077-1081** — auto-generated JSDoc stubs `@param options0`, `@param options0.symbol`, etc. Replace with prose describing each param (or remove the JSDoc since the `EstimatedSlippageParams` interface already documents them in-line).
- **ui/pages/perps/perps-order-entry-page.tsx:386-391** — move the swallow-rationale comment to the line above `.catch(` so the antipatterns-rule literal form is satisfied; or upgrade to a user-visible failure surface (toast) — the current "modal closed but value didn't persist" outcome can confuse a user the next session.
- **ui/components/app/perps/utils/slippageFormat.ts:21** — `0.01` is a magic display threshold. Either pull it next to `PERPS_SLIPPAGE_MIN_PCT` (the input min is `0.1` so this isn't quite the same value) or add a one-line comment justifying the choice for future readers.
- **ui/pages/perps/perps-order-entry-page.tsx:1602-1605** — `${maxSlippagePct.toFixed(1)}%` is duplicated between `order-summary.tsx` (max-slippage button label) and the blocked-error message. Tiny helper `formatMaxSlippageLabel(pct)` would prevent divergence if rounding rules change. Optional.
- **ui/hooks/perps/useEstimatedSlippage.test.ts:18-21** — uses `require('../../providers/perps')` after `jest.mock` instead of `jest.mocked(getPerpsStreamManager)`. The `eslint-disable @typescript-eslint/no-require-imports` comment hints at the workaround. Minor refactor possible.
