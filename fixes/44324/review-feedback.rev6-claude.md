# Self-Review: MetaMask/metamask-extension#44324

## Verdict: ISSUES

## Summary

The PR migrates Extension perps analytics onto the `@metamask/perps-controller@9.2.1`
contract: client-side transaction events are dropped in favour of controller-owned ones,
UTM/deeplink attribution is threaded through a new `PerpsAttributionProvider`, and the
market-search / order-abandonment funnels are added for mobile parity. Design is sound and
behaviour is well covered (740/740 tests green this session, `tsc` clean). Blocking:
three ESLint errors will fail CI, one "controller owns this now" removal is **not** covered
by the pinned 9.2.1 and silently drops a failure event today, and the market-search funnel
still has two event-losing mobile-parity gaps.

Reviewed at HEAD `cb6aa610f7`, worktree clean. Same commit rev1 reviewed — none of that
round's 12 findings have been fixed, so the overlapping ones are re-confirmed here with
independent evidence rather than restated.

## Type Check

- Result: PASS
- New errors: none (`yarn lint:tsc`, exit 0, zero output)
- Ran the broad TS gate deliberately, per the checklist exemption: the diff changes
  dependency and public type surfaces (`package.json`, `yarn.lock`, the exported
  `shared/constants/perps-events.ts` contract, and the `test/mocks/metamask-perps-controller.js`
  mock contract), so TS compatibility is itself under review.

## Tests

- Result: PASS
- Details: all 21 changed/added suites re-run at HEAD, `--runInBand`, three batches —
  11 non-component suites **279/279**, 7 perps component suites **237/237**, 3 page suites
  **224/224**. Total **740/740**. `reverse-position-modal.test.tsx:391`, which flaked for
  rev1 under batch load, passed here. No console-baseline violations.

## Test Quality

- No `should` in any added/modified test name. AAA separation is clean, fake-timer state
  changes are wrapped in `act()`, and no added assertion hardcodes user-facing copy — the
  previously-flagged ones read `messages.*.message`.
- **ui/pages/perps/perps-market-detail-page.test.tsx:481** — `expect(typeof
  assetDetailView?.properties?.watchlisted).toBe('boolean')` pins only the type; the
  fixture is deterministic so the value is assertable. See Issues.
