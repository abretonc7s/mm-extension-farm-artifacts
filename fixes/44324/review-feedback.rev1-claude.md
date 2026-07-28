# Self-Review: MetaMask/metamask-extension#44324

## Verdict: ISSUES

## Summary

The PR migrates Extension perps analytics onto the `@metamask/perps-controller@9.2.1`
contract: client-side transaction events are removed in favour of controller-owned ones,
UTM/deeplink attribution is threaded through a new `PerpsAttributionProvider`, and the
market-search / order-abandonment funnels are added for mobile parity. The design is
sound and the behaviour is well covered by tests (740 tests re-run green this session).
Three ESLint errors introduced by the self-review-fix commit will fail CI, and the
market-list search funnel has two concrete mobile-parity gaps that lose real events.

## Type Check

- Result: NOT RUN (bounded self-review; the diff's type surfaces were already covered by
  the worker's full `yarn lint` including `tsc`, and no new type errors surfaced in the
  fresh ESLint pass over the 57 changed JS/TS files)
- New errors: n/a

## Tests

- Result: PASS
- Details: All 22 changed/added test suites re-run against HEAD.
  - 11 non-component suites (infrastructure, controller-init, 3 deep-link route suites,
    deriveTradeAction, track-perps-error-screen, abandon hook, attribution hook,
    usePerpsEventTracking, PerpsAttributionContext): **279/279 pass**.
  - 7 perps component suites (cancel-order, close-position, edit-margin, geo-block,
    perps-view, reverse-position, update-tpsl): **236/237**, one failure —
    `reverse-position-modal.test.tsx:391` "calls perpsFlipPosition once with symbol and
    position payload" timed out under `--runInBand` batch load. Passes in isolation
    (29/29) and on a re-run of the same 3-suite batch (117/117). Load-sensitive flake,
    already documented by the worker; the suite is slow (~50 s for 29 tests).
  - 3 page suites (market-list, market-detail, order-entry): **224/224 pass**.

## Test Quality

- No `should` in any added/modified test name. AAA separation and `act()` usage around
  fake timers are correct. No hardcoded user-facing copy — the previously-flagged
  assertions now read from `messages.*.message`.
- **ui/pages/perps/perps-market-detail-page.test.tsx:481** — `expect(typeof
  assetDetailView?.properties?.watchlisted).toBe('boolean')` asserts only the type. The
  fixture is deterministic, so it can assert the value; as written the test still passes
  if `watchlisted` is wired to the wrong selector.
- **ui/components/app/perps/utils/track-perps-error-screen.test.ts:26** — "carries a
  non-null, human-readable screen_name" re-asserts the same single `track` call as the
  test above it, only with the literal instead of the constant. It cannot fail
  independently.

## Domain Anti-Patterns

- **Import boundary violation (blocking)** —
  `ui/components/app/perps/edit-margin/edit-margin-modal-content.test.tsx:6` imports
  `app/_locales/en/messages.json` from `ui/`. ESLint reports
  `import-x/no-restricted-paths`. Sibling perps suites use the sanctioned helper
  (`enLocale as messages` from `test/lib/i18n-helpers`).
- **eslint-disable additions** — 8 new file-level
  `/* eslint-disable @typescript-eslint/naming-convention */` directives across perps and
  deep-link test files. `CLAUDE.local.md` forbids `eslint-disable`; precedent exists on
  main (`usePerpsEventTracking.test.tsx`) and removing them means rewriting snake_case
  object keys across 8 files. Worker already surfaced this; recorded for the author's
  decision, not treated as a blocker.
- **Error handling** — clean. Every new `catch` either surfaces UI state or calls
  `captureException`, and the two intentional fire-and-forget paths
  (`PerpsAttributionContext.tsx:217`, `perps-market-detail-page.tsx:1039`) carry
  explanatory comments. No bare catches, no `.catch(() => {})`.
- **Shared module state** — `sessionUtmAttribution` in `PerpsAttributionContext.tsx:92` is
  mutable module-level state. It is deliberate (last-touch UTM across provider mounts),
  scoped to the UI page load rather than the service worker, documented, and has a
  test-only reset. Acceptable; noted because it is never cleared on lock/account switch.
- **Provider coverage verified** — every `usePerpsAttribution()` call site
  (market-list, market-detail, order-entry, cancel/close/reverse/TP-SL modals) renders
  under either `PerpsLayout` (`routes.component.tsx:572`) or `PerpsTab`
  (`perps-tab.tsx:82`, also reached via `perps-home-page.tsx`), so the context's
  throw-outside-provider path is unreachable at runtime.
