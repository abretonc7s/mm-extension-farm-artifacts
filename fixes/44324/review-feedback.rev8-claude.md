# Self-Review: MetaMask/metamask-extension#44324

## Verdict: ISSUES

## Summary

The PR migrates Extension perps analytics onto the `@metamask/perps-controller@9.2.1`
contract: client-emitted transaction events are dropped in favour of controller-owned
ones, UTM/deeplink attribution is threaded through a new `PerpsAttributionProvider`, and
the market-search / order-abandonment funnels are added for mobile parity. Every
CI-blocking item from the rev7 round is fixed and verified this session (ESLint clean over
all 57 changed JS/TS files, `yarn lint:tsc` exit 0, 743/743 tests green in one batch, the
previously order-dependent TP/SL timer flake no longer reproduces). Four items remain, all
small: one behavioural gap in the close modal that mirrors the order-entry bug fixed this
round, two dead-surface cleanups, and one previously-deferred analytics hole that needs an
author decision.

Review base is `origin/main` (`3cb496ea9a`): 90 files, +4771/−989. Local `main` is 330
commits stale, so `git diff main...HEAD` shows ~2262 unrelated files — every number below
uses `origin/main...HEAD`.

## Type Check

- Result: PASS
- New errors: none. `yarn lint:tsc` was run (exit 0) despite the checklist default, because
  this diff changes exactly the surfaces the exception names: `package.json` /`yarn.lock`
  (perps-controller 9.0.0 → patched 9.2.1), the shared exported analytics contract
  (`shared/constants/perps-events.ts` now spreads the controller enums), and controller/mock
  type contracts (`InfrastructureDeps.mergeAttributionContext`, `TrackingData` /
  `TPSLTrackingData` / `InputMethod` at call sites). ESLint was also run directly over the
  57 changed JS/TS/TSX files with the repo config (`eslint -c ./.eslintrc.js`): zero output.
  `yarn lint:changed` reports "No changed JS/TS/TSX/MTS/SNAP files" because the working tree
  is clean — it diffs the index, not the branch, so it cannot gate a committed branch.

## Tests

- Result: PASS
- Details: all 21 changed/added suites run in one batch — **743/743 pass**, 21/21 suites,
  no console-baseline violations. The rev7 load-sensitive failure at
  `update-tpsl-modal-content.test.tsx:1244` did **not** reproduce: the suite now installs
  `jest.useFakeTimers({ advanceTimers: true })` per test and drains in `afterEach`, so the
  deliberate 2.5 s post-close reconciliation can no longer leak into a later test.
- `yarn verify-locales --quiet` → "No invalid entries!". `yarn circular-deps:check` → passed.

## Test Quality

- No `should` in any added/modified test name (grep over added lines: zero hits). AAA
  separation and `act()`/fake-timer usage are correct. No hardcoded user-facing copy in
  added assertions (no added `getByText('…')`/`toHaveTextContent('…')` string literals).
- Both rev7 findings are fixed and verified:
  `perps-market-detail-page.test.tsx:479,495` now assert `watchlisted` **values**
  (`toBe(false)` and a second case seeding `watchlistMarkets.mainnet = ['ETH']` asserting
  `toBe(true)`) instead of `typeof … toBe('boolean')`; `track-perps-error-screen.test.ts`
  is a single test whose payload assertion pins both the constant and the literal
  `'perps_market_details'`.
- The three added `toBeDefined()` assertions
  (`perps-order-entry-page.test.tsx:1632,1655`, `perps-market-detail-page.test.tsx:511`) are
  existence guards immediately followed by `toEqual`/`toMatchObject` on the same object —
  not standalone weak assertions.

## Domain Anti-Patterns

- **Import boundaries** — clean. The rev7 blocker is gone:
  `edit-margin-modal-content.test.tsx:6` now imports `enLocale as messages` from
  `test/lib/i18n-helpers`. No `ui/` → `app/` or `shared/` → `ui|app` imports in the diff.
