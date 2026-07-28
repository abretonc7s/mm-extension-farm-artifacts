# Self-Review: MetaMask/metamask-extension#44324

## Verdict: ISSUES

## Summary

The PR migrates Extension perps analytics onto the `@metamask/perps-controller@9.2.1`
contract: client-emitted transaction events give way to controller-owned ones, UTM/deeplink
attribution is threaded through a new `PerpsAttributionProvider`, and the market-search /
order-abandonment funnels are added for mobile parity. **rev9's blocker is genuinely fixed** —
commit `aba477d058` folded the duplicate close-modal test into the existing failure test and
`yarn dedupe`d the lockfile; every gate I ran this session is green, including the console
baseline that was failing. What remains are the three rev9 findings the last commit did not
touch: a dead re-arm in the close modal (with comments and a test that assert a state
production never reaches), a missing `leverage_used` on close-modal abandonments, and stale
recipe/report sidecars.

Review base is `origin/main` (`3cb496ea9a`): **90 files, +4794/−999**. Local `main` is stale
(`7ec2719d8b`, 18 days behind), so `git diff main...HEAD` reports ~2262 unrelated files —
every number below uses `origin/main...HEAD`.

## Type Check

- Result: PASS
- New errors: none. `yarn lint:tsc` → exit 0. Run despite the checklist default because the
  diff changes exactly the surfaces the exception names: `package.json` / `yarn.lock`
  (perps-controller `^9.0.0` → patched `9.2.1`, plus this round's `decimal.js` 10.4.3 → 10.6.0
  dedupe), the shared exported analytics contract (`shared/constants/perps-events.ts` spreads
  the controller enums and deletes the exported `TRADE_ACTION` / `RISK_MANAGEMENT_TYPE`
  blocks), and controller/mock type contracts (`InfrastructureDeps.mergeAttributionContext`,
  `TrackingData` / `TPSLTrackingData` / `InputMethod` at call sites).
- ESLint: clean over all **57** branch-changed JS/TS/TSX files
  (`./node_modules/.bin/eslint -c ./.eslintrc.js --no-cache`, exit 0, zero output).
  `yarn lint:changed` printed "No changed JS/TS/TSX/MTS/SNAP files" — it diffs the working
  tree/index, not the branch, so on a clean checkout it lints nothing and cannot gate a
  committed branch. Tooling note repeated from rev8/rev9; step 4 still needs an explicit
  branch-scoped invocation to mean anything.

## Tests

- Result: **PASS**
- 29 suites (all 21 branch-changed suites plus the 8 sibling suites for changed non-test
  files): **955/955 tests pass, 29/29 suites pass**, and the run ends with
  `✅ No console baseline violations`.
- rev9's blocker is closed and I verified the mechanism, not just the green run: the second
  close-modal test that added the two unwrapped-`act` warnings is gone, its assertion folded
  into the existing `ORDER_SIZE_MIN` failure test, and the `isOpen={false}` rerender is now
  wrapped in `act()`. `close-position-modal.test.tsx` no longer moves off its baseline of 4.
- `yarn verify-locales --quiet` → "No invalid entries!". `yarn circular-deps:check` → passed.
- `yarn dedupe --check` → "No packages can be deduped using the highest strategy" (the
  repository-health check that commit `aba477d058` set out to fix — confirmed fixed).

## Test Quality

- Findings: one, carried from rev9 and unfixed — see Issues. The folded assertion in
  `close-position-modal.test.tsx:507-535` does exercise the re-arm (removing it makes the test
  fail), but only because the test passes `onClose={jest.fn()}`; the sole real caller unmounts
  the modal at `onClose()`, so the assertion describes a state production never reaches.
- No `should` in any added/modified test name (0 hits across all added `it`/`test` blocks).
- No hardcoded user-facing copy in added assertions — zero added `getByText('…')` /
  `toHaveTextContent('…')` string literals; i18n assertions read from `messages.*.message`
  via `enLocale`. The snake_case literals that do appear (`screen_type: 'error'`,
  `screen_name: 'perps_market_details'`) are the analytics contract, which is the right thing
  to pin literally.
