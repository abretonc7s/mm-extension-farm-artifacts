# Self-Review: MetaMask/metamask-extension#44324

## Verdict: ISSUES

## Summary

The PR migrates Extension perps analytics onto the `@metamask/perps-controller@9.2.1`
contract: client-side transaction events are dropped in favour of controller-owned ones,
UTM/deeplink attribution is threaded through a new `PerpsAttributionProvider`, and the
market-search / order-abandonment funnels are added for mobile parity. The design is sound
and behaviour is well covered (740 tests re-run this session). Three ESLint errors will
fail CI, and the market-list search funnel still loses real events in two mobile-diverging
paths. Every finding below was re-verified against HEAD `cb6aa610f7` this session — none
is inherited from an earlier review round.

Review base is `origin/main` (`9c8c6bcb8b`): 90 files, +4544/−990. Local `main` is 330
commits stale, so `git diff main...HEAD` shows ~1000 unrelated files.

## Type Check

- Result: NOT RUN (bounded self-review)
- New errors: n/a. `yarn lint:tsc` was deliberately skipped: the type surfaces the diff
  touches (`InfrastructureDeps`, `TrackingData`/`TPSLTrackingData`, `InputMethod`, the
  `perps-events.ts` contract spread) are all exercised by the 22 re-run suites, and the
  checklist restricts the broad gate. ESLint was run directly over the 57 changed
  JS/TS/TSX files instead — see Issues.

## Tests

- Result: PASS (1 load-sensitive flake)
- Details: all 22 changed/added suites re-run against HEAD.
  - 11 non-component suites (infrastructure, controller-init, 3 deep-link routes,
    deriveTradeAction, track-perps-error-screen, abandon hook, attribution hook,
    usePerpsEventTracking, PerpsAttributionContext): **279/279 pass**.
  - 7 component suites (cancel-order, close-position, edit-margin, geo-block, perps-view,
    reverse-position, update-tpsl): **236/237**. The one failure is
    `update-tpsl-modal-content.test.tsx:1244` — `expect(mockSubmitRequestToBackground)
    .not.toHaveBeenCalled()` saw a stray `perpsGetPositions [{ skipCache: true }]`. That is
    the un-cleared 2.5 s delayed refetch from an earlier test in the same file landing
    inside a later one under batch load. The suite passes in isolation (**68/68**). Cause
    is in the diff's own code path — see Issues.
  - 3 page suites (market-list, market-detail, order-entry): **224/224 pass**.

## Test Quality

- No `should` in any added/modified test name. AAA separation and `act()` usage around fake
  timers are correct. No hardcoded user-facing copy: the two previously-flagged assertions
  now read `messages.perpsToastMarginAdjustmentFailedDescriptionFallback.message` and
  `messages.somethingWentWrong.message`.
- **ui/pages/perps/perps-market-detail-page.test.tsx:481** — `expect(typeof
  assetDetailView?.properties?.watchlisted).toBe('boolean')` pins only the type. The fixture
  is deterministic, so the value is assertable; as written the test passes even if
  `watchlisted` is wired to the wrong selector.
- **ui/components/app/perps/utils/track-perps-error-screen.test.ts:27** — "carries a
  non-null, human-readable screen_name" re-asserts the same single `track` call as the test
  above it, only with the literal instead of the constant. It cannot fail independently.

## Domain Anti-Patterns

- **Import boundary (blocking)** — `edit-margin-modal-content.test.tsx:6` imports
  `app/_locales/en/messages.json` from `ui/`; ESLint reports `import-x/no-restricted-paths`.
  Sibling perps suites use `enLocale as messages` from `test/lib/i18n-helpers`.
- **eslint-disable additions** — 8 new file-level
  `/* eslint-disable @typescript-eslint/naming-convention */` directives across perps and
  deep-link test files. `CLAUDE.local.md` forbids `eslint-disable`; precedent exists on main
  (`usePerpsEventTracking.test.tsx`) and removing them means rewriting snake_case object
  keys across 8 files. Recorded for the author's decision, not treated as a blocker.
