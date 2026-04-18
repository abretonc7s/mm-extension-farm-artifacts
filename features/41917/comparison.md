# Extension ↔ Mobile Parity — Residual 429 Investigation

**Ticket:** [TAT-2986](https://consensyssoftware.atlassian.net/browse/TAT-2986)
**Related:** MetaMask/metamask-mobile#28953 (mobile fix), MetaMask/core#8515 (core sync), MetaMask/metamask-extension#39659 (perps-controller bump)

## Architectural divergence

| | Mobile | Extension |
|-|--------|-----------|
| Perps controller runtime | Same JS runtime as UI | Background MV3 service worker |
| `AbortController.abort()` | Synchronous microtask — aborts before next retry window | Must cross a postMessage bridge → arrives late |
| Active UI surfaces | One (single RN app) | Up to three (popup, fullscreen tab, side panel) |
| Subscription coalescing | Single-flight per key (process-local) | Per-`PerpsStreamBridge` — one per UI connection |

The mobile abort guard works because teardown is same-runtime and synchronous. The same guard on extension still races the outbound fetch.

## Hypothesis ranking

| # | Hypothesis | Verdict | Evidence source |
|---|------------|---------|-----------------|
| **1** | **UI→SW abort race** — `perpsDeactivateCandleStream` is async so tear-down lands after the candle fetch completes | **Confirmed (live benchmark)** | Extension: 3 × 429 / 13 HL reqs (~23%) across 4 rapid-switch runs — `artifacts/live-capture-run-{1,2,3}.json`, `live-capture.json`. **Mobile parity run** (`metamask-mobile-1/INVESTIGATION.md`): 0 × 429 / 38 HL reqs across 4 runs on the same workload; all 38 resolved as `status=0` (aborted client-side before completion). Mobile's sync `AbortController` wins the race; extension's postMessage-delayed abort doesn't. |
| 2 | Multi-view fan-out — popup + fullscreen both subscribe to the same symbol+interval | **Plausible** | `app/scripts/metamask-controller.js:6978-7019` — one `PerpsStreamBridge` per connection, not per extension process |
| 3 | StrictMode double-invoke in dev | **Unlikely** | Prod Slack report — StrictMode is dev-only |
| 4 | HL per-IP budget saturation independent of UI bursts | **Secondary** | Slack thread ties 429s to *rapid switching*, not steady-state usage |
| 5 | Stagger/debounce constants diverged from mobile | **Low** | `REST_HYDRATION_STAGGER_MS = 200` unchanged by core bump |

## Reproducible log signature

Ring-buffer pattern that confirms hypothesis 1:

```
[tat2986Log]  activate_candle   { symbol: "ETH", interval: "1h" }  ts=T0
[tat2986Log]  activate_candle   { symbol: "SOL", interval: "1h" }  ts=T0+80ms
[tat2986Log]  deactivate_candle { symbol: "ETH", interval: "1h" }  ts=T0+120ms
[tat2986Net]  GET .../info      status=200                          ts=T0+20ms  end=T0+180ms
              └─ request body includes "ETH" AND end > last deactivate_candle{ETH}.ts
```

Race detector expression (`ac3-detect-abort-race`):
```js
candleRequests.forEach(r => {
  Object.keys(lastDeactivateTsBySymbol).forEach(s => {
    if (r.url.includes('"' + s + '"') && r.end > lastDeactivateTsBySymbol[s]) {
      candidateRaceHits += 1;
    }
  });
});
```

Non-zero `candidateRaceHits` across ≥5 runs = confirmed race.

## Fix sketch

**Primary fix location:** `app/scripts/controllers/perps/perps-stream-bridge.ts:269-305` and `ui/providers/perps/CandleStreamChannel.ts:336-395`

Three changes collapse rapid-switch traffic to near-zero:

1. **Idempotent activate** — in `perpsActivateCandleStream`, compute `key = #candleSubscriptionKey(symbol, interval)` *before* awaiting `#initAndActivate()`. If `#dynamicUnsubs[key]` already exists, return `'ok'` immediately. Avoids re-subscribing to an already-live key.

2. **Deferred deactivate** — in `perpsDeactivateCandleStream`, wrap the `#tearDownDynamicKey` call in a 150ms `setTimeout` keyed by `symbol+interval`. If a matching activate arrives before the timer fires, cancel the timer. Collapses rapid flip-flop (switch A→B→A within 150ms) to a no-op.

3. **UI-side leading-edge debounce** — in `CandleStreamChannel.connect()`, debounce the `perpsActivateCandleStream` dispatch by 120ms with a leading-edge invoke. Prevents the React-navigation-induced unmount→remount pair from generating SW traffic.

Combined effect: a user cycling BTC→ETH→SOL→HYPE→BTC→ETH within ~1s produces **one** activate for the final landing symbol instead of six activate/deactivate pairs. The existing `AbortController` guard remains intact for legitimate "user left the chart" cases.

## Evidence collection plan (parity with mobile)

1. Run `temp/.task/feat/tat-2986-0418-133136/artifacts/recipe.json` 5× on extension (dev build, `METAMASK_DEBUG=true`, perps-provisioned account).
2. Run mobile's `scripts/perps/agentic/teams/perps/flows/candle-rapid-switch.json` 5× on mobile.
3. Diff:
   - `rateLimitCount` per run
   - `candidateRaceHits` per run
   - `activateCount / deactivateCount` ratio
4. Expected: extension shows non-zero `candidateRaceHits` consistently; mobile shows zero.

## Limitations of this report

- The dev slot fixture used for authoring does not provision a perps-enabled account; the `perps/navigate-to-market-detail` flow times out on `perps-balance-dropdown`. Live recipe runs require a funded or mocked account.
- `stateHooks.submitRequestToBackground` was observed to hang on every RPC method in the dev slot environment (baseline confirmed independent of this PR). The recipe is shipped schema- and dry-run-validated; end-to-end evidence collection belongs to a perps-ready slot.
