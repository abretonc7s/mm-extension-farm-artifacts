# TAT-3012 Report

## Summary

Non-positive Perps liquidation prices could render as fiat values or as a misleading `0%` liquidation distance. The fix gates liquidation price display and margin calculations on strictly positive finite prices and uses the `--` fallback for invalid liquidation values.

## Root cause

The market detail row rendered any truthy `position.liquidationPrice` as fiat, so `-1` became `-$1` instead of a fallback (`ui/pages/perps/perps-market-detail-page.tsx:1448`). The add-margin hook accepted any finite parsed liquidation price as the anchor (`ui/hooks/perps/usePerpsMarginCalculations.ts:67`), which let negative provider values flow into the modal distance display path (`ui/components/app/perps/edit-margin/edit-margin-modal-content.tsx:137`). Mobile suppresses liquidation distance when `liqPrice <= 0`, so Extension needed the same non-positive guard and explicit fallback.

## Changes

- `ui/components/app/perps/utils/formatPerpsDisplayPrice.ts`: Added shared liquidation price validation and `--` fallback formatting.
- `ui/pages/perps/perps-market-detail-page.tsx`: Uses the shared liquidation fallback for the position details liquidation row.
- `ui/hooks/perps/usePerpsMarginCalculations.ts`: Treats non-positive provider liquidation prices as missing anchors.
- `ui/hooks/perps/marginUtils.ts`: Treats non-positive liquidation prices as fallback distance inputs.
- `ui/components/app/perps/edit-margin/edit-margin-modal-content.tsx`: Displays `--` for invalid liquidation price and distance while preserving valid `0%` distance when the positive liquidation price equals mark.
- Tests updated in the affected colocated suites for market detail, add margin, margin calculations, and distance utility behavior.

## Test plan

- `yarn lint:changed && yarn verify-locales --quiet && yarn circular-deps:check`
- `yarn jest ui/hooks/perps/marginUtils.test.ts ui/hooks/perps/usePerpsMarginCalculations.test.ts ui/components/app/perps/edit-margin/edit-margin-modal-content.test.tsx ui/pages/perps/perps-market-detail-page.test.tsx --no-coverage`
- `node temp/runtime/coverage-analyze.js`
- `node temp/recipes/validate-flow-schema.js temp/tasks/fix/tat-3012-0506-074754/artifacts/recipe.json`
- `node temp/recipes/validate-recipe.js --recipe temp/tasks/fix/tat-3012-0506-074754/artifacts/recipe.json --dry-run`
- `node temp/recipes/validate-recipe.js --recipe temp/tasks/fix/tat-3012-0506-074754/artifacts/recipe.json --cdp-port 6665 --skip-manual` passed 16/16.

Manual Gherkin:

```gherkin
Given I have a Perps position whose liquidation price is zero or negative
When I open the market detail position details
Then the liquidation price displays "--"

Given I have an isolated Perps position whose liquidation price is zero or negative
When I open Add margin
Then the liquidation price displays "--"
And the liquidation distance displays "--"
```

## Evidence

- `before.mp4` has a valid `moov` atom and captures the recipe failing before the fix.
- `after.mp4` has a valid `moov` atom and captures the recipe passing after the fix.
- `after-evidence-ac1-position-liq-fallback.png` shows the market-detail liquidation fallback.
- `after-evidence-ac2-add-margin-liq-fallback.png` shows the add-margin liquidation fallback.
- `recipe-coverage.md` documents 4/4 ACs proven.
- `recipe-quality.json` records a pass verdict.

## Ticket

TAT-3012: https://consensyssoftware.atlassian.net/browse/TAT-3012

## Self-Review Fixes

- `ui/components/app/perps/edit-margin/edit-margin-modal-content.tsx:138` — copied the nullable anchor liquidation price into a numeric display value before validating and formatting, which resolves the TypeScript narrowing failure at the `formatPerpsFiat` call.
- `ui/hooks/perps/usePerpsMarginCalculations.ts:71` — parse the nullable provider liquidation price through `parsePerpsDisplayPrice` before validation, avoiding `Number.parseFloat` on `string | null`.
- `ui/components/app/perps/edit-margin/edit-margin-modal-content.test.tsx:7` and `ui/pages/perps/perps-market-detail-page.test.tsx:16` — imported `PERPS_LIQUIDATION_PRICE_FALLBACK` so fallback assertions use the shared source instead of hardcoded `"--"`.
- `app/images/blackfort.png`, `app/images/default_nft.png`, `app/images/icon-128.png`, `app/images/icon-32.png`, `app/images/icon-512.png`, and `app/images/linea-logo-testnet.png` — attempted to remove the binary diffs, but the required `yarn lint && yarn verify-locales --quiet && yarn circular-deps:check` gate failed at `lint:images` until `yarn lint:images:fix` optimized these same files; the retained image diffs are required gate output.
- `temp/recipes/validate-recipe.js` invocation — reran the recipe from `temp/recipes` with `--recipe ../tasks/fix/tat-3012-0506-074754/artifacts/recipe.json --cdp-port 6665 --skip-manual`; it passed 16/16 after a soft refresh.