- **Error handling** — clean. Every new `catch` rethrows, surfaces UI state, or calls
  `captureException`; the two intentional fire-and-forget paths
  (`PerpsAttributionContext.tsx:217`, `perps-market-detail-page.tsx:1039`) carry explanatory
  comments. No bare catches, no `.catch(() => {})`. One inconsistency in Issues.
- **Shared module state** — `sessionUtmAttribution` (`PerpsAttributionContext.tsx:92`) is
  mutable module-level state. Deliberate (last-touch UTM across provider mounts), scoped to
  the UI page load rather than the service worker, documented, with a test-only reset.
  Acceptable; noted because it is never cleared on lock or account switch.
- **Provider coverage** — every `usePerpsAttribution()` call site renders under either
  `PerpsLayout` or `PerpsTab` (`perps-tab.tsx:82`), so the context's throw-outside-provider
  path is unreachable at runtime; `usePerpsEventTracking` reads the context via
  `useContext` without throwing for unwrapped call sites.
- **Formatting rules** — no new `.toFixed()` or `{min:2,max:2}` on any displayed perps
  value. The only `toFixed(2)` in the diff is inside a pre-existing jest mock body in
  `infrastructure.test.ts`, not a render path.
- **testIDs / accessibility** — no new interactive elements; nothing to flag.
- **Deep-link params** — `perps.ts`, `perps-asset.ts`, `perps-markets.ts` switch to
  `handlerSearchParams: 'original'`, so routing params come from the unsigned URL. `predict`
  and `batch-sell` on main already do this, `parse` still returns the signature status
  alongside the destination, and these routes open read-only screens. Acceptable; noted.

## Mobile Comparison

- Status: DIVERGES (two concrete gaps in the market-search funnel; everything else aligned)
- Reference: `metamask-mobile-ref/app/components/UI/Perps/Views/PerpsMarketListView/
  PerpsMarketListView.tsx` and `hooks/usePerpsAbandonOrderTracking.ts`.
- **Aligned**: 500 ms debounce, settled-count gating, `mode` derivation, `active_chips`,
  results/no-results screen views, `query_text`/`query_length`/`has_results`, the one-shot
  abandon guard and `time_on_screen_ms`. The abandon hook's `pagehide` + unmount trigger is
  a correct platform translation of mobile's `beforeRemove`/`blur`.
- **Diverges**: fast-tap flush and empty-box session reset — see Issues.
- **Nuance on abandon-commit reset**: mobile's hook clears `hasCommittedRef` on every focus;
  the Extension makes the reset caller-owned. The close modal resets on reopen, the
  order-entry page never does — so the *post-failed-submit* abandonment is lost on both
  platforms, but the Extension has no path that ever re-arms the page. See Issues.

## LavaMoat Policy

- Status: OK
- Details: `lavamoat/browserify/**` no longer exists (removed by main), so only the 8 webpack
  policies changed. Deltas match the `@metamask/perps-controller` 9.0.0 → 9.2.1 bump: a
  removed `WebSocket` global on the controller, added `DecompressionStream` / `Response` /
  `TextDecoder` / `atob` / `Blob` / `TextEncoder` on the `@nktkas/hyperliquid` and
  `@nktkas/rews` sub-packages. The mix of removals and additions reads as genuine
  `lavamoat:auto` regeneration, not hand editing. No new top-level dependency. The patch
  file `.yarn/patches/@metamask-perps-controller-npm-9.2.1-727f87b8bb.patch` is checked in.
  (The unreferenced `…-6.0.0-…patch` is a pre-existing orphan on main, not this PR.)

## Fix Quality

