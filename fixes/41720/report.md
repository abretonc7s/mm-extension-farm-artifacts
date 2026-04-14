# Report — TAT-2794: %PnL is missing on individual position in perps tab

## Summary

The position card in the Perps tab was only showing the USD P&L value without the ROE% alongside it. The fix adds `returnOnEquity` extraction and rendering to `PositionCard`, displaying both values together (e.g., `+$0.88 (26.30%)`). This fix was landed on main in PR #41696 / commit `1097d7a4fa` (filed under TAT-2911).

## Root Cause

**File:** `ui/components/app/perps/position-card/position-card.tsx`

**Buggy state (commit `9198cdb016`):**
- Only destructured `formatCurrencyWithMinThreshold` from `useFormatters`
- P&L row rendered only `{formattedPnl}` (USD value)
- No `returnOnEquity` computation or display

**Fix (current main / commit `1097d7a4fa`):**
- Lines 40-41: Added `formatPercentWithMinThreshold` to `useFormatters` destructuring
- Lines 49-52: Compute `roeNum = Number.parseFloat(position.returnOnEquity)` and `formattedRoe = formatPercentWithMinThreshold(roeNum)` (null if NaN)
- Lines 132-142: Conditionally render `({formattedRoe})` alongside `{formattedPnl}` with `data-testid={position-card-roe-{symbol}}`

## Changes

No new code changes on this branch — the fix was already merged to main via PR #41696. This PR formally closes TAT-2794 and provides validation evidence.

## Test Plan

**Automated:**
- Unit tests: 16/16 pass (`yarn jest ui/components/app/perps/position-card/position-card.test.tsx`)
  - Tests cover: ROE% for profit, ROE% for loss, NaN ROE (element not rendered)
- Lint: `yarn lint && yarn verify-locales --quiet && yarn circular-deps:check` — all pass
- Recipe: `validate-recipe.js` — 6/6 nodes pass against live mainnet ETH position

**Manual Gherkin:**
```
Given the wallet is unlocked
And the user is on the Perps tab
And there is at least one open position
When the user views the Positions section
Then the position card shows the USD P&L value (e.g., +$0.88)
And the position card shows the ROE% alongside it (e.g., (26.30%))
```

## Evidence

- `before-ac1-position-card-roe.png` — position card with ROE% (fixed state)
- `after-ac1-position-card-roe.png` — position card with ROE% confirmed after validation
- `recipe-coverage.md` — 2/2 ACs PROVEN
- Note: Video recording unavailable (ScreenCaptureKit permission issue on this machine)

## Ticket

TAT-2794: https://consensyssoftware.atlassian.net/browse/TAT-2794
