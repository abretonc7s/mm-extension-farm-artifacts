# Self-Review: MetaMask/metamask-extension#44324

## Verdict: ISSUES

## Summary

This is an **update-branch** run: 330 commits of `origin/main` were merged into the perps
analytics-contract branch (merge `3d79f566f9`), with 12 conflicted files (7 perps source).
The resolutions are correct on the substance I could verify — the patched
`@metamask/perps-controller@9.2.1` pin survived the lock regeneration, `SOURCE.BOTTOM_NAV_BAR`
was carried over as an Extension-only override, and main's re-added client-side
`PerpsPositionCloseTransaction` emissions were correctly dropped (the controller now owns
them). Every referenced controller constant exists in the real 9.2.1 package, and the Jest
mock mirror matches the real package value-for-value today. Blocking: two ESLint **errors**
in changed files (one of them a direct leftover of the close-modal conflict resolution), a
failing artifact-contract sub-check, plus mobile search-funnel divergences and hardcoded
i18n copy in new tests.

Diff reviewed against `origin/main` (`9c8c6bcb8b`), not the stale local `main` (`7ec2719d8b`):
**73 files, +4446 / −928**, 42 commits.

## Type Check
- Result: PASS
- New errors: none (`yarn lint:tsc`, exit 0). Run deliberately despite the "bounded
  validation" default because the diff changes dependency and public type surfaces
  (`package.json` controller pin + patch, `shared/constants/perps-events.ts` now re-exports
  the controller contract, new `TrackingData`/`TPSLTrackingData`/`InputMethod` consumers).