- `ui/components/app/perps/utils/track-perps-error-screen.test.ts:26` ("carries a non-null,
  human-readable screen_name") re-asserts the same single `track` call as the test above it.
  It is not dead — it pins the literal `'perps_market_details'` so a constant-value change
  is caught — but the name does not say that. Low value as written; not listed as an issue.
- New tests use `fireEvent` rather than `userEvent`. Called out because the anti-pattern doc
  prefers `userEvent`, but it is the correct call here: these suites drive `jest.useFakeTimers()`
  and `userEvent` needs extra advance-timer wiring. Matches the surrounding suites.

## Domain Anti-Patterns

- **Import boundaries** — one violation, CI-blocking (`edit-margin-modal-content.test.tsx:6`,
  see Issues). Everything else is clean: `shared/` imports no `app/`/`ui/`, and the new
  `shared/lib/deep-links/routes/perps-attribution.ts` is dependency-free.
- **`eslint-disable` — verified empirically, not argued.** The 8 new file-level
  `@typescript-eslint/naming-convention` disables are load-bearing: I stripped all 8 and
  re-ran ESLint — **33 errors** ("Object Literal Property name `utm_source` must match
  camelCase…"). They can only be removed by rewriting the assertions to computed
  `PERPS_EVENT_PROPERTY.*` keys, which is a separate refactor. Recording the measurement so
  the next reviewer stops re-litigating it; `CLAUDE.local.md` still prohibits them, so this
  remains the author's call.
- **Error handling** — clean for everything new. All 4 added catch/`.catch` sites either
  surface UI state or call `captureException`, and the two intentional fire-and-forget paths
  (`PerpsAttributionContext.tsx:217`, `perps-market-detail-page.tsx:1039`) carry explanatory
  comments. No bare catch, no `.catch(() => {})`. One pre-existing `console.warn` swallow is
  now inconsistent with its converted siblings (see Issues).
- **Controller usage** — no direct `chrome.storage`, no controller instantiation outside the
  init path; attribution is written through the `perpsSetAttributionContext` background API.
- **MV3** — `messengerClientRef` is function-scoped inside `PerpsControllerInit`, not a
  module global; no new SW timers or top-level await.
- **Shared module state** — `sessionUtmAttribution` (`PerpsAttributionContext.tsx:92`) is
  mutable module state, deliberate (last-touch UTM across provider mounts), UI-page-load
  scoped, documented, test-resettable. Acceptable; note it is never cleared on lock or
  account switch, so a campaign click stamps `utm_*` on every later perps screen view for
  that page-load.
- **Magic strings** — see Issues (`market_not_found`, `'trade'`, the three `mode` literals).
- **Formatting rules** — no new `.toFixed()` / `{min:2,max:2}` on any displayed value. The
  single `toFixed(2)` in the diff is inside a re-indented jest mock body in
  `infrastructure.test.ts`, not a render path. No displayed-value formatter, sign rule,
  rounding, or threshold changed, so the value-parity sweep is N/A.
- **testIDs / accessibility** — no new interactive elements or displayed values; nothing to flag.
- **Mock-vs-package contract (verified)** — `test/mocks/metamask-perps-controller.js`
  declares 5 property keys and ~14 value keys the real 9.2.1 package does **not** export
  (`TYPE`, `SIZE`, `BUTTON_TYPE`, `SOURCE.MARKET_LIST`, `TRADE_ACTION.*`, …). Every one is
  re-declared as an Extension-only override in `shared/constants/perps-events.ts` **except**
  `PERPS_EVENT_PROPERTY.TYPE` — and `git grep` confirms no non-test call site uses it, so
  there is no runtime hazard. Zero *value* mismatches between mock and package. Brittleness
  note only: the mock being a superset means a call site typo'd against it passes jest;
  `tsc` (which uses the real types) is the backstop.

## Mobile Comparison

- Status: DIVERGES (three concrete gaps; everything else aligned)
- References read: `metamask-mobile-ref/app/components/UI/Perps/Views/PerpsMarketListView/PerpsMarketListView.tsx`
  (:255-300, :475-560), `hooks/usePerpsAbandonOrderTracking.ts`, `utils/deriveTradeAction.ts`.
- **Aligned**: the 500 ms debounce, settled-count gating, `mode` derivation, `active_chips`,
  results/no-results screen views, `query_text`/`query_length`/`has_results`, the one-shot
  abandon guard and `time_on_screen_ms`. `deriveTradeAction` is a faithful port (it takes a
  direction instead of a `Position`, with callers converting via `getPositionDirection`).
  Abandon tracking on both the order **and** close surfaces matches mobile, which calls the
  hook from `PerpsOrderView` and `PerpsClosePositionView`. `pagehide` + unmount is a correct
  platform translation of mobile's `beforeRemove`/`blur`.
- **Diverges**: fast-tap flush, empty-box session reset, and the never-reset commit flag —
  all three in Issues below, each with the mobile line that does it differently.

## LavaMoat Policy

- Status: OK (verified, not assumed)
- `lavamoat/browserify/**` no longer exists on main, so only the 8 webpack policies changed.
  The deltas match the `@metamask/perps-controller` 9.0.0 → 9.2.1 bump (which pulls
  `@nktkas/hyperliquid` 0.32 → 0.33 and `@nktkas/rews` 2 → 4): a removed `WebSocket` global
  on the controller, added `DecompressionStream`/`Response`/`TextDecoder`/`atob`/`Blob`/
  `TextEncoder` on the two `@nktkas` sub-packages. Mixed additions and removals read as
  genuine `lavamoat:auto` output, and nothing permissive (`fs`, `net`, `child_process`) was
  granted.
- Chased the one thing that looked like a gap: hyperliquid 0.33.2 adds a **new** dependency
  `decimal.js@^10.6.0` that appears in no policy file. Not a defect — `decimal.js` is
  imported only by `@nktkas/hyperliquid/esm/utils/_format.js`, reachable solely through the
  package's `./utils` subpath export, and `@metamask/perps-controller` imports only the root
  `"@nktkas/hyperliquid"` entry (whose `mod.js` does not re-export `utils`). It is genuinely
  outside the bundle graph, so its absence from the allowlist is correct.

## Fix Quality

- Best approach: mostly yes, with one structural simplification available in
  `ui/pages/perps/market-list/index.tsx`. The search-session lifecycle is split across two
  paths that behave differently — `handleSearchClear` (:396) and the empty branch of the
  debounce effect (:344). Mobile has one path: the effect's empty branch calls
  `emitSearchAbandoned()` then `resetSearchSession()` (`PerpsMarketListView.tsx:543-546`).
  Collapsing to that shape removes parity gap #3 and deletes the special-case emit from
  `handleSearchClear`.
- Would not ship: the three ESLint errors (CI), the margin-failure event loss, and the
  fast-tap funnel loss. The rest are cheap quality wins.
- Test quality: good. Assertions check emitted payloads and specific args, both failure
  shapes are separately exercised (`{ success: false }` vs a transport throw in the
  close/cancel/reverse/order-entry suites), and the removal claims are asserted directly
  (`expect(closeTxCalls).toHaveLength(0)`) so reverting the fix fails the tests. Two weak
  spots noted above.
- Brittleness: low. `latestAbandonPropsRef` is written in a dependency-scoped effect (the
  worker bisected the dependency-free version against a control run rather than assuming),
  and the abandon hook keeps stable refs so activation changes alone re-run its effect.
  Residual: `readScreenViewedHashAttribution()` is merged **last** in `buildPerpsEvent`, so
  the hash always beats a call-site `source` — intended and documented, but any route whose
  hash retains `source=deeplink` reports `deeplink` for every later screen view on that route.

## Diff Quality

- Minimal: yes — 90 files vs `origin/main`, all PR content, no reformatting or unrelated
  edits. The earlier churn reverts (hook ordering, dep-array ordering, ticket IDs) held.
  Scope note: review base is `origin/main...HEAD`; local `main` is ~330 commits stale, so
  `git diff main...HEAD` shows ~1000 unrelated files.
- Debug code: none — no added `console.*`, no `debugger`, no commented-out code, no added
  TODO/FIXME, no `as any` / `as unknown as`.

## Recipe

- Present: yes (`artifacts/recipe.json`, 19 nodes; `recipe-quality.json` verdict `pass`;
  `recipe-coverage.md` present with a `visual` proof mode)
- Quality: good — the AC nodes test the actual fix, not "app boots". The absence asserts
  (`ac5-*`) are what make the client-event removal checkable, and `ac1` pins the controller
  contract rather than a version string. Documented limit still holds: no node observes a
  real MetaMetrics payload in the running app, so "the controller emits
  `PerpsPositionCloseTransaction` exactly once" rests on absence asserts plus unit tests.
  Related weakness, now concrete: because no node observes real emissions, the recipe cannot
  catch the margin-failure event loss in Issues #1 — every AC passes while the event is gone.
- Re-run this session: `mm-harness run` is **blocked by the same framework slot-config bug**
  rev1 hit, reproduced independently — `Slot macwork-mmedev-2 is missing
  resources.dev-server.metro_port required by Metro configuration; run farmslot update`.
  Not worked around. Every node was executed directly instead:
  - 7 deterministic nodes (`gate-repo-root`, `ac1` version=9.2.1, both `ac2`, all three
    `ac5`): **PASS**.
  - 6 behaviour nodes (`ac3`, `ac4`, `ac6`, `ac7`, `ac8`): **PASS** — the jest suites above.
  - 6 live nodes driven with `mm-harness call` against CDP 6662: `ensure_unlocked`,
    `ui.navigate page=perps`, `ui.navigate hash=#/perps/market/DOESNOTEXIST`,
    `ui.wait_for text="Market not found"` → `matched: true` at
    `home.html#/perps/market/DOESNOTEXIST`, `ui.screenshot` → fresh capture at
    `artifacts/recipe-run-rev6-live/call.png`. `runtime-health` reports `PASS`.
  - Disclosed: the `cdp.target` node failed with `UI_COMPOSITOR_SUSPENDED`
    ("requestAnimationFrame did not advance") — a stale-frame heuristic tripped by the
    macOS window state. The subsequent navigate/wait/screenshot all succeeded and the
    capture shows the state I had just navigated to, so the proof stands, but the compositor
    warning is recorded rather than hidden.

## Visual Evidence

- Status: OK
- `recipe-run/live-capture-error-screen.png` (the manifest's only `standalone` entry) read
  directly: "Market not found" and `The market "DOESNOTEXIST" could not be found.` are
  plainly visible on the correct screen, with the runner's `RUN 18/19` overlay. Claim supported.
- `recipe-run-rev6-live/call.png` (captured this session at HEAD) shows the same state.
  Provider is `capture-helper` — not a forbidden one.
- Gates: `TASK_ARTIFACT_CONTRACT_PASS`; no `FAIL_VISUAL_CLASSIFICATION`, no `FAIL_EMPTY`, no
  `MISSING:` files, no `FAIL_INVALID_SCREENSHOT_PROVIDER`.

## Issues

- **ui/components/app/perps/edit-margin/edit-margin-modal-content.tsx:335** — the removed client `PerpsRiskManagement` FAILED emission is **not** replaced by the controller in the pinned 9.2.1, so a failed margin add/remove now emits **no** terminal risk event at all. Verified in `node_modules/@metamask/perps-controller@9.2.1`: `TradingService.updateMargin` (dist/services/TradingService.cjs:1081) tracks `RiskManagement` only inside `if (result.success)` (:1111) and in its `catch` (:1134) — the non-throwing `{ success: false }` path tracks nothing. And `HyperLiquidProvider.updateMargin` (dist/providers/HyperLiquidProvider.cjs:1292-1301) catches its own errors and **returns** `{ success: false, error }`, so every real failure ("No position found", "Insufficient balance for margin addition", "Margin adjustment failed") lands on exactly that untracked path. Repro: add margin with insufficient balance → before this PR one `Perp Risk Management` `status: failed`; after, only the new error screen view. The inline comment ("the controller emits the terminal margin risk failed event for the `{ success: false }` branch from the next perps-controller release (core #9471)") describes a release that is not what `package.json` pins. Either keep the client FAILED emission until the controller ships #9471, or land this behind the controller bump. I checked the sibling removals for the same class of gap and they are safe: close (`#trackPositionCloseResult` emits FAILED for `result.success !== true`), batch close (`closePositions` `finally`), cancel (explicit `else`), flip (explicit `else`), TP/SL (`finally`) — `updateMargin` is the only uncovered path.
- **ui/components/app/perps/edit-margin/edit-margin-modal-content.test.tsx:6** — importing `app/_locales/en/messages.json` from a `ui/` test trips `import-x/no-restricted-paths` ("Should not import from background in UI, use shared directory instead"). CI `yarn lint:eslint` fails. Use `import { enLocale as messages } from '../../../../../test/lib/i18n-helpers'`, the helper the sibling perps suites already use.
- **ui/components/app/perps/edit-margin/edit-margin-modal-content.tsx:67** — two `jsdoc/require-param` errors: the `getMarginAdjustmentFailedToast` JSDoc documents neither `errorMessage` nor `fallbackDescription`. CI-blocking; auto-fixable with `--fix`.
- **ui/pages/perps/market-list/index.tsx:280** — `no-nested-ternary` error on the `MODE` computation (`chips.length ? 'discovery' : /re/.test(q) ? 'intent' : 'browse'`). CI-blocking. Extract a `deriveSearchMode(chips, query)` helper — which also gives the three inline mode literals a home.
- **ui/pages/perps/market-list/index.tsx:445** — a result tapped before the 500 ms debounce elapses emits neither `PERPS_SEARCH_QUERY` nor `PERPS_SEARCH_RESULT_TAPPED`: the tap block is gated on `emittedQueryRef.current` (still `''`), and `pendingQueryRef` is dropped when the page unmounts on navigate. Repro: type "BTC", click the first market row within 500 ms → zero search-funnel events for a completed search. Mobile gates on the current box content and calls `flushPendingSearchQueryRef.current()` before emitting, precisely so the stream is always query → tap (`PerpsMarketListView.tsx:257-283`).
- **ui/pages/perps/market-list/index.tsx:344** — emptying the box by backspacing never emits `search_abandoned` (only the clear button / Escape does, via `handleSearchClear` at :396), and the empty branch resets only `pendingQueryRef` and `searchStartedAtRef`, leaving `emittedQueryRef`, `emittedResultsCountRef` and `queryCountRef` stale. Mobile's empty branch calls `emitSearchAbandoned()` then `resetSearchSession()`, which also clears `lastEmittedSearchQuery`/`lastEmittedSearchResultsCount` and zeroes `searchQueryCount` (`PerpsMarketListView.tsx:480-492, 543-546`). Repro: search "BTC" (emitted), backspace to empty, search "ETH" (emitted), leave the page → one `search_abandoned` carrying the stale query `btc` with `query_count: 2` and no `time_in_search_ms`, instead of two sessions of `query_count: 1`.
- **ui/pages/perps/perps-order-entry-page.tsx:1263** — `hasSubmittedOrderRef.current = true` is set at the start of submission and never reset on failure. `surfaceControllerFailure` deliberately keeps the user on the form, so after a failed order any subsequent real abandonment emits nothing for the life of that page instance. `close-position-modal.tsx:376` resets its equivalent flag on reopen, and mobile's hook clears `hasCommittedRef.current = false` on every focus (`usePerpsAbandonOrderTracking.ts`, `useFocusEffect`) exactly to re-arm a fresh order session. Reset it in `surfaceControllerFailure` and the `catch`.
- **ui/pages/perps/perps-market-detail-page.tsx:487** — the error screen view fires on `!marketsLoading && Boolean(decodedSymbol) && !market`. If a symbol arrives in a later market-stream snapshot after `isInitialLoading` has already flipped false, both `error` and `asset_details` fire for one visit — the double emission this PR set out to remove. The fire-once guard is per-`resetKey`, so the spurious `error` cannot be retracted. Consider also requiring the market list to be non-empty.
- **ui/pages/perps/perps-market-detail-page.tsx:490** — `'market_not_found'` is an inline literal, duplicated verbatim at `ui/pages/perps/perps-order-entry-page.tsx:495`, and is not a member of `PERPS_EVENT_VALUE.ERROR_TYPE`. Same pattern for `[PERPS_EVENT_PROPERTY.ORDER_CONTEXT]: 'trade'` (`perps-order-entry-page.tsx:592`) and the three `mode` literals (`market-list/index.tsx:281-284`). Every other analytics value in the diff goes through the constants layer.
- **ui/components/app/perps/perps-view.tsx:224** — dropping the client close-all summary also drops `number_positions_closed`: 9.2.1's `closePositions` `finally` block (TradingService.cjs:900-912) emits the batch `PositionCloseTransaction` with only `status`, `completion_duration` and `bulk_action_id`. The event survives, the property does not, until core #9471. Unlike the margin case this is a property gap rather than a lost event, but it needs flagging to the data consumers alongside the `perps_timestamp` → `timestamp` rename in `test/mocks/metamask-perps-controller.js:23`.
- **ui/pages/perps/perps-order-entry-page.tsx:337** — `DEFAULT_LEVERAGE = 3` stayed a component-body constant while the same commit hoisted `DEFAULT_MAX_LEVERAGE` to module scope (:231); both feed `tradingScreenDefaults`. Move it next to `DEFAULT_MAX_LEVERAGE`.
- **ui/components/app/perps/update-tpsl/update-tpsl-modal-content.tsx:540** — the delayed refetch still swallows into `console.warn` while the same commit converted the sibling swallows in `perps-view.tsx:238` and `perps-market-detail-page.tsx:1039` to `captureException`. Pre-existing line, inconsistent after this PR, one-line change.
- **ui/pages/perps/perps-market-detail-page.test.tsx:481** — `expect(typeof assetDetailView?.properties?.watchlisted).toBe('boolean')` pins only the type. The fixture is deterministic, so assert the value; as written the test passes even if `watchlisted` reads the wrong selector.
- **package.json:429** — `@metamask/perps-controller` is pinned to `patch:@metamask/perps-controller@npm%3A9.2.1#…727f87b8bb.patch`, dropping the `^` range, so the extension can no longer pick up 9.2.x patch releases. The patch itself is legitimate (upstream 9.2.1 shipped `require("file:///home/runner/work/hyperliquid/…")` in two dist files). Needs a tracked follow-up to revert once upstream republishes, not a silent pin — and it is the same pin that makes Issue #1 live rather than theoretical.

## Tooling / environment notes (framework, not the PR)

- **`yarn lint:changed` gives no signal here.** On a clean tree `development/lint-changed.mts`
  prints "No changed JS/TS/TSX/MTS/SNAP files to lint" and exits 0 — it only inspects
  untracked/staged/unstaged files. The 4 ESLint errors above were found by running
  `node node_modules/eslint/bin/eslint.js -c ./.eslintrc.js --no-cache` over the 57 changed
  JS/TS files. `yarn verify-locales --quiet` ("No invalid entries!") and
  `yarn circular-deps:check` both pass.
- **`mm-harness run` launcher is blocked** on `Slot macwork-mmedev-2 is missing
  resources.dev-server.metro_port`. Needs `farmslot update` at the orchestrator level.
  Reproduced twice this session; the `--project-root` flag in the checklist is also stale
  (the CLI wants `--target`).
- **`cdp.target` reports `UI_COMPOSITOR_SUSPENDED`** on this slot's browser while every
  other live action against the same port works. Frame-advance heuristic vs. macOS window
  state; recorded for the orchestrator.
- No repo files were modified by this review. The 8-file eslint-disable experiment was
  reverted with `git checkout --` and the worktree is clean at `cb6aa610f7`. The only
  additions are new artifacts under `artifacts/recipe-run-rev6-live/`.
