# Fix Report — TAT-2831

## Summary

The Long/Short submit button on the perps order entry page was enabled when the user had zero available balance. The `hasNoAvailableBalance` flag was computed and used for button text but was not included in the `isSubmitDisabled` gate.

## Root cause

`ui/pages/perps/perps-order-entry-page.tsx` lines 539–545: `isSubmitDisabled` was missing `hasNoAvailableBalance ||`. The condition (`orderMode === 'new' && !isLoadingAccount && availableBalance <= 0`) was defined at line 455 and used for UI text rendering (`isPrimaryTradeAction`, button label) but never wired into the disabled state.

## Changes

- `ui/pages/perps/perps-order-entry-page.tsx` — add `hasNoAvailableBalance ||` to `isSubmitDisabled` (1 line)
- `ui/pages/perps/perps-order-entry-page.test.tsx` — update two tests that previously expected an enabled/clickable button when balance is zero; now assert `disabled=true` instead

## Test plan

- Unit tests: 61/61 pass (`yarn jest ui/pages/perps/perps-order-entry-page.test.tsx --no-coverage`)
- ESLint: clean on changed files
- Coverage: 92% (PASS, threshold 80%)
- Recipe: `temp/.task/fix/tat-2831-0417-1845/artifacts/recipe.json` — 6/6 nodes pass against live extension

Manual Gherkin:
```
Given wallet is unlocked on Hyperliquid-enabled network
And user is on perps order entry page (/perps/trade/BTC?direction=long&mode=new)
And user has zero available perps balance
When the page renders
Then the submit button (data-testid="submit-order-button") is disabled
And the button label is "Add funds"
```

## Evidence

- `before-ac1-submit-button-state.png` — button enabled with 0.00 USDC (bug)
- `after-ac1-submit-button-state.png` — button disabled with 0.00 USDC (fixed)
- `recipe-coverage.md` — 1/1 ACs PROVEN
- `recipe-quality.json` — verdict: pass

## Self-Review Fixes

- `ui/pages/perps/perps-order-entry-page.test.tsx:511` — renamed test from `'shows an add funds CTA when new order balance is zero'` to `'disables submit button and shows add funds label when balance is zero'` (stale name implied clickable CTA; button is now disabled)
- `ui/pages/perps/perps-order-entry-page.test.tsx:511` — removed vestigial `async` from test function signature (no `await` remains after click removal)

## Ticket

[TAT-2831](https://consensyssoftware.atlassian.net/browse/TAT-2831)