- Best approach: mostly yes — one simplification remains in
  `ui/pages/perps/market-list/index.tsx`. The search-session lifecycle is split across two
  paths (`handleSearchClear` at :396 and the empty branch of the debounce effect at :344)
  that behave differently. Mobile has a single path: the effect's empty branch calls
  `emitSearchAbandoned()` then `resetSearchSession()`. Collapsing to that shape removes both
  parity gaps and deletes the special-case emit from `handleSearchClear`.
- Would not ship: the three ESLint errors (CI-blocking) and the fast-tap funnel loss.
- Test quality: good — assertions check emitted payloads and specific args, failure paths are
  exercised (`{ success: false }` vs transport throw asserted separately in the
  close/cancel/reverse/order-entry suites), and absence claims are asserted directly
  (`expect(closeTxCalls).toHaveLength(0)`). Reverting the fix would fail these tests. Two
  weak spots noted under Test Quality.
- Brittleness: low. The `latestAbandonPropsRef` write is in a dependency-scoped effect, not
  the render body. One residual: `readScreenViewedHashAttribution()` is merged last in
  `buildPerpsEvent` (`usePerpsEventTracking.ts:75`), so the hash always wins over a call-site
  `source` — intended and documented, but any route whose hash retains `source=deeplink`
  reports `deeplink` for every later screen view on that route.
- Analytics-schema note (no code change requested): `PERPS_EVENT_PROPERTY.TIMESTAMP` moves
  from `perps_timestamp` to the controller's `timestamp`, renaming that property on every
  perps event. Correct per the contract; the data consumers need to know.

## Diff Quality

- Minimal: yes — 90 files vs `origin/main`, all PR content. No reformatting, no unrelated
  edits. The e2e state snapshots (`recentlyViewedMarkets`) follow from the controller bump.
- Debug code: none — no `console.log`, no `debugger`, no commented-out code, no untracked
  TODO/FIXME in added lines.

## Recipe

- Present: yes (`artifacts/recipe.json`, 19 nodes; `recipe-quality.json` verdict `pass`;
  `recipe-coverage.md` present with a `visual` proof mode)
- Quality: good — the AC nodes test the actual fix, not "app boots". The absence claims
  (`ac5-*`) are what make the client-side event removal checkable, and `ac1` pins the
  controller contract keys rather than a version string. Documented limit still true: no node
  observes a real MetaMetrics payload in the running app, so "the controller emits
  `PerpsPositionCloseTransaction` exactly once" stays proved by absence asserts plus unit
  tests, not by a live observed emission.
- Re-run this session: `mm-harness run` is still **blocked by the slot-config bug**, not by
  the code — `Slot macwork-mmedev-2 is missing resources.dev-server.metro_port required by
  Metro configuration; run farmslot update to migrate the pool`. (A first attempt also hit
  `SANDBOX_BUSY` with a pid that no longer existed, and the failed launcher took the CDP
  runtime down; `runtime-launch` restored it.) Every node was therefore executed directly
  against HEAD:
  - 6 deterministic nodes (`gate-repo-root`, `ac1`, both `ac2`, all three `ac5`): **PASS**
    (`perps-controller 9.2.1`, `re-export ok`, `order-entry deduped`, `cancel deduped`,
    `close modal deduped`).
  - 5 behaviour nodes (`ac3`, `ac4`, `ac6`, `ac7`, `ac8`): **PASS** — the Jest suites above.
  - 6 live nodes (`live-cdp` … `live-capture-error-screen`): driven individually with
    `mm-harness call` against the restored CDP runtime on 6662, all `status: pass`;
    `ui.wait_for` returned `matched: true` for "Market not found"; fresh screenshot at
    `artifacts/recipe-run-rev7/call.png`.

## Visual Evidence