- The three added `toBeDefined()` calls (`perps-market-detail-page.test.tsx:2373` and
  `perps-order-entry-page.test.tsx:2884,2907` in diff coordinates) are existence guards
  immediately followed by `toMatchObject` / `toEqual(expect.objectContaining(...))` on the same
  object — not standalone weak assertions.
- 67 added `act()` usages; the TP/SL suite installs and drains fake timers per test.

## Domain Anti-Patterns

- **Import boundaries** — clean. No `ui/` → `app/`, no `shared/` → `ui|app` in added lines.
- **Error handling** — clean. Every added `catch` either calls `captureException` or surfaces
  user-visible state; the two fire-and-forget promise catches
  (`PerpsAttributionContext.tsx:281`, `perps-market-detail-page.tsx:1040`) each carry an
  explanatory comment. No bare catches, no `.catch(() => {})`, no added `console.*`, no
  `as any` / `as unknown as` / `@ts-ignore`.
- **Analytics-removal safety (re-verified independently against `node_modules`, not assumed).**
  Every client transaction emit this PR deletes has a controller-side replacement in the
  *installed* 9.2.1 build:
  - `TradingService.cancelOrder` tracks submitted + executed + failed, including the
    non-throwing `{ success: false }` branch (`TradingService.cjs:426,441,451,470`).
  - `closePosition` tracks a terminal executed/failed event on every path via
    `#trackPositionCloseResult` (`:1657-1722`), including the no-local-position case.
  - `placeOrder` tracks executed and failed (`:1220,1251,1282`).
  - `updatePositionTPSL` tracks `RiskManagement` from a `finally`, so `{ success: false }` is
    covered (`:1063`).
  - **Close-all**: `HyperLiquidProvider.closePositions` exists (`:712`), so the batch path is
    taken — and `TradingService.closePositions` still emits a batch
    `PositionCloseTransaction` summary from its `finally` (`:912`) with `status`,
    `completion_duration`, `bulk_action_id`. Only `number_positions_closed` is missing until
    core #9471, exactly as the comment at `perps-view.tsx:209` claims. I checked this because
    it is the one flow where a wholesale client removal could have gone dark; it does not.
  - The **`updateMargin` exception is real**: `TradingService.updateMargin` tracks
    `RiskManagement` only inside `if (result.success)` and in its `catch` (`:1111,1134`), and
    `HyperLiquidProvider.updateMargin` returns rather than throws — so the restored client
    emit at `edit-margin-modal-content.tsx:340` is load-bearing, not a duplicate.
- **Contract keys resolve against the real package** — `PERPS_EVENT_PROPERTY.TIMESTAMP` is
  `timestamp`, `LEVERAGE_USED` is `leverage_used`, `MARGIN_USED` is `margin_used`,
  `SCREEN_NAME.PERPS_MARKET_DETAILS` is `perps_market_details` (read from the installed
  `dist/constants/eventNames.cjs`).
- **Magic numbers** — all named: `SEARCH_QUERY_DEBOUNCE_MS`, `TRANSACTION_CONSIDERED_DEBOUNCE_MS`,
  `TPSL_RECONCILE_DELAY_MS`, `DEFAULT_MAX_LEVERAGE`, `DEFAULT_LEVERAGE`, `SEARCH_MODE`,
  `TICKER_LIKE_QUERY`, `ERROR_TYPE.MARKET_NOT_FOUND`, `ORDER_CONTEXT.TRADE`.
- **Formatting rules** — no new `.toFixed()` and no `{min:2,max:2}` on any displayed perps
  value (zero hits in non-test changed files).
