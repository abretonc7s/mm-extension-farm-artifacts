# Self-Review: TAT-1043

## Verdict: ISSUES

## Summary
Worker added a configurable max-slippage cap + live estimated-slippage row on the perps order entry surface, persisted via PreferencesController, with telemetry and a 16-node recipe. Implementation matches the ACs and type-checks cleanly. Two real problems block PASS: the "walkthrough" `after.mp4` is a 0.2-second clip (not a usable visual proof), and the order-entry page imports got mangled (`perps-order-entry-page.tsx:73`). Several easy-fix nits also worth a pass.

## Type Check
- Result: PASS
- New errors: none (`yarn lint:tsc` exits 0)

## Tests
- Result: PASS
- Details: 23 tests across `slippage-config-modal.test.tsx`, `slippageFormat.test.ts`, `useEstimatedSlippage.test.ts`, `order-summary.test.tsx`, `constants.test.ts`. All green.

## Test Quality
- Findings:
  - `slippage-config-modal.test.tsx:44,45,56,65,76` — uses `fireEvent.change`/`fireEvent.click`; antipatterns doc §7 calls for `userEvent`. Low severity; modal behaviour is deterministic, but inconsistent with rest of perps tests.
  - `useEstimatedSlippage.test.ts` covers only the pure `computeSlippagePct` helper. The hook itself (subscription, 500 ms sampling, cleanup, `enabled=false` path) has no test — these are the bits with the actual side effects and the throttle behaviour is the design call most likely to regress silently.

## Domain Anti-Patterns
- Findings:
  - `ui/hooks/perps/useEstimatedSlippage.ts:130` and `ui/pages/perps/perps-order-entry-page.tsx:496` both call `perpsActivateOrderBookStream` for the same `symbol`. Hook also calls `perpsDeactivateOrderBookStream` on cleanup (`useEstimatedSlippage.ts:148`). If the controller is not refcounted per subscriber, the hook's unmount can tear down the stream while the page still needs it. Worth a one-line note in the hook (or verify via controller code path) before shipping.
  - `ui/components/app/perps/slippage-config-modal/slippage-config-modal.tsx:110-130` — inline `dialogStyle` style objects rather than DS tokens. Acceptable for the sheet/centred layout switch, but flag per antipatterns §5 ("inline styles instead of design tokens").

## Mobile Comparison
- Status: ALIGNED
- Details: Mobile (`metamask-mobile-ref/.../PerpsOrderView.tsx:1018-1021`) still uses hardcoded `ORDER_SLIPPAGE_CONFIG.DefaultMarketSlippageBps` (3% market / 1% limit) with no user-configurable UI. Extension's `PERPS_SLIPPAGE_DEFAULT_PCT = 3` × 100 = 300 bps matches mobile's `DefaultMarketSlippageBps`. Extension is the first surface to expose configuration; mobile parity is a follow-up.

## LavaMoat Policy
- Status: N/A
- Details: No deps added (`package.json` / `yarn.lock` untouched). `lavamoat/browserify/*` unchanged.

## Fix Quality
- Best approach: yes — order-book walk reusing existing `perpsActivateOrderBookStream` stream avoids extra fetches; 500 ms sample throttle matches HyperLiquid's 50 ms diff cadence sensibly.
- Would not ship:
  - `after.mp4` is **0.2 s** (`ffprobe duration=0.200000`, 21 KB), despite report.md and recipe-quality.json claiming it is the AC1→AC5 walkthrough. Either re-record or drop the video claim and rely on `trace.json` + state assertions.
  - Import formatting in `ui/pages/perps/perps-order-entry-page.tsx:70-73` is broken — `PERPS_MIN_MARKET_ORDER_USD` is wedged onto the same line as the closing brace with single-space indent. Run `yarn lint:fix` on that file.
