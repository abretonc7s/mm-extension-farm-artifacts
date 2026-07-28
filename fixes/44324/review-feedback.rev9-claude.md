# Self-Review: MetaMask/metamask-extension#44324

## Verdict: ISSUES

## Summary

The PR migrates Extension perps analytics onto the `@metamask/perps-controller@9.2.1`
contract: client-emitted transaction events give way to controller-owned ones, UTM/deeplink
attribution is threaded through a new `PerpsAttributionProvider`, and the market-search /
order-abandonment funnels are added for mobile parity. The architecture is sound and every
gate I ran passes except one: the final commit (`47f0578e77`) added a close-modal regression
test that pushes `close-position-modal.test.tsx` past its console baseline, so `yarn test:unit`
now **exits 1**. That same commit's close-modal fix is also dead code in production — it was
written against a premise (`the modal stays open on an uncommitted form`) that the modal's own
`onClose()` call contradicts.

Review base is `origin/main` (`3cb496ea9a`): **90 files, +4810/−993**. Local `main` is 18 days /
330 commits stale, so `git diff main...HEAD` reports ~2262 unrelated files — every number below
uses `origin/main...HEAD`.

## Type Check

- Result: PASS
- New errors: none. `yarn lint:tsc` was run (exit 0, no output) despite the checklist default,
  because this diff changes exactly the surfaces the exception names: `package.json` / `yarn.lock`
  (perps-controller `^9.0.0` → patched `9.2.1`), the shared exported analytics contract
  (`shared/constants/perps-events.ts` now spreads the controller enums, and commit `47f0578e77`
  **deleted** the exported `TRADE_ACTION` / `RISK_MANAGEMENT_TYPE` blocks), and controller/mock
  type contracts (`InfrastructureDeps.mergeAttributionContext`, `TrackingData` / `TPSLTrackingData`
  / `InputMethod` at call sites). Deleting exported constants is precisely the case where the type
  gate matters, and it is clean.
- ESLint: clean over all **57** branch-changed JS/TS/TSX files (`eslint -c ./.eslintrc.js --no-cache`,
  exit 0, zero output). `yarn lint:changed` reports "No changed JS/TS/TSX/MTS/SNAP files" because it
  diffs the working tree/index, not the branch — on a clean checkout it lints nothing and cannot
  gate a committed branch. Tooling note repeated from rev8; step 4 of the checklist still needs an
  explicit branch-scoped ESLint invocation to mean anything.

## Tests

- Result: **FAIL** (console-baseline gate; all assertions pass)
- All 21 changed/added suites run in one batch: **742/742 tests pass, 21/21 suites pass**.
- But the run ends with `❌ BASELINE VIOLATIONS DETECTED` —
  `ui/components/app/perps/close-position/close-position-modal.test.tsx`, "React: Act warnings
  (component updates not wrapped)", **baseline 4, current 6 (+2)**. Verified this is a hard failure,
  not a warning: `yarn jest ui/components/app/perps/close-position/close-position-modal.test.tsx`
  → `exit 1`. CI runs `yarn test` → `yarn lint && yarn test:unit`, so this fails the branch.
- Isolated the cause rather than inferring it: running **only** the new test
  (`-t "reports abandonment when the modal is dismissed after a failed close"`) reports
  `Current: 2` on its own, i.e. that single test contributes exactly the +2. The baseline entry is
  identical (4) on `origin/main` and on the branch, so this is introduced by commit `47f0578e77`,
  not inherited.
- The recipe's own `ac4-order-lifecycle-behaviour` node reproduces it: 218/218 tests pass,
  `Violations: 1`.
- `yarn verify-locales --quiet` → "No invalid entries!". `yarn circular-deps:check` → passed.

## Test Quality

- Findings: none beyond the act-warning blocker above.
- No `should` in any added/modified test name (grep over 88 added `it`/`test` blocks: zero hits).
- No hardcoded user-facing copy in added assertions — zero added
  `getByText('…')` / `toHaveTextContent('…')` string literals; the i18n assertions read from
  `messages.*.message` via `enLocale`.
- The three added `toBeDefined()` calls (`perps-order-entry-page.test.tsx:1632,1655`,
  `perps-market-detail-page.test.tsx:511` and the two at `:2376`/`:2887`/`:2910` in the diff) are
  existence guards immediately followed by `toEqual` / `toMatchObject` on the same object — not
  standalone weak assertions.