## Tests
- Result: PASS
- Details: all 21 changed test files plus the 8 untouched sibling suites of changed source
  files — **29 suites, 954 tests, 0 failures**. No console-baseline violations.
  Note: `yarn lint:changed` is **vacuous** on this run (clean working tree → "No changed
  JS/TS/TSX/MTS/SNAP files to lint"). Worse, `development/lint-changed.mts` invokes ESLint
  without `-c ./.eslintrc.js`, so on ESLint 9 it aborts with "couldn't find
  eslint.config.js" whenever it *does* find files (verified with a throwaway probe file).
  Pre-existing on main, not caused by this branch, but it means the mandated changed-file
  gate proves nothing here. I linted the branch's changed files directly instead
  (`node node_modules/eslint/bin/eslint.js -c ./.eslintrc.js <58 files>`), which is where
  the two errors below come from.

## Test Quality
- Findings:
  - `ui/components/app/perps/edit-margin/edit-margin-modal-content.test.tsx:266` — new
    assertion hardcodes `'Unable to adjust margin. Please try again.'`, a verbatim duplicate
    of `perpsToastMarginAdjustmentFailedDescriptionFallback` (confirmed against
    `app/_locales/en/messages.json`), while the component renders it via
    `t('perpsToastMarginAdjustmentFailedDescriptionFallback')`.
  - `ui/pages/perps/perps-order-entry-page.test.tsx:2227` — new assertion hardcodes
    `"We couldn't load this page."` (= `somethingWentWrong`). Three other occurrences in
    this file are pre-existing.
  - No `should`-prefixed test names (the one `describe('shouldShowPerpsOrderSubmissionToasts')`
    is a function name, not a violation). New async paths use `act()`/`waitFor` correctly.
    Assertions are specific — the new tests assert emitted event names, exact property
    payloads, and *absence* counts, and would fail if the fix were reverted.

## Domain Anti-Patterns
- Findings:
  - **Error handling — clean.** Every new/changed catch either rethrows, surfaces UI, or
    calls `captureException` with a comment (`perps-view.tsx` close-all + cancel-all,
    `perps-market-detail-page.tsx` watchlist toggle, `PerpsAttributionContext.tsx`
    controller sync). Two previously bare `catch {}` blocks in `perps-view.tsx` were fixed
    by this branch. No new swallows.
  - **Import boundaries — clean.** `shared/` now value-imports `@metamask/perps-controller`
    (allowed scope); no `app/` ↔ `ui/` crossings. All perps pages/modals that call
    `usePerpsAttribution` render under `PerpsLayout` or `PerpsTab`, both of which now mount
    `PerpsAttributionProvider`, so the throwing context hook cannot be hit unwrapped
    (verified via route table + usage grep).
  - **Magic numbers** — `ui/pages/perps/perps-order-entry-page.tsx:609` uses a bare
    `setTimeout(..., 1000)` for the CONSIDERED debounce, and `:348` a bare `50` maxLeverage
    fallback; `ui/pages/perps/market-list/index.tsx:292` embeds the intent/browse heuristic
    as an inline regex. The same file names its search debounce
    (`SEARCH_QUERY_DEBOUNCE_MS`), so the inconsistency is self-evident.
  - **Mutable module-level state** — `ui/providers/perps/PerpsAttributionContext.tsx:~78`
    (`sessionUtmAttribution`) is deliberate last-touch session state, documented, written
    only from effects, with a test-only reset. Accepted, not flagged.
  - **eslint-disable** — 9 new file-level `@typescript-eslint/naming-convention` disables,
    all in test files with justification comments, matching the pre-existing convention for
    snake_case MetaMetrics props. One of them is dead (see Issues).
  - **testIDs / a11y** — no new interactive elements or displayed values; analytics-only.

## Mobile Comparison
- Status: DIVERGES (mostly aligned; search funnel diverges)
- Details (mobile ref: `/Users/deeeed/dev/metamask/metamask-mobile-ref`):
  - ALIGNED: `derivePerpsTradeAction` mirrors
    `app/components/UI/Perps/utils/deriveTradeAction.ts` (same 4 outcomes, same doc intent;
    extension takes a direction instead of a `Position` — semantically identical).
    `usePerpsAbandonOrderTracking` is a faithful web port of
    `app/components/UI/Perps/hooks/usePerpsAbandonOrderTracking.ts` (same
    `getAbandonProperties`/`hasCommittedRef`/one-shot-guard contract, `pagehide`+unmount
    replacing `beforeRemove`/`blur`). CONSIDERED debounce 1000 ms matches
    `PerpsOrderView.tsx:822`. Search debounce 500 ms matches
    `PerpsMarketListView.tsx:580`. No new `.toFixed(2)` or `{min:2,max:2}` anywhere in the
    diff — the only added `toFixed` is inside a Jest mock.
  - DIVERGES: `mode` never reports `discovery`; mid-debounce exits are dropped;
    `time_in_search_ms` clock starts later than mobile's; four mobile-only search props are
    absent. Details in Issues.

## LavaMoat Policy
- Status: OK
- Details: `package.json` moves `@metamask/perps-controller` from `^9.0.0` to a yarn patch
  of `9.2.1`, and all 8 `lavamoat/webpack/{mv2,mv3}/*/policy.json` files were regenerated
  consistently with the new dep graph (`@nktkas/hyperliquid` / `@nktkas/rews` gain
  `DecompressionStream`, `Response`, `TextDecoder`, `atob`, `Blob`, …). `WebSocket: true`
  is *removed* from `@metamask/perps-controller`'s own globals — I checked the published
  dist and it contains no direct `new WebSocket` (only `WebSocketConnectionState`-style
  identifiers; the socket is created inside the `@nktkas` subpackages whose policies gained
  the needed globals), so the removal is correct rather than a runtime break.
  `lavamoat/browserify/**` was deleted by main (#44433) and correctly not resurrected.

## Fix Quality
- Best approach: yes — consume the controller contract, delete the client duplicates, and
  keep client `PerpsError` strictly for the transport-throw gap the controller pipeline
  never sees. The `{ success: false }` vs `throw` split is applied consistently across
  order entry, close, cancel, reverse, TP/SL and margin, each with an inline rationale.
- Would not ship: the two ESLint errors (CI `yarn lint` gate) and the
  `FAIL_VISUAL_CLASSIFICATION` artifact-gate sub-check. Everything else is follow-up-able.
- Test quality: good — assertions target emitted event names + exact payloads and *absence*
  counts (`ac5` duplicate-emission checks, flip actions, debounce reset-on-symbol/direction,
  pagehide one-shot). Reverting the fix would fail them.
- Brittleness: the hand-maintained `test/mocks/metamask-perps-controller.js` mirror is the
  main risk. I diffed it against the real 9.2.1 package programmatically — **zero value
  mismatches** for every shared key, and every constant the diff references exists upstream
  (`SOURCE.MARKET_LIST` only via the intended Extension alias to `PERPS_MARKET_LIST_ALL`).
  But nothing enforces that: a future controller value change would keep tests green while
  production emits a different string. A cheap CI script comparing the mock to the real
  package would close this.

## Diff Quality
- Minimal: no — several pure-churn hunks (see Issues): a hook-call/dep-array reorder in
  `edit-margin-modal-content.tsx`, three multiline reformats of
  `Object.assign(..., { name, cause })` in `perps-controller-init.test.ts`, two `describe`
  titles stripped of their ticket IDs (TAT-3264 / TAT-3053), and a duplicated
  fallback-description block.
- Debug code: none. No `console.log`, no `TODO`/`FIXME`, no `as any` / `as unknown as` in
  added lines. The single cast (`tradeAction as TrackingData['tradeAction']`) is narrow and
  documented (controller type lists create/increase but accepts flips at runtime).

## Recipe
- Present: yes (19 nodes, Protocol v1). **Re-ran it against the current tree**:
  `artifacts/review-loop-1/recipe-rerun/` — **pass, 19/19**, `teardown-end` = pass, all
  `ac1`–`ac8` nodes plus the 6 live CDP nodes executed in `trace.json` (needed
  `caffeinate -u` first: `runtime-health` reported `UI_COMPOSITOR_SUSPENDED`, exactly the
  flake risk `recipe-quality.json` documents). Side findings unchanged dev noise
  (`Invalid chain ID "0xa4b1"`, a backend 500, `Sentry not initialized`).
- Quality: weak — honest, but structurally thin for an analytics PR. 8 of 19 nodes are
  `command` nodes re-running the *same Jest suites* the unit gate already runs (proof
  duplication, not app-level proof), and 4 more are source-text greps
  (`assert_file` / `node -e` reading file contents) that assert code *shape* — they pass
  whether or not the emission is correct at runtime. The live portion seeds no positions or
  orders and asserts **no MetaMetrics payload at all**, so the PR's central claim
  ("controller emits the transaction events exactly once, with the contract properties") is
  not proven in the running app. `recipe-quality.json` and `recipe-coverage.md` both state
  this limit explicitly rather than papering over it, which is the right call.

## Visual Evidence
- Status: OK — `recipe-run/live-capture-error-screen.png` read directly: the "Market not
  found" heading and `The market "DOESNOTEXIST" could not be found.` body are plainly
  visible, top of viewport, not clipped, and the recipe satisfies the protocol
  (`live-assert-error-screen` = `ui.wait_for` on that text immediately precedes
  `live-capture-error-screen`). My re-run reproduced a byte-identical capture.
  `check-task-artifact-contract.mjs` → `TASK_ARTIFACT_CONTRACT_PASS`; no `MISSING:`,
  no `FAIL_EMPTY`, no invalid screenshot provider. Only `FAIL_VISUAL_CLASSIFICATION` fires
  (see Issues).

## Issues

- **ui/components/app/perps/close-position/close-position-modal.tsx:721** — ESLint error `react-hooks/exhaustive-deps`: "useCallback has unnecessary dependencies: 'closeNotionalUsd', 'closePercent', 'effectivePnl', and 'youWillReceive'". These four became unused when the merge dropped main's client-side `PerpsPositionCloseTransaction` emissions from the success/failure/catch paths; the conflict resolution kept the union of both sides' dep arrays. CI `yarn lint` fails. Remove them from the array (lines 737-741).
- **ui/hooks/perps/usePerpsAbandonOrderTracking.test.ts:1** — ESLint error: "Unused eslint-disable directive (no problems were reported from '@typescript-eslint/naming-convention')". The file's assertions only use camelCase keys plus `properties.time_on_screen_ms` member access, so the file-level disable is dead. Delete the line.
- **temp/tasks/fix/44324-0728-033914/artifacts/recipe-coverage.md:22** — artifact-contract sub-check emits `FAIL_VISUAL_CLASSIFICATION`: the gate requires at least one coverage row classified `visual` or `mixed`, but the only screenshot-backed row is labelled `live UI`. Relabel the proof mode to `visual` (accurate — the row is backed by `live-capture-error-screen.png`). Root cause of the keyword trigger is worth knowing: the gate's TASK.md scan matches only the injected boilerplate phrase "use the **visible** 1-based step number", not a real visual AC, so this is a labelling mismatch rather than missing proof.
- **ui/pages/perps/market-list/index.tsx:292** — search `mode` can never be `discovery`. The comment claims "No search chips in the Extension, so `discovery` never applies", but the page has a category `FilterSelect` (`selectedFilter`, line 165, also emitted as `market_category_filter`). Mobile (`PerpsMarketListView.tsx:427-432`) reports `discovery` whenever a category/watchlist chip narrows the set, so a filtered Extension search reports `intent`/`browse` where mobile reports `discovery` — the two clients' search-mode funnels will not be comparable.
- **ui/pages/perps/market-list/index.tsx:310** — a query typed but abandoned before the 500 ms debounce elapses is silently dropped. The unmount cleanup calls `emitSearchAbandoned`, which early-returns because `emittedQueryRef.current` is still empty, and the pending timeout is cleared. Mobile explicitly guards this case (`pendingSearchQueryRef` "Flushed on blur/unmount so a mid-debounce exit is never silently lost", `PerpsMarketListView.tsx:167-168`), flushing the query with the count props omitted. Extension loses those sessions entirely.
- **ui/pages/perps/market-list/index.tsx:279** — `searchStartedAtRef` is set *inside* the debounce callback, so `time_in_search_ms` and `time_to_tap_ms` are measured from the first *emitted* query rather than the first keystroke. Mobile starts its clock in the query effect before the debounce (`searchStartTimeRef`, `PerpsMarketListView.tsx:550-552`), so Extension values run systematically ~500 ms+ lower than mobile for the same user behaviour.
- **ui/pages/perps/market-list/index.tsx:288** — `PERPS_SEARCH_QUERY` omits four properties mobile sends on the same event: `query_text`, `query_length`, `has_results`, `active_chips` (`PerpsMarketListView.tsx:443-459`). Low impact, but any shared dashboard keyed on them will be Extension-blind.
- **ui/components/app/perps/edit-margin/edit-margin-modal-content.test.tsx:266** — new test hardcodes the i18n string `'Unable to adjust margin. Please try again.'` instead of referencing `perpsToastMarginAdjustmentFailedDescriptionFallback`; a copy edit will break the test for no reason.
- **ui/pages/perps/perps-order-entry-page.test.tsx:2227** — new assertion hardcodes `"We couldn't load this page."` rather than the `somethingWentWrong` message source.
- **shared/constants/perps-events.ts:129** — `PERPS_VERIFY_LOCALE_FALSE_POSITIVES = ['tutorial']` is a dead export with no importer anywhere in the repo; its sole purpose is to make `verify-locales` still see the `tutorial` message key as used now that the hand-maintained enum mirror is gone. Shipping a fake consumer to satisfy a lint script hides the real state: either the `tutorial` locale entry (`app/_locales/en/messages.json:11167`) is genuinely unused and should be removed, or it belongs in the verify-locales allowlist.
- **ui/pages/perps/perps-order-entry-page.tsx:615** — `latestAbandonPropsRef.current = {...}` is assigned during render (same pattern at `ui/components/app/perps/close-position/close-position-modal.tsx:443`). Writing refs in the render body is the impurity React explicitly warns against, and this very PR cites the react-compiler purity rule as the reason the session-UTM writer was hoisted to module scope (`PerpsAttributionContext.tsx:~80`). Move the snapshot into a `useEffect`.
- **ui/pages/perps/perps-order-entry-page.tsx:341** — `tradingScreenDefaults` re-derives the market with `allMarkets.find((m) => m.symbol.toLowerCase() === decodedSymbol.toLowerCase())`, duplicating the `market` memo computed 15 lines earlier (line 315) with identical logic. Reuse `market` (and its `maxLeverage`).
- **ui/pages/perps/perps-order-entry-page.tsx:609** — CONSIDERED debounce is a bare `setTimeout(..., 1000)`; `:348` is a bare `50` maxLeverage fallback. Name both, matching `SEARCH_QUERY_DEBOUNCE_MS` in the sibling market-list page.
- **ui/pages/perps/perps-order-entry-page.tsx:8** — `import type { Json }` was downgraded to a value import `import { Json } from '@metamask/utils'` (same at `ui/components/app/perps/close-position/close-position-modal.tsx:9`). `Json` is type-only; restore `import type`.
- **ui/components/app/perps/edit-margin/edit-margin-modal-content.tsx:319** — the `normalizedErrorMessage` + `MARGIN_FAILED_FALLBACK_ERROR_PATTERNS.some(...)` + `replacePerpsToastByKey` block is now duplicated verbatim in the `!result.success` branch and the `catch` branch (line 377). Extract one helper.
- **ui/components/app/perps/edit-margin/edit-margin-modal-content.tsx:112** — pure churn: `usePerpsEventTracking()` and `usePerpsToast()` swapped order, and the `track` / `replacePerpsToastByKey` entries swapped in the dep array, with no functional effect. Same class of churn in `app/scripts/messenger-client-init/perps-controller-init.test.ts` (three `Object.assign(..., { name, cause })` literals reformatted to multiline) and in two `describe` titles that lost their ticket IDs (`perps-market-detail-page.test.tsx` TAT-3264, `perps-order-entry-page.test.tsx` TAT-3053). Unrelated to the merge; revert to keep the diff reviewable.
- **package.json:426** — `@metamask/perps-controller` is pinned to a local yarn patch of exactly `9.2.1`; the patch rewrites two `require("file:///home/runner/work/hyperliquid/...")` statements that the published tarball ships with. That is a legitimate workaround for an upstream packaging bug, but it removes the semver range and makes the Extension carry a private patch into production. Call it out in the PR description with a tracked follow-up to drop the patch once upstream republishes.
- **test/mocks/metamask-perps-controller.js:22** — `PERPS_EVENT_PROPERTY.TIMESTAMP` changes from `perps_timestamp` to the controller's `timestamp` (verified against `dist/constants/eventNames.d.cts`), which renames that property on **every** perps event, client- and controller-emitted. Correct per the contract, but it is a breaking analytics-schema change for any dashboard or query keyed on `perps_timestamp`; it should be flagged to the data consumers before release rather than left implicit in a mock diff.
- **test/jest/console-baseline-unit.json:1015** — the new baseline entry allows one "Uncaught Errors" console error from `PerpsAttributionContext.test.tsx`, produced by the deliberate "throws outside provider" test. Baselining is acceptable, but asserting the throw without leaking an uncaught error (e.g. an error-boundary-free `expect(() => ...).toThrow()` style harness) would avoid growing the baseline.
