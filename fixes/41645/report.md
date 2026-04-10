# Fix Report — TAT-2901

## Summary

`PerpsController.toggleTestnet()` was registered as a background RPC action at `perps-controller-init.ts:220` but had no `ui/store/actions.ts` wrapper and no UI surface. This blocked automated testing and manual QA on testnet perps markets. The fix adds the action wrapper and a `METAMASK_DEBUG`-gated toggle in the developer options tab.

## Root Cause

`perpsToggleTestnet` is registered in the background at `app/scripts/messenger-client-init/perps-controller-init.ts:220` and exposed via `metamask-controller.js:6795`. The `ui/store/actions.ts` had no wrapper to call it, and no component in the UI called `submitRequestToBackground('perpsToggleTestnet')`. The selector `selectPerpsIsTestnet` at `ui/selectors/perps-controller.ts:32` already read the state, but nothing flipped it.

## Changes

- `ui/store/actions.ts` — adds `perpsToggleTestnet()` async action (~5 LoC)
- `ui/pages/settings/developer-options-tab/developer-options-tab.tsx` — adds `ToggleRow` with `data-testid="perps-testnet-toggle"` gated on `process.env.METAMASK_DEBUG` (~20 LoC)
- `ui/pages/settings/developer-options-tab/developer-options-tab.test.tsx` — adds 3 unit tests for METAMASK_DEBUG gate, render, and click handler
- `test/jest/console-baseline-unit.json` — updates Act warning baseline for the new tests

## Test Plan

**Automated:**
- Unit tests: 5/5 pass (`yarn jest developer-options-tab.test.tsx --no-coverage`)
- Lint: clean (`yarn lint`)
- TypeScript: clean (`yarn lint:tsc`)
- Recipe: 16/16 nodes pass

**Manual Gherkin:**
```
Given I have a dev build of MetaMask (METAMASK_DEBUG=true)
And I am on Settings > Developer Options

When I look for the Perps Testnet toggle
Then I should see "Perps Testnet" toggle with data-testid="perps-testnet-toggle"

When I click the toggle
Then PerpsController.isTestnet should flip in chrome.storage.local
And the Perps tab should show testnet markets
```

## Evidence

- `evidence-ac3-toggle-visible.png` — toggle visible in dev settings (OFF state)
- `evidence-ac5-isTestnet-true.png` — toggle in ON state after click
- `evidence-ac6-perps-testnet-markets.png` — perps tab while testnet active
- `recipe-coverage.md` — full AC coverage matrix (6/6 PROVEN)
- `trace.json` — full recipe execution trace

## Ticket

[TAT-2901](https://consensyssoftware.atlassian.net/browse/TAT-2901)