- 66 added `act()` usages; fake timers are installed and drained per test in the TP/SL suite. The
  rev7 load-sensitive TP/SL flake did not reproduce.
- The new close-modal test is also **structurally unsound**, not just noisy — see Issues.

## Domain Anti-Patterns

- **Import boundaries** — clean. No `ui/` → `app/`, no `shared/` → `ui|app` in added lines. The
  rev7 blocker is gone (`edit-margin-modal-content.test.tsx:6` imports `enLocale` from
  `test/lib/i18n-helpers`).
- **Error handling** — clean. Every new `catch` calls `captureException` or surfaces user-visible
  state; the two fire-and-forget promise catches (`PerpsAttributionContext.tsx:281`,
  `perps-market-detail-page.tsx:1040`) each carry an explanatory comment. No bare catches, no
  `.catch(() => {})`, no added `console.*`, no `as any` / `as unknown as` / `@ts-ignore`.
- **Provider coverage (checked for a crash, not assumed)** — `usePerpsAttributionContext()`
  **throws** when unwrapped, so I traced all 7 `usePerpsAttribution()` consumers to a provider:
  market-list, market-detail and order-entry are `PerpsLayout` children
  (`routes.component.tsx:572-594`); the four modals are hosted only by `perps-market-detail-page`;
  `PerpsTab` (both hosts: `perps-home-page.tsx:21`, `account-overview-tabs.tsx:283`) is wrapped by
  its own provider. No unwrapped path — no white-screen risk.
- **Analytics contract resolution** — every alias in the Extension override block resolves against
  the **real installed package** (checked mechanically, 30 value paths + 31 property keys, zero
  `undefined`). `tsc` passing independently proves no call site can reference a key the real package
  lacks, so the Jest mock's superset cannot mask a removal at compile time.
- **Magic numbers** — all named: `SEARCH_QUERY_DEBOUNCE_MS`, `TRANSACTION_CONSIDERED_DEBOUNCE_MS`,
  `TPSL_RECONCILE_DELAY_MS`, `DEFAULT_MAX_LEVERAGE`, `DEFAULT_LEVERAGE`, `SEARCH_MODE`,
  `TICKER_LIKE_QUERY`, plus `ERROR_TYPE.MARKET_NOT_FOUND` / `ORDER_CONTEXT.TRADE`.
- **Formatting rules** — no new `.toFixed()` and no `{min:2,max:2}` on any displayed perps value.
- **testIDs / accessibility** — no new interactive elements and no new displayed values; nothing to
  flag.
- **Shared module state** — `sessionUtmAttribution` (`PerpsAttributionContext.tsx:217`) is mutable
  module-level state. Deliberate (last-touch UTM across provider mounts), scoped to the UI page load
  rather than the service worker, documented, with a test-only reset. Mobile's controller-side
  context has the same session lifetime, so this is aligned rather than drift.
- **`eslint-disable` additions (recorded, not blocking)** — 8 file-level
  `@typescript-eslint/naming-convention` disables across perps and deep-link test files. The
  `CLAUDE.local.md` rule forbids `eslint-disable`; each carries a justification, precedent exists on
  main (`usePerpsEventTracking.test.tsx`), and removing them means rewriting snake_case analytics
  assertions across 8 files. Author's call.

## Mobile Comparison

- Status: **ALIGNED**, with one small payload gap (Issues) and one divergence this round made worse.
- Reference: `metamask-mobile-ref/.../PerpsMarketListView.tsx`,
  `.../PerpsClosePositionView/PerpsClosePositionView.tsx`, `hooks/usePerpsAbandonOrderTracking.ts`.
- **Search funnel** — `deriveSearchMode` (`market-list/index.tsx:76`) matches mobile's inline
  derivation at `PerpsMarketListView.tsx:426-432` exactly (chips → `discovery`, `/^[a-z0-9]{1,6}$/`
  → `intent`, else `browse`), same 500 ms debounce, same `active_chips` shape. Fast-tap flush and
  empty-box `emitSearchAbandoned()` → `resetSearchSession()` mirror mobile's shape.
- **Abandon tracking** — the Extension's `pagehide` + effect-teardown trigger is a correct platform
  translation of mobile's `beforeRemove` / `blur`, and neither client gates on "user interacted
  first". Mobile re-arms `hasCommittedRef` on focus; the Extension makes the reset caller-owned.
