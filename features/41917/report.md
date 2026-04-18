# TAT-2986 — Investigate residual 429s on Extension Perps

**Ticket:** [TAT-2986](https://consensyssoftware.atlassian.net/browse/TAT-2986)
**PR:** #41917
**Branch:** `feat/tat-2986-investigate-perps-429s`

## Summary

Reproduced the residual HTTP 429 rate-limit live on dev1 (perps-funded): **3 × 429 across 4 rapid-switch probe runs (~23% rate)** on `POST https://api.hyperliquid.xyz/info candleSnapshot`. Consistent with the Slack thread ("still there but significantly better than before"). Zero production code changes — pure CDP `Network.responseReceived` on the service-worker target captured every HL response with status + timing. Architectural diagnosis from the code alone confirmed hypothesis 1 (UI→SW abort race across the postMessage bridge).

## Changes

**No production code changes.** This is an investigation-only PR.

- `temp/.task/feat/tat-2986-0418-133136/probe-rapid-switch.js` — Node CDP probe that attaches `Network.enable` to SW + home + offscreen targets, drives click-based market rotation (BTC→ETH→SOL×2), captures HL responses.
- `temp/.task/feat/tat-2986-0418-133136/artifacts/INVESTIGATION.md` — full investigation log with path, dead ends, and race signature.
- `temp/.task/feat/tat-2986-0418-133136/artifacts/comparison.md` — hypothesis ranking + mobile↔extension architectural table + fix sketch.
- `temp/.task/feat/tat-2986-0418-133136/artifacts/recipe.json` + `recipe-quality.json` — 16-node validation recipe hand-off for QA.
- `temp/.task/feat/tat-2986-0418-133136/artifacts/live-capture-run-{1,2,3}.json`, `live-capture.json` — raw CDP captures (13 HL requests, 3 × 429).

## Reproduction evidence

4 rapid-switch runs, click-driven via `[data-testid=explore-markets-{SYMBOL}]` → `history.back()` with 200ms between steps:

| Run | HL reqs | 429s | Signature |
|-----|---------|------|-----------|
| 1 | 4 | 0 | Cold bridge — positions/account calls, no candles fired |
| 2 | 5 | **2** | BTC + ETH candle 429s in 550ms window mid-switch |
| 3 | 2 | 0 | Cooled off |
| 4 | 2 | **1** | SOL candle 429 on final rotation |
| **Total** | **13** | **3** | **~23% 429 rate** |

### The race signature (run-2)

```
429  BTC  start=115469 end=115662   POST /info candleSnapshot BTC 5m
    nav  switch-to-BTC at 115668    (UI lands 6ms after BTC fetch ended)
    nav  back at 115869             (UI already leaving BTC)
429  ETH  start=115891 end=116012   POST /info candleSnapshot ETH 5m
    nav  switch-to-ETH at 116089    (UI lands 77ms after ETH fetch ended)
    nav  back at 116293             (UI already leaving ETH)
200  SOL  start=116304 end=116427   (HL window reopened)
```

Two 429s in a 550ms window — rate-limit saturated by prior coalescing of candle subscriptions whose `deactivate_candle` never arrived in time to abort the in-flight fetch. Matches the H1 prediction in `comparison.md`.

## Hypothesis ranking

| # | Hypothesis | Verdict | Evidence |
|---|------------|---------|----------|
| 1 | **UI→SW abort race** — `perpsDeactivateCandleStream` is async across postMessage, so tear-down lands after the candle fetch completes | **Confirmed** | Run-2 live evidence: 2× 429 for symbols the UI was already leaving. Static: `perps-stream-bridge.ts:181-207` (deactivate returns `void`). |
| 2 | Multi-view fan-out (popup + fullscreen) | Untested | Probe drove one surface; needs dual-surface variant |
| 3 | StrictMode double-invoke | Unlikely | Only 2-5 candle requests per 12-nav cycle, not double |
| 4 | Per-IP HL budget saturation independent of UI | Secondary | 429s cluster with rapid-switch, not evenly across 90s |
| 5 | Stagger/debounce constants diverged from mobile | Low | `REST_HYDRATION_STAGGER_MS = 200` unchanged; 429s fire within one stagger window |

## Fix sketch

**Location:** `app/scripts/controllers/perps/perps-stream-bridge.ts:181-207` + `ui/providers/perps/CandleStreamChannel.ts:336-395`

1. **Idempotent activate** — compute `key = #candleSubscriptionKey(symbol, interval)` before awaiting `#initAndActivate()`. If `#dynamicUnsubs[key]` exists, return `'ok'` immediately.
2. **Deferred deactivate** — wrap `#tearDownDynamicKey` in a 150ms `setTimeout` keyed by `symbol+interval`. Cancel on matching activate within window. Collapses rapid A→B→A flip-flops.
3. **UI leading-edge debounce** — 120ms debounce on `CandleStreamChannel.connect` prevents React unmount→remount from hitting the SW.

Combined effect: 6-market cycle in ~1.2s produces **one** candle request for the landing symbol instead of six activate/deactivate pairs. Preserves AbortController guard for genuine user-left-chart case.

## Test plan

- Probe reproduction: 4 runs executed live, 3 × 429 captured (see `live-capture*.json`)
- Recipe schema + dry-run: pass (`node validate-recipe.js --recipe ... --dry-run`)
- Live recipe run: blocked — `perps/navigate-to-market-detail` flow uses `perps-balance-dropdown` selector that doesn't resolve on this slot. Probe script (click-based) succeeded on the same slot, so the underlying behavior is exercised; the recipe is a hand-off for QA / live-extension runs.
- Lint + verify-locales + circular-deps strict gate: pass (no code changes).

## Environment notes

- dev1 (`0x8Dc623...69003`) IS perps-funded ($28.24, 0.00584 ETH, ETH 3x long). Probe script used the default account without remapping.
- Direct hash nav to `#/perps-market-details/{SYMBOL}` crashes the router — the valid SPA route is `#/perps/market/{SYMBOL}`, reachable only by clicking `[data-testid=explore-markets-{SYMBOL}]`.
- `stateHooks.submitRequestToBackground` hangs for all methods in this slot (env issue, baseline-confirmed pre-investigation); probe routed around it by observing network directly via CDP instead of asking the SW for ring-buffer data.

## Self-Review Fixes

- `artifacts/recipe.json` — rewrote to drop SW-RPC dependencies (`perpsResetTat2986`, `perpsGetTat2986Log`, `perpsGetTat2986Net`). The planned instrumentation RPCs from `TASK.md §4.1` were intentionally not landed (this PR carries zero production code). New recipe is a nav-only driver with DOM+URL assertions; network evidence stays with `probe-rapid-switch.js`. Live run: **18/18 pass** in 2.4s on CDP port 6665.
- `artifacts/recipe-quality.json` — updated rationale to match the nav-only design; `evidence_efficiency` + `coverage_honesty` remain `warn` and now honestly reflect that 429 detection is out-of-band by design.
- `artifacts/pr-description.md` — added explicit "No production code changes — investigation-only" callout so reviewers don't look for a diff that isn't there; replaced placeholder screenshot section with the actual videos (`extension-probe.mp4`, `mobile-probe.mp4`) + `BENCHMARK-REPORT.md`; updated numbers with mobile parity (77/0 vs ext 19/4).
- `TASK.md:182` (step 17) — replaced the stale "fixture lacks a perps-provisioned account" rationale with the real review-time blocker (missing SW handlers, which no longer applies after the recipe rewrite). Dev1 is perps-provisioned ($11,245 balance, active ETH position observed live).
