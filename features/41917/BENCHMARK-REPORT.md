# TAT-2986 — Extension vs Mobile Benchmark

**Ticket:** [TAT-2986](https://consensyssoftware.atlassian.net/browse/TAT-2986) · **PR:** #41917

## Bottom line

Same rapid-switch workload. **Extension 429s at ~21%. Mobile 429s at 0%.**
Root cause: mobile's `AbortController.abort()` is synchronous (same JS runtime as UI). Extension's abort crosses the MV3 postMessage bridge and lands *after* the candle fetch has already completed — the server-side rate-limit budget is spent on fetches the UI no longer wants.

## Benchmark

Workload (both platforms): 6-market rotation BTC→ETH→SOL×2, 200ms dwell, click-driven nav, × 4 runs.

| Platform | Net | HL reqs | 429s | Status breakdown |
|---|---|---|---|---|
| **Extension** dev1 (Chrome MV3 SW) | mainnet | 19 | **4 (~21%)** | `{200: 15, 429: 4}` — completed fetches, rate-limit hits |
| **Mobile** mm-1 (iOS Hermes) | testnet | 77 | **0 (0%)** | `{0: 71, 200: 6}` — aborted client-side before response |

Data is the aggregate of the recorded run + three prior probe runs per platform. Raw: `live-capture-run-{1,2,3}.json`, `live-capture.json`, `extension-recorded-capture.json` (extension); `/metamask-mobile-1/INVESTIGATION/mobile-live-capture*.json` (mobile).

### Race signature (extension, run-2 of prior probe)

```
429  BTC  start=115469 end=115662   POST /info candleSnapshot BTC 5m
    nav  switch-to-BTC at 115668    (UI lands 6ms after BTC fetch ended)
    nav  back at 115869             (UI already leaving BTC)
429  ETH  start=115891 end=116012   POST /info candleSnapshot ETH 5m
    nav  switch-to-ETH at 116089    (UI lands 77ms after ETH fetch ended)
    nav  back at 116293             (UI already leaving ETH)
200  SOL  start=116304 end=116427
```

Two 429s in a 550ms window — bodies target symbols the UI had already left. Mobile captures for the same symbols complete as `status=0` (XHR aborted) before the HL response arrives.

## Videos

- **Extension:** [`extension-probe.mp4`](./extension-probe.mp4) — CDP `Page.startScreencast` of the popup tab rapid-switching BTC→ETH→SOL→BTC→ETH→SOL (10 fps, ~54s).
- **Mobile:** [`mobile-probe.mp4`](./mobile-probe.mp4) — `xcrun simctl recordVideo` of the iOS sim screen across 4 × 6-market rotation runs.

## Why the diff exists

| | Mobile | Extension |
|---|---|---|
| Perps controller runtime | Same JS runtime as UI (Hermes) | Background MV3 service worker |
| UI → controller RPC | Direct in-process call | postMessage bridge, async |
| `AbortController.abort()` | Synchronous microtask | Crosses serialization boundary, lands late |
| `perpsDeactivateCandleStream` | Wins race before REST resolves | Loses race; fetch completes and burns budget |

The abort race is load-bearing: mobile avoids 429 not by having a fix, but by having no race to begin with.

## Next steps

**Fix location:** `app/scripts/controllers/perps/perps-stream-bridge.ts:181-207` + `ui/providers/perps/CandleStreamChannel.ts:336-395`.

1. **Idempotent activate** — compute the subscription key before `#initAndActivate()`. If `#dynamicUnsubs[key]` exists, return `'ok'` immediately. Kills duplicate REST on A→A re-entry.
2. **Deferred deactivate (load-bearing)** — wrap `#tearDownDynamicKey` in a 150ms `setTimeout` keyed by `symbol+interval`. Cancel on matching activate. Gives the bridge enough time to actually cancel the in-flight fetch before HL responds.
3. **UI leading-edge debounce (belt-and-braces)** — 120ms on `CandleStreamChannel.connect` so normal React unmount/remount pairs never hit the SW.

Expected effect: 6-market cycle in ~1.2s produces one candle request for the landing symbol, matching mobile's observed `status=0` abort pattern. Preserves the existing AbortController guard for the legitimate "user left chart" case.

## Scope of this PR

Investigation-only. No production code changes. Shipped artifacts:

- `BENCHMARK-REPORT.md` (this file)
- `INVESTIGATION.md`, `comparison.md`, `report.md` — detailed paths and hypothesis ranking
- `probe-rapid-switch.js` / `record-probe-extension.js` — CDP probes
- `extension-probe.mp4`, `mobile-probe.mp4` — video evidence
- `live-capture-run-{1,2,3}.json`, `live-capture.json`, `extension-recorded-capture.json` — raw CDP captures
- `recipe.json` + `recipe-quality.json` — rapid-switch validation recipe for QA hand-off

Mobile-side artifacts live at `/metamask-mobile-1/INVESTIGATION.md` + `/metamask-mobile-1/scripts/perps/agentic/probe-tat2986.js`; they are reference, not shipped here.
