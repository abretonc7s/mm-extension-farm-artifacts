# TAT-3461 — Expanded (extended) view performance spike

**Ticket:** [TAT-3461](https://consensyssoftware.atlassian.net/browse/TAT-3461) ·
Parent epic TAT-2448 · Surface: **Extension** (perps expanded view).

## TL;DR

The expanded view **does not carry a significant performance cost on the
Extension.** Opening it renders in **~21 ms** with **0 ms Total Blocking Time**
("good"), and steady‑state streaming — including a live order book — adds **0 ms
of main‑thread blocking** because the clean architecture isolates each panel's
re‑renders. It reads the **same live data the popup already streams**, plus
exactly **one** new subscription (the order book).

What the measurement *did* surface is a **real, pre‑existing performance bug** in
the perps detail experience: each market‑page mount/unmount **leaks ~3,750 event
listeners and ~700 DOM nodes**, and it leaks at the **same rate on the popup
detail page with no expanded view involved**. That is the perf work worth doing
next — it is shared, it is not introduced by this view, and the expanded view
(which renders more at once) makes it marginally worse.

So: ship the expanded view on its merits; fix the shared leak as a prerequisite
follow‑up.

---

## AC1 — Assessment of PoC #41661 (keep / discard / rework)

PoC `feat/expanded-view-poc` (#41661, +5062/−101 across 45 files) proves
feasibility of a full‑width perps trading terminal at route
`/perps/market-expanded/:symbol`, rendered in a fullscreen tab outside the popup
max‑width.

| Area | Verdict | Notes |
| --- | --- | --- |
| Full‑width route + layout concept | **Keep** | Bypassing `RootLayout`'s `max-w-[clamp(...)]` is the right mechanism. |
| Component decomposition (header / chart / order book / trade / bottom panels) | **Keep** | Reasonable split; reused conceptually. |
| Terminal 3‑column layout | **Keep** | Good UX shape (chart \| order book \| ticket). |
| `RequireAuthenticatedFullWidth` duplicating the auth guard | **Rework** | Copy‑pasted onboarding/unlock logic. |
| 4 live‑stream subscriptions at the **page** level | **Discard** | All of `usePerpsLivePositions/Orders/Account/MarketData` at the top → any tick re‑renders the whole tree. |
| `onCurrentPriceChange={setCurrentPrice}` lifting chart price into page state | **Discard** | Every price tick re‑renders header + ticket + bottom panel + modals. |
| Hardcoded magic grid `minmax(420px,1fr) …` inline | **Rework** | Move to a named constant. |

**Conclusion:** keep the concept and the panel breakdown; rework the
architecture so live data is owned per‑panel rather than lifted to the page.

## AC2 — Performance baseline (method + numbers)

### Method

All measurements are scripted and headless (no Instruments GUI), reproducible on
any slot/port. Harness lives under `artifacts/`:

| Signal | CDP source | Script |
| --- | --- | --- |
| Main‑thread blocking / re‑render churn | `window.stateHooks.getLongTaskMetricsWithTBT()` (`PerformanceObserver('longtask')` → TBT, Lighthouse thresholds) | `cdp-step.js metrics`, `cdp-perf.js` |
| Time‑to‑rendered | `performance.now()` delta: navigation → first panel testid | `cdp-perf.js` |
| Memory / DOM / render work | CDP `Performance.getMetrics` (`JSHeapUsedSize`, `Nodes`, `JSEventListeners`, `LayoutCount`, `RecalcStyleCount`) | `cdp-perf.js`, `cdp-churn.js` |
| Leak slope | `Performance.getMetrics` sampled per nav cycle | `cdp-churn.js` |

Instances: **mme‑5 :7665** (this branch, has expanded view) vs **mme‑6 :7666**
(`main`, popup baseline). Same machine, same fixture, ETH.

### Numbers

**Open + steady‑state (warm session):**

| View | Time‑to‑render | TBT | TBT rating |
| --- | --- | --- | --- |
| Expanded (branch) | **21 ms** | **0 ms** | good |
| Popup detail (branch) | 18 ms | 0 ms | good |
| Popup detail (main) | 264 ms* | 0 ms | good |

\* cold first‑nav on main (markets less warm); branch numbers are warm. The
recipe (`recipe.json`) records `expanded` and `popup` TBT each run into
`perf-metrics.json` — both **0 / good**.

**Footprint snapshot (`Performance.getMetrics`, single warm sample):**

| | Expanded | Popup detail |
| --- | --- | --- |
| JS heap | ~115 MB | ~78 MB |
| DOM nodes | ~1,950 | ~880 |

**DOM‑node attribution per expanded panel** (direct subtree counts): order book
96 (+22 rows), trade ticket 83, chart 50, header 13, positions 2. The extra
footprint is the order book + the trade ticket rendered **inline** (the popup
puts trading on a separate route) + all panels mounted **simultaneously**.

> ⚠️ Absolute heap/listener single‑point numbers are **session‑cumulative** and
> not comparable across runs without a fresh browser process (a page reload does
> **not** reset the extension's accumulated heap). The reliable signals are TBT,
> time‑to‑render, per‑panel DOM attribution, and per‑cycle growth slopes (below).

### Are the data calls the same? (the central question)

**Yes — identical, except one.** Both views subscribe to the same module‑level
singleton channels via `PerpsStreamManager`: positions, orders, account,
markets, candles, price. Subscribing from multiple panels adds React subscribers
but **not** network/background calls. The expanded view adds exactly **one** new
subscription the popup never makes: **`usePerpsLiveOrderBook`** (a new order‑book
WebSocket feed). Remove it and the data footprint equals the popup's. That one
subscription is a new *feature*, not a regression.

## AC3 — Performance risks, ranked

| # | Risk | Impact | Evidence | Mitigation / open question |
| --- | --- | --- | --- | --- |
| 1 | **Pre‑existing perps navigation leak** | **High** | Churn test: popup detail leaks **+687 nodes / +3,750 listeners per nav cycle on its own**; expanded **+815 / +3,766** — same listener rate ⇒ shared component. `leak-findings.md`, `perf-churn.json` | **Not caused by the expanded view.** Shared source, non-obvious (the chart already disposes); tracked in **TAT-3462** with evidence + repro. This PR's new subscriptions clean up correctly. The expanded view amplifies it slightly. |
| 2 | Higher memory / DOM footprint | Medium | ~115 MB vs ~78 MB; ~1,950 vs ~880 nodes | Inherent to a multi‑panel terminal; acceptable. Lazy‑mount the order book only when visible to cut idle cost. |
| 3 | Order book is the one new high‑frequency stream | Low–Med | `usePerpsLiveOrderBook` activates a new WS feed | Throttle the order‑book channel; cap/virtualize levels; gate subscription on panel visibility. |
| 4 | Initial render / main‑thread blocking | **Low (de‑risked)** | TBT 0, ~21 ms render, steady‑state 0 | Per‑panel subscriptions already isolate re‑renders. No action. |

## AC4 — Clean architecture (implemented) + follow‑up tickets

This PR implements the clean architecture (not just a spike) so the perf claims
are measured against real code:

- **Shared full‑width layout** — `useAuthGuardRedirect` hook shared by
  `RequireAuthenticated` + new `RequireAuthenticatedFullWidth`; generic
  `FullWidthLayout` bypasses the popup max‑width. No duplicated guard.
- **Per‑panel subscriptions** — the page is a thin orchestrator; each panel owns
  only the streams it consumes (header→price, chart→candles, order‑book→book,
  trade→account+price, positions→positions+orders). A tick re‑renders one panel.
- **No top‑level price‑lift** — the trade ticket reads price from the stream
  directly; the chart owns its price line. No whole‑tree re‑render on price.
- Shared `formStateToOrderParams` extracted to `order-entry/order-params.ts`
  (deduped from the order entry page); named grid constant; robust cold‑mount
  guard (skeleton + in‑page not‑found, no redirect race); `data-testid`s
  throughout; an **Expand** entry point on the detail page (sidebar/popup → full
  tab, fullscreen → in‑place).

**Suggested delivery breakdown (follow‑up tickets):**

1. **Fix the shared perps navigation leak** (TAT-3462) — *prerequisite*; benefits popup and expanded.
2. Productionize the expanded view: responsive breakpoints, position/order inline
   actions (close/TPSL/margin from the bottom panel), order‑book throttle +
   visibility‑gated subscription.
3. Discoverability + analytics for the Expand entry point; empty/funded states.
4. Cross‑environment perf gate in CI using this harness (TBT budget per view).

## Methodology notes & reproducibility

Run the validation recipe (starts from the side panel, clicks the real Expand
button, asserts the terminal, records perf):

```bash
"$RUNNER_CMD" run temp/tasks/feat/tat-3461-0629-191632/artifacts/recipe.json \
  --adapter extension --cdp-port 7665 --launch-existing-dist --json \
  --artifacts-dir temp/tasks/feat/tat-3461-0629-191632/artifacts/recipe-run
```

Standalone perf / leak harness:

```bash
node artifacts/cdp-perf.js  7665 expanded ETH 10000 expanded out.json
node artifacts/cdp-churn.js 7665 detail   ETH 8     detail-churn churn.json   # leaks on its own
node artifacts/cdp-churn.js 7665 expanded ETH 8     expanded-churn churn.json # same listener rate
```

## Evidence artifacts

- `recipe.json` + `recipe-run/` — passing sidebar‑entry recipe (35/35 nodes).
- `recipe-run/evidence-ac4-expanded-view.png` — full‑width terminal.
- `perf-metrics.json` — per‑run expanded vs popup TBT.
- `perf-comparison.json` — Performance.getMetrics A/B.
- `perf-churn.json` + `leak-findings.md` — the pre‑existing leak, with repro.
