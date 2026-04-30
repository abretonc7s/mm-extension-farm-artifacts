# TAT-3075 — positionTPSL not displayed in auto-close section

## Summary

A position-level TP/SL (positionTPSL) created from the order entry screen
appeared in the orders section of the market detail page instead of the
auto-close section. The fix aligns the extension's
`shouldDisplayOrderInMarketDetailsOrders` predicate with mobile so reduce-only
orders associated with the full position are filtered out of the market detail
orders list. The auto-close section already reads `position.takeProfitPrice` /
`position.stopLossPrice`, so excluding the duplicate row resolves the bug
without any new state plumbing.

## Root cause

`ui/components/app/perps/utils/orderUtils.ts:181-184` defined
`shouldDisplayOrderInMarketDetailsOrders` as `() => true`, so
`normalizeMarketDetailsOrders` left full-position TP/SL rows
(`isPositionTpsl: true` / size matching the position) in the orders list
rendered by `ui/pages/perps/perps-market-detail-page.tsx:469-485`. Mobile's
equivalent at `metamask-mobile/app/components/UI/Perps/utils/orderUtils.ts:290-299`
correctly filters these via `isOrderAssociatedWithFullPosition`, which is the
behavior described by the ticket.

## Changes

- `ui/components/app/perps/utils/orderUtils.ts` — replace the always-true
  predicate with the mobile rule: non-reduce-only orders pass through; reduce-only
  orders are kept only when they are NOT associated with the full position.
- `ui/components/app/perps/utils/orderUtils.test.ts` — invert the existing
  positionTpsl/full-position cases to assert exclusion, add a
  size-matches-position case for the orders-list normalizer.
- `ui/pages/perps/perps-market-detail-page.tsx` — update the comment above the
  `orders` `useMemo` to describe the new behavior (auto-close section is the
  canonical place for full-position TP/SL).

## Test plan

Automated:

- `yarn jest ui/components/app/perps/utils/orderUtils.test.ts --no-coverage` — 38/38 pass.
- `yarn jest ui/pages/perps/perps-market-detail-page.test.tsx --no-coverage` — 74/74 pass.
- `yarn lint:changed && yarn verify-locales --quiet && yarn circular-deps:check` — clean.
- `node temp/runtime/coverage-analyze.js` — VERDICT: PASS (orderUtils 91%, market-detail-page 86%).
- `node temp/recipes/validate-recipe.js --recipe artifacts/recipe.json --cdp-port 6665 --skip-manual` — 15/15 nodes pass.

Manual (Gherkin):

```
Given the wallet is unlocked and connected to perps
And  a BTC long position is open with a positionTPSL (TP=$99,000, SL=$90,000)
When I navigate to /perps/market/BTC
Then the Auto close section shows TP $99,000 and SL $90,000
And  the Orders section does not contain a Take profit / Stop row for the positionTPSL

Given the wallet is unlocked and connected to perps
And  no position exists on BTC
And  a buy limit order with takeProfitPrice and stopLossPrice exists on BTC
When I navigate to /perps/market/BTC
Then the Orders section shows the parent limit order with synthetic Take profit / Stop rows
And  the Auto close section is not rendered
```

## Evidence

Artifacts in `temp/tasks/fix/tat-3075-0430-205100/artifacts/`:

- `recipe.json` — executable validation recipe (15 nodes, 3 ACs).
- `recipe-coverage.md` — 3/3 ACs PROVEN.
- `recipe-quality.json` — verdict PASS.
- `evidence-manifest.json` — gateway evidence selection.
- `before.mp4` + `screenshots/before-ac1-*.png` — recipe running against buggy code; AC1 disjoint check fails (positionTPSL present in orders list).
- `after.mp4` + `screenshots/after-ac1-*.png` + `screenshots/after-ac2-*.png` — recipe running against fixed code; 15/15 nodes pass.
- `trace.json` — per-node trace from the after run.

## Ticket

[TAT-3075](https://consensyssoftware.atlassian.net/browse/TAT-3075)

## Self-Review Fixes

- `ui/components/app/perps/utils/orderUtils.ts:312` — refreshed the JSDoc on `normalizeMarketDetailsOrders` to describe the new behavior (full-position TP/SL is excluded; auto-close section surfaces it instead) and clarified the `existingPosition` param doc. Behavior unchanged — comment-only fix in response to self-review.
