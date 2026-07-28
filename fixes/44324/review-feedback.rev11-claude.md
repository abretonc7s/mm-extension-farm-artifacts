# Self-Review: MetaMask/metamask-extension#44324

## Verdict: ISSUES

## Summary

The PR migrates Extension perps analytics onto the `@metamask/perps-controller@9.2.1`
contract: client-emitted transaction events give way to controller-owned ones, UTM/deeplink
attribution is threaded through a new `PerpsAttributionProvider`, and the market-search /
order-abandonment funnels are added for mobile parity. **All three rev10 code findings are
genuinely fixed** in `3e2307f3fd` — both dead `hasConfirmedCloseRef` re-arms and their
self-fulfilling test are gone, and `leverage_used` now rides on the close-modal abandon
payload, matching mobile exactly. Every gate I ran this session is green (742/742 tests,
`lint:tsc` exit 0, ESLint clean over all 57 changed files, live recipe proof re-captured
against a HEAD build).

What remains are **two newly-found Jest-mock drifts** — `PERPS_EVENT_PROPERTY.MARGIN_USED`
and `PERPS_EVENT_VALUE.SCREEN_TYPE.CREATE_TPSL`/`EDIT_TPSL` are absent from
`test/mocks/metamask-perps-controller.js`, so they resolve to `undefined` in every test —
plus the recipe-coverage sidecar going stale again. Production is correct in all three
cases; the defect is that the test layer pins the wrong keys and can no longer catch a
regression there.

Review base is `origin/main` (`cfdbb033e8`): **90 files, +4800/−998**. Local `main` is stale
(`7ec2719d8b`, 18 days behind), so `git diff main...HEAD` reports ~2262 unrelated files —
every number below uses `origin/main...HEAD`.

## Type Check

- Result: PASS
- New errors: none. `yarn lint:tsc` → exit 0. Run despite the checklist default because the
  diff changes exactly the surfaces the exception names: `package.json` / `yarn.lock`
  (`@metamask/perps-controller` `^9.0.0` → patched `9.2.1`), the shared exported analytics
  contract (`shared/constants/perps-events.ts` spreads the controller enums and deletes the
  exported `TRADE_ACTION` / `RISK_MANAGEMENT_TYPE` blocks), and controller/mock type
  contracts (`InfrastructureDeps.mergeAttributionContext`, `TrackingData` /
  `TPSLTrackingData` / `InputMethod` at call sites).
- ESLint: clean over all **57** branch-changed JS/TS/TSX files
  (`./node_modules/.bin/eslint -c ./.eslintrc.js --no-cache`, exit 0, zero output).
  `yarn lint:changed` printed "No changed JS/TS/TSX/MTS/SNAP files" — it diffs the working
  tree/index, not the branch, so on a clean checkout it lints nothing and cannot gate a
  committed branch. Tooling note carried from rev8–rev10; step 4 still needs an explicit
  branch-scoped invocation to mean anything.

## Tests

- Result: **PASS**
- All 21 branch-changed suites: **742/742 tests pass, 21/21 suites pass**
  (`yarn jest <21 files> --runInBand --no-coverage`), ending with
  `✅ No console baseline violations`.
- The rev10 blocker is closed and I verified the mechanism, not just the green run: the
  `isOpen={false}` rerender assertion is gone from the `ORDER_SIZE_MIN` failure test, and
  the replacement "reports leverage_used when the modal is dismissed without submitting"
  drives the reachable path (render → `unmount()` → hook cleanup emits). Act-warning count
  for `close-position-modal.test.tsx` is unchanged at baseline.
- `yarn verify-locales --quiet` → "No invalid entries!". `yarn circular-deps:check` → passed.

## Test Quality

- Findings: **two**, both new this round — see Issues. Both are mock-drift: an assertion
  that reads a `PERPS_EVENT_PROPERTY.*` / `PERPS_EVENT_VALUE.*` key which is `undefined`
  under Jest pins the literal key `"undefined"` on *both* sides of the comparison, so it
  cannot detect a wrong emitted key.
- No `should` in any added/modified test name (0 hits across all added `it`/`test` blocks).
- No hardcoded user-facing copy in added assertions — zero added
  `getByText('…')` / `toHaveTextContent('…')` / `findByText('…')` string literals. i18n
  assertions read from `messages.*.message` via `enLocale`. The snake_case literals that do
  appear (`screen_type: 'error'`, `screen_name: 'perps_market_details'`) are the analytics
  contract, which is the right thing to pin literally.
