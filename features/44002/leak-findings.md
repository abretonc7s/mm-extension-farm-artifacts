# Perps navigation leak — findings & proof (TAT-3461 spike)

> **Status:** pre-existing leak, **not introduced by the expanded view**. Recorded
> here for a separate fix ticket. The expanded view inherits and slightly
> amplifies it.

## Summary

Repeatedly mounting/unmounting a perps market view (navigate perps tab ⇄ market)
leaks DOM nodes, JS event listeners, and JS heap **monotonically** — they are not
released on unmount. The leak occurs on the **popup detail page alone** (no
expanded view involved), and at an essentially identical **listener** rate on the
expanded view, which points at a **shared component** (the candlestick chart
and/or perps stream subscriptions) rather than expanded-view-specific code.

## Evidence — navigation churn (8 mount/unmount cycles, ETH, mme-5 :7665)

Captured via `artifacts/cdp-churn.js` (CDP `Performance.getMetrics` per cycle).
Raw data: `artifacts/perf-churn.json`.

| View | DOM nodes (start → end) | per-cycle | JS listeners (start → end) | **per-cycle** | Heap (start → end) |
| --- | --- | --- | --- | --- | --- |
| Popup detail (`/perps/market/ETH`) | 2887 → 7696 | +687 | 8735 → 34903 | **+3,750** | 200.8 → 290.0 MB |
| Expanded (`/perps/market-expanded/ETH`) | 2159 → 7888 | +815 | 4439 → 31005 | **+3,766** | 96.0 → 140.5 MB |

**Key reads**

1. **The popup detail page leaks on its own** — ~687 nodes and ~3,750 listeners
   per navigation cycle, with no expanded view in the picture. This is a
   pre-existing perps issue.
2. **The listener leak rate is the same on both views** (~3,750/cycle). Identical
   rate across two different page layouts ⇒ the leak lives in a component **common
   to both**, not in the expanded view's new panels.
3. The expanded view leaks slightly more **DOM nodes** per cycle (+815 vs +687)
   because it renders the extra panels (order book, inline trade ticket), but the
   dominant signal (listeners) is shared.

## Most likely source (to confirm during the fix)

Both views render:

- **`PerpsCandlestickChart`** (lightweight-charts) — charting libraries attach
  many internal listeners (crosshair, resize, mouse, time-scale). If the chart
  instance is not `.remove()`d on unmount, every mount leaks its listener set.
  This is the prime suspect for the ~3,750 listeners/cycle.
- **Perps stream subscriptions** (`usePerpsLive*` → `PerpsStreamManager` channels)
  and `PerpsLayout` lifecycle — if any `subscribe()` is not paired with an
  `unsubscribe()` on unmount, channel subscribers accumulate.

## Reproduce

```bash
cd /Users/deeeed/dev/metamask/metamask-extension-5
# Popup detail page (leaks on its own):
node temp/tasks/feat/tat-3461-0629-191632/artifacts/cdp-churn.js 7665 detail ETH 8 detail-churn out.json
# Expanded view (same listener rate):
node temp/tasks/feat/tat-3461-0629-191632/artifacts/cdp-churn.js 7665 expanded ETH 8 expanded-churn out.json
```

Each cycle navigates perps-tab → view → waits for the page testid → samples
`Performance.getMetrics`. Watch `listeners` and `nodes` climb monotonically.

## Recommended follow-up (separate ticket)

1. Confirm the source with a Chrome heap snapshot diff across one navigation cycle
   (retained `EventListener` / detached-node counts), or by temporarily disabling
   the chart and re-running the churn test.
2. Ensure `PerpsCandlestickChart` disposes its chart instance and removes all
   listeners on unmount; audit `usePerpsLive*` hooks for unpaired `subscribe()`.
3. Re-run `cdp-churn.js` — a fixed component should show a flat (non-growing)
   listener/node line across cycles.

## Caveat on absolute memory numbers

Absolute heap/listener counts are **session-cumulative** and not comparable across
separate runs without a fresh browser process (a page-level reload does **not**
reset the extension's accumulated heap). The *per-cycle growth slope within one
run* (above) is the reliable signal; raw single-point absolutes are not.