- **Error handling** — clean. Every new `catch` calls `captureException` or emits
  user-visible state; the two fire-and-forget promise catches
  (`PerpsAttributionContext.tsx:281`, `perps-market-detail-page.tsx:1040`) both carry an
  explanatory comment. No bare catches, no `.catch(() => {})`, no `console.*` in added
  non-test lines. The rev7 `console.warn` in the TP/SL delayed refetch is now
  `captureException`.
- **Magic numbers** — all named this round: `SEARCH_QUERY_DEBOUNCE_MS`,
  `TRANSACTION_CONSIDERED_DEBOUNCE_MS`, `TPSL_RECONCILE_DELAY_MS`, `DEFAULT_MAX_LEVERAGE`,
  `DEFAULT_LEVERAGE` (hoisted to module scope), `SEARCH_MODE`, `TICKER_LIKE_QUERY`, plus
  `ERROR_TYPE.MARKET_NOT_FOUND` / `ORDER_CONTEXT.TRADE` in the constants layer.
- **Analytics contract resolution** — verified mechanically, not by eye: every
  `PERPS_EVENT_PROPERTY.X` (66 unique) and `PERPS_EVENT_VALUE.G.K` (95 unique) used across
  `ui/`, `shared/`, `app/` resolves against the **real installed package** merged with the
  Extension override block. Zero unresolvable keys, so no call site can emit an `undefined`
  property name in production while passing under the Jest mock.
- **Mock drift (informational)** — `test/mocks/metamask-perps-controller.js` is a superset
  of the real contract (`TRADE_ACTION`, `RISK_MANAGEMENT_TYPE` value groups; `SIZE`,
  `TYPE`, `BUTTON_TYPE`, `MARKET_CATEGORY_FILTER`, `NUMBER_POSITIONS_CLOSED` properties;
  extra `SOURCE`/`BUTTON_*`/`SCREEN_TYPE` keys). Today every extra is also declared in the
  Extension override block, so nothing is masked — but the mock will silently absorb a
  future controller removal.
- **`eslint-disable` additions** — 8 file-level
  `/* eslint-disable @typescript-eslint/naming-convention -- … */` directives across perps
  and deep-link test files. `CLAUDE.local.md` forbids `eslint-disable`; each now carries a
  justification comment, precedent exists on main (`usePerpsEventTracking.test.tsx`), and
  removing them means rewriting snake_case analytics keys across 8 files. Recorded for the
  author, not treated as a blocker.
- **Shared module state** — `sessionUtmAttribution`
  (`PerpsAttributionContext.tsx:217`) is mutable module-level state, deliberate
  (last-touch UTM across provider mounts), scoped to the UI page load rather than the
  service worker, documented, with a test-only reset. Mobile's controller-side context has
  the same session lifetime and is likewise never cleared, so this is aligned, not drift.
- **Formatting rules** — no new `.toFixed()` or `{min:2,max:2}` on any displayed perps
  value anywhere in the diff.
- **testIDs / accessibility** — no new interactive elements; nothing to flag.

## Mobile Comparison

- Status: ALIGNED (both rev7 divergences are closed)
- Reference: `metamask-mobile-ref/app/components/UI/Perps/Views/PerpsMarketListView/
  PerpsMarketListView.tsx`, `hooks/usePerpsAbandonOrderTracking.ts`,
  `utils/perpsAnalyticsAttribution.ts`.
- **Fast-tap flush** — `market-list/index.tsx:516-540` now gates on `trimmedQueryRef`
  (box content) and calls `flushPendingSearchQuery()` before emitting
  `PERPS_SEARCH_RESULT_TAPPED`, matching `PerpsMarketListView.tsx:269-283`. Stream is
  always query → tap.
