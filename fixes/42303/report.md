# TAT-3077 — Recent activity row fully tappable

## Summary

The Recent Activity sections on the perps tab (wallet home) and on each market detail page only made the section-header `>` chevron tappable; transaction rows were inert. Now every row navigates to `/perps/activity` (the same destination as the chevron), matching mobile behavior where the entire row is tappable.

## Root cause

`TransactionCard` (`ui/components/app/perps/transaction-card/transaction-card.tsx:180-194`) only renders an interactive `ButtonBase` when an `onClick` prop is supplied — otherwise it falls through to a non-interactive `Box` (`transaction-card.tsx:196-205`).

- `PerpsRecentActivity` (`ui/components/app/perps/perps-recent-activity/perps-recent-activity.tsx:160-164`) forwarded `onClick={onTransactionClick}` but `perps-view.tsx:300-305` mounts the component without an `onTransactionClick`, so every home-tab row was a plain `<Box>`.
- `PerpsMarketRecentActivity` (`ui/components/app/perps/perps-market-recent-activity/perps-market-recent-activity.tsx:58-65`) never wired `onClick` at all, so every market-detail row was a plain `<Box>` too.

Mobile parity: `app/components/UI/Perps/components/PerpsRecentActivityList/PerpsRecentActivityList.tsx:104-146` wraps every row in a `TouchableOpacity` `onPress` handler.

## Changes

- `ui/components/app/perps/perps-recent-activity/perps-recent-activity.tsx` — default `handleRowClick = onTransactionClick ?? handleSeeAll` so unowned mounts (perps tab) navigate to `PERPS_ACTIVITY_ROUTE`.
- `ui/components/app/perps/perps-market-recent-activity/perps-market-recent-activity.tsx` — extract `handleSeeAll`, pass it through `RecentActivityList` → `TransactionCard.onClick` so market-detail rows are tappable.
- `ui/components/app/perps/perps-recent-activity/perps-recent-activity.test.tsx` — replace the "no onClick when handler missing" test with one that asserts default tap navigates to `PERPS_ACTIVITY_ROUTE` and the row carries the `cursor-pointer` class.
- `ui/components/app/perps/perps-market-recent-activity/perps-market-recent-activity.test.tsx` — add a regression test asserting a row tap navigates to `PERPS_ACTIVITY_ROUTE`.

## Test plan

Automated:

- `yarn jest ui/components/app/perps/perps-recent-activity/perps-recent-activity.test.tsx ui/components/app/perps/perps-market-recent-activity/perps-market-recent-activity.test.tsx --no-coverage` — 25/25 pass.
- `yarn jest ui/components/app/perps/perps-view.test.tsx ui/components/app/perps/transaction-card/transaction-card.test.tsx --no-coverage` — 48 pass / 4 skipped (no regressions).
- `yarn lint:changed && yarn verify-locales --quiet && yarn circular-deps:check` — green (CI parity gate).
- `node temp/recipes/validate-recipe.js --recipe artifacts/recipe.json --cdp-port 6666 --skip-manual` — 22/22 pass with the fix; the same recipe FAILS at `ac1-wait-activity-page` against the buggy code (captured in `before.mp4`).
- Coverage gate (`temp/runtime/coverage-analyze.js`) — VERDICT: PASS (100% of changed files).

Manual Gherkin:

```
Feature: Tap recent-activity row navigates to activity page
  Scenario: Perps tab — wallet home
    Given the user is on the Perps tab
      And there is at least one row in "Recent activity"
    When the user taps any row in "Recent activity"
    Then the app navigates to the perps activity list page (/perps/activity)

  Scenario: Market detail page
    Given the user is on a perps market detail page (e.g. BTC-USD)
      And there is at least one row in "Recent activity"
    When the user taps any row in "Recent activity"
    Then the app navigates to the perps activity list page (/perps/activity)
```

## Evidence

Artifacts in `artifacts/`:

- `recipe.json` — executable validation recipe (22 nodes covering AC1 + AC2).
- `recipe-coverage.md` — per-AC coverage matrix (2/2 PROVEN).
- `recipe-quality.json` — gateway recipe-quality verdict (PASS).
- `before.mp4` — recording of the recipe failing on buggy code (`ac1-wait-activity-page` timeout).
- `after.mp4` — recording of the recipe passing on the final fix.
- `screenshots/before-ac1-row-before-tap-*.png` — buggy state, row visible but tap is a no-op.
- `screenshots/after-ac1-row-before-tap-*.png` + `after-ac1-activity-page-*.png` — fixed state, row tap routes to `/perps/activity` (perps tab).
- `screenshots/after-ac2-row-before-tap-*.png` + `after-ac2-activity-page-*.png` — fixed state, row tap routes to `/perps/activity` (BTC market detail).
- `evidence-manifest.json` — gateway routing for which artifacts to embed in the PR.
- `trace.json`, `summary.json`, `workflow.mmd` — runtime artifacts emitted by `validate-recipe.js`.

## Ticket

[TAT-3077](https://consensyssoftware.atlassian.net/browse/TAT-3077)