- Test quality: weak — the hook's subscription/throttle/cleanup logic is untested; tests only cover `computeSlippagePct`. Tests for the modal could not pass if the fix were reverted (`onSave` is asserted), but the hook surface could regress invisibly.
- Brittleness:
  - `ui/components/app/perps/slippage-config-modal/slippage-config-modal.tsx:197` — quick-pick "selected" comparison uses `snapToStep(parsedDraft) === pct`. Round presets (0.5, 1, 3, 5) are exactly representable so this works today, but any future preset like `0.3` would silently fail to highlight. Cheap fix: compare with `Math.abs(... - pct) < PERPS_SLIPPAGE_STEP_PCT / 2`.
  - `ui/pages/perps/perps-order-entry-page.tsx:1582-1590` — when `insufficientLiquidity === true`, the row reads "Estimated slippage >10%" and the inline error still cites `maxSlippagePct.toFixed(1)%` (e.g. "0.1%"). Two different thresholds on one screen reads as a bug; consider unifying the copy or showing "exceeds available liquidity" in the insufficient case.

## Diff Quality
- Minimal: mostly yes — diff is scoped to the slippage feature.
- Debug code: none. One `TODO` in `useEstimatedSlippage.ts:108` ("Mobile parity TODO") is acceptable — it's tied to TAT-1043 and documents the rationale, but per `CLAUDE.local.md` ("no TODO without ticket") add the ticket id (`TODO(TAT-1043)`) to be explicit.

## Recipe
- Present: yes
- Quality: good — 16/16 nodes pass per `trace.json`; AC1–AC5 each map to `ac<N>-*` nodes; AC5 forces `perpsMaxSlippagePct=0.1` and a $1M amount so the cap-block is exercised even on the live book (seeds its own data). Uses `call perps/prime-perps-state`. Note: `recipe-coverage.md` is absent; `evidence-manifest.json` standalone/before_after_pairs are both empty, so step 11b's gate did not fire — but the broken `after.mp4` makes the recipe-quality.json claim of `proof_mode: mixed` untrue in practice. Recipe re-run skipped: task block `CDP_PORT` is empty; relying on the worker's existing run.

## Visual Evidence
- Status: MISSING_FILES — `after.mp4` is a 0.2-second placeholder despite being claimed as the AC1–AC5 walkthrough in `report.md` and `recipe-quality.json`. Either re-record the slow-mode run or remove the video claim and declare the recipe state-only proof.

## Issues
- **temp/tasks/feat/tat-1043-0513-160437/artifacts/after.mp4** — 0.2 s clip, not a walkthrough; re-record or drop the visual claim.
- **ui/pages/perps/perps-order-entry-page.tsx:70-73** — mangled import block, `PERPS_MIN_MARKET_ORDER_USD` jammed onto the closing-brace line with one-space indent.
- **ui/pages/perps/perps-order-entry-page.tsx:1582-1590** — insufficient-liquidity branch shows ">10%" in the row but cites `maxSlippagePct%` in the error; unify the message.
- **ui/components/app/perps/slippage-config-modal/slippage-config-modal.tsx:197** — preset-selected check uses `===` after snap; works for current presets but brittle if presets ever include non-step-aligned values.
- **ui/hooks/perps/useEstimatedSlippage.ts** — hook has no tests for subscription, 500 ms throttle, `enabled=false` short-circuit, or unmount cleanup; add at least one test that fakes the stream manager.
- **ui/hooks/perps/useEstimatedSlippage.ts:130** vs **ui/pages/perps/perps-order-entry-page.tsx:496** — double activation of `perpsActivateOrderBookStream` for the same symbol; verify controller refcount or consolidate.
- **ui/components/app/perps/slippage-config-modal/slippage-config-modal.test.tsx** — switch `fireEvent` → `userEvent` per antipatterns §7.
- **ui/hooks/perps/useEstimatedSlippage.ts:108** — annotate the `TODO` with the ticket (`TODO(TAT-1043)`).