- **Empty-box session reset** — the debounce effect's empty branch calls
  `emitSearchAbandoned()` then `resetSearchSession()` (`index.tsx:344-352`), exactly
  mobile's shape at `PerpsMarketListView.tsx:543-546`; `handleSearchClear` no longer emits
  directly, so clear button, Escape and backspace behave identically.
- **Property parity** — `PERPS_SEARCH_QUERY` (`search_query`, `query_text`, `query_length`,
  settled-only `results_count`/`result_count`/`has_results`, `mode`, `active_chips`,
  `source=perp_market_search`), the results/no-results screen views,
  `PERPS_SEARCH_ABANDONED` (`query_count`, omitted-not-zero `results_count`,
  `time_in_search_ms`) and the sort/filter double-emit (`button_clicked` +
  `filter_applied` / `sort_applied`) all match mobile field-for-field. The 500 ms debounce
  and the ticker regex are identical.
- **Abandon tracking** — the Extension's `pagehide` + teardown trigger is a correct
  platform translation of mobile's `beforeRemove`/`blur`. Mobile re-arms `hasCommittedRef`
  on focus; the Extension makes the reset caller-owned — order-entry now re-arms on failure
  (`surfaceControllerFailure`), the close modal only on reopen. See Issues.
- **Attribution mirroring (accepted divergence)** — mobile reads client screen-view UTM
  straight from `PerpsController.mergeAttributionContext()`; the Extension mirrors UTM
  client-side (React state + session module store + a `window.location.hash` read at emit
  time) because the controller lives in the background and cannot be read synchronously.
  More moving parts, but the architecture forces it.

## LavaMoat Policy

