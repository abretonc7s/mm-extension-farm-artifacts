## **Description**

When a perps position has a liquidation price ≤ $0 (possible with very high leverage or cross margin), the extension displayed "0%" for liquidation distance and "$0.00" for liquidation price. Fixed by formatting liquidation distance with a minimum threshold (`<0.1%`) and showing `--` for invalid liquidation prices.

## **Changelog**

CHANGELOG entry: Fixed liquidation distance showing "0%" instead of a minimum-threshold value when liquidation price is at or below zero

## **Related issues**

Fixes: [TAT-3012](https://consensyssoftware.atlassian.net/browse/TAT-3012)

## **Manual testing steps**

1. Open Extension and navigate to Perps tab
2. Open or have a position with very high leverage such that liquidation price is ≤ $0
3. Observe the liquidation price on the market detail page — should show "--"
4. Open "Add margin" modal — liquidation price should show "--" and liquidation distance should show "<0.1%"
5. Open "Remove margin" modal — same fallback/min-threshold formatting should apply

## **Screenshots/Recordings**

The previous before/after screenshots did not prove this PR because the live path only showed the normal `liq > 0` state. I replaced them with recipe-generated evidence for the actual `liq <= 0` edge case by seeding an ETH position with `liquidationPrice: -100.50`.

<table>
<tr><td colspan="2"><strong>TAT-3012 edge-case evidence from updated recipe</strong></td></tr>
<tr>
<td align="center" width="50%"><em>Market detail: liquidation price fallback</em><br/><img src="https://raw.githubusercontent.com/abretonc7s/mm-extension-farm-artifacts/main/fixes/42293/tat-3012-market-detail-liq-fallback.png" alt="Market detail showing Liquidation price as -- for seeded negative liquidation price" width="400" /></td>
<td align="center" width="50%"><em>Add margin: distance minimum threshold</em><br/><img src="https://raw.githubusercontent.com/abretonc7s/mm-extension-farm-artifacts/main/fixes/42293/tat-3012-add-margin-liq-distance.png" alt="Add margin modal showing liquidation price as -- and liquidation distance as &lt;0.1%" width="400" /></td>
</tr>
</table>

Updated recipe result: 11/11 nodes passed. It asserts market detail `Liquidation price` is `--`, then opens Add margin and asserts `Liquidation price` is `--` and `Liquidation distance` is `<0.1%`.

## **Pre-merge author checklist**

- [x] I've followed [MetaMask Contributor Docs](https://github.com/MetaMask/contributor-docs) and [MetaMask Extension Coding Standards](https://github.com/MetaMask/metamask-extension/blob/main/.github/guidelines/CODING_GUIDELINES.md).
- [x] I've completed the PR template to the best of my ability
- [x] I've included tests if applicable
- [x] I've documented my code using [JSDoc](https://jsdoc.app/) format if applicable
- [x] I've applied the right labels on the PR (see [labeling guidelines](https://github.com/MetaMask/metamask-extension/blob/main/.github/guidelines/LABELING_GUIDELINES.md)). Not required for external contributors.

## **Pre-merge reviewer checklist**

- [ ] I've manually tested the PR (e.g. pull and build branch, run the app, test code being changed).
- [ ] I confirm that this PR addresses all acceptance criteria described in the ticket it closes and includes the necessary testing evidence such as recordings and or screenshots.

## **Validation Recipe**

<details>
<summary>recipe.json</summary>

```json
{
  "schema_version": 1,
  "title": "TAT-3012: Liquidation distance evidence for liq price <= 0",
  "description": "Seeds the Perps stream cache with an ETH position whose liquidation price is negative, then verifies the market detail and add-margin modal render useful fallback/min-threshold evidence.",
  "validate": {
    "workflow": {
      "pre_conditions": ["wallet.unlocked", "perps.feature_enabled"],
      "entry": "seed-negative-liquidation-position",
      "nodes": {
        "seed-negative-liquidation-position": {
          "action": "eval_sync",
          "expression": "(function(){ var state = window.stateHooks.store.getState().metamask; var selectedId = state.internalAccounts && state.internalAccounts.selectedAccount; var selectedAddress = (state.internalAccounts && state.internalAccounts.accounts && state.internalAccounts.accounts[selectedId] && state.internalAccounts.accounts[selectedId].address) || '0x8dc623e964475d4d669da601fd15ea9125469003'; var sm = window.stateHooks.getPerpsStreamManager(); sm.pendingInit = null; sm.initializedAddress = selectedAddress; var market = { symbol: 'ETH', name: 'Ethereum', maxLeverage: '20x', price: '$3,025.50', change24h: '+$75.50', change24hPercent: '+2.56%', volume: '$850M', openInterest: '$1.8B', nextFundingTime: Date.now() + 3600000, fundingIntervalHours: 8, fundingRate: 0.00008 }; var position = { symbol: 'ETH', size: '2.5', entryPrice: '2850.00', positionValue: '7125.00', unrealizedPnl: '375.00', marginUsed: '2375.00', leverage: { type: 'isolated', value: 3, rawUsd: '2375.00' }, liquidationPrice: '-100.50', maxLeverage: 20, returnOnEquity: '0.1579', cumulativeFunding: { allTime: '12.50', sinceOpen: '8.30', sinceChange: '0.00' }, takeProfitPrice: '3200.00', stopLossPrice: '2600.00', takeProfitCount: 1, stopLossCount: 1 }; var account = { totalBalance: '15250.00', availableBalance: '10125.00', availableToTradeBalance: '10125.00', marginUsed: '5125.00', unrealizedPnl: '375.00', returnOnEquity: '7.32' }; sm.handleBackgroundUpdate({ channel: 'markets', data: [market] }); sm.handleBackgroundUpdate({ channel: 'positions', data: [position] }); sm.handleBackgroundUpdate({ channel: 'orders', data: [] }); sm.handleBackgroundUpdate({ channel: 'account', data: account }); location.hash = '#/'; setTimeout(function(){ location.hash = '#/perps/market/ETH'; }, 100); return JSON.stringify({ seeded: true, selectedAddress: selectedAddress, positions: sm.positions.getCachedData().length }); })()",
          "assert": {
            "all": [
              { "field": "seeded", "operator": "eq", "value": true },
              { "field": "positions", "operator": "eq", "value": 1 }
            ]
          },
          "next": "wait-market-detail"
        },
        "wait-market-detail": {
          "action": "wait_for",
          "test_id": "perps-market-detail-page",
          "timeout": 10000,
          "next": "assert-market-liq-fallback"
        },
        "assert-market-liq-fallback": {
          "action": "eval_sync",
          "expression": "(function(){ var el = document.querySelector('[data-testid=\"perps-position-liquidation-value\"]'); return JSON.stringify({ text: el ? el.textContent.trim() : 'NOT_FOUND' }); })()",
          "save_as": "marketLiqPriceText",
          "assert": {
            "field": "text",
            "operator": "eq",
            "value": "--"
          },
          "next": "scroll-market-liq-row"
        },
        "scroll-market-liq-row": {
          "action": "eval_sync",
          "expression": "(function(){ var el = document.querySelector('[data-testid=\"perps-position-liquidation-value\"]'); if (el) { el.scrollIntoView({ block: 'center', inline: 'nearest' }); } return JSON.stringify({ scrolled: !!el }); })()",
          "assert": {
            "field": "scrolled",
            "operator": "eq",
            "value": true
          },
          "next": "screenshot-market-liq-fallback"
        },
        "screenshot-market-liq-fallback": {
          "action": "screenshot",
          "filename": "tat-3012-market-detail-liq-fallback",
          "note": "TAT-3012: seeded ETH position has liquidationPrice -100.50 and market detail renders Liquidation price as --.",
          "next": "open-margin-menu"
        },
        "open-margin-menu": {
          "action": "press",
          "test_id": "perps-margin-card",
          "next": "wait-margin-menu"
        },
        "wait-margin-menu": {
          "action": "wait_for",
          "test_id": "perps-margin-menu-add",
          "timeout": 5000,
          "next": "open-add-margin"
        },
        "open-add-margin": {
          "action": "press",
          "test_id": "perps-margin-menu-add",
          "next": "wait-add-margin-modal"
        },
        "wait-add-margin-modal": {
          "action": "wait_for",
          "test_id": "perps-edit-margin-liquidation-distance-value",
          "timeout": 5000,
          "next": "assert-add-margin-distance"
        },
        "assert-add-margin-distance": {
          "action": "eval_sync",
          "expression": "(function(){ var distance = document.querySelector('[data-testid=\"perps-edit-margin-liquidation-distance-value\"]'); return JSON.stringify({ distance: distance ? distance.textContent.trim() : 'NOT_FOUND', text: document.body.innerText }); })()",
          "save_as": "addMarginText",
          "assert": {
            "all": [
              { "field": "distance", "operator": "eq", "value": "<0.1%" },
              { "field": "text", "operator": "matches", "pattern": "Liquidation price\\s+--" }
            ]
          },
          "next": "screenshot-add-margin-distance"
        },
        "screenshot-add-margin-distance": {
          "action": "screenshot",
          "filename": "tat-3012-add-margin-liq-distance",
          "note": "TAT-3012: seeded negative liquidation price renders Add margin liquidation distance as <0.1% and liquidation price as --.",
          "next": "end-success"
        },
        "end-success": {
          "action": "end",
          "message": "Useful TAT-3012 evidence captured for the liq <= 0 edge case."
        }
      }
    }
  }
}
```

</details>

## **Recipe Workflow**

<details>
<summary>workflow.mmd</summary>

```mermaid
flowchart TD
  %% TAT-3012: Liquidation distance fallback for liq price <= 0
  __entry__(["ENTRY"]) --> node_setup_navigate_market_detail
  node_setup_navigate_market_detail[["setup-navigate-market-detail<br/>perps/navigate-to-market-detail"]]
  node_setup_wait_position_loaded["setup-wait-position-loaded<br/>wait_for"]
  node_ac3_assert_liq_price_displayed["ac3-assert-liq-price-displayed<br/>eval_sync"]
  node_ac3_screenshot_liq_price["ac3-screenshot-liq-price<br/>screenshot"]
  node_setup_click_margin_card["setup-click-margin-card<br/>press"]
  node_setup_wait_margin_menu["setup-wait-margin-menu<br/>wait_for"]
  node_setup_click_add_margin["setup-click-add-margin<br/>press"]
  node_setup_wait_modal["setup-wait-modal<br/>wait_for"]
  node_ac1_assert_distance_valid["ac1-assert-distance-valid<br/>eval_sync"]
  node_ac1_screenshot_add_margin["ac1-screenshot-add-margin<br/>screenshot"]
  node_end_success(["end-success<br/>PASS"])
  node_setup_navigate_market_detail --> node_setup_wait_position_loaded
  node_setup_wait_position_loaded --> node_ac3_assert_liq_price_displayed
  node_ac3_assert_liq_price_displayed --> node_ac3_screenshot_liq_price
  node_ac3_screenshot_liq_price --> node_setup_click_margin_card
  node_setup_click_margin_card --> node_setup_wait_margin_menu
  node_setup_wait_margin_menu --> node_setup_click_add_margin
  node_setup_click_add_margin --> node_setup_wait_modal
  node_setup_wait_modal --> node_ac1_assert_distance_valid
  node_ac1_assert_distance_valid --> node_ac1_screenshot_add_margin
  node_ac1_screenshot_add_margin --> node_end_success
```

</details>

[TAT-3012]: https://consensyssoftware.atlassian.net/browse/TAT-3012?atlOrigin=eyJpIjoiNWRkNTljNzYxNjVmNDY3MDlhMDU5Y2ZhYzA5YTRkZjUiLCJwIjoiZ2l0aHViLWNvbS1KU1cifQ

<!-- CURSOR_SUMMARY -->
---

> [!NOTE]
> **Low Risk**
> Low risk UI/formatting and calculation-guard changes; primary risk is minor display regressions around liquidation edge cases, covered by added unit tests.
> 
> **Overview**
> Prevents perps liquidation *price* and *distance* from rendering misleading values when liquidation price is `<= 0` (now showing `--`/`<0.1%` instead of `-`/`$0.00`/`0%`) across the edit-margin modal and market detail page.
> 
> Updates liquidation-distance formatting to handle sub-1% values (1 decimal) and clamp very small/invalid cases, and tightens margin math helpers (`liquidationDistancePercent`, `estimateLiquidationPrice`) for negative/zero inputs. Adds focused unit tests for these edge cases (TAT-3012).
> 
> <sup>Reviewed by [Cursor Bugbot](https://cursor.com/bugbot) for commit 7e128c9ba987df4a5e366c414b20eca866a636b0. Bugbot is set up for automated code reviews on this repo. Configure [here](https://www.cursor.com/dashboard/bugbot).</sup>
<!-- /CURSOR_SUMMARY -->