- Status: OK
- `recipe-run/live-capture-error-screen.png` (the manifest's referenced file) was read
  directly: "Market not found" and `The market "DOESNOTEXIST" could not be found.` are
  plainly visible on the correct screen, with the runner's `RUN 18/19` overlay.
- `recipe-run-rev7/call.png` (captured this session against the current build) shows the same
  state with `home.html#/perps/market/DOESNOTEXIST` visible in the address bar.
- Artifact contract gate: `TASK_ARTIFACT_CONTRACT_PASS`. No `FAIL_VISUAL_CLASSIFICATION`, no
  `FAIL_EMPTY`, no `MISSING:` files, no invalid screenshot provider.

## Issues

- **ui/components/app/perps/edit-margin/edit-margin-modal-content.test.tsx:6** — importing `app/_locales/en/messages.json` from a `ui/` test trips ESLint `import-x/no-restricted-paths` ("Should not import from background in UI, use shared directory instead"). CI `yarn lint:eslint` fails. Use `import { enLocale as messages } from '../../../../../test/lib/i18n-helpers'`, the helper the sibling perps suites already use.
- **ui/components/app/perps/edit-margin/edit-margin-modal-content.tsx:67** — two `jsdoc/require-param` errors: the `getMarginAdjustmentFailedToast` JSDoc block documents neither `errorMessage` nor `fallbackDescription`. CI-blocking; auto-fixable with `--fix`.
- **ui/pages/perps/market-list/index.tsx:280** — `no-nested-ternary` error on the `mode` computation (`chips.length ? 'discovery' : /re/.test(q) ? 'intent' : 'browse'`). CI-blocking. Extract a `deriveSearchMode(chips, query)` helper, which also gives the three inline mode literals a home.
- **ui/pages/perps/market-list/index.tsx:445** — a search result tapped before the 500 ms debounce elapses emits neither `PERPS_SEARCH_QUERY` nor `PERPS_SEARCH_RESULT_TAPPED`: the tap block is gated on `emittedQueryRef.current`, still `''`, and `pendingQueryRef` is dropped when the page unmounts on navigate. Repro: type "BTC", click the first market row within 500 ms → zero search-funnel events for a completed search. Mobile gates on the current box content and calls `flushPendingSearchQueryRef.current()` first, precisely so the stream is always query → tap (`PerpsMarketListView.tsx:269-283`).
- **ui/pages/perps/market-list/index.tsx:344** — emptying the search box by backspacing never emits `search_abandoned` (only the clear button / Escape does, via `handleSearchClear` at :396), and the empty branch resets only `pendingQueryRef` and `searchStartedAtRef`. Mobile's `resetSearchSession` also clears `lastEmittedSearchQuery` / `lastEmittedSearchResultsCount` and zeroes `searchQueryCount`. Two concrete symptoms: (a) search "BTC", backspace to empty, search "ETH", leave the page → one `search_abandoned` carrying the stale query `btc` with `query_count: 2`; (b) search "BTC", backspace to empty, then tap any row from the unfiltered list → a bogus `search_result_tapped` with `search_query: 'btc'`, because `emittedQueryRef` at :445 was never cleared.
- **ui/pages/perps/perps-order-entry-page.tsx:1263** — `hasSubmittedOrderRef.current = true` is set at the start of submission and never reset on any failure path (`surfaceControllerFailure` returns, the user stays on the form). Editing and then leaving emits no `abandon_order`, so a real abandonment is lost. `close-position-modal.tsx:376` resets its equivalent flag on reopen and mobile's hook resets on focus; the order-entry page has no equivalent re-arm.
- **ui/components/app/perps/update-tpsl/update-tpsl-modal-content.tsx:533** — the 2.5 s delayed reconciliation `setTimeout` is never stored or cleared. It leaks past the modal's life and across Jest tests: this session it fired a stray `perpsGetPositions` inside a later test and failed `update-tpsl-modal-content.test.tsx:1244` under batch load (the suite passes in isolation). The comment argues no React state is touched, which is true, but the un-owned timer still makes the suite order-dependent — keep the handle and clear it on unmount, or have the test drive it with fake timers.
- **ui/pages/perps/perps-market-detail-page.tsx:487** — the error screen view fires on `!marketsLoading && Boolean(decodedSymbol) && !market`. If a symbol arrives in a later market-stream snapshot after `isInitialLoading` has flipped false, both `error` and `asset_details` fire for a single visit — the double-emission this PR set out to remove. The fire-once guard is per-`resetKey`, so the spurious `error` cannot be retracted. Consider also requiring the market list to be non-empty.
- **ui/pages/perps/perps-market-detail-page.tsx:490** — `'market_not_found'` is an inline string literal, duplicated verbatim at `ui/pages/perps/perps-order-entry-page.tsx:495`, and is not a member of `PERPS_EVENT_VALUE.ERROR_TYPE`. Same pattern for `[PERPS_EVENT_PROPERTY.ORDER_CONTEXT]: 'trade'` (`perps-order-entry-page.tsx:592`) and the three `mode` literals in `market-list/index.tsx:281-284`. Every other analytics value in the diff goes through the constants layer.
- **ui/pages/perps/perps-order-entry-page.tsx:337** — `DEFAULT_LEVERAGE = 3` stayed a component-body constant while the same commit hoisted `DEFAULT_MAX_LEVERAGE` to module scope at :231; both feed `tradingScreenDefaults`. Move it next to `DEFAULT_MAX_LEVERAGE`.
- **ui/components/app/perps/update-tpsl/update-tpsl-modal-content.tsx:540** — the delayed refetch still swallows into `console.warn` while the same commit converted the sibling swallows in `perps-view.tsx:238` and `perps-market-detail-page.tsx:1039` to `captureException`. Pre-existing line, inconsistent after this PR, one-line change.
- **ui/pages/perps/perps-market-detail-page.test.tsx:481** — `expect(typeof assetDetailView?.properties?.watchlisted).toBe('boolean')` only pins the type. The fixture is deterministic, so assert the value; as written the test passes even if `watchlisted` reads the wrong selector.
- **ui/components/app/perps/utils/track-perps-error-screen.test.ts:27** — "carries a non-null, human-readable screen_name" re-asserts the same single `track` call as the test above it with a literal instead of the constant, so it cannot fail independently. Fold it into the first test or drop it.
- **package.json:429** — `@metamask/perps-controller` is pinned to `patch:@metamask/perps-controller@npm%3A9.2.1#…727f87b8bb.patch`, dropping the `^` range, so the extension can no longer pick up 9.2.x patch releases. The patch itself is legitimate (upstream 9.2.1 shipped `require("file:///home/runner/work/hyperliquid/…")` in two dist files). Needs a tracked follow-up to revert once upstream republishes, not a silent pin.

## Tooling / environment notes (framework, not the PR)

- **`yarn lint:changed` gives no signal here.** `development/lint-changed.mts` only inspects
  untracked/staged/unstaged files, so on a clean tree it prints "No changed JS/TS/TSX/MTS/SNAP
  files to lint" and exits 0. The four ESLint errors above were found with
  `node node_modules/eslint/bin/eslint.js -c ./.eslintrc.js --no-cache <57 changed files>` —
  the same config and invocation `yarn lint:eslint` uses, minus its cache. There is no
  `eslint-suppressions.json` entry covering them. `yarn verify-locales --quiet` ("No invalid
  entries!") and `yarn circular-deps:check` both pass.
- **`mm-harness run` launcher is blocked** on `Slot macwork-mmedev-2 is missing
  resources.dev-server.metro_port`. Needs `farmslot update` at the orchestrator level. A
  stale `SANDBOX_BUSY` report (pid 38586 / 41393, neither alive, no `sandbox.lock` on disk)
  preceded it, and the failed launcher left CDP 6662 down until `runtime-launch` restored it
  (`runtime-health` PASS, 1 extension page target, `dist-freshness: fresh`).
- Working tree is clean (`git status --porcelain` empty); no repo file was modified by this
  review.
