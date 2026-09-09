## **Description**

Start Perps market/account/price preload when an eligible wallet unlocks so data can be ready before the user opens Perps. Keep the route UI lazy and preserve the existing window-close disconnect grace period. Account transitions cancel old REST fallbacks and accept new-session snapshots after disconnect, including snapshots emitted before initialization returns.

Route Core preload traces through shared `trace`/`endTrace`. Use Mobile's documented `Perps Entry To Live Market List` for Home and `Perps Market List View` for the browser, with `perps.operation`, lifecycle_context and Home variants. End readiness after live rows commit and orders/positions/account finish loading; cancel or fail abandoned, timed-out and superseded work.

| Loading behavior | Before | After |
| --- | --- | --- |
| Wallet unlock | Perps loading waits for navigation into Perps. | Eligible wallets start market/account data and broad price preload from the wallet root. |
| First Perps entry | Connection and data loading start when the lazy Perps layout mounts. | Entry reuses preload work; loading remains until the required live data and rendered rows are ready. |
| Perps UI bundle | Route layout loads lazily. | Route layout still loads lazily; unlock preloads data. |
| Warm visit | No dedicated Perps entry-to-live trace. | Reuses available live data and records the documented Mobile entry trace with `warm` after a successful initial entry. |
| Background resume | No dedicated Perps entry lifecycle cohort. | Records `background_resume` on the next entry and waits for live readiness before successful completion. |
| Stale or incomplete data | No dedicated entry trace to distinguish it from successful live readiness. | Persisted metadata and unrelated-symbol prices cannot complete readiness; cancelled, failed and superseded entries end without success. |
| Measured loading duration | Controlled comparison pending. | The original comparison was invalidated by accumulated tabs. Controlled one-page samples then exposed different HTTP-cache behavior between builds; a comparable fresh-backend comparison is still pending. No numeric gain is claimed. |

A production-runtime prerequisite corrects NetworkController's fetch/btoa LavaMoat endowments in all eight overrides. No dependencies change.

Validation on the rebased branch, account-transition fix `63ddfd4fd5`: 576 tests pass; 240/253 changed executable lines covered (94.9%), with every file above 80%. The stream manager has 98.1% changed-line coverage. The bounded gate passes 510 tests across 13 suites. A non-test Chrome MV3 LavaMoat build and the 27/27-node product recipe pass. New regressions reproduce stale positions, orders and account REST writes plus dropped initial stream snapshots before the fix.

Additional browser runs exercised offline entry without false success, account switching from Home during offline preload, abandonment, lock/reset during offline entry, recovery after reconnecting, and disabling Basic Functionality. The full interruption recipe did not pass: locking with Basic Functionality disabled timed out, and a standalone close/reopen collector hit a CDP error. These checks remain incomplete. Remote Sentry ingestion, populated position/order variants, and a fair fresh-backend loading comparison remain unverified. No trades or transfers were made.

## **Changelog**

CHANGELOG entry: Preloaded Perps market data when the wallet unlocks.

## **Related issues**