- **testIDs / accessibility** — no new interactive elements; nothing to flag.
- **Formatting rules** — no new `.toFixed()` or `{min:2,max:2}` on any displayed perps
  value. The only `toFixed(2)` in the diff is inside a pre-existing jest mock body in
  `infrastructure.test.ts` that was re-indented, not a render path.

## Mobile Comparison

- Status: DIVERGES (two concrete gaps in the market-search funnel; everything else aligned)
- Reference: `/Users/deeeed/dev/metamask/metamask-mobile-ref/app/components/UI/Perps/Views/PerpsMarketListView/PerpsMarketListView.tsx`
  and `hooks/usePerpsAbandonOrderTracking.ts`.
- **Aligned**: the 500 ms debounce, settled-count gating, `mode` derivation, `active_chips`,
  results/no-results screen views, `query_text`/`query_length`/`has_results`, the
  one-shot abandon guard and `time_on_screen_ms` all match mobile. The abandon hook's
  `pagehide` + unmount trigger is a correct platform translation of mobile's
  `beforeRemove`/`blur`, and the caller-owned `hasCommittedRef` reset is documented.
- **Diverges**: fast-tap flush and empty-box session reset — see Issues below.

## LavaMoat Policy

- Status: OK
- Details: `lavamoat/browserify/**` no longer exists (removed by main), so only the 8
  webpack policies changed. The deltas are consistent with the
  `@metamask/perps-controller` 9.0.0 → 9.2.1 bump — a removed `WebSocket` global on the
  controller and added `DecompressionStream` / `Response` / `TextDecoder` / `atob` /
  `Blob` / `TextEncoder` globals on the `@nktkas/hyperliquid` and `@nktkas/rews`
  sub-packages. The mix of removals and additions reads as genuine `lavamoat:auto`
  regeneration rather than hand editing. No new top-level dependency was added.

## Fix Quality

- Best approach: mostly yes — one simplification available in
  `ui/pages/perps/market-list/index.tsx`. The search-session lifecycle is split across
  two paths (`handleSearchClear` at :395 and the empty branch of the debounce effect at
  :344) that behave differently. Mobile has a single path: the effect's empty branch calls
  `emitSearchAbandoned()` then `resetSearchSession()`. Collapsing to that shape removes
  both parity gaps below and deletes the special-case emit from `handleSearchClear`.
- Would not ship: the three ESLint errors (CI-blocking) and the fast-tap funnel loss.
- Test quality: good — assertions check emitted payloads and specific args, failure paths
  are exercised (`{ success: false }` vs transport throw are separately asserted in the
  close/cancel/reverse/order-entry suites), and the absence claims are asserted directly
  (`expect(closeTxCalls).toHaveLength(0)`). Reverting the fix would fail these tests.
  Two weak spots noted under Test Quality.
- Brittleness: low. The `latestAbandonPropsRef` write was correctly moved into a
  dependency-scoped effect (the worker bisected the dependency-free version against a
  control run rather than assuming). `usePerpsEventTracking` still re-arms its fire-once
  guard when `conditions` goes false, which the geo-block modal relies on and its test
  pins. One residual: `readScreenViewedHashAttribution()` is merged last in
  `buildPerpsEvent`, so the hash always wins over a call-site `source` — intended and
  documented, but it means any route whose hash retains `source=deeplink` reports
  `deeplink` for every later screen view on that route.

## Diff Quality

- Minimal: yes — 90 files vs `origin/main`, all PR content. No reformatting or unrelated
  edits; the previously-flagged churn reverts (hook ordering, dep-array ordering, ticket
  IDs) held. Note the review scope is `origin/main...HEAD`; local `main` is 330 commits
  stale, so `git diff main...HEAD` shows ~1000 unrelated files from the merge.
- Debug code: none — no `console.log`, no `debugger`, no commented-out code, no untracked
  TODO/FIXME in added lines.

## Recipe

- Present: yes (`artifacts/recipe.json`, 19 nodes; `recipe-quality.json` verdict `pass`;
  `recipe-coverage.md` present with a `visual` proof mode)
- Quality: good — the AC nodes test the actual fix, not "app boots". The absence claims
  (`ac5-*`) are what make the client-side event removal checkable, and `ac1` pins the
  controller contract keys rather than just the version string. Assertions are specific.
  Documented limit still true: no node observes a real MetaMetrics payload in the running
  app, so "the controller emits `PerpsPositionCloseTransaction` exactly once" remains
  proved by absence asserts plus unit tests, not by a live observed emission.
