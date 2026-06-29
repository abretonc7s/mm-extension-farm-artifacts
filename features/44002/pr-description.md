## **Description**

Spike (TAT-3461) to de-risk the performance impact of the Extension perps **expanded ("extended") view**, implemented as a clean, production-shaped architecture rather than a throwaway PoC.

**TL;DR — the expanded view carries no significant performance cost.** It opens in ~21 ms with **0 ms Total Blocking Time** ("good") and adds **0 ms** of main-thread blocking during live streaming (order book included), because each panel owns its own subscriptions — no top-level price-lift, no whole-tree re-renders. Measuring it surfaced a **real, pre-existing perps leak** that is worth fixing next (separate ticket).

### Are the data calls the same? (the central question)

**Yes — identical, except one.** Both the expanded view and the popup detail page subscribe to the same module-level singleton channels (`PerpsStreamManager`): positions, orders, account, markets, candles, price. Reading them from multiple panels adds React subscribers, **not** network/background calls. The expanded view adds exactly **one** new subscription the popup never makes: **`usePerpsLiveOrderBook`** (a new order-book WebSocket feed). Remove it and the data footprint equals the popup's — it's a new *feature*, not a regression.

### Performance comparison (CDP-measured, reproducible)

| Metric | Expanded | Popup detail | Source |
| --- | --- | --- | --- |
| Time-to-render | ~21 ms | ~18 ms | `performance.now()` |
| Total Blocking Time | **0 ms (good)** | 0 ms (good) | `getLongTaskMetricsWithTBT` |
| Steady-state blocking (10 s, live) | **0 ms** | 0 ms | longtask observer |
| JS heap | ~115 MB | ~78 MB | `Performance.getMetrics` |
| DOM nodes | ~1,950 | ~880 | `Performance.getMetrics` |

The extra memory/DOM is the order book + the trade ticket rendered inline (the popup puts trading on a separate route) + all panels mounted at once — **no latency or main-thread cost.**

### Real performance issue found (for a separate fix)

