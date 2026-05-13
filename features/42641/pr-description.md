## **Description**

Adds the slippage visualization and configuration surface defined in [TAT-1043](https://consensyssoftware.atlassian.net/browse/TAT-1043) to the extension perps order entry screen.

- New estimated-slippage row in `OrderSummary`, fed by a `useEstimatedSlippage` hook that walks the live HyperLiquid order book and reports a volume-weighted % deviation from mid (500ms-sampled to keep the form repaint budget sane).
- New `SlippageConfigModal` lets the user pick a max slippage in `0.1%`–`10%` 0.1-steps; the chosen value is persisted via `PreferencesController` as `perpsMaxSlippagePct` (same path `perpsSelectedCandlePeriod` uses) so it sticks across sessions.
- Default 3% (matches HyperLiquid's `DefaultMarketSlippageBps = 300`); submission is blocked client-side when the estimate exceeds the cap; cap value is forwarded to `perpsPlaceOrder` as `maxSlippageBps`.
- Telemetry: new `slippage_config_opened`, `slippage_config_changed`, `slippage_limit_blocked_order` interaction types plus `max_slippage_pct`, `max_slippage_source`, `estimated_slippage_pct` properties on `PerpsTradeTransaction`.

## **Changelog**

CHANGELOG entry: Added estimated-slippage display and configurable max-slippage cap on the perps order entry screen.

## **Related issues**

Fixes: [TAT-1043](https://consensyssoftware.atlassian.net/browse/TAT-1043)

## **Manual testing steps**

1. Open the extension, navigate to `Perps` → any market (e.g. SOL) → `Long`.
2. Enter a size; confirm the order summary now shows an `Estimated slippage` value next to a `Max 3.0%` button.
3. Click `Max 3.0%`; confirm the sheet opens with the current value pre-selected.
4. Change to `5%` (or use a preset), `Save`; confirm the row reflects `Max 5.0%`.
5. Reload the extension; confirm the value persists.
6. Open the sheet again, set `0.1%`, save; enter a $1,000,000 notional; confirm the submit button disables and a "Estimated slippage exceeds your max slippage of 0.1%" message renders.

## **Screenshots/Recordings**

_Evidence will be added after upload._

### **Before**

_Not applicable — additive feature._

### **After**

_See `after.mp4` (auto-attached after upload)._

## **Validation Recipe**

<details>
<summary>Runnable recipe — proves AC1, AC2, AC3, AC4, AC5</summary>

```json
{
  "schema_version": 1,
  "title": "TAT-1043 — Slippage visualization and configuration on perps order entry",
  "validate": {
    "workflow": {
      "pre_conditions": ["wallet.unlocked", "perps.feature_enabled"],
      "entry": "ac4-read-default-pref",
      "key_assertions": [
        "ac4-read-default-pref → preferences.perpsMaxSlippagePct unset, resolves to 3",
        "ac1-assert-estimate-visible → text endsWith '%' and parses as a number",
        "ac4-assert-default-3pct → max-slippage button text contains '3'",
        "ac2-assert-input-prefilled → modal input value === 3",
        "ac3-assert-persisted → preferences.perpsMaxSlippagePct === 5 after save",
        "ac3-assert-button-reflects → row repaints with '5'",
        "ac5-assert-submit-disabled → submit-order-button disabled AND perps-slippage-blocked-error visible"
      ],
      "run": "node temp/recipes/validate-recipe.js --recipe artifacts/recipe.json --cdp-port 6662 --skip-manual"
    }
  }
}
```

Full recipe lives at `temp/tasks/feat/tat-1043-0513-160437/artifacts/recipe.json`. Latest run: 16/16 nodes pass.

</details>

## **Pre-merge author checklist**

- [x] I've followed [MetaMask Contributor Docs](https://github.com/MetaMask/contributor-docs) and [MetaMask Extension Coding Standards](https://github.com/MetaMask/metamask-extension/blob/main/.github/guidelines/CODING_GUIDELINES.md).
- [x] I've completed the PR template to the best of my ability
- [x] I’ve included tests if applicable
- [x] I’ve documented my code using [JSDoc](https://jsdoc.app/) format if applicable
- [x] I’ve applied the right labels on the PR (see [labeling guidelines](https://github.com/MetaMask/metamask-extension/blob/main/.github/guidelines/LABELING_GUIDELINES.md)). Not required for external contributors.

## **Pre-merge reviewer checklist**

- [ ] I've manually tested the PR (e.g. pull and build branch, run the app, test code being changed).
- [ ] I confirm that this PR addresses all acceptance criteria described in the ticket it closes and includes the necessary testing evidence such as recordings and or screenshots.