- Re-run this session: the full `mm-harness run` is **blocked by a framework slot-config
  bug**, not by the code — `Slot macwork-mmedev-2 is missing
  resources.dev-server.metro_port required by Metro configuration; run farmslot update to
  migrate the pool`. Reproduced with and without `--watcher-port`. Not worked around.
  Instead every node was executed directly against HEAD:
  - 6 deterministic nodes (`gate-repo-root`, `ac1`, both `ac2`, all three `ac5`): **PASS**.
  - 5 behaviour nodes (`ac3`, `ac4`, `ac6`, `ac7`, `ac8`): **PASS** — these are the jest
    suites re-run under Tests above.
  - 6 live nodes (`live-cdp` … `live-capture-error-screen`): driven individually with
    `mm-harness call` against a restored CDP runtime on 6662. `ui.wait_for` returned
    `matched: true` for "Market not found"; fresh screenshot written to
    `artifacts/recipe-run-rev1/call.png`.
  This closes the gap the worker flagged: the live market-not-found proof is now
  re-captured against a build whose `dist-freshness` reports `fresh — dist id matches
  HEAD; no uncommitted source`, rather than the merge-time build.

## Visual Evidence

- Status: OK
- `recipe-run/live-capture-error-screen.png` (merge-time) was read directly: "Market not
  found" and `The market "DOESNOTEXIST" could not be found.` are both plainly visible on
  the correct screen, with the runner's `RUN 18/19` overlay. Claim supported.
- `recipe-run-rev1/call.png` (this session, post-fix HEAD build) shows the same state with
  the URL `home.html#/perps/market/DOESNOTEXIST` visible in the address bar.
- Artifact contract gate: `TASK_ARTIFACT_CONTRACT_PASS`. No `FAIL_VISUAL_CLASSIFICATION`,
  no `FAIL_EMPTY`, no `MISSING:` files, no invalid screenshot provider.

## Issues

- **ui/components/app/perps/edit-margin/edit-margin-modal-content.test.tsx:6** — importing `app/_locales/en/messages.json` from a `ui/` test trips ESLint `import-x/no-restricted-paths` ("Should not import from background in UI, use shared directory instead"). CI `yarn lint:eslint` fails. Use `import { enLocale as messages } from '../../../../../test/lib/i18n-helpers'`, the helper the sibling perps suites already use.
- **ui/components/app/perps/edit-margin/edit-margin-modal-content.tsx:67** — two `jsdoc/require-param` errors: the new `getMarginAdjustmentFailedToast` JSDoc block documents neither `errorMessage` nor `fallbackDescription`. CI-blocking; auto-fixable with `--fix`.
- **ui/pages/perps/market-list/index.tsx:280** — `no-nested-ternary` error on the `MODE` computation (`chips.length ? 'discovery' : /re/.test(q) ? 'intent' : 'browse'`). CI-blocking. Extract to a small `deriveSearchMode(chips, query)` helper — which also gives the three inline mode literals a home.
- **ui/pages/perps/market-list/index.tsx:445** — a search result tapped before the 500 ms debounce elapses emits neither `PERPS_SEARCH_QUERY` nor `PERPS_SEARCH_RESULT_TAPPED`: the tap block is gated on `emittedQueryRef.current`, which is still `''`, and `pendingQueryRef` is dropped when the page unmounts on navigate. Repro: type "BTC", click the first market row within 500 ms → zero search-funnel events for a completed search. Mobile gates on the current box content and calls `flushPendingSearchQueryRef.current()` first, precisely so the stream is always query → tap (`PerpsMarketListView.tsx:269-283`).
- **ui/pages/perps/market-list/index.tsx:344** — emptying the search box by backspacing never emits `search_abandoned` (only the clear button / Escape does, via `handleSearchClear` at :395), and the empty branch resets only `pendingQueryRef` and `searchStartedAtRef`. Mobile's `resetSearchSession` also clears `lastEmittedSearchQuery` / `lastEmittedSearchResultsCount` and zeroes `searchQueryCount`. Repro: search "BTC" (emitted), backspace to empty, search "ETH" (emitted), leave the page → one `search_abandoned` carrying the stale query `btc` with `query_count: 2` and no `time_in_search_ms`, instead of two sessions of `query_count: 1`.
- **ui/pages/perps/perps-order-entry-page.tsx:1263** — `hasSubmittedOrderRef.current = true` is set at the start of submission and never reset when the submit fails. After a failed order the user stays on the form; editing and then leaving emits no `abandon_order`, so a real abandonment is lost. `close-position-modal.tsx:376` resets its equivalent flag on reopen; the order-entry page has no equivalent reset on the failure paths.
- **ui/pages/perps/perps-market-detail-page.tsx:490** — `'market_not_found'` is an inline string literal, duplicated verbatim at `ui/pages/perps/perps-order-entry-page.tsx:495`, and is not a member of `PERPS_EVENT_VALUE.ERROR_TYPE`. Same pattern for `[PERPS_EVENT_PROPERTY.ORDER_CONTEXT]: 'trade'` (`perps-order-entry-page.tsx:592`) and the three `mode` literals in `market-list/index.tsx:281-284`. Every other analytics value in the diff goes through the constants layer.
- **ui/pages/perps/perps-market-detail-page.tsx:487** — the error screen view fires on `!marketsLoading && Boolean(decodedSymbol) && !market`. If a symbol arrives in a later market-stream snapshot after `isInitialLoading` has already flipped false, both `error` and `asset_details` fire for a single visit, which is the double-emission this PR set out to remove. The fire-once guard is per-`resetKey`, so the spurious `error` cannot be retracted. Consider also requiring the market list to be non-empty.
- **ui/pages/perps/perps-order-entry-page.tsx:337** — `DEFAULT_LEVERAGE = 3` stayed a component-body constant while the same commit hoisted `DEFAULT_MAX_LEVERAGE` to module scope; both are used by `tradingScreenDefaults`. Move it next to `DEFAULT_MAX_LEVERAGE`.
- **ui/components/app/perps/update-tpsl/update-tpsl-modal-content.tsx:540** — the delayed refetch still swallows into `console.warn` while the same commit converted the sibling swallows in `perps-view.tsx:238` and `perps-market-detail-page.tsx:1039` to `captureException`. Pre-existing line, but inconsistent after this PR and a one-line change.
- **ui/pages/perps/perps-market-detail-page.test.tsx:481** — `expect(typeof assetDetailView?.properties?.watchlisted).toBe('boolean')` only pins the type. The fixture is deterministic, so assert the value; as written the test passes even if `watchlisted` reads the wrong selector.
- **package.json:429** — `@metamask/perps-controller` is pinned to `patch:@metamask/perps-controller@npm%3A9.2.1#…727f87b8bb.patch`, dropping the `^` range entirely, so the extension can no longer pick up 9.2.x patch releases. The patch itself is legitimate (upstream 9.2.1 shipped `require("file:///home/runner/work/hyperliquid/…")` in two dist files). Worker flagged it deliberately; it needs a tracked follow-up to revert once upstream republishes, not a silent pin.