- **testIDs / accessibility** — no new interactive elements and no new displayed values.
- **Shared module state** — `sessionUtmAttribution` (`PerpsAttributionContext.tsx:217`) is
  mutable module-level state, deliberate (last-touch UTM across provider mounts), scoped to the
  UI page load rather than the service worker, documented, with a test-only reset. Mobile's
  controller-side context has the same session lifetime.
- **`eslint-disable` additions (recorded, not blocking — unchanged from rev9)** — 8 file-level
  `@typescript-eslint/naming-convention` disables, all in test files, each with a justification.
  `CLAUDE.local.md` forbids `eslint-disable`; precedent exists on main
  (`usePerpsEventTracking.test.tsx`), and removing them means rewriting snake_case analytics
  assertions across 8 files (~33 errors). Author's call.
- **Locale key removal is in scope, not creep** — the `tutorial` message key deleted from 17
  locale files was orphaned *by this PR* (the literal `'tutorial'` disappeared from Extension
  source when `perps-events.ts` moved to the controller spread), and its removal was requested
  by an earlier review round (`review-feedback.rev-claude.md:177`). `verify-locales` passes.

## Mobile Comparison

- Status: **ALIGNED**, with one payload gap and one divergence, both carried from rev9 and both
  still open.
- **Abandon payload gap** — mobile sends `LEVERAGE_USED` on the close abandonment
  (`metamask-mobile-ref/.../PerpsClosePositionView.tsx:422`); the Extension close modal does
  not. The order-entry page already reports it, so close-modal abandonments are the only ones
  missing it. See Issues.
- **Close-modal re-arm is a divergence, not parity** — mobile sets `hasConfirmedCloseRef = true`
  at `PerpsClosePositionView.tsx:473` and never re-arms it on failure; it relies on
  `useFocusEffect` and a full screen that stays mounted. The Extension modal unmounts at
  submit, which is what makes the added re-arm dead. Re-verified this round: mobile has exactly
  one write to that ref.
- **Search funnel** — `deriveSearchMode` (`market-list/index.tsx:76`) matches mobile's inline
  derivation (chips → `discovery`, `/^[a-z0-9]{1,6}$/` → `intent`, else `browse`), same 500 ms
  debounce, same `active_chips` shape, same flush-on-fast-tap and empty-box abandon → reset.
- **Attribution mirroring (accepted divergence)** — mobile reads client screen-view UTM from
  `PerpsController.mergeAttributionContext()`; the Extension mirrors UTM client-side because
  the controller lives in the background and cannot be read synchronously.

## LavaMoat Policy

