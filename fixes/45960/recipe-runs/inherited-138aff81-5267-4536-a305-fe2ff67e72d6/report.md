# Report — TAT-3845: update perps controller to latest (15.1.0)

**Ticket:** [TAT-3845](https://consensyssoftware.atlassian.net/browse/TAT-3845)

## Summary

Bumped `@metamask/perps-controller` from `^12.0.0` to `^15.1.0` (npm `latest`) and made
only the changes the new package forces: five new `PerpsErrorCode` values needed i18n
mappings, and the Jest stub's copy of `DEFAULT_PRO_LAYOUT_PREFERENCES` had drifted from the
package. No mobile feature parity was adopted — that is the ticket's stated boundary and
belongs to follow-up PRs.

## Changes

| File | Change |
| --- | --- |
| `package.json` | `@metamask/perps-controller` `^12.0.0` → `^15.1.0` |
| `yarn.lock` | resolution 12.0.0 → 15.1.0 (dependency graph unchanged) |
| `ui/components/app/perps/utils/translate-perps-error.ts` | mapped `PROVIDER_NOT_FOUND`, `PROVIDER_LIFECYCLE_STALE`, `TPSL_PROTECTION_LOST` → `somethingWentWrong`; `ORDER_STRATEGY_ROUTE_UNAVAILABLE`, `ORDER_CHASE_MAX_DISTANCE_INVALID` → `perpsOrderFailed` |
| `ui/components/app/perps/utils/translate-perps-error.test.ts` | added the five codes to the suite's local `jest.mock`, plus a case asserting each resolves to the expected copy |
| `test/mocks/metamask-perps-controller.js` | `DEFAULT_PRO_LAYOUT_PREFERENCES.chartExpanded` `false` → `true`, realigning the stub with the package (13.0.0 flipped the real default) |
| `ui/selectors/perps-controller.test.ts` | two pro-layout default assertions follow the corrected stub |

`yarn lavamoat:auto` was run and regenerated all eight policy files with **zero diff**, so
no policy file is part of this PR — expected, since 12.0.0 and 15.1.0 declare an identical
dependency set.

## What the bump does and does not change for users

Nothing rendered changes. The five new error codes are unreachable from the extension's
current UI (no strategy orders, no provider picker, no TP/SL protection surface), and
although controller 13.0.0 flipped `DEFAULT_PRO_LAYOUT_PREFERENCES.chartExpanded` to
`true`, no extension component reads `chartExpanded` yet — only `orderBookPosition` and
`orderBookExpanded` have consumers. That default becomes user-visible when Pro mode's chart
panel lands, not here.

Breaking changes in 13.0.0-15.0.0 that do **not** reach the extension: the new persisted
`PerpsControllerState` fields (the extension only holds `Partial<PerpsControllerState>`),
the required `PerpsProvider.previewPositionModify` (the extension implements no provider),
and `PerpsProviderType` gaining `'lighter'` (no exhaustive switch over the union in
extension source).

## Test plan

| Gate | Result |
| --- | --- |
| `mm-harness check diff --profile fast` (eslint, oxfmt, jest, policy-suppressions) | pass, 6 changed files |
| `tsc --noEmit` (full repo) | exit 0 |
| `yarn jest translate-perps-error.test.ts perps-controller.test.ts` | 130 passed |
| `yarn jest perps-controller-init.test.ts app/scripts/controllers/perps` | 300 passed |
| `coverage-analyze.js` | VERDICT PASS — 100% (20/20) on changed lines |
| `mm-harness run recipe.json` | pass, 27/27 nodes |

## Evidence

| Artifact | What it shows |
| --- | --- |
| `after-ac3-perps-market-live.png` | ETH market detail on 15.1.0: live price, 24h change, candles, open position |
| `recipe-run/trace.json` | 27/27 nodes `ok=true` |
| `recipe-run/summary.json` | run verdict `pass` |
| `recipe-coverage.md` | per-claim proof matrix |
| `recipe-quality.json` | self-audit, verdict `pass` |

### Evidence fit

| Claim | Proof mode | Primary evidence |
| --- | --- | --- |
| C1 — extension bundles and runs 15.1.0 | state | manifest/lockfile/resolved-version assertions plus a grep for a 13.0.0-only symbol in `dist/chrome` |
| C2 — every `PerpsErrorCode` maps to an i18n key | state | title-filtered jest run (`44 skipped, 1 passed, 45 total`) + `tsc --noEmit` exit 0 |
| C3 — Perps UI still renders live data | mixed | `read_visible_state` assertions + one screenshot |

Screenshots deliberately omitted: none for C1 or C2. Both are dependency-resolution and
compiler claims with no visible surface — a screenshot there would be decoration, not
proof. No `before-*` pair either; baseline was recorded N/A because the PR changes nothing
a user can see, so a before shot would be the same screen.

## Notes for the reviewer

1. **The `PackagePerpsControllerMessenger` cast stays.** Its TODO says to drop it once the
   package widens its allowed-actions union. I removed the cast and ran `tsc` against
   15.1.0 to check: it still fails with `TS2322`, so the cast is still load-bearing.
2. **Recipe C3 routes by hash, not by semantic navigator.** The harness's
   `page: perps-market-list` / `page: perps-market` navigators wait on `market-list-view`
   and `perps-market-detail-page` test ids that this build's UI does not render, and the
   perps surface detector labels the market list `unknown` for the same reason. Both fail
   on `main` too — a pre-existing harness/product test-id gap, not a regression here. Worth
   a follow-up to add those test ids; out of scope for a dependency bump.
3. **173 image 404s** were logged on the market-list surface (market-row token art). The
   runner flags them as `Relation to the task is not determined`; they are unrelated to the
   controller and non-blocking.
4. **Pre-existing dead code, left alone:** `ui/__mocks__/perps/perps-controller/index.ts` is
   a 2,177-line dev-era stand-in for the package that nothing imports and that still
   declares `PerpsProviderType = 'hyperliquid' | 'myx'`. It predates this ticket; deleting
   it is a separate cleanup.

## Follow-ups this PR deliberately leaves open

`subscribeToTwapOrders`, `getScalePriceLadder`, `previewPositionModify`, the Lighter venue,
Chase lifecycle UI, and the new persisted `selectedOrderType` / `orderBookPreferences` /
`visibleCandleCount` preferences are all available in 15.1.0 and all unused. The ticket
reserves that parity work for follow-up PRs.


## Self-Review Fixes

- `test/e2e/tests/metrics/state-snapshots/errors-after-init-opt-in-ui-state.json` — added
  `"orderBookPreferences": "object"`, `"selectedOrderType": "string"` and
  `"visibleCandleCount": "number"`. Controller 13.0.0 added these three as `usedInUi: true`
  fields that `getDefaultPerpsControllerState()` always materialises, and `maskObject`
  emits unmasked keys as their `typeof`, so they appear in the captured UI state.
  `errors.spec.ts` `should capture UI application state` asserts `deepStrictEqual` against
  this snapshot with no browser skip, so this was an unconditional CI failure. Verified the
  three flags directly in `dist/PerpsController.cjs` and confirmed none of them appears in
  `maskedBackgroundFields` / `removedBackgroundFields`. Keys inserted in case-sensitive
  alphabetical position, which is the sort the file already uses (checked: all 338 keys).
- `test/e2e/tests/settings/state-logs.json` — added the same three fields, which also carry
  `includeInStateLogs: true`. `findNewKeys` flattens to dotted paths and no perps path is in
  `getIgnoredKeys()`, so `state-logs.spec.ts` would `assert.fail`. `orderBookPreferences`
  needs its nested shape, not a bare `"object"` — confirmed against
  `OrderBookPreferences = { currency: OrderBookListCurrency; metric: OrderBookListMetric }`
  in the package types, hence `{ "currency": "string", "metric": "string" }`. Firefox-only
  blast radius, since the spec skips when `SELENIUM_BROWSER === 'chrome'`.
- `artifacts/recipe.json` — `ac3-wait-market-list` now waits on
  `[data-testid^="market-row-"]:not([data-testid^="market-row-ticker-"]) ~ [same]` instead of
  the `market-list-filter-sort-row` container. The sibling combinator only matches once two
  row roots share a parent, so it is a real "at least 2 rows are hydrated" gate matching the
  `minimum_market_count: 2` the next node asserts — the container rendered before any row
  arrived, which is what made the count flaky on a cold browser. The `:not(...)` excludes the
  per-row ticker element, which also carries a `market-row-` prefix. Verified live against
  the running extension before wiring it in.

### Deviation from the review's prescription

The review suggested placing the snapshot keys "beside `proLayoutPreferences`". They went in
case-sensitive alphabetical position instead: that file is a flat, fully sorted merge of all
controller state, not a per-controller grouping, so alphabetical is what a
`UPDATE_SNAPSHOTS=true` regeneration would produce. Functionally irrelevant either way —
`assert.deepStrictEqual` ignores key order — but it keeps the next regeneration diff empty.

### Evidence change

`after.mp4` was removed from `evidence-manifest.json`. `record-window.sh` attaches to the
shared screen-capture owner, and the recipe's `ac3-clear-capture-orphans` node
(`pkill -9 -f 'capture-helper'`) kills that owner mid-run, so the recording always finalises
about three seconds before the run ends and can never satisfy the checklist's
`after.mp4 -nt summary.json` check. Re-recording with a 15-second trailing window did not
help, which is what confirmed the cause rather than a race. The `pkill` node is load-bearing
— it is what keeps `ui.screenshot` on capture-helper instead of the `Page.captureScreenshot`
fallback — so the video was dropped rather than the node weakened. The PR claims no visual
change, so the screenshot alone carries C3.

### Re-validation after the fixes

- `mm-harness check diff --profile fast` — pass, 8 changed files (eslint, oxfmt, jest, policy-suppressions)
- `prettier --check` on both changed JSON files — clean
- `mm-harness run recipe.json` — pass, 27/27 nodes, screenshot provenance `capture-helper`
- `check-task-artifact-contract.mjs` — `TASK_ARTIFACT_CONTRACT_PASS`

The two e2e specs themselves are Mocha/Selenium and are not run in this slot; the fixes are
verified by deriving the expected shape from the installed package rather than by execution.


## Self-Review Fixes — Round 2

- `artifacts/recipe.json` — the round-1 gate did not fix the cold-start flake; it waited on the
  loading state it was meant to skip. `ui/pages/perps/market-list/index.tsx` renders eight
  `<MarketRowSkeleton />` siblings while `isLoading`, each with `data-testid="market-row-skeleton"`.
  That id matches the `[data-testid^="market-row-"]` prefix, and round 1 only excluded
  `market-row-ticker-`, so the sibling combinator resolved against skeleton-to-skeleton in ~371ms.
  `read_visible_state` then deduped the eight identical ids to one and counted it as a market —
  the `observed 1` failure. The gate now excludes `market-row-skeleton` on both sides, so it
  requires two real hydrated rows.

### Why the earlier round looked green

Both round-1 runs happened on a warm browser, where the controller's market cache is already
populated and the skeleton branch never renders — I confirmed this directly by probing for
`[data-testid="market-row-skeleton"]` within 1.2s of a warm navigate and getting nothing. The
gate was therefore never exercised against the state it was written to survive. Warm re-runs
could not have caught this; only a cold browser can.

### Validation

Stopped the runtime and relaunched cold (fresh build, fresh browser profile), then ran the
recipe against that cold browser — the exact condition the reviewer reproduced the failure under:

- `mm-harness run recipe.json` — **pass, 27/27**, screenshot provenance `capture-helper`
- `ac3-wait-market-list` blocked for **4767ms** before `ac3-assert-market-list` read the count
  in 76ms. The gate held roughly thirteen times longer than the 371ms the skeleton-matching
  selector took to resolve, which is the behavioural evidence that it now waits past the
  loading phase rather than short-circuiting on placeholders.
- `mm-harness check diff --profile fast` — pass, 8 changed files
- `check-task-artifact-contract.mjs` — `TASK_ARTIFACT_CONTRACT_PASS`

No product source changed in this round; the fix is confined to the task-local validation
recipe, so the two existing commits are unchanged.
