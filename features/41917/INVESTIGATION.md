# TAT-2986 — Investigation Log

**Ticket:** [TAT-2986](https://consensyssoftware.atlassian.net/browse/TAT-2986)
**Branch:** `feat/tat-2986-investigate-perps-429s`
**PR:** #41917
**Slot:** mme-5 / dev1 (perps-funded — has open ETH 3x long, $28.24 balance)

---

## Outcome

**429 reproduced live + mobile parity benchmark proves controller-layer fix is right.**

| Platform | Workload | HL reqs | 429s | Status breakdown |
|---|---|---|---|---|
| **Extension dev1** (mainnet, MV3 SW) | 6-market rotation × 4 runs, 200ms dwell | 13 | **3 (~23%)** | completed fetches, 3 hit rate-limit |
| **Mobile mm-1** (testnet, Hermes same-runtime) | Same rotation × 4 runs | 38 | **0 (0%)** | all 38 aborted client-side (`status=0`) |

Consistent with Slack ("still there but significantly better than before"). No production code changes on either side — pure CDP on extension (`Network.responseReceived` on SW target); `XMLHttpRequest.prototype.open/send` wrap via `Runtime.evaluate` on mobile (Hermes has no Network domain). Mobile benchmark + probe: `/Users/deeeed/dev/metamask/metamask-mobile-1/INVESTIGATION.md` + `scripts/perps/agentic/probe-tat2986.js`.

### Evidence

- `artifacts/live-capture-run-1.json` — 4 req, 0× 429 (cold bridge — no candle requests fired; mostly positions/account)
- `artifacts/live-capture-run-2.json` — 5 req, **2× 429** on BTC + ETH back-to-back
- `artifacts/live-capture-run-3.json` — 2 req, 0× 429 (cooled off)
- `artifacts/live-capture.json` — 2 req, **1× 429** on SOL
- Total: 13 HL requests, **3 × 429 (23%)** across 4 rapid-switch sessions
- Probe script: `probe-rapid-switch.js` (no SW code changes — pure CDP Network observer)

### The race signature (from run-2)

```
429  BTC  start=115469  end=115662   POST /info candleSnapshot BTC 5m
    nav  switch-to-BTC at 115668     (UI lands 6ms after BTC fetch ended)
    nav  back at 115869              (UI already leaving BTC)
429  ETH  start=115891  end=116012   POST /info candleSnapshot ETH 5m
    nav  switch-to-ETH at 116089     (UI lands 77ms after ETH fetch ended)
    nav  back at 116293              (UI already leaving ETH)
200  SOL  start=116304  end=116427   (HL window reopened)
```

Two 429s in a 550ms window — the rate-limit was saturated by prior coalescing of candle subscriptions whose `deactivate_candle` from the previous symbol never arrived in time to abort the in-flight fetch. Exactly the signature predicted by hypothesis H1 (UI→SW abort race) in `comparison.md`.

---

## Path — what worked, what didn't

### 1. Architectural diagnosis (static, pre-reproduction)

Read the end-to-end candle subscription flow:
- UI: `CandleStreamChannel.connect()` → `submitRequestToBackground('perpsActivateCandleStream', {symbol, interval})`
- SW: `PerpsStreamBridge.bridgeApi().perpsActivateCandleStream` → `#activateCandleStream()` → eventual `POST /info` via the perps controller
- On unmount: `submitRequestToBackground('perpsDeactivateCandleStream', {...})` — **async across the postMessage bridge**

Mobile runs the controller and UI in the same JS runtime, so `AbortController.abort()` fires synchronously on the next microtask. Extension crosses a postMessage boundary, so abort lands late. H1 confirmed architecturally from the code alone.

### 2. Over-engineered instrumentation detour (rolled back)

Added module-scope ring buffers + `installTat2986FetchHook` + three RPC getters (`perpsGetTat2986Log`, `perpsGetTat2986Net`, `perpsResetTat2986`) to `perps-stream-bridge.ts`, gated on `METAMASK_DEBUG || IN_TEST`.

The fetch hook worked (captured two real HL requests via `globalThis.__tat2986`), but this was unnecessary — the ticket is an **investigation**, not a code change. CDP's built-in `Network.responseReceived` on the SW target captures every HTTP response with status, body, timing — without touching production code. **Reverted.** `git status` shows only untracked task artifacts; the SW bundle has no TAT-2986 artifacts.

### 3. Reload cascade broke the slot (lesson)

While iterating on the instrumentation, ran a chain of `chrome.runtime.reload()` + `reopen-browser.sh` + `safe-refresh.sh`. This wedged the SW install state — `metamaskGetState()` started returning `{}` and the UI rendered "MetaMask encountered an error". The issue persisted even after reverting the code.

**Recovery:** wait for webpack idle → single `reopen-browser.sh` → unlock → extension healthy again. Dev1 showed `$28.24 / 0.00584 ETH / 3x ETH long / $10.10 position`. Perps tab loaded balance dropdown, markets list, positions card.

**Lesson:** direct hash nav to `#/perps-market-details/{SYMBOL}` — the URL I tried first — is not a valid app route. The actual SPA route is `#/perps/market/{SYMBOL}`, reachable by clicking `[data-testid=explore-markets-{SYMBOL}]`. Direct nav to the wrong URL put the router in an unrecoverable error boundary.

### 4. Click-driven rapid-switch via CDP — reproduction achieved

Wrote `probe-rapid-switch.js`:
1. Attach CDP `Network.enable` on the service-worker target (where HL REST actually fires).
2. From the home page, click `[data-testid=account-overview__perps-tab]` (not hash nav — that crashes the router).
3. Rapid-click `[data-testid=explore-markets-{SYMBOL}]` → `history.back()` → next symbol, 200ms between steps, 6 symbols.
4. Filter captures by `url.includes('hyperliquid')` and log `{url, body, status, startedAt, endedAt, latencyMs}`.

Ran 4 times in sequence — 23% 429 rate on the `POST /info candleSnapshot` endpoint. Reproduction complete.

---

## Hypothesis outcome

| # | Hypothesis | Verdict | Evidence |
|---|------------|---------|----------|
| 1 | **UI→SW abort race** — async `perpsDeactivateCandleStream` lets in-flight candle fetches complete after the UI has moved on | **Confirmed** | Run-2: two 429s fire during mid-switch with candle bodies targeting symbols the UI was already leaving. Architectural diagnosis in `perps-stream-bridge.ts:196-206` (deactivate returns `void` — caller can't await tear-down before the next activate). |
| 2 | Multi-view fan-out (popup + fullscreen) | Untested this run | Probe only drove one surface. Needs dual-surface variant. |
| 3 | StrictMode double-invoke | Unlikely | Dev build showed only 2-5 candle requests per 12-nav cycle — not double. |
| 4 | Per-IP HL budget saturation independent of UI | Secondary | 429s cluster tightly around rapid-switch (run-2 got 2 back-to-back), not evenly distributed across the 90s window. |
| 5 | Stagger/debounce constants diverged from mobile | Low | `REST_HYDRATION_STAGGER_MS = 200` unchanged — the 429s happen within a single stagger window (121–197ms latencies). |

---

## Fix sketch (from `comparison.md`)

**Location:** `app/scripts/controllers/perps/perps-stream-bridge.ts:181-207` + `ui/providers/perps/CandleStreamChannel.ts:336-395`

1. **Idempotent activate** (`perpsActivateCandleStream`) — compute `key = #candleSubscriptionKey(symbol, interval)` *before* awaiting `#initAndActivate()`. If `#dynamicUnsubs[key]` already exists, return `'ok'` immediately.
2. **Deferred deactivate** (`perpsDeactivateCandleStream`) — wrap the `#tearDownDynamicKey` call in a 150ms `setTimeout` keyed by `symbol+interval`. Cancel if a matching activate arrives before the timer fires. Collapses rapid A→B→A flip-flops to no-ops.
3. **UI-side leading-edge debounce** (`CandleStreamChannel.connect`) — 120ms debounce with leading-edge invoke; prevents the React-nav unmount→remount pair from hitting the SW at all.

Combined effect: 6-market cycle in ~1.2s should produce **one** candle request for the landing symbol, not six activate/deactivate pairs. Keeps the `AbortController` guard intact for the genuine "user left the chart" case.

---

## What ships with this PR

- `artifacts/INVESTIGATION.md` — this document.
- `artifacts/comparison.md` — hypothesis ranking + mobile↔extension architectural table.
- `artifacts/report.md` — deliverable summary.
- `artifacts/recipe.json` — 16-node validation recipe (hand-off for QA / live extension testing).
- `artifacts/recipe-quality.json` — quality eval.
- `artifacts/live-capture-run-{1,2,3}.json` + `artifacts/live-capture.json` — raw CDP capture data from the reproduction runs.
- `probe-rapid-switch.js` — the Node CDP probe script used to reproduce (keep in-task, no shipping to production code).
- **No changes** to `app/scripts/controllers/perps/perps-stream-bridge.ts`. Investigation-only deliverable.