- **Close-modal re-arm is a divergence, not parity** — mobile sets `hasConfirmedCloseRef = true` at
  `PerpsClosePositionView.tsx:473` and **never re-arms it on failure**; it relies on
  `useFocusEffect`. Mobile can afford that because its close flow is a full screen that stays
  mounted on failure. The Extension modal unmounts at submit, which is what makes the added re-arm
  dead (Issues).
- **Attribution mirroring (accepted divergence)** — mobile reads client screen-view UTM straight
  from `PerpsController.mergeAttributionContext()`; the Extension mirrors UTM client-side because
  the controller lives in the background and cannot be read synchronously. More moving parts, but
  the architecture forces it.

## LavaMoat Policy

- Status: **OK**
- `lavamoat/browserify/**` no longer exists (main removed it in #44433), so only the 8 webpack
  policies changed — and all 8 changed **identically** (11 changed lines each), which is what
  genuine `lavamoat:auto` regeneration looks like rather than hand editing (commit `8334ae523f`).
- The delta matches the `9.0.0 → 9.2.1` bump: `WebSocket` removed from `@metamask/perps-controller`;
  `DecompressionStream`, `Response`, `TextDecoder`, `atob`, `clearTimeout` added on
  `@nktkas/hyperliquid`; `Blob`, `DOMException`, `TextEncoder`, `URL` added and `CustomEvent`
  removed on `@nktkas/rews`. The mix of adds *and* removals is the tell.
- Lockfile delta is 68 lines confined to `@metamask/perps-controller` + `@nktkas/hyperliquid`
  (0.32→0.33) + `@nktkas/rews` (^2→^4.1) + `@noble/hashes` + `decimal.js`.
- The patch `.yarn/patches/@metamask-perps-controller-npm-9.2.1-727f87b8bb.patch` is checked in and
  minimal: it rewrites two `require("file:///home/runner/work/hyperliquid/…")` lines shipped broken
  by upstream to `require("@nktkas/hyperliquid")`.

## Fix Quality

- Best approach: **yes for the architecture, no for the close-modal re-arm.**
  `surfaceControllerFailure` collapsing five duplicated failure branches into one funnel
  (`perps-order-entry-page.tsx:1310`) is the right shape, and it is what makes the order-entry
  abandon re-arm a genuine one-liner. The same one-liner applied to the close modal is not
  equivalent, because the two surfaces have opposite lifecycles on failure — the page stays mounted,
  the modal does not. That difference was not checked before the fix was copied across.
- Would not ship: the console-baseline failure (hard CI stop) and the dead re-arm + its
  self-fulfilling test. Both are small.
- **The edit-margin decision is right and I re-verified it independently.**
  `edit-margin-modal-content.tsx:340` restores the client `PerpsRiskManagement` FAILED emit on the
  `{ success: false }` branch. Confirmed in `node_modules` this session:
  `TradingService.updateMargin` (`dist/services/TradingService.cjs:1102-1115`) tracks
  `RiskManagement` only inside `if (result.success)` and again in its `catch` (:1134) — the
  non-throwing `{ success: false }` path tracks nothing, and `HyperLiquidProvider.updateMargin`
  *returns* rather than throws. Without the client emit, every provider-rejected margin adjustment
  would report no terminal risk event. No double-count today; the emit is shaped like the
  controller's own margin event and carries a `REMOVE when the controller bump lands` marker.
- Test quality: **good**, with the one exception below. Assertions check emitted payloads and
  specific args, `{ success: false }` and transport-throw paths are exercised separately, and
  absence claims are asserted directly. The worker verified the new margin test fails without its
  fix.
- Brittleness: low. Residual and intended: `readScreenViewedHashAttribution()` is merged last in
  `buildPerpsEvent` (`usePerpsEventTracking.ts:75`), so any route whose hash retains
  `source=deeplink` reports `deeplink` for every later screen view on that route.
- Accepted residual (author's documented, measured decision — not re-raised):
  `perps-market-detail-page.tsx:487` can emit both `error` and `asset_details` for one visit if a
  symbol arrives in a later market-stream snapshot. The "require non-empty market list" guard was
  implemented, measured and reverted because it silences a legitimate error view.
- Type-cast note (not an issue): `usePerpsAttribution.ts:41` casts to
  `TrackingData['tradeAction']` because the package types `TradeAction` as
  `'create_position' | 'increase_exposure'` only. Verified the flips are valid at runtime —
  `TradingService.cjs:1374-1375` forwards `trackingData.tradeAction` verbatim with no validation.
  Narrow, documented, and not fixable locally.
- Analytics-schema note (no code change requested): `PERPS_EVENT_PROPERTY.TIMESTAMP` moves from
  `perps_timestamp` to the controller's `timestamp`, renaming that property on every perps event.
  Correct per the contract; data consumers need to know.

## Diff Quality

- Minimal: yes — 90 files, all PR content. No reformatting, no import churn, no unrelated edits.
  The e2e state snapshots (`recentlyViewedMarkets`) and the single `console-baseline-unit.json`
  entry (the provider's throw-outside-provider test) follow from the change.
- Debug code: none — no `console.log`, no `debugger`, no commented-out code, no untracked
  TODO/FIXME.
- Dead surface: the rev8 findings are genuinely cleared. `PERPS_EVENT_VALUE.TRADE_ACTION` and
  `RISK_MANAGEMENT_TYPE` and their test-mock mirrors are deleted; `perpsGetAttributionContext` /
  `perpsClearAttributionContext` / `perpsMergeAttributionContext` are gone from the background API
  with a comment at the remaining registration explaining why only the setter is exposed. Every
  remaining Extension-only constant (`ORDER_CONTEXT`, `MARKET_NOT_FOUND`, `FLIP_POSITION`,
  `BOTTOM_NAV_BAR`, `SUPPORT`, `MARGIN`) still has live consumers.
- Pre-existing, not introduced here: `EditMarginExpandable` is exported but never rendered.

## Recipe

- Present: yes (`artifacts/recipe.json`, 19 nodes; `recipe-quality.json` verdict `pass`;
  `recipe-coverage.md` present with a `visual` proof mode).
- Quality: **good** — the AC nodes test the actual fix, not "app boots". The `ac5-*` absence asserts
  are what make the client-event removal checkable, and `ac1` pins the controller contract keys
  rather than a version string. `--plan` validates: 19 nodes, 0 findings.
- **Re-run this session: `mm-harness run` is still blocked by the slot-config bug, not by the code** —
  `Slot macwork-mmedev-2 is missing resources.dev-server.metro_port required by Metro configuration;
  run farmslot update to migrate the pool`. Every node was therefore executed directly:
  - 7 deterministic nodes (`gate-repo-root`, `ac1`, both `ac2`, all three `ac5`): **PASS**
    (`perps-controller 9.2.1`, `re-export ok`, `order-entry deduped`, `cancel deduped`,
    `close modal deduped`).
  - 5 behaviour nodes (`ac3`, `ac4`, `ac6`, `ac7`, `ac8`): assertions all pass (742/742 across the
    full set), but `ac4-order-lifecycle-behaviour` **exits 1** on the console-baseline gate — see
    Tests/Issues. This node is the one that catches the regression.
  - 6 live nodes: re-driven individually with `mm-harness call` against the restored CDP runtime on
    6662 — `ensure_unlocked`, `ui.navigate page=perps`, `ui.navigate hash=#/perps/market/DOESNOTEXIST`,
    `ui.wait_for text="Market not found"` → `matched: true`, `ui.screenshot` → **fresh capture** at
    `artifacts/recipe-run-rev9-live/call.png` (provider `capture-helper`). This closes the gap
    `recipe-coverage.md` flagged as "not re-proved post-fix".
- Documented limit still true: no node observes a real MetaMetrics payload in the running app, so
  event *counts* are proved in the Jest layer only.

## Visual Evidence

- Status: **OK**
- `recipe-run-rev9-live/call.png`, captured this session against the current build, read directly
  via the Read tool: "Market not found" and `The market "DOESNOTEXIST" could not be found.` are
  plainly visible on the correct screen, with
  `chrome-extension://…/home.html#/perps/market/DOESNOTEXIST` in the address bar.
- `recipe-run/live-capture-error-screen.png` (the manifest's referenced file) also read directly:
  same state, with the runner's `RUN 18/19` overlay.
- Artifact contract gate: `TASK_ARTIFACT_CONTRACT_PASS`. No `FAIL_VISUAL_CLASSIFICATION`, no
  `FAIL_EMPTY`, no `MISSING:` files, no invalid screenshot provider.

## Issues

- **ui/components/app/perps/close-position/close-position-modal.test.tsx:506** — the new test "reports abandonment when the modal is dismissed after a failed close" introduces 2 unwrapped-`act` React warnings, taking this file from the recorded baseline of 4 to 6. This is a **CI blocker, not a warning**: `yarn jest ui/components/app/perps/close-position/close-position-modal.test.tsx` exits 1, and CI runs `yarn test` → `yarn lint && yarn test:unit`. Isolated by running only this test (`Current: 2`), and the baseline entry is identical (4) on `origin/main`, so commit `47f0578e77` introduced it. The un-acted updates are the post-`await` `setError` / `setIsSubmitting(false)` that land after the click resolves. Wrap the failing submit in `act()` (or `await waitFor` the toast as well as the inline error) — do not ratchet the baseline, since the underlying test should be removed or rewritten anyway per the next item.
- **ui/components/app/perps/close-position/close-position-modal.tsx:667** — the `hasConfirmedCloseRef.current = false` re-arm here (and the identical one at :702 in the transport `catch`) is unreachable in production, and the comments above both — "The close did not go through and the modal stays open on an uncommitted form" — are false. `onClose()` is called at :639, *before* the `await submitRequestToBackground`, and the modal's only host renders it conditionally: `{position && isCloseModalOpen && <ClosePositionModal …>}` (`ui/pages/perps/perps-market-detail-page.tsx:2159-2172`). So the component **unmounts** while the request is in flight; `usePerpsAbandonOrderTracking`'s cleanup has already run with `hasConfirmedCloseRef === true` and suppressed the emit, and the re-arm then writes to a ref nobody reads (the `isOpen` effect at :378 resets it on reopen anyway). The regression test only passes because it stubs `onClose={jest.fn()}`, which no real caller does. Mobile agrees: `PerpsClosePositionView.tsx:473` sets the flag and never re-arms on failure. Either revert both re-arms and the test, or — if a failed close really should be recoverable in place — move `onClose()` to the success path so the modal actually stays open on failure, which would also fix the inline `setError` at :664 currently being written to an unmounted component.
- **ui/components/app/perps/close-position/close-position-modal.tsx:454** — the abandon payload omits `LEVERAGE_USED`, which mobile's equivalent sends (`metamask-mobile-ref/app/components/UI/Perps/Views/PerpsClosePositionView/PerpsClosePositionView.tsx:422`: `[PERPS_EVENT_PROPERTY.LEVERAGE_USED]: livePosition.leverage?.value`). The order-entry page already reports it, so close-modal abandonments are the only ones missing it. `Position.leverage` is `{ value, type }` in the controller types and is already read elsewhere on the host page (`perps-market-detail-page.tsx:1627`), so this is one line.
- **temp/tasks/fix/44324-0728-033914/artifacts/recipe-coverage.md:1** — the coverage doc is two commits stale (written 08:32; HEAD is `47f0578e77` at 16:16). It describes only the rev6/rev7 fix pass, still claims "Not re-proved post-fix: the six live UI nodes", and its AC table predates both the LavaMoat regeneration (`8334ae523f`) and the four rev8 fixes. `report.md` was updated for that commit; the coverage sidecar was not. I re-proved the live nodes this session (`recipe-run-rev9-live/`), so the doc now understates coverage — refresh it so the artifact matches the tree it claims to cover.

## Tooling / environment notes (framework, not the PR)

- `mm-harness run` remains unusable in this slot: `Slot macwork-mmedev-2 is missing
  resources.dev-server.metro_port required by Metro configuration`. A Metro port requirement on a
  chrome-extension adapter is a slot-config bug.
- Second bug, reproduced again this session: the failed launcher **takes down the healthy CDP
  runtime it did not start**. `runtime-health` was `PASS` before the attempt and
  `CDP is not reachable on port 6662: fetch failed` after. Recovered with `runtime-launch`
  (which itself reported `runtime_launch_failed` while nevertheless leaving the runtime healthy —
  a third rough edge: its verification step disagrees with its own result).
- The checklist's step-11 `run` invocation uses `--project-root`, which the installed `mm-harness`
  rejects (`CLI_UNKNOWN_OPTION`, suggests `--target`). Checklist template needs updating.
- `yarn lint:changed` diffs the working tree/index only, so on a clean checkout it lints nothing and
  cannot gate a committed branch. Step 4 needs an explicit
  `eslint -c ./.eslintrc.js <branch-changed files>` for self-review to mean anything.