- Status: **OK**
- `lavamoat/browserify/**` no longer exists (removed on main in #44433), so only the 8 webpack
  policies changed — and all 8 changed **identically** (11 changed lines each), which is what
  genuine `lavamoat:auto` regeneration looks like rather than hand editing (commit `8334ae523f`).
- The delta matches the `9.0.0 → 9.2.1` bump: `WebSocket` removed from
  `@metamask/perps-controller`; `DecompressionStream` / `Response` / `TextDecoder` / `atob` /
  `clearTimeout` added on `@nktkas/hyperliquid`; `Blob` / `DOMException` / `TextEncoder` / `URL`
  added and `CustomEvent` removed on `@nktkas/rews`. The mix of adds *and* removals is the tell.
- **This round's lockfile change does not need a policy update, and I verified the claim rather
  than trusting the commit message.** `yarn dedupe` collapsed `decimal.js` onto 10.6.0 because
  `@nktkas/hyperliquid@0.33.2` now declares it. But decimal.js is only reachable through the
  package's `./utils` subpath export (`esm/utils/mod.js` → `esm/utils/_format.js`); the main
  entry `esm/mod.js` — the only one `@metamask/perps-controller` requires — never references
  `utils`. So it is outside the extension bundle graph, which is why no policy names it. The
  other consumer is jsdom (test-only).
- The patch `.yarn/patches/@metamask-perps-controller-npm-9.2.1-727f87b8bb.patch` is checked in
  and minimal: it rewrites two `require("file:///home/runner/work/hyperliquid/…")` lines shipped
  broken by upstream to `require("@nktkas/hyperliquid")`.

## Fix Quality

- Best approach: **yes for the architecture, no for the close-modal re-arm.**
  `surfaceControllerFailure` collapsing five duplicated failure branches into one funnel
  (`perps-order-entry-page.tsx:1310`) is the right shape, and it is what makes the order-entry
  abandon re-arm a genuine one-liner. The same one-liner applied to the close modal is not
  equivalent, because the two surfaces have opposite lifecycles on failure — the page stays
  mounted, the modal does not.
- This round's fix is the right shape too: folding the abandon assertion into the existing
  failure test (rather than ratcheting `console-baseline-unit.json`) removes the duplicate
  failing submit that produced the two act warnings, and keeps the assertion. Given the
  underlying re-arm is dead, though, the honest fix is still to delete both.
- Would not ship: the dead re-arm plus its false comments and self-fulfilling assertion. Small,
  and the only code-level item left.
- Test quality: **good**, with the one exception above. Assertions check emitted payloads and
  specific args, `{ success: false }` and transport-throw paths are exercised separately, and
  absence claims are asserted directly.
- Brittleness: low, with one intended residual — `readScreenViewedHashAttribution()` is merged
  **last** in `buildPerpsEvent` (`usePerpsEventTracking.ts:75`), so on any route whose hash
  still carries `source=deeplink`, every later `PERPS_SCREEN_VIEWED` on that route reports
  `deeplink`, overriding the call site. That includes modal screen views opened from the route
  (`position_close` would report `deeplink` rather than `asset_details`). Documented and
  deliberate — the alternative loses UTM on the entry emit — but data consumers should know.
- Accepted residual (author's documented, measured decision — not re-raised):
  `perps-market-detail-page.tsx:487` can emit both `error` and `asset_details` for one visit if
  a symbol arrives in a later market-stream snapshot.
- Type-cast note (not an issue): `usePerpsAttribution.ts:41` casts to
  `TrackingData['tradeAction']` because the package types `TradeAction` as
  `'create_position' | 'increase_exposure'` only; the flips are valid at runtime
  (`TradingService.cjs:1374` forwards the value verbatim). Narrow, documented, not fixable
  locally.
- Analytics-schema note (no code change requested): `PERPS_EVENT_PROPERTY.TIMESTAMP` moves from
  `perps_timestamp` to the controller's `timestamp`, renaming that property on every perps
  event.

## Diff Quality

- Minimal: yes — 90 files, all PR content. No reformatting, no import churn, no unrelated
  edits. This round's commit touches exactly two files (one test, `yarn.lock`) and both changes
  are justified by a CI gate.
- Debug code: none — no `console.log`, no `debugger`, no commented-out code, no untracked
  TODO/FIXME (zero hits across the branch diff).
- Dead surface: `PERPS_EVENT_VALUE.TRADE_ACTION` / `RISK_MANAGEMENT_TYPE` and their mock
  mirrors are deleted; the three unused attribution background actions are gone. Every
  remaining Extension-only constant still has live consumers. Pre-existing, not introduced
  here: `EditMarginExpandable` is exported but never rendered.

## Recipe

- Present: yes (`artifacts/recipe.json`, 19 nodes; `recipe-quality.json` verdict `pass`;
  `recipe-coverage.md` present with a `visual` proof mode).
- Quality: **good** — the AC nodes test the actual fix, not "app boots". The `ac5-*` absence
  asserts are what make the client-event removal checkable, and `ac1` pins the controller
  contract keys rather than a version string.
- **Re-run this session — first blocked by a stale-dist gate, then by the slot-config bug:**
  1. `mm-harness run` initially refused with `EXTENSION_RUNTIME_NOT_CURRENT`
     (`dist git id 8334ae52 != HEAD aba477d0`). I rebuilt via
     `refresh-build.sh --repo … --watcher-port 9012` (webpack 100 % in 34 s, exit 0), so
     `dist/chrome` is now built from HEAD.
  2. The re-run then failed for the same reason as rev9 — `Slot macwork-mmedev-2 is missing
     resources.dev-server.metro_port required by Metro configuration` — which is a slot-config
     bug, not a code failure.
  3. Every node was therefore executed directly:
     - 7 deterministic nodes (`gate-repo-root`, `ac1`, both `ac2`, all three `ac5`): **PASS**
       (`perps-controller 9.2.1`, `re-export ok`, `order-entry deduped`, `cancel deduped`,
       `close modal deduped`).
     - 5 behaviour nodes (`ac3`, `ac4`, `ac6`, `ac7`, `ac8`): **PASS** — their suites are all
       inside the 955/955 run above, and `ac4-order-lifecycle-behaviour`, the node that caught
       rev9's regression, is now clean on the console-baseline gate.
     - 6 live nodes: re-driven individually with `mm-harness call` against the relaunched CDP
       runtime on 6662 — `cdp.target` (exit 0), `metamask.wallet.ensure_unlocked` (exit 0),
       `ui.navigate page=perps` (exit 0), `ui.navigate hash=#/perps/market/DOESNOTEXIST`
       (exit 0), `ui.wait_for text="Market not found"` → `matched: true`, `ui.screenshot` →
       fresh capture at `artifacts/recipe-run-rev10-live/call.png`, `runStatus: pass`,
       provider `capture-helper`. This is the first live proof against a build made from HEAD.
- Documented limit still true: no node observes a real MetaMetrics payload in the running app,
  so event *counts* are proved in the Jest layer only.

## Visual Evidence

- Status: **OK**
- `recipe-run-rev10-live/call.png`, captured this session against the HEAD build and read
  directly via the Read tool: "Market not found" and `The market "DOESNOTEXIST" could not be
  found.` are plainly visible on the correct screen, with
  `chrome-extension://…/home.html#/perps/market/DOESNOTEXIST` in the address bar.
- `recipe-run/live-capture-error-screen.png` (the manifest's referenced file) also read
  directly: same state, with the runner's `RUN 18/19` overlay.
- Artifact contract gate: `TASK_ARTIFACT_CONTRACT_PASS`. No `FAIL_VISUAL_CLASSIFICATION`, no
  `FAIL_EMPTY`, no `MISSING:` files, no `FAIL_INVALID_SCREENSHOT_PROVIDER`.

## Issues

- **ui/components/app/perps/close-position/close-position-modal.tsx:667** — the
  `hasConfirmedCloseRef.current = false` re-arm here (and the identical one at :702 in the
  transport `catch`) is unreachable in production, and the comments above both — "The close did
  not go through and the modal stays open on an uncommitted form" — are false. `onClose()` is
  called at :639, *before* the `await submitRequestToBackground`, and the modal's only host
  renders it conditionally: `{position && isCloseModalOpen && <ClosePositionModal …>}` with
  `onClose={() => setIsCloseModalOpen(false)}` (`ui/pages/perps/perps-market-detail-page.tsx:2159-2172`).
  So the component **unmounts** while the request is in flight; `usePerpsAbandonOrderTracking`'s
  cleanup (`usePerpsAbandonOrderTracking.ts:64-67`) has already run with
  `hasCommittedRef === true` and suppressed the emit, and the re-arm then writes to a ref nobody
  reads (the `isOpen` effect at :373 resets it on reopen anyway). Unchanged since rev9; the last
  commit reworked the test around it rather than removing it. Mobile agrees: `PerpsClosePositionView.tsx:473`
  sets the flag and never re-arms on failure. Either revert both re-arms (and the assertion at
  `close-position-modal.test.tsx:507-535`), or — if a failed close really should be recoverable
  in place — move `onClose()` onto the success path so the modal actually stays open on failure,
  which would also fix the inline `setError` at :676 currently being written to an unmounted
  component.
- **ui/components/app/perps/close-position/close-position-modal.test.tsx:507** — the folded
  abandon assertion passes only because the test stubs `onClose={jest.fn()}`, so the modal stays
  mounted and `isOpen={false}` reaches the hook as an activation change. No real caller does
  that (see above), so this asserts a state production cannot reach: the test would keep passing
  if the modal's real lifecycle regressed further. Remove it with the re-arm, or rewrite it to
  render through the actual host wiring (`onClose` flipping the conditional render) so unmount
  is what the assertion exercises.
- **ui/components/app/perps/close-position/close-position-modal.tsx:445** — the abandon payload
  omits `LEVERAGE_USED`, which mobile's equivalent sends
  (`metamask-mobile-ref/app/components/UI/Perps/Views/PerpsClosePositionView/PerpsClosePositionView.tsx:422`:
  `[PERPS_EVENT_PROPERTY.LEVERAGE_USED]: livePosition.leverage?.value`). The order-entry page
  already reports it (`perps-order-entry-page.tsx:1131`), so close-modal abandonments are the
  only ones missing it. `Position.leverage` is `{ value, type }` in the controller types and is
  already read on the host page (`perps-market-detail-page.tsx:1627`), and
  `PERPS_EVENT_PROPERTY.LEVERAGE_USED` resolves to `leverage_used` in the installed package —
  so this is one line. Unchanged since rev9.
- **temp/tasks/fix/44324-0728-033914/artifacts/recipe-coverage.md:1** — the coverage doc is now
  three commits stale (written 08:32; HEAD is `aba477d058` at 18:06). Its AC table still
  timestamps to the 02:28 merge-branch run, its supporting-evidence section still cites
  "180/180 across the three conflicted suites" (the current number is 955/955 across 29), and it
  still carries "not re-proved post-fix" language for the live nodes I re-proved in rev9 and
  again this round against a HEAD build. Refresh it so the artifact matches the tree it claims
  to cover.
- **temp/tasks/fix/44324-0728-033914/artifacts/report.md:1** — same problem, one commit newer
  (16:16 vs HEAD 18:06): the report documents through the third review-fix pass and has no
  section for `aba477d058`, so the two changes a reviewer most needs context for — why the
  lockfile was deduped and why the close-modal regression test was folded away — are recorded
  only in the commit message. Add the fourth-pass section.

## Tooling / environment notes (framework, not the PR)

- `mm-harness run` remains unusable in this slot: `Slot macwork-mmedev-2 is missing
  resources.dev-server.metro_port required by Metro configuration`. A Metro port requirement on
  a chrome-extension adapter is a slot-config bug, unchanged since rev9.
- Reproduced again: the failed launcher **takes down the healthy CDP runtime it did not start**
  (`runtime-health` PASS before, `CDP is not reachable on port 6662: fetch failed` after).
  Recovered with `runtime-launch`, which itself reports `runtime_launch_failed` while
  nevertheless leaving the runtime healthy — its verification step disagrees with its own result.
- Third rough edge this round: `runtime-health` returned `UI_COMPOSITOR_SUSPENDED` on an idle
  machine; `caffeinate -disu` is a hard requirement for live nodes, as `recipe-quality.json`
  already notes.
- The checklist's step-11 `run` invocation uses `--project-root`, which the installed
  `mm-harness` rejects (`CLI_UNKNOWN_OPTION`, suggests `--target`). Checklist template needs
  updating.
- `yarn lint:changed` (step 4) diffs the working tree/index only, so on a clean checkout it
  lints nothing. Step 4 needs an explicit `eslint -c ./.eslintrc.js <branch-changed files>` for
  self-review to mean anything.
- The checklist's diff commands use `main...HEAD`; with a stale local `main` that is ~2262
  unrelated files. Step 2/3/5 should use `origin/main...HEAD`.
