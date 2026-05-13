# Self-Review: TAT-1043

## Verdict: PASS

## Summary
Worker added an estimated-slippage row plus a configurable max-slippage cap to the perps order entry surface, persisted via `PreferencesController`, with telemetry and submit-blocking. Diff is contained to `ui/`, locales, and a single shared types/event-constant edit. Type check, 26 unit tests, and the canonical recipe trace (16/16) all pass; mobile parity holds for `DefaultLimitSlippageBps=100` / `DefaultMarketSlippageBps=300`.

## Type Check
- Result: PASS
- New errors: none

## Tests
- Result: PASS
- Details: `yarn jest` on slippageFormat, useEstimatedSlippage, slippage-config-modal, order-summary → 4 suites / 26 tests pass.

## Test Quality
- Findings: none found.
  - No "should" in new test names (verified via grep).
  - `slippage-config-modal.test.tsx` uses `userEvent`, scoped to testIDs, asserts on input `.value`, `toBeDisabled()`, and call args (specific).
  - `useEstimatedSlippage.test.ts` covers initial empty state, computed slippage on push, 500ms throttle window, `enabled=false` short-circuit + unsubscribe, and unmount cleanup. Pure-fn `computeSlippagePct` covered for ask/bid/insufficient/negative-clamp/malformed-level paths.
  - `slippageFormat.test.ts` asserts boundary values (`0.0099` → `<0.01%`, `0.01` → `0.01%`, `9.876` → `9.88%`) and both null + insufficient-liquidity branches.
  - No raw i18n strings duplicated in tests; existing `order-summary.test.tsx` uses `messages.<key>.message` (untouched here).

## Domain Anti-Patterns
- Findings: none found.
  - Import boundaries: only `ui/` ↔ `ui/` and reads from `shared/`; no `app/` reach-in.
  - Controller usage: persistence rides existing `submitRequestToBackground('setPreference', ...)` path used by `perpsSelectedCandlePeriod`. New `perpsMaxSlippagePct?: number` is optional, so no migration needed.
  - LavaMoat: no `yarn.lock` / `package.json` / `lavamoat/` diff.
  - MV3: no SW changes.
  - Error handling: `setPreference` failure goes through `log.error('[Perps] Save max-slippage preference failed:', error)` with rationale comment immediately above the awaited call (perps-order-entry-page.tsx:386).
  - testIDs: `perps-order-summary-slippage-row`, `perps-order-summary-estimated-slippage`, `perps-order-summary-max-slippage-button`, `perps-slippage-config-modal`, `perps-slippage-config-input`, `perps-slippage-config-save`, `perps-slippage-config-close`, `perps-slippage-config-error`, `perps-slippage-config-preset-{0.5,1,3,5}`, `perps-slippage-blocked-error` — all interactive elements covered.
  - Magic numbers: `PERPS_LIMIT_ORDER_SLIPPAGE_BPS`, `PERPS_SLIPPAGE_DEFAULT_PCT`, `ORDER_BOOK_SAMPLE_MS`, `SLIPPAGE_DISPLAY_FLOOR_PCT` all named.

## Mobile Comparison
- Status: ALIGNED
- Details: `PERPS_LIMIT_ORDER_SLIPPAGE_BPS = 100` matches `ORDER_SLIPPAGE_CONFIG.DefaultLimitSlippageBps` in mobile `PerpsOrderView.tsx:1020`. `PERPS_SLIPPAGE_DEFAULT_PCT = 3` matches `DefaultMarketSlippageBps = 300`. `formStateToOrderParams` branches `maxSlippageBps` by order type identically to mobile (`PerpsOrderView.tsx:1018-1021`). `useEstimatedSlippage.ts:111` carries an explicit `TODO(TAT-1043)` flagging extension-first scope so the mobile follow-up isn't lost.

## LavaMoat Policy
- Status: N/A
- Details: no dependency or policy file changes in the diff.

## Fix Quality
- Best approach: yes — order-book walk over the existing `getPerpsStreamManager().orderBook` stream avoids extra network calls; client-side block keeps the UX latency low while the controller still enforces `maxSlippageBps` server-side.
- Would not ship: none.
- Test quality: good — `computeSlippagePct` is exported separately so the math is unit-tested without stream mocking; the hook tests prove throttle, unsubscribe, and disabled paths via a controlled subscriber set.
- Brittleness: none flagged. `slippageBlockTrackedRef` resets on every transition so re-blocks re-fire telemetry. The `SLIPPAGE_LIMIT_BLOCKED_ORDER` payload now uses `estimatedSlippagePct ?? null` so insufficient-liquidity blocks aren't reported as a fake "10% observed" data point.

## Diff Quality
- Minimal: yes — no unrelated reformatting; the order-summary import reorder is local to the same statement and pulls in `ButtonBase` for the new button.
- Debug code: none — no `console.*` in changed files; only `TODO(TAT-1043)` ticketed.

## Recipe
- Present: yes
- Quality: good — `recipe-quality.json` verdict `pass`, 16/16 nodes passed in `trace.json`, AC1–AC5 each map to `ac<N>-*` nodes, persistence proven via state read on `metamask.preferences.perpsMaxSlippagePct`, AC5 forces a 0.1% cap with a $1M order so the block is deterministic. AC6 (≥98% success-rate guardrail) flagged as A/B-platform measurement and excluded from the recipe with rationale.

## Visual Evidence
- Status: OK — `evidence-manifest.json` declares video as preferred mode; `after.mp4` exists alongside the manifest. No `recipe-coverage.md` so the FAIL_EMPTY grep in step 11b does not trigger; standalone/before-after pairs are intentionally empty per the streaming-page rationale captured in the manifest and `recipe-quality.json`.

## Issues
(none — verdict PASS)
