# TAT-3104 Report

## Summary

The perps market detail page had live max leverage data available but did not render it in the header. The fix adds a small max leverage pill beside the market title and covers the present/missing-data cases.

## Root cause

`ui/pages/perps/perps-market-detail-page.tsx:429` selects the live market object, including `maxLeverage`, but the header at `ui/pages/perps/perps-market-detail-page.tsx:1032` only rendered the symbol, price, and 24h change. Mobile renders the same value as a `PerpsLeverage` title accessory at `PerpsMarketDetailsView.tsx:1266`, so Extension had a presentational divergence rather than a missing data path.

## Changes

- `ui/pages/perps/perps-market-detail-page.tsx` — renders `market.maxLeverage` as a muted header pill with `data-testid="perps-market-max-leverage"`.
- `ui/pages/perps/perps-market-detail-page.test.tsx` — adds focused coverage for showing the pill and omitting it when max leverage is unavailable.

## Test plan

- `yarn lint:changed && yarn verify-locales --quiet && yarn circular-deps:check` — passed.
- `yarn jest ui/pages/perps/perps-market-detail-page.test.tsx --no-coverage` — passed, 76 tests.
- `node temp/runtime/coverage-analyze.js` — passed, 86% for the changed source file.
- `node validate-recipe.js --recipe ../../temp/tasks/fix/tat-3104-0505-174247/artifacts/recipe.json --cdp-port 6661 --skip-manual` — passed.

Manual Gherkin:

```gherkin
Given the wallet is unlocked and perps is active
When I open the BTC perps market detail page
Then the header shows BTC-USD with a 40x max leverage pill
```

## Evidence

- `before.mp4`
- `after.mp4`
- `before-evidence-ac1-max-leverage-pill.png`
- `after-evidence-ac1-max-leverage-pill.png`
- `recipe-coverage.md`
- `recipe-quality.json`

## Self-Review Fixes

- `ui/pages/perps/perps-market-detail-page.test.tsx:581` — Replaced the type-invalid `maxLeverage: undefined` fixture with the type-valid empty string unavailable case.
- `temp/tasks/fix/tat-3104-0505-174247/artifacts/recipe.json:56` — Set the visual evidence screenshot to viewport capture and reran the recipe to produce a passing trace.
- `ui/pages/perps/perps-market-detail-page.tsx:1042` — Matched the max-leverage pill to the existing market-row badge classes with `shrink-0` and `bg-background-muted`.

## Ticket

TAT-3104: https://consensyssoftware.atlassian.net/browse/TAT-3104