Fixes: [TAT-3857](https://consensyssoftware.atlassian.net/browse/TAT-3857)

## **Manual testing steps**

1. Open an eligible wallet with Perps and Basic Functionality enabled. Lock and unlock it, and stay on wallet Home before opening Perps.
2. Open Perps and verify populated market rows replace the loading state. Open the full market browser and confirm its rows render.
3. Return Home and revisit Perps. Background the extension window, restore it and revisit Perps again.
4. With shared tracing visible in a development/Sentry-enabled environment, verify `Perps Connection Establishment`, `Perps Market Data Preload` and `Perps User Data Preload` on unlock. Verify `Perps Entry To Live Market List` for Home and `Perps Market List View` for the browser, with cold_process, warm and background_resume cohorts. Home completion must wait for orders and carry empty, position or order.
5. While loading, leave Perps, lock the wallet, or switch accounts. Verify abandoned work cannot end a newer trace successfully. Temporarily interrupt connectivity and verify readiness is not reported for an empty or stale list.
6. Close and promptly reopen the extension. Confirm its existing connection grace behavior remains intact. Disable Basic Functionality and confirm proactive preload stops.

<!--
## **Screenshots/Recordings**

Local recipe screenshot is retained in task artifacts at recipe-run-final/screenshots/evidence-ac5-live-markets.png. No hosted media attached in this pass.
-->

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

<details>
<summary>Unlock preload and Mobile trace parity, 27 executable nodes</summary>

```json
{
  "$schema": "https://farmslot.io/schemas/recipe-v1.schema.json",
  "title": "TAT-3857 unlock preload and Mobile lifecycle tracing",
  "workflow": {
    "entry": "setup-unlock",
    "nodes": {
      "setup-unlock": {
        "action": "metamask.wallet.ensure_unlocked",
        "intent": "Open the preserved wallet for the preload journey",
        "next": "setup-home"
      },
      "setup-home": {
        "action": "ui.navigate",
        "page": "home",
        "intent": "Establish wallet home before a fresh unlock",
        "next": "setup-lock"
      },
      "setup-lock": {
        "action": "metamask.wallet.lock",
        "intent": "End the previous unlocked Perps connection through the wallet lock action",
        "next": "setup-cache-expiry"
      },
      "setup-observer": {
        "action": "command",
        "cmd": "node temp/tasks/feat/tat-3857-0908-110457/artifacts/proof.ts start",
        "intent": "Observe real shared trace calls and WebSocket subscriptions in this slot",
        "next": "ac1-unlock"
      },
      "setup-reload": {
        "action": "command",
        "cmd": "node temp/tasks/feat/tat-3857-0908-110457/artifacts/proof.ts reload",
        "intent": "Create a fresh UI document while retaining the locked wallet and tracing observer",
        "next": "setup-observer"
      },
      "ac1-unlock": {
        "action": "metamask.wallet.ensure_unlocked",
        "intent": "Trigger proactive Perps preload from wallet unlock without entering Perps",
        "next": "ac1-preload"
      },
      "ac1-preload": {
        "action": "command",
        "cmd": "node temp/tasks/feat/tat-3857-0908-110457/artifacts/proof.ts preload",
        "timeout_ms": 60000,
        "intent": "Assert live markets account and prices are ready on wallet home with a successful connection trace",
        "next": "ac2-lazy"
      },
      "ac2-lazy": {
        "action": "command",
        "cmd": "node temp/tasks/feat/tat-3857-0908-110457/artifacts/proof.ts lazy",
        "intent": "Assert the Perps layout has not loaded before navigation and remains declared with mmLazy",
        "next": "ac3-shared"
      },
      "ac3-shared": {
        "action": "command",
        "cmd": "node temp/tasks/feat/tat-3857-0908-110457/artifacts/proof.ts shared",
        "intent": "Assert connection market and user preload spans reach both shared trace functions",
        "next": "ac4-cold-enter"
      },
      "ac4-cold-enter": {
        "action": "ui.navigate",
        "page": "perps",
        "intent": "Enter Perps for the first time in the document lifecycle",
        "next": "ac5-rows"
      },
      "ac5-rows": {
        "action": "ui.wait_for",
        "test_id": "perps-watchlist-BTC",
        "timeout_ms": 30000,
        "intent": "Establish the rendered Bitcoin market row before reading live readiness",
        "next": "ac5-state"
      },
      "ac5-state": {
        "action": "metamask.perps.read_visible_state",
        "surface": "home",
        "minimum_market_count": 1,
        "require_test_ids": [
          "perps-watchlist-BTC"
        ],
        "intent": "Assert market rows appear in the existing Perps view",
        "next": "ac4-cold-trace"
      },
      "ac4-cold-trace": {
        "action": "command",
        "cmd": "node temp/tasks/feat/tat-3857-0908-110457/artifacts/proof.ts entry cold_process",
        "intent": "Assert the first successful live render ends the cold process entry span",
        "next": "ac5-screenshot"
      },
      "ac5-screenshot": {
        "action": "ui.screenshot",
        "path": "screenshots/evidence-ac5-live-markets.png",
        "intent": "Record the rendered market list after live readiness assertions",
        "next": "ac4-home"
      },
      "ac4-home": {
        "action": "ui.navigate",
        "page": "home",
        "intent": "Leave Perps before the warm revisit",
        "next": "ac4-warm-enter"
      },
      "ac4-warm-enter": {
        "action": "ui.navigate",
        "page": "perps",
        "intent": "Revisit Perps with the existing document and preloaded data",
        "next": "ac4-warm-trace"
      },
      "ac4-warm-trace": {
        "action": "command",
        "cmd": "node temp/tasks/feat/tat-3857-0908-110457/artifacts/proof.ts entry warm",
        "intent": "Assert a distinct warm entry span completes with live rows",
        "next": "ac4-resume-home"
      },
      "ac4-resume-home": {
        "action": "ui.navigate",
        "page": "home",
        "intent": "Return to wallet home before exercising background resume",
        "next": "ac4-resume"
      },
      "ac4-resume": {
        "action": "command",
        "cmd": "node temp/tasks/feat/tat-3857-0908-110457/artifacts/proof.ts resume",
        "intent": "Hide and restore this extension page using a temporary browser tab",
        "next": "ac4-resume-enter"
      },
      "ac4-resume-enter": {
        "action": "ui.navigate",
        "page": "perps",
        "intent": "Enter Perps after returning from a hidden document",
        "next": "ac4-resume-trace"
      },
      "ac4-resume-trace": {
        "action": "command",
        "cmd": "node temp/tasks/feat/tat-3857-0908-110457/artifacts/proof.ts entry background_resume",
        "intent": "Assert Mobile-compatible background resume context on live entry",
        "next": "ac3-browser-enter"
      },
      "ac6-regression": {
        "action": "command",
        "cmd": "node temp/tasks/feat/tat-3857-0908-110457/artifacts/proof.ts regression",
        "intent": "Verify the existing account overview Perps tab trace definition and callers are preserved",
        "next": "teardown-observer"
      },
      "teardown-observer": {
        "action": "command",
        "cmd": "node temp/tasks/feat/tat-3857-0908-110457/artifacts/proof.ts stop",
        "intent": "Release task-owned debugger and network observers",
        "next": "teardown-done"
      },
      "teardown-done": {
        "action": "end",
        "status": "pass"
      },
      "setup-cache-expiry": {
        "action": "command",
        "cmd": "node temp/tasks/feat/tat-3857-0908-110457/artifacts/proof.ts cache-expiry",
        "timeout_ms": 45000,
        "intent": "Wait for the locked wallet caches to age past the Core 30-second preload guard without changing wallet state",
        "next": "setup-reload"
      },
      "ac3-browser-enter": {
        "action": "ui.navigate",
        "page": "perps-market-list",
        "intent": "Open the market browser to verify its separate Mobile screen trace",
        "next": "ac3-browser-trace"
      },
      "ac3-browser-trace": {
        "action": "command",
        "cmd": "node temp/tasks/feat/tat-3857-0908-110457/artifacts/proof.ts entry warm market_list",
        "intent": "Assert Perps Market List View ends with live rendered markets without conflating the Home CUF",
        "next": "ac6-regression"
      }
    }
  }
}
```

</details>


[TAT-3857]: https://consensyssoftware.atlassian.net/browse/TAT-3857?atlOrigin=eyJpIjoiNWRkNTljNzYxNjVmNDY3MDlhMDU5Y2ZhYzA5YTRkZjUiLCJwIjoiZ2l0aHViLWNvbS1KU1cifQ

<!-- CURSOR_SUMMARY -->
---

> [!NOTE]
> **Medium Risk**
> Touches background Perps connection lifecycle, stream gating, and init races across unlock, preferences, and account switches; mistakes could leak subscriptions, stale UI, or incorrect performance signals.
> 
> **Overview**
> Eligible wallets now **warm Perps market, account, and broad price data from the wallet root** (via `usePerpsPreload` and background `perpsStartPreload` / `perpsStopPreload`) without opening the lazy Perps layout. The stream bridge can emit selected channels through **`canEmit`** while preload owns the connection, tags market payloads with **`live`**, and gates init on **`isPreloadAllowed`** (unlock, onboarding, Basic Functionality, rollout). Disabling Basic Functionality **disconnects active Perps** proactively.
> 
> **Tracing** moves Core Perps spans onto shared **`trace` / `endTrace`** with expanded `TraceName` values; UI adds Mobile-aligned **entry lifecycle** (`Perps Entry To Live Market List`, market list view, connection establishment) that completes only when **live market rows and prices** commit—not cached seeds—with cold / warm / background_resume cohorts.
> 
> **Stream manager** changes serialize account init, ignore updates during pending init, merge shared price caches, and expose **`isLive`** for hooks. Tests and LavaMoat **`fetch` / `btoa`** endowments for `@metamask/network-controller` are updated accordingly.
> 
> <sup>Reviewed by [Cursor Bugbot](https://cursor.com/bugbot) for commit a2266af9b83cebf81149eae2ce568d6a95255ef3. Bugbot is set up for automated code reviews on this repo. Configure [here](https://www.cursor.com/dashboard/bugbot).</sup>
<!-- /CURSOR_SUMMARY -->