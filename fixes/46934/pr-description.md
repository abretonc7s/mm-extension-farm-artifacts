## **Description**

Upgrade `@metamask/perps-controller` from 17.1.0 to 20.0.0 (MV2/MV3 LavaMoat policies regenerated; no further policy changes from 19 to 20).

Fee previews now match what the controller charges:
- **Shared notional helper.** Order entry, close, close-all, reverse, auto-close and TP/SL use one helper to derive the USD notional passed to the controller fee quote and refetch when it changes. Close-all quotes each symbol using the combined batch notional. Since controller 18, bounded subscription waivers depend on size.
- **Fees from the controller quote.** Resolved rates, the VIP badge and the struck-through original rate come from controller 20's quote metadata. The badge shows only when the quote is reduced. The hook and close-all share one pure function to apply rewards discounts only to local fallbacks.
- **Controller 20 changes.** Missing realized PnL displays as Unknown (zero stays zero); the error map includes `ORDER_SCALE_PREVIEW_STALE`.

Validation: unit tests for every preview (discounted, undiscounted, full and blended waivers, rewards-lookup disagreement), TypeScript, lint, LavaMoat. Read-only live proof (dev1 testnet BTC long, 3x, USD 100 and 1000, HUD on) passes 43/43 on controller 19 and on this branch. No fixture account currently has a positive discount (10 fixtures checked on testnet, then mainnet read-only), so the discounted path is proven by the unit tests; no order, close or signature was submitted.

## **Changelog**

CHANGELOG entry: null

## **Related issues**