- The three added `toBeDefined()` calls (`perps-market-detail-page.test.tsx`,
  `perps-order-entry-page.test.tsx` ×2) are existence guards immediately followed by
  `toMatchObject` / `toEqual(expect.objectContaining(...))` on the same object — not
  standalone weak assertions.
- 66 added `act()` usages; the TP/SL suite installs and drains fake timers per test.

## Domain Anti-Patterns

- **Import boundaries** — clean. No `ui/` → `app/`, no `shared/` → `ui|app` in added lines.
- **Error handling** — clean. Every added `catch` either calls `captureException` or
  surfaces user-visible state; the two fire-and-forget promise catches
  (`PerpsAttributionContext.tsx:281`, `perps-market-detail-page.tsx:1040`) each carry an
  explanatory comment. No bare catches, no `.catch(() => {})`, no added `console.*`
  (0 hits), no `as any` / `as unknown as` / `@ts-ignore` (0 hits).
- **Analytics-removal safety** — re-verified against `node_modules` in rev10 and unchanged
  this round: every deleted client transaction emit has a controller-side replacement in the
  installed 9.2.1 build (`cancelOrder`, `closePosition` via `#trackPositionCloseResult`,
  `placeOrder`, `updatePositionTPSL` via `finally`, batch `closePositions` via `finally`).
  The one genuine hole — `TradingService.updateMargin` tracking `RiskManagement` only inside
  `if (result.success)` and its `catch`, while `HyperLiquidProvider.updateMargin` *returns*
  `{ success: false }` — is covered by the deliberately-restored client emit at
  `edit-margin-modal-content.tsx:352`, which carries a `REMOVE when the controller bump
  lands` marker referencing core #9471.
- **Magic numbers** — all named: `SEARCH_QUERY_DEBOUNCE_MS`,
  `TRANSACTION_CONSIDERED_DEBOUNCE_MS`, `TPSL_RECONCILE_DELAY_MS`, `DEFAULT_MAX_LEVERAGE`,
  `DEFAULT_LEVERAGE`, `SEARCH_MODE`, `TICKER_LIKE_QUERY`, `ERROR_TYPE.MARKET_NOT_FOUND`,
  `ORDER_CONTEXT.TRADE`.
- **Formatting rules** — no new `.toFixed()` and no `{min:2,max:2}` on any displayed perps
  value (0 hits in non-test changed files).
- **testIDs / accessibility** — no new interactive elements and no new displayed values.
  `onInputMethodChange` is a callback added to existing controls.
- **Shared module state** — `sessionUtmAttribution` (`PerpsAttributionContext.tsx:217`) is
  mutable module-level state, deliberate (last-touch UTM across provider mounts), scoped to
  the UI page load rather than the service worker, documented, with a test-only reset.
  Mobile's controller-side context has the same session lifetime.
- **`eslint-disable` additions (recorded, not re-raised as blocking — unchanged since rev9)**
  — 8 file-level `@typescript-eslint/naming-convention` disables, all in test files, each
  with a justification comment. `CLAUDE.local.md` forbids `eslint-disable`, and the root fix
  *is* demonstrated in-repo (`edit-margin-modal-content.test.tsx` asserts computed
  `PERPS_EVENT_PROPERTY.*` keys and needs no disable), but removing all 8 means rewriting
  snake_case analytics assertions across 8 files (~33 errors). Raised in rev8/9/10 and
  deliberately deferred by the author; recorded here rather than re-litigated.

## Mobile Comparison

- Status: **ALIGNED** — this round's change closes the last payload gap.
- **Close-modal abandon payload now matches mobile field-for-field.** Extension
  `close-position-modal.tsx:444-456` emits `interaction_type`, `action: abandon_order`,
  `asset`, `direction`, `order_size`, `leverage_used`; mobile
  `PerpsClosePositionView.tsx:413-423` emits exactly the same six.
- **Commit-flag lifecycle now matches mobile.** Mobile has exactly one write to
  `hasConfirmedCloseRef` (`PerpsClosePositionView.tsx:473`, set on submit, never re-armed on
  failure); the Extension now does too, after this commit removed both re-arms.
- Minor divergence (not blocking, noted for the data consumers): Extension writes
  `position.leverage?.value ?? 0` while mobile writes `livePosition.leverage?.value`
  (undefined, which the analytics layer drops). A `leverage_used: 0` is not a value a real
  position can have, so the fallback reports a semantically impossible number instead of
  omitting the key. Mobile also reads the *live* position; the Extension reads the prop.
  Both are edge cases — `Position.leverage` is always populated in practice.