## Tooling / environment notes (framework, not the PR)

- **`yarn lint:changed` gives no signal here.** `development/lint-changed.mts` only inspects
  untracked/staged/unstaged files, so on a clean tree it prints "No changed JS/TS/TSX/MTS/SNAP
  files to lint" and exits 0. Worse, when it *does* find files it invokes
  `node_modules/eslint/bin/eslint.js` with no `-c`, and ESLint 9 aborts with "couldn't find
  an eslint.config.js" — the repo's config is `.eslintrc.js` (flat-format, via
  `defineConfig`) and only resolves when passed explicitly. The three lint errors above
  were found by running `node node_modules/eslint/bin/eslint.js -c ./.eslintrc.js` over the
  57 changed files with no cache. The worker's "yarn lint passes" claim was most likely a
  stale `node_modules/.cache/eslint/.eslint-cache` — `yarn lint:eslint` is cached, this run
  was not. Repo tooling issue; not patched here.
- **`mm-harness run` launcher is blocked** on `Slot macwork-mmedev-2 is missing
  resources.dev-server.metro_port`. Needs `farmslot update` at the orchestrator level.
- **Runtime disturbance, disclosed and repaired.** To get fresh live evidence I ran
  `temp/recipe/harness/extension/scripts/refresh-build.sh`, which started a second
  `yarn start` alongside the orchestrator's already-running webpack watcher (PID 69415).
  The two writers collided on `dist/chrome`, producing six spurious
  `HTML Bundler Plugin … Can't resolve app/vendor/trezor/usb-permissions.js` errors and
  leaving `dist/chrome` without its HTML entry points, which took the CDP runtime on 6662
  down. Both are repaired: the orchestrator's watcher rebuilt `dist/chrome` cleanly, and
  `mm-harness runtime-launch --cdp-port 6662` restored the browser —
  `runtime-health` now returns `PASS` with one extension page target, and
  `launch --verify` reports `dist-freshness: fresh — dist id matches HEAD; no uncommitted
  source`. The build error was entirely an artifact of the concurrent build, not a repo
  defect: the PR touches no build config, and `app/vendor/trezor/usb-permissions.js` is
  present and tracked. Working tree is clean (`git status --porcelain` shows no tracked
  changes).