Fixes: [TAT-4063](https://consensyssoftware.atlassian.net/browse/TAT-4063)

## **Manual testing steps**

1. Load the updated extension and unlock a wallet with Perps enabled.
2. Open Perps in the fullscreen wallet.
3. Confirm the account balance and market watchlist load with prices.
4. Open positions, orders, and transaction history; confirm each view loads without errors.
5. For a history entry whose liquidation metadata omits the user address, confirm its other trade information remains visible and it does not show an account-specific “Liquidated” badge.

6. Open an order preview and enter an amount. Confirm the fee estimate updates and any rewards/subscription discount is applied once; leave the order unsubmitted.
7. With existing positions, open the close-all confirmation. Confirm its fee estimate loads and reflects each position size; leave the close action unsubmitted.

## **Screenshots/Recordings**

Current-source Perps home from the restored prepared wallet. Fee calculations are covered by focused tests; this image proves the read-only AC2 home surface.

<table>
<tr><td align="center" valign="top" width="50%"><strong>AC2: current-source populated Perps home</strong><br/><img src="https://raw.githubusercontent.com/abretonc7s/mm-extension-farm-artifacts/main/features/46934/recipe-run/screenshots/ac2-home.png?sha=9d7a218c1c25ad57" alt="AC2: current-source populated Perps home" width="320" /></td><td></td></tr>
</table>

## **Validation Recipe**

<details><summary>recipe.json (14 nodes — TAT-4063 Perps controller 19.0.0 proof)</summary>

```json
{
  "$schema": "https://farmslot.io/schemas/recipe-v1.schema.json",
  "title": "TAT-4063 Perps controller 19.0.0 proof",
  "description": "Read-only live regression guard followed by the new dependency-version assertion. Derived AC3 is corroborated outside this runtime recipe.",
  "workflow": {
    "entry": "setup-status",
    "nodes": {
      "setup-status": {
        "action": "app.status",
        "next": "setup-cdp",
        "intent": "Resolve the Extension checkout and adapter status before Perps proof"
      },
      "setup-cdp": {
        "action": "cdp.target",
        "required": true,
        "timeout_ms": 15000,
        "next": "setup-ensure-unlocked",
        "intent": "Confirm the Extension CDP runtime is reachable"
      },
      "setup-ensure-unlocked": {
        "action": "metamask.wallet.ensure_unlocked",
        "timeout_ms": 45000,
        "next": "setup-open-perps",
        "intent": "Ensure the wallet is unlocked before opening Perps"
      },
      "setup-open-perps": {
        "action": "ui.navigate",
        "next": "setup-perps-ready",
        "intent": "Show the Perps home surface",
        "hash": "#/perps-home"
      },
      "ac2-read-positions": {
        "action": "metamask.perps.read_positions",
        "next": "ac2-read-orders",
        "intent": "Read live Perps positions without mutating account state"
      },
      "ac2-read-orders": {
        "action": "metamask.perps.read_orders",
        "next": "ac2-settle",
        "intent": "Read live Perps open orders without mutating account state"
      },
      "gate-done": {
        "action": "end",
        "status": "pass"
      },
      "ac2-read-home": {
        "action": "metamask.perps.read_visible_state",
        "surface": "home",
        "minimum_market_count": 1,
        "require_features": [
          "balance",
          "market-list"
        ],
        "intent": "Observe a populated Perps home after setup",
        "next": "ac2-assert-home",
        "forbid_test_ids": [
          "perps-tutorial-skip-button"
        ],
        "max_items": 200
      },
      "ac2-assert-home": {
        "action": "assert_output",
        "source": "ac2-read-home",
        "assert": {
          "path": "$.surface",
          "operator": "eq",
          "value": "home"
        },
        "proves": [
          "AC2"
        ],
        "intent": "The observed surface is Perps home",
        "next": "ac2-assert-markets"
      },
      "ac2-assert-markets": {
        "action": "assert_output",
        "source": "ac2-read-home",
        "assert": {
          "path": "$.marketCount",
          "operator": "gte",
          "value": 1
        },
        "proves": [
          "AC2"
        ],
        "intent": "Perps home contains market data rather than only a loading shell",
        "next": "ac2-read-positions"
      },
      "ac2-settle": {
        "action": "ui.wait_for",
        "test_id": "perps-watchlist-BTC",
        "timeout_ms": 20000,
        "intent": "Show the populated account market watchlist",
        "next": "ac2-capture",
        "proves": [
          "AC2"
        ]
      },
      "ac2-capture": {
        "action": "ui.screenshot",
        "intent": "Preserve the read-only trading overview",
        "next": "ac1-version",
        "proves": [
          "AC2"
        ]
      },
      "ac1-version": {
        "action": "command",
        "cmd": "node -e 'const fs=require('\"'\"'node:fs'\"'\"');const assert=require('\"'\"'node:assert/strict'\"'\"');const manifest=require('\"'\"'./package.json'\"'\"').dependencies['\"'\"'@metamask/perps-controller'\"'\"'];const installed=require('\"'\"'./node_modules/@metamask/perps-controller/package.json'\"'\"').version;const lock=fs.readFileSync('\"'\"'yarn.lock'\"'\"','\"'\"'utf8'\"'\"');console.log(JSON.stringify({manifest,installed,lock19:lock.includes('\"'\"'resolution: \\\"@metamask/perps-controller@npm:19.0.0\\\"'\"'\"')}));assert.equal(manifest,'\"'\"'^19.0.0'\"'\"');assert.equal(installed,'\"'\"'19.0.0'\"'\"');assert.ok(lock.includes('\"'\"'resolution: \\\"@metamask/perps-controller@npm:19.0.0\\\"'\"'\"'));'",
        "timeout_ms": 10000,
        "intent": "The installed trading controller matches the requested release",
        "next": "gate-done",
        "proves": [
          "AC1"
        ]
      },
      "setup-perps-ready": {
        "action": "ui.wait_for",
        "test_id": "perps-watchlist-BTC",
        "timeout_ms": 60000,
        "intent": "The account watchlist is ready before checking the trading overview",
        "next": "ac2-read-home"
      }
    }
  },
  "proofTargets": [
    {
      "id": "AC1",
      "claim": "The Extension manifest, lockfile and installed controller resolve 19.0.0."
    },
    {
      "id": "AC2",
      "claim": "The live Perps home remains populated and positions/orders reads succeed."
    }
  ]
}
```
</details>

## **Validation Logs**

<details><summary>Full output (14/14 passed, pass)</summary>

```
# MetaMask Recipe Run

Status: pass
Duration: 5.2s
Nodes: 14/14 passed

## Side findings
- REVIEW 2 distinct application warning/error event(s) (non-blocking; expanded below and stored in diagnostics.json)

## Steps
- PASS setup-status (app.status, 14ms): platform=extension
- PASS setup-cdp (cdp.target, 8ms): platform=extension
- PASS setup-ensure-unlocked (metamask.wallet.ensure_unlocked, 341ms): proof=extension-password-unlock
- PASS setup-open-perps (ui.navigate, 151ms): proof=ui-navigation
- PASS setup-perps-ready (ui.wait_for, 3.3s): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=9EB98A70161C9ACB2FD39A995ADBD422, runtimeSessionId=2a5d1c03-88df-4870-b00a-b6144cb1bff4
- PASS ac2-read-home (metamask.perps.read_visible_state, 149ms): platform=extension, route=#/perps-home, proof=visible-dom-accessibility
- PASS ac2-assert-home (assert_output, 7ms): source=ac2-read-home, stream=stdout
- PASS ac2-assert-markets (assert_output, 8ms): source=ac2-read-home, stream=stdout
- PASS ac2-read-positions (metamask.perps.read_positions, 137ms): count=0, matching=0
- PASS ac2-read-orders (metamask.perps.read_orders, 130ms): count=0, matching=0
- PASS ac2-settle (ui.wait_for, 548ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=9EB98A70161C9ACB2FD39A995ADBD422, runtimeSessionId=2a5d1c03-88df-4870-b00a-b6144cb1bff4
- PASS ac1-version (command, 36ms): exitCode=0, stdout={"manifest":"^19.0.0","installed":"19.0.0","lock19":true}

- PASS gate-done (end, 0ms)
```
</details>

## **Pre-merge author checklist**

- [x] Followed the repository coding guidelines.
- [x] Completed the available template prose and retained validation evidence.
- [x] Included focused regression tests.
<!-- Labels are assigned by the publication host; no PR exists yet. -->
<!-- Documentation checklist: no new public component or utility. -->

<!--
## **Pre-merge reviewer checklist**

Reserved for the human reviewer after publication.
-->

## **Pre-merge reviewer checklist**

- [ ] I've manually tested the PR (e.g. pull and build branch, run the app, test code being changed).
- [ ] I confirm that this PR addresses all acceptance criteria described in the ticket it closes and includes the necessary testing evidence such as recordings and or screenshots.


[TAT-4063]: https://consensyssoftware.atlassian.net/browse/TAT-4063?atlOrigin=eyJpIjoiNWRkNTljNzYxNjVmNDY3MDlhMDU5Y2ZhYzA5YTRkZjUiLCJwIjoiZ2l0aHViLWNvbS1KU1cifQ

<!-- CURSOR_SUMMARY -->
---

> [!NOTE]
> **Medium Risk**
> Wide changes to Perps fee estimation and a major controller bump affect order previews and close flows; incorrect notional or discount handling could misstate fees before submit.
> 
> **Overview**
> Bumps **`@metamask/perps-controller`** to **^20.0.0** and refreshes MV2/MV3 LavaMoat policies for its nested `@metamask/utils` dependency paths.
> 
> **Fee previews** now pass **USD notional** (`amount`) into `perpsCalculateFees` everywhere fees matter—order entry/close, close-all, reverse, and TP/SL—so subscription caps and batch builder discounts match controller behavior. Close-all quotes each symbol with the **combined batch notional**; TP/SL uses the largest trigger notional (or a shared parent notional from order entry).
> 
> **`usePerpsOrderFees`** stops double-applying rewards: **resolved controller quotes** are shown as returned; the UI rewards discount applies only to **local RPC/timeout fallbacks**. Discount badges follow quote metadata (`feeSource` / `metamaskFeeDiscountBips`) when rates actually drop.
> 
> **Transaction history** treats missing PnL as **unknown** (no fabricated net amounts), allows optional liquidation fields without `liquidatedUser`, and keeps list/details styling consistent.
> 
> <sup>Reviewed by [Cursor Bugbot](https://cursor.com/bugbot) for commit 262e1760527371154711b619a74e3f3b3e2670d2. Bugbot is set up for automated code reviews on this repo. Configure [here](https://www.cursor.com/dashboard/bugbot).</sup>
<!-- /CURSOR_SUMMARY -->