- **Search funnel** — `deriveSearchMode` (`market-list/index.tsx:76`) matches mobile's inline
  derivation (chips → `discovery`, `/^[a-z0-9]{1,6}$/` → `intent`, else `browse`), same
  500 ms debounce, same `active_chips` shape, same flush-on-fast-tap and empty-box
  abandon → reset.
- **Attribution mirroring (accepted divergence)** — mobile reads client screen-view UTM from
  `PerpsController.mergeAttributionContext()`; the Extension mirrors UTM client-side because
  the controller lives in the background and cannot be read synchronously.

## LavaMoat Policy

- Status: **OK**
- `lavamoat/browserify/**` no longer exists (removed on main in #44433), so only the 8
  webpack policies changed — and all 8 changed **identically** (9 added / 2 removed lines
  each), which is what genuine `lavamoat:auto` regeneration looks like rather than hand
  editing (commit `8334ae523f`).
- The delta matches the `9.0.0 → 9.2.1` bump: `WebSocket` removed from
  `@metamask/perps-controller`; `DecompressionStream` / `Response` / `TextDecoder` / `atob` /
  `clearTimeout` added on `@nktkas/hyperliquid`; `Blob` / `DOMException` / `TextEncoder` /
  `URL` added and `CustomEvent` removed on `@nktkas/rews`. The mix of adds *and* removals is
  the tell.
- The later `yarn dedupe` (`decimal.js` → 10.6.0) needs no policy update: decimal.js is only
  reachable through `@nktkas/hyperliquid`'s `./utils` subpath export, which the controller
  never imports, so it is outside the bundle graph — which is why no policy names it.
- The patch `.yarn/patches/@metamask-perps-controller-npm-9.2.1-727f87b8bb.patch` is checked
  in and minimal: it rewrites two `require("file:///home/runner/work/hyperliquid/…")` lines
  shipped broken by upstream to `require("@nktkas/hyperliquid")`.

## Fix Quality

- Best approach: **yes.** Removing the re-arms rather than moving `onClose()` onto the
  success path was the right call — the alternative changes what users see on failure, which
  is out of scope for an analytics PR. The replacement test exercises the only lifecycle a
  real caller produces (host unmounts the modal), so it is no longer self-fulfilling.
- The `position.leverage?.value` addition to the `useEffect` dep array is correct — without
  it a leverage change would leave a stale snapshot in `latestAbandonPropsRef`.
- Would not ship: nothing in the application code. The two mock drifts are test-layer
  defects, cheap to fix, and both should land before merge because they silently weaken
  exactly the assertions this PR added.
- Test quality: **good**, with the two mock-drift exceptions. Assertions check emitted
  payloads and specific args, `{ success: false }` and transport-throw paths are exercised
  separately, and absence claims (`toHaveLength(0)`) are asserted directly. The new abandon
  test fails when `LEVERAGE_USED` is removed, so it is not vacuous.
- Brittleness: low, with one intended residual — `readScreenViewedHashAttribution()` is
  merged **last** in `buildPerpsEvent` (`usePerpsEventTracking.ts:75`), so on any route whose
  hash still carries `source=deeplink`, every later `PERPS_SCREEN_VIEWED` on that route
  reports `deeplink`, overriding the call site (a `position_close` modal view would report
  `deeplink` rather than `asset_details`). Documented and deliberate — the alternative loses
  UTM on the entry emit — but data consumers should know.
- Accepted residual (author's documented, measured decision — not re-raised):
  `perps-market-detail-page.tsx:487` can emit both `error` and `asset_details` for one visit
  if a symbol arrives in a later market-stream snapshot.
- Checked and cleared this round (not an issue): the search debounce timeout is not
  cancelled by `flushPendingSearchQuery()` on a fast result tap, but a tap always
  `navigate()`s and unmounts `MarketListView`, whose effect cleanup clears it — and if the
  effect re-runs first, `emittedQueryRef.current === normalizedQuery` short-circuits before
  a new timer is scheduled. No duplicate `PERPS_SEARCH_QUERY` is reachable.
- Analytics-schema note (no code change requested): `PERPS_EVENT_PROPERTY.TIMESTAMP` moves
  from `perps_timestamp` to the controller's `timestamp`, and
  `SCREEN_TYPE.CREATE_TP_SL`/`UPDATE_TP_SL` move from `create_tp_sl`/`update_tp_sl` to the
  controller's `create_tpsl`/`edit_tpsl` — renaming those properties/values on every affected
  perps event.

## Diff Quality

- Minimal: yes — 90 files, all PR content. No reformatting, no import churn, no unrelated
  edits. This round's commit touches exactly two files (the close modal and its test) and
  both changes are justified by a rev10 finding.
- Debug code: none — no `console.log`, no `debugger`, no commented-out code, no untracked
  TODO/FIXME (0 hits across the branch diff).
- Dead surface: `PERPS_EVENT_VALUE.TRADE_ACTION` / `RISK_MANAGEMENT_TYPE` and their mock
  mirrors are deleted; the three unused attribution background actions are gone; the
  now-dead `hasConfirmedCloseRef` re-arms are gone. Every remaining Extension-only constant
  still has live consumers. Pre-existing, not introduced here: `EditMarginExpandable` is
  exported but never rendered.
- Value parity checked for this round's change: `git grep -n LEVERAGE_USED` over non-test
  source returns exactly the two `usePerpsAbandonOrderTracking` consumers
  (`close-position-modal.tsx:455`, `perps-order-entry-page.tsx:637`), and both now report it.
  No third abandon path exists.

## Recipe

- Present: yes (`artifacts/recipe.json`, 19 nodes; `recipe-quality.json` verdict `pass`;
  `recipe-coverage.md` present with a `visual` proof mode).
- Quality: **good** — the AC nodes test the actual fix, not "app boots". The `ac5-*` absence
  asserts are what make the client-event removal checkable, and `ac1` pins the installed
  controller version rather than a manifest string.
- **Re-run this session — blocked by the same slot-config bug, so every node was driven
  directly:**
  1. `mm-harness run … --target … --launch-existing-dist` → exit 1,
     `Slot macwork-mmedev-2 is missing resources.dev-server.metro_port required by Metro
     configuration`. Framework bug, not a code failure; unchanged since rev8.
  2. 7 deterministic nodes (`gate-repo-root`, `ac1`, both `ac2`, all three `ac5`): **PASS**
     (`perps-controller 9.2.1`, `re-export ok`, `no local timestamp mirror`,
     `order-entry deduped`, `cancel deduped`, `close modal deduped`).
  3. 6 behaviour nodes (`ac3`, `ac4`, `ac6`, `ac7`, `ac8`): **PASS** — their suites are all
     inside the 742/742 run above, console-baseline clean.
  4. 6 live nodes: **PASS**, against a build made from HEAD. `dist/chrome` was rebuilt via
     the slot's `refresh-build.sh` (webpack 100 % in 17 s, exit 0) because it was stale
     (18:29 vs HEAD authored 19:09); `runtime-launch` → `runtime_ready`, `runtime-health` →
     `PASS` with one extension page target. Then `metamask.wallet.ensure_unlocked` (pass),
     `ui.navigate page=perps` (pass), `ui.navigate hash=#/perps/market/DOESNOTEXIST` (pass),
     `ui.wait_for text="Market not found"` → `matched: true` with
     `sideFindings.status: "clean"`, `ui.screenshot` → fresh capture at
     `artifacts/recipe-run-rev11-live/shot/call.png` (provider `capture-helper`, exit 0).
- Documented limit still true: no node observes a real MetaMetrics payload in the running
  app, so event *counts* are proved in the Jest layer only.

## Visual Evidence

- Status: **OK**
- `recipe-run-rev11-live/shot/call.png`, captured this session against the HEAD build and
  read directly via the Read tool: "Market not found" and
  `The market "DOESNOTEXIST" could not be found.` are plainly visible on the correct screen,
  with `chrome-extension://…/home.html#/perps/market/DOESNOTEXIST` in the address bar.
- `recipe-run/live-capture-error-screen.png` (the manifest's referenced file) also read
  directly: same state, with the runner's `RUN 18/19` overlay. It is the merge-time capture
  and the manifest's `note` says so explicitly, so the claim is dated rather than overstated.
- Artifact contract gate: `TASK_ARTIFACT_CONTRACT_PASS`. No `FAIL_VISUAL_CLASSIFICATION`, no
  `FAIL_EMPTY`, no `MISSING:` files, no `FAIL_INVALID_SCREENSHOT_PROVIDER`.

## Issues

- **test/mocks/metamask-perps-controller.js:95** — the mock's property map has no
  `MARGIN_USED`, so `PERPS_EVENT_PROPERTY.MARGIN_USED` is `undefined` in every Jest run
  (the real package defines `MARGIN_USED: 'margin_used'` in
  `dist/constants/eventNames.cjs:23`). Verified empirically, not by inspection: a throwaway
  suite importing `shared/constants/perps-events` printed
  `{"LEVERAGE_USED":"leverage_used"}` — `MARGIN_USED` was dropped by `JSON.stringify`
  because it is `undefined`. Consequence: the regression test this PR added,
  `edit-margin-modal-content.test.tsx:306`
  (`[PERPS_EVENT_PROPERTY.MARGIN_USED]: 100`), pins the literal key `"undefined"` on both
  sides of the comparison, so it asserts a payload production never emits and cannot catch a
  wrong key. Fix is one line next to the existing `LEVERAGE_USED: 'leverage_used'`:
  `MARGIN_USED: 'margin_used',`.
- **test/mocks/metamask-perps-controller.js:112** — the mock's `SCREEN_TYPE` block is missing
  `CREATE_TPSL` and `EDIT_TPSL` (the real package has
  `CREATE_TPSL: 'create_tpsl'` / `EDIT_TPSL: 'edit_tpsl'`). This PR rewrote
  `shared/constants/perps-events.ts:68,70` to alias the Extension's historical names onto
  those controller keys
  (`CREATE_TP_SL: CONTROLLER_PERPS_EVENT_VALUE.SCREEN_TYPE.CREATE_TPSL`), so under Jest both
  `PERPS_EVENT_VALUE.SCREEN_TYPE.CREATE_TP_SL` and `.UPDATE_TP_SL` are now `undefined` —
  they were plain local literals before this PR, so this is a test-fidelity regression the
  PR introduced. `ui/components/app/perps/update-tpsl/update-tpsl-modal.tsx:59-60` emits
  `screen_type` from exactly those two values, so that screen view carries
  `screen_type: undefined` in every test run and no suite can detect a regression in it.
  (The mock's existing `CREATE_TP_SL: 'create_tp_sl'` at :222 is in the `ACTION` block and
  does not cover this.) Fix: add `CREATE_TPSL: 'create_tpsl', EDIT_TPSL: 'edit_tpsl',` to
  the `SCREEN_TYPE` block.
- **temp/tasks/fix/44324-0728-033914/artifacts/recipe-coverage.md:3** — stale again by one
  commit. The currency header claims "refreshed for HEAD `aba477d058` + the rev10 review
  fixes" while HEAD is `3e2307f3fd`, and the "Current status" table cites the live capture as
  `recipe-run-rev8-live/call.png` even though rev10 captured `recipe-run-rev10-live/call.png`
  and this round captured `recipe-run-rev11-live/shot/call.png`. Same class of finding as
  rev10's, which the worker fixed for the then-HEAD and which drifted on the next commit.
  Refresh the header, the live-capture path, and add the rev11 re-proof row.
- **ui/components/app/perps/close-position/close-position-modal.tsx:455** — nit:
  `position.leverage?.value ?? 0` reports `leverage_used: 0` when leverage is absent, a value
  no real position can have. Mobile's equivalent
  (`metamask-mobile-ref/app/components/UI/Perps/Views/PerpsClosePositionView/PerpsClosePositionView.tsx:422`)
  passes `livePosition.leverage?.value` through undefined so the key is dropped rather than
  reported as zero. `perps-order-entry-page.tsx:637` has the same `?? 0`. Either drop the
  fallback on both or leave it deliberately — but a zero leverage in the funnel data is
  indistinguishable from a real reading.

## Tooling / environment notes (framework, not the PR)

- `mm-harness run` remains unusable in this slot: `Slot macwork-mmedev-2 is missing
  resources.dev-server.metro_port required by Metro configuration`. A Metro port requirement
  on a chrome-extension adapter is a slot-config bug, unchanged since rev8. Unlike rev10, the
  failed launcher did **not** take down the healthy CDP runtime this time — `runtime-health`
  still reported `PASS` immediately afterwards.
- The checklist's step-11 `run` invocation uses `--project-root`, which the installed
  `mm-harness` rejects (`CLI_UNKNOWN_OPTION`, suggests `--target`). Checklist template still
  needs updating.
- `yarn lint:changed` (step 4) diffs the working tree/index only, so on a clean checkout it
  lints nothing. Step 4 needs an explicit
  `eslint -c ./.eslintrc.js <branch-changed files>` for self-review to mean anything.
- The checklist's diff commands use `main...HEAD`; with a stale local `main` that is ~2262
  unrelated files. Steps 2/3/5 should use `origin/main...HEAD`.