- Status: OK
- Details: `lavamoat/browserify/**` no longer exists (main removed it in #44433), so only
  the 8 webpack policies changed, identically. The delta matches the 9.0.0 → 9.2.1 bump:
  `WebSocket` removed from `@metamask/perps-controller`; `DecompressionStream`, `Response`,
  `TextDecoder`, `atob`, `clearTimeout` added on `@nktkas/hyperliquid`; `Blob`,
  `DOMException`, `TextEncoder`, `URL` added and `CustomEvent` removed on `@nktkas/rews`.
  The mix of adds *and* removals reads as genuine `lavamoat:auto` regeneration
  (commit `8334ae523f`), not hand editing. Lockfile delta is 68 lines confined to
  `@metamask/perps-controller` + `@nktkas/*` + `@noble/hashes` + `decimal.js`. The patch
  `.yarn/patches/@metamask-perps-controller-npm-9.2.1-727f87b8bb.patch` is checked in and
  minimal — it rewrites two `require("file:///home/runner/work/hyperliquid/…")` lines
  shipped by upstream to `require("@nktkas/hyperliquid")`. (The unreferenced `…6.0.0…patch`
  is a pre-existing orphan on main, not this PR.)

## Fix Quality

- Best approach: yes, with the caveats below. The rev7 simplification landed — the search
  session now has one lifecycle path instead of two, and `deriveSearchMode` gives the mode
  literals a home. `surfaceControllerFailure` collapses five duplicated failure branches in
  `perps-order-entry-page.tsx` into one funnel, which is what makes the abandon re-arm a
  one-liner.
- Would not ship without a decision: the margin-failure analytics hole
  (`edit-margin-modal-content.tsx:340`, Issues). Everything else is nit-level.
- Test quality: good. Assertions check emitted payloads and specific args; failure paths are
  exercised separately (`{ success: false }` vs transport throw); absence claims are asserted
  directly. The two behavioural fixes this round are pinned by new regression tests
  (`market-list/index.test.tsx` fast-tap and backspace-to-empty; `perps-order-entry-page.
  test.tsx` "still reports abandonment after a failed submit"), and the worker verified the
  latter fails when the one-line fix is reverted.
- Brittleness: low. Residual, unchanged from rev7 and intended:
  `readScreenViewedHashAttribution()` is merged last in `buildPerpsEvent`
  (`usePerpsEventTracking.ts:75`), so any route whose hash retains `source=deeplink` reports
  `deeplink` for every later screen view on that route.
- Accepted residual (author's documented decision, not re-raised as an issue):
  `perps-market-detail-page.tsx:487` can emit both `error` and `asset_details` for one visit
  if a symbol arrives in a later market-stream snapshot. The worker implemented, measured and
  reverted the "require non-empty market list" guard because it silences a legitimate error
  view when the stream genuinely returns empty — a worse trade.
- Analytics-schema note (no code change requested): `PERPS_EVENT_PROPERTY.TIMESTAMP` moves
  from `perps_timestamp` to the controller's `timestamp`, renaming that property on every
  perps event. Correct per the contract; data consumers need to know.

## Diff Quality

- Minimal: yes — 90 files vs `origin/main`, all PR content. No reformatting, no unrelated
  edits. The e2e state snapshots (`recentlyViewedMarkets`) and the single
  `console-baseline-unit.json` entry (the provider's throw-outside-provider test) follow
  from the change.
- Debug code: none — no `console.log`, no `debugger`, no commented-out code, no untracked
  TODO/FIXME, no `as any` / `as unknown as` / `@ts-ignore` in added lines.

## Recipe

- Present: yes (`artifacts/recipe.json`, 19 nodes; `recipe-quality.json` verdict `pass`;
  `recipe-coverage.md` present with a `visual` proof mode).
- Quality: good — the AC nodes test the actual fix, not "app boots". The `ac5-*` absence
  asserts are what make the client-event removal checkable, and `ac1` pins the controller
  contract keys rather than a version string. Documented limit still true: no node observes
  a real MetaMetrics payload in the running app.
- Re-run this session: `mm-harness run` is **still blocked by the slot-config bug**, not by
  the code — `Slot macwork-mmedev-2 is missing resources.dev-server.metro_port required by
  Metro configuration; run farmslot update to migrate the pool`. The failed launcher also
  took the CDP runtime down; `runtime-launch` restored it (`artifacts/runtime-launch-rev8`).
  `--plan` validates: 19 nodes, 0 findings. Every node was therefore executed directly:
  - 7 deterministic nodes (`gate-repo-root`, `ac1`, both `ac2`, all three `ac5`): **PASS**
    (`perps-controller 9.2.1`, `re-export ok`, `order-entry deduped`, `cancel deduped`,
    `close modal deduped`).
  - 5 behaviour nodes (`ac3`, `ac4`, `ac6`, `ac7`, `ac8`): **PASS** — the Jest suites above
    (743/743).
  - 6 live nodes (`live-cdp`, `live-ensure-unlocked`, `live-open-perps`,
    `live-open-unknown-market`, `live-assert-error-screen`, `live-capture-error-screen`):
    driven individually with `mm-harness call` against the restored CDP runtime on 6662, all
    `status: pass`; `ui.wait_for` returned `matched: true` for "Market not found"; fresh
    screenshot at `artifacts/recipe-run-rev8-live/call.png` (provider `capture-helper`).

## Visual Evidence

- Status: OK
- `recipe-run/live-capture-error-screen.png` (the manifest's referenced file) read directly:
  "Market not found" and `The market "DOESNOTEXIST" could not be found.` are plainly visible
  on the correct screen, with the runner's `RUN 18/19` overlay.
- `recipe-run-rev8-live/call.png`, captured this session against the current build, shows
  the same state with `home.html#/perps/market/DOES…` in the address bar.
- Artifact contract gate: `TASK_ARTIFACT_CONTRACT_PASS`. No `FAIL_VISUAL_CLASSIFICATION`,
  no `FAIL_EMPTY`, no `MISSING:` files, no invalid screenshot provider.

## Issues

- **ui/components/app/perps/close-position/close-position-modal.tsx:664** — `hasConfirmedCloseRef.current = true` is set at submit start (:613) and is never re-armed on the `{ success: false }` branch (:664) or in the transport `catch` (:696). Both paths leave the modal open with an inline error and a failure toast, so the user is back on an uncommitted form — but closing it now emits no `abandon_order`. Repro: open close modal, set 50%, submit, backend returns `{ success: false }`, dismiss the modal → zero abandon events. This is the exact bug fixed for the order-entry page this round (`perps-order-entry-page.tsx:1310`, `surfaceControllerFailure` sets `hasSubmittedOrderRef.current = false`); the modal only re-arms on reopen (:378). One line in each failure path.
- **shared/constants/perps-events.ts:125** — `PERPS_EVENT_VALUE.TRADE_ACTION` has zero call sites left in `ui/`, `shared/` or `app/`: this PR removed its last consumer (the inline `deriveTradeAction` in `perps-order-entry-page.tsx`, now `derivePerpsTradeAction` reading `ACTION.*`). Dead deprecated surface introduced by the diff — delete the block (and its mirror at `test/mocks/metamask-perps-controller.js:228`).
- **shared/constants/perps-events.ts:132** — same for `PERPS_EVENT_VALUE.RISK_MANAGEMENT_TYPE`: its last consumers (`deriveTpslType`, the edit-margin and TP/SL client risk emits) were all deleted in this PR, leaving eight alias keys nothing reads. Delete the block and its mirror at `test/mocks/metamask-perps-controller.js:234`.
- **app/scripts/messenger-client-init/perps-controller-init.ts:531** — `perpsGetAttributionContext`, `perpsClearAttributionContext` and `perpsMergeAttributionContext` (:531, :533, :535, declared at :204-206) are registered on the background API but never invoked from the UI — a repo-wide grep finds only these definitions and their unit tests. The UI only calls `perpsSetAttributionContext`, and the controller's merge reaches events through the `InfrastructureDeps.mergeAttributionContext` closure, not through this action. Drop the three unused entries or state the consumer that needs them.
- **ui/components/app/perps/edit-margin/edit-margin-modal-content.tsx:340** — AUTHOR DECISION (previously raised in rev6 and deliberately deferred; re-stated because it is a behaviour regression against main, not a style point). Dropping the client `PerpsRiskManagement` FAILED emit on the `{ success: false }` branch leaves a failed margin add/remove with **no terminal risk event at all** in the pinned 9.2.1 — re-verified in `node_modules` this session: `TradingService.updateMargin` tracks only inside `if (result.success)` (`dist/services/TradingService.cjs:1111`) and in its `catch` (:1134), while `HyperLiquidProvider.updateMargin` (`dist/providers/HyperLiquidProvider.cjs:1292-1301`) catches and *returns* `{ success: false, error }`, so every real failure ("No position found", "Insufficient balance for margin addition") lands on the untracked path. Either restore the client emit until core #9471 ships, or record the accepted analytics gap on the ticket.

## Tooling / environment notes (framework, not the PR)

- `mm-harness run` remains unusable in this slot: `Slot macwork-mmedev-2 is missing
  resources.dev-server.metro_port required by Metro configuration; run farmslot update to
  migrate the pool`. A Metro port requirement on a chrome-extension adapter is a slot-config
  bug. The failed launcher additionally kills the CDP runtime, which then needs
  `runtime-launch` to recover — that is a second bug (a failed launch should not take down a
  healthy runtime it did not start).
- The checklist's step-11 `run` invocation uses `--project-root`, which the installed
  `mm-harness` rejects (`CLI_UNKNOWN_OPTION`, suggests `--target`). The checklist template
  needs updating.
- `yarn lint:changed` diffs the working tree/index only, so on a clean checkout it lints
  nothing and cannot gate a committed branch. Step 4 needs an explicit
  `eslint -c ./.eslintrc.js <branch-changed files>` for self-review to mean anything.