While measuring, a navigation-churn test (8 mount/unmount cycles) exposed a **pre-existing leak**: each perps market-page mount leaks **~700 DOM nodes and ~3,750 event listeners**, and it leaks at the **same rate on the popup detail page with no expanded view involved** (popup +3,750/cycle, expanded +3,766/cycle). Identical rate across both ⇒ a **shared component**, **not introduced by this view** (the new panels' subscriptions here clean up correctly on unmount). Tracked separately in **[TAT-3462](https://consensyssoftware.atlassian.net/browse/TAT-3462)** with evidence + repro; recommended as a prerequisite before shipping the expanded view.

### Assessment of PoC #41661 (AC1)

**Keep:** the full-width route concept, the 3-column terminal, the panel decomposition. **Rework/discard:** the PoC lifted 4 live-stream subscriptions to the page and lifted chart price into page state (whole-tree re-renders on every tick), and duplicated the auth guard. This PR reworks all three.

### What this PR implements (AC4)

Shared `useAuthGuardRedirect` + generic `FullWidthLayout` (no duplicated guard); a thin orchestrator page with **per-panel subscriptions**; no top-level price-lift; shared `formStateToOrderParams`; a robust cold-mount guard; `data-testid`s throughout; and an **Expand** entry point on the market detail page (sidebar/popup → full tab, fullscreen → in-place).

Detailed report, methodology, ranked risks, and the sized follow-up breakdown are in the task artifacts (`report.md`, `leak-findings.md`) and the validation recipe below.

## **Changelog**

CHANGELOG entry: null

## **Related issues**

Fixes: [TAT-3461](https://consensyssoftware.atlassian.net/browse/TAT-3461)

## **Manual testing steps**

1. Open MetaMask and go to Perps → a market (e.g. ETH) detail page (popup, side panel, or fullscreen tab).
2. Click the new **Expand** icon in the market header.
3. From the popup/side panel it opens the full-width trading terminal in a new browser tab; from a fullscreen tab it navigates in place.
4. Confirm the terminal renders chart + live order book + trade ticket + positions, full width, with live price/order-book updates.

## **Screenshots/Recordings**

_Evidence will be added after upload._

### **Before**

### **After**

## **Pre-merge author checklist**

- [x] I've followed [MetaMask Contributor Docs](https://github.com/MetaMask/contributor-docs) and [MetaMask Extension Coding Standards](https://github.com/MetaMask/metamask-extension/blob/main/.github/guidelines/CODING_GUIDELINES.md).
- [x] I've completed the PR template to the best of my ability
- [x] I’ve included tests if applicable
- [x] I’ve documented my code using [JSDoc](https://jsdoc.app/) format if applicable
- [x] I’ve applied the right labels on the PR (see [labeling guidelines](https://github.com/MetaMask/metamask-extension/blob/main/.github/guidelines/LABELING_GUIDELINES.md)). Not required for external contributors.

## **Pre-merge reviewer checklist**

- [ ] I've manually tested the PR (e.g. pull and build branch, run the app, test code being changed).
- [ ] I confirm that this PR addresses all acceptance criteria described in the ticket it closes and includes the necessary testing evidence such as recordings and or screenshots.

## **Validation Recipe**

Sidebar-entry recipe: opens the side panel, clicks the real Expand button, asserts the expanded terminal opens with all five panels + full width, and records the expanded vs popup TBT baseline (35/35 nodes pass).

<details>
<summary>recipe.json</summary>

```json
{
  "schema_version": 1,
  "title": "TAT-3461 Perps expanded view — sidebar entry, render + perf baseline",
  "description": "Starts from the side panel and exercises the real entry flow: open the side panel, open the ETH perps detail page, click the new Expand button, and assert the full-width expanded trading terminal opens in a browser tab and renders every panel (AC4). Captures a reproducible Long-Task/TBT perf baseline for the expanded view vs the popup detail page (AC2). Sidebar/new-tab steps run through artifacts/cdp-step.js (trusted CDP gestures + tab handling); the evidence screenshot uses ui.screenshot on the runner tab navigated to the expanded route. AC1 (PoC assessment) and AC3 (ranked risks + the pre-existing chart/stream leak, see leak-findings.md) are written deliverables.",
  "validate": {
    "workflow": {
      "entry": "status",
      "nodes": {
        "status": {
          "action": "app.status",
          "intent": "Read runner compatibility status",
          "flow": "setup",
          "next": "fixture"
        },
        "fixture": {
          "action": "metamask.wallet.fixture_status",
          "intent": "Verify wallet fixture availability",
          "flow": "setup",
          "next": "setup-unlock"
        },
        "setup-unlock": {
          "action": "metamask.wallet.ensure_unlocked",
          "intent": "Ensure the wallet is unlocked",
          "flow": "setup",
          "next": "setup-clean-perf"
        },
        "setup-clean-perf": {
          "action": "command",
          "cmd": "rm -f temp/tasks/feat/tat-3461-0629-191632/artifacts/perf-metrics.json",
          "intent": "Start from a clean perf-metrics file",
          "flow": "setup",
          "next": "setup-assert-clean"
        },
        "setup-assert-clean": {
          "action": "assert_exit_code",
          "source": "setup-clean-perf",
          "expected": 0,
          "intent": "Confirm perf-metrics reset",
          "flow": "setup",
          "next": "setup-open-sidebar"
        },
        "setup-open-sidebar": {
          "action": "command",
          "cmd": "bash temp/recipe/harness/extension/scripts/sidepanel-toggle.sh open --cdp-port ${CDP_PORT:-7665} && sleep 3",
          "intent": "Open the extension side panel (primary product surface)",
          "flow": "ac4 sidebar",
          "next": "setup-assert-sidebar"
        },
        "setup-assert-sidebar": {
          "action": "assert_exit_code",
          "source": "setup-open-sidebar",
          "expected": 0,
          "intent": "Confirm the side panel opened",
          "flow": "ac4 sidebar",
          "next": "ac4-sidebar-nav-detail"
        },
        "ac4-sidebar-nav-detail": {
          "action": "command",
          "cmd": "STEP_TARGET=sidepanel.html node temp/tasks/feat/tat-3461-0629-191632/artifacts/cdp-step.js ${CDP_PORT:-7665} nav '#/perps/market/ETH' && sleep 4",
          "intent": "Open the ETH perps market in the side panel",
          "flow": "ac4 sidebar",
          "next": "ac4-sidebar-wait-detail"
        },
        "ac4-sidebar-wait-detail": {
          "action": "command",
          "cmd": "STEP_TARGET=sidepanel.html node temp/tasks/feat/tat-3461-0629-191632/artifacts/cdp-step.js ${CDP_PORT:-7665} wait perps-market-detail-page 20000",
          "intent": "Wait for the detail page in the side panel",
          "flow": "ac4 sidebar",
          "next": "ac4-sidebar-assert-detail"
        },
        "ac4-sidebar-assert-detail": {
          "action": "assert_exit_code",
          "source": "ac4-sidebar-wait-detail",
          "expected": 0,
          "intent": "Confirm the detail page rendered in the side panel",
          "flow": "ac4 sidebar",
          "next": "ac4-sidebar-wait-expand-button"
        },
        "ac4-sidebar-wait-expand-button": {
          "action": "command",
          "cmd": "STEP_TARGET=sidepanel.html node temp/tasks/feat/tat-3461-0629-191632/artifacts/cdp-step.js ${CDP_PORT:-7665} wait perps-market-detail-expand-button 15000",
          "intent": "Confirm the Expand button is present in the side panel",
          "flow": "ac4 sidebar",
          "next": "ac4-sidebar-assert-expand-button"
        },
        "ac4-sidebar-assert-expand-button": {
          "action": "assert_exit_code",
          "source": "ac4-sidebar-wait-expand-button",
          "expected": 0,
          "intent": "Confirm the Expand affordance exists on the detail page",
          "flow": "ac4 sidebar",
          "next": "ac4-sidebar-click-expand"
        },
        "ac4-sidebar-click-expand": {
          "action": "command",
          "cmd": "STEP_TARGET=sidepanel.html node temp/tasks/feat/tat-3461-0629-191632/artifacts/cdp-step.js ${CDP_PORT:-7665} click perps-market-detail-expand-button && sleep 4",
          "intent": "Click Expand in the side panel (trusted gesture opens a full tab)",
          "flow": "ac4 sidebar",
          "next": "ac4-sidebar-assert-click"
        },
        "ac4-sidebar-assert-click": {
          "action": "assert_exit_code",
          "source": "ac4-sidebar-click-expand",
          "expected": 0,
          "intent": "Confirm the Expand click dispatched",
          "flow": "ac4 sidebar",
          "next": "ac4-wait-expanded-tab"
        },
        "ac4-wait-expanded-tab": {
          "action": "command",
          "cmd": "node temp/tasks/feat/tat-3461-0629-191632/artifacts/cdp-step.js ${CDP_PORT:-7665} wait-tab 'market-expanded/ETH' 20000",
          "intent": "Wait for the expanded view to open in a new browser tab",
          "flow": "ac4 sidebar",
          "next": "ac4-assert-expanded-tab"
        },
        "ac4-assert-expanded-tab": {
          "action": "assert_exit_code",
          "source": "ac4-wait-expanded-tab",
          "expected": 0,
          "intent": "Confirm the Expand button opened the expanded tab",
          "flow": "ac4 sidebar",
          "next": "ac2-reset-expanded"
        },
        "ac2-reset-expanded": {
          "action": "command",
          "cmd": "STEP_TARGET=market-expanded node temp/tasks/feat/tat-3461-0629-191632/artifacts/cdp-step.js ${CDP_PORT:-7665} reset",
          "intent": "Reset Long-Task/TBT counters on the expanded tab",
          "flow": "ac2 perf",
          "next": "ac4-wait-expanded-page"
        },
        "ac4-wait-expanded-page": {
          "action": "command",
          "cmd": "STEP_TARGET=market-expanded node temp/tasks/feat/tat-3461-0629-191632/artifacts/cdp-step.js ${CDP_PORT:-7665} wait perps-market-expanded-page 20000",
          "intent": "Wait for the expanded terminal to render in the new tab",
          "flow": "ac4 architecture",
          "next": "ac4-assert-expanded-page"
        },
        "ac4-assert-expanded-page": {
          "action": "assert_exit_code",
          "source": "ac4-wait-expanded-page",
          "expected": 0,
          "intent": "Confirm the expanded page rendered",
          "flow": "ac4 architecture",
          "next": "ac4-check-panels"
        },
        "ac4-check-panels": {
          "action": "command",
          "cmd": "STEP_TARGET=market-expanded node temp/tasks/feat/tat-3461-0629-191632/artifacts/cdp-step.js ${CDP_PORT:-7665} panels",
          "intent": "Assert all five expanded panels render",
          "flow": "ac4 architecture",
          "next": "ac4-assert-panels"
        },
        "ac4-assert-panels": {
          "action": "assert_exit_code",
          "source": "ac4-check-panels",
          "expected": 0,
          "intent": "Confirm every panel rendered",
          "flow": "ac4 architecture",
          "next": "ac4-check-full-width"
        },
        "ac4-check-full-width": {
          "action": "command",
          "cmd": "STEP_TARGET=market-expanded node temp/tasks/feat/tat-3461-0629-191632/artifacts/cdp-step.js ${CDP_PORT:-7665} fullwidth perps-market-expanded-page",
          "intent": "Assert the expanded page spans the full viewport width",
          "flow": "ac4 architecture",
          "next": "ac4-assert-full-width"
        },
        "ac4-assert-full-width": {
          "action": "assert_exit_code",
          "source": "ac4-check-full-width",
          "expected": 0,
          "intent": "Confirm RootLayout max-width was bypassed",
          "flow": "ac4 architecture",
          "next": "ac2-measure-expanded"
        },
        "ac2-measure-expanded": {
          "action": "command",
          "cmd": "STEP_TARGET=market-expanded node temp/tasks/feat/tat-3461-0629-191632/artifacts/cdp-step.js ${CDP_PORT:-7665} metrics expanded temp/tasks/feat/tat-3461-0629-191632/artifacts/perf-metrics.json",
          "intent": "Capture expanded-view Long-Task/TBT baseline",
          "flow": "ac2 perf",
          "next": "ac2-assert-measure-expanded"
        },
        "ac2-assert-measure-expanded": {
          "action": "assert_exit_code",
          "source": "ac2-measure-expanded",
          "expected": 0,
          "intent": "Confirm expanded perf metrics captured",
          "flow": "ac2 perf",
          "next": "ac4-runner-warm-detail"
        },
        "ac4-runner-warm-detail": {
          "action": "ui.navigate",
          "hash": "#/perps/market/ETH",
          "intent": "Warm the runner tab on the detail route for the evidence screenshot",
          "flow": "ac4 evidence",
          "next": "ac4-runner-wait-detail"
        },
        "ac4-runner-wait-detail": {
          "action": "command",
          "cmd": "STEP_TARGET=market/ETH node temp/tasks/feat/tat-3461-0629-191632/artifacts/cdp-step.js ${CDP_PORT:-7665} wait perps-market-detail-page 20000",
          "intent": "Wait for the detail page on the runner tab",
          "flow": "ac4 evidence",
          "next": "ac2-reset-popup"
        },
        "ac4-runner-nav-expanded": {
          "action": "ui.navigate",
          "hash": "#/perps/market-expanded/ETH",
          "intent": "Navigate the runner tab to the expanded route for the screenshot",
          "flow": "ac4 evidence",
          "next": "ac4-runner-wait-expanded"
        },
        "ac4-runner-wait-expanded": {
          "action": "ui.wait_for",
          "text": "Order book",
          "intent": "Wait for the expanded terminal (order book visible)",
          "flow": "ac4 evidence",
          "next": "ac4-screenshot"
        },
        "ac4-screenshot": {
          "action": "ui.screenshot",
          "path": "evidence-ac4-expanded-view.png",
          "timeout_ms": 15000,
          "intent": "Capture the full-width expanded perps terminal",
          "flow": "ac4 evidence",
          "next": "ac2-assert-perf-json"
        },
        "ac2-reset-popup": {
          "action": "command",
          "cmd": "STEP_TARGET=market/ETH node temp/tasks/feat/tat-3461-0629-191632/artifacts/cdp-step.js ${CDP_PORT:-7665} reset",
          "intent": "Reset counters before the popup measurement",
          "flow": "ac2 perf",
          "next": "ac2-measure-popup"
        },
        "ac2-measure-popup": {
          "action": "command",
          "cmd": "STEP_TARGET=market/ETH node temp/tasks/feat/tat-3461-0629-191632/artifacts/cdp-step.js ${CDP_PORT:-7665} metrics popup temp/tasks/feat/tat-3461-0629-191632/artifacts/perf-metrics.json",
          "intent": "Capture popup detail Long-Task/TBT baseline for comparison",
          "flow": "ac2 perf",
          "next": "ac2-assert-measure-popup"
        },
        "ac2-assert-measure-popup": {
          "action": "assert_exit_code",
          "source": "ac2-measure-popup",
          "expected": 0,
          "intent": "Confirm popup perf metrics captured",
          "flow": "ac2 perf",
          "next": "ac4-runner-nav-expanded"
        },
        "ac2-assert-perf-json": {
          "action": "assert_json",
          "path": "temp/tasks/feat/tat-3461-0629-191632/artifacts/perf-metrics.json",
          "assert": { "path": "$.expanded.ok", "operator": "eq", "value": true },
          "intent": "Confirm a numeric expanded-view TBT baseline was recorded",
          "flow": "ac2 perf",
          "next": "done"
        },
        "done": {
          "action": "end",
          "status": "pass",
          "intent": "Finish sidebar-entry expanded-view render + perf recipe",
          "flow": "complete"
        }
      }
    }
  }
}
```

</details>
