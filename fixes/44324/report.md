# Update-Branch Report — PR #44324

Branch: `MANUAL-000001-feat-consume-perps-controller-analy`
Base: `origin/main` @ `9c8c6bcb8b`
Merge commit: `3d79f566f9`

## Strategy used: `merge` (deviation from configured `rebase`)

`BRANCH_UPDATE_STRATEGY` was `rebase`. A rebase was attempted first and aborted.
Recorded here because the task requires the concrete strategy actually used.

**Why the deviation:**

- Branch was 39 commits ahead / 330 behind. `git rebase origin/main` conflicted on
  **the very first replayed commit** (`086ebf752b`) across 6 files, and would have
  repeated comparable conflicts across all 37 non-merge commits. Each replay resolves
  against a different intermediate tree, so the same perps analytics hunks would be
  hand-resolved dozens of times — high risk of silently wrong resolutions.
- The branch history already contains two merge commits from main
  (`4e79b28868`, `71e5e28f76`), so it was never linear; rebasing would not have
  produced a clean linear history anyway.
- A merge resolves the same divergence in **one** pass (12 conflicted files,
  7 of them real source), which is auditable in a single diff.

A safety ref `backup/pre-rebase-44324` points at the pre-merge branch tip
(`b690bcbcf9`) should the merge need to be redone.

## Conflicted files and resolutions

### Auto-generated / dependency (5 files)

| File | Side preferred |
| --- | --- |
| `yarn.lock` | regenerated (`yarn install`) from the merged `package.json` |
| `lavamoat/browserify/{main,beta,flask,experimental}/policy.json` | **main** (deletion) |

- **`yarn.lock`** — took main's copy, then ran `yarn install` so the lock matches the
  merged manifest. Verified the PR's pinned dependency survived:
  `@metamask/perps-controller` resolves to the patched `9.2.1`
  (`patch:@metamask/perps-controller@npm%3A9.2.1#...727f87b8bb.patch`), not main's `^9.0.0`.
- **`lavamoat/browserify/*`** — delete/modify conflict. Main removed browserify
  wholesale in #44433; the branch had only regenerated those policies. Accepted the
  deletion (`git rm -r lavamoat/browserify`) — keeping regenerated policies for a
  build system that no longer exists would be dead weight.
- **Webpack LavaMoat policies** auto-merged. Spot-checked
  `lavamoat/webpack/mv3/main/policy.json`: perps-controller entries intact (13 on
  branch, 13 on main, 13 merged).

### Feature code (7 files)

| File | Side preferred |
| --- | --- |
| `shared/constants/perps-events.ts` | **branch**, with one main addition carried over |
| `ui/components/app/perps/close-position/close-position-modal.tsx` | **manual** (8 hunks) |
| `ui/components/app/perps/close-position/close-position-modal.test.tsx` | **manual** (both test suites kept) |
| `ui/components/app/perps/reverse-position/reverse-position-modal.tsx` | **manual** (imports) |
| `ui/pages/perps/perps-layout.tsx` | **manual** (imports) |
| `ui/pages/perps/perps-market-detail-page.tsx` | **manual** (props union) |
| `ui/pages/perps/perps-order-entry-page.tsx` | **manual** (imports) |

#### `shared/constants/perps-events.ts`

Branch replaces the hand-maintained Extension enums with the controller contract
(spread of `CONTROLLER_PERPS_EVENT_PROPERTY` / `_VALUE` plus deprecation aliases).
Main, never having that migration, added new literals to the old hand-maintained
objects. Kept the branch structure — that *is* the PR — but audited every one of
main's additions against the controller package to avoid silently dropping them:

- `LIMIT_PRICE`, `FEES`, `PNL_DOLLAR`, `RECEIVED_AMOUNT` — already exported by
  `@metamask/perps-controller` with **identical string values**
  (verified in `dist/constants/eventNames.d.cts`), so the spread already supplies
  them. Dropped main's duplicates.
- `SOURCE.BOTTOM_NAV_BAR: 'bottom_nav_bar'` — **not** in the controller contract, and
  main code depends on it (`ui/hooks/perps/usePerpsBottomNavSource.ts`,
  `perps-view.tsx`). Re-added explicitly to the branch's `SOURCE` override block as an
  Extension-only value. Dropping it would have been a compile break.
- Main's `SCREEN_NAME` / `ACTION_TYPE` / `PERPS_HISTORY_TABS` / `MAX_SLIPPAGE_SOURCE` /
  `SETTING_TYPE` blocks — all present in the controller contract; the branch
  deliberately deleted the hand-maintained copies. Kept them deleted.

#### `close-position-modal.tsx` (8 hunks)

- Imports, `Props`, destructuring, and the reopen-reset effect: **union of both sides**
  (branch's `buttonClicked` / `buttonLocation` analytics props + `useRef` abandon
  tracking, main's `displayPrice` / `displayChange` header props + order-type reset).
- Three hunks where main added client-side `PerpsPositionCloseTransaction` tracking
  (success path, backend-failure path, catch path): **took the branch side**, i.e.
  dropped main's calls. This is the core intent of the PR — the controller now owns
  transaction events, and the branch documents this in sibling files
  (`perps-view.tsx`: "Emitting it client-side would double-count";
  `perps-order-entry-page.tsx`: "controller-owned (deferred to controller 9.2.2)").
  Error reporting is not lost: the branch already emits `PerpsError` +
  `trackPerpsErrorScreenViewed` on both failure paths.
- `useCallback` dep array: union of both sides, deduped (`track` was listed twice).

#### `close-position-modal.test.tsx`

Git interleaved two *independent* `describe` blocks — branch's
`position_close screen view` (2 tests) and main's `header` (2 tests). Neither side's
tests were dropped; both blocks were reconstructed in full and kept.

#### Import-only conflicts, and a subtle auto-merge hazard

`perps-layout.tsx`, `perps-order-entry-page.tsx`, `perps-market-detail-page.tsx`,
`reverse-position-modal.tsx` conflicted only on import/prop lists. A naive
"take both sides" union **compiled to broken imports**, because each side had deleted
helpers the other still referenced — and those deletions auto-merged silently:

- `getDisplayName` — deleted by main (superseded by `getDisplaySymbol`), still imported
  by the branch.
- `deriveTpslType` — deleted by the branch ("drop dead analytics helpers"), re-added by main.
- `buildPerpsVipTrackingData` (+ `ui/components/app/perps/utils/trackingData.ts`) —
  deleted by the branch, still imported by main.

Resolved by checking actual usage in the merged bodies: only `getDisplaySymbol` and
`getPositionDirection` are genuinely called, so the unused imports were dropped rather
than the helpers restored. Also removed the now-unused
`MetaMaskReduxDispatch` type import from `perps-layout.tsx` — main switched to the
typed `useDispatch` from `store/hooks`, which drops the generic.

## LavaMoat note

The update deletes `lavamoat/browserify/**` and `lavamoat/build-system/**` (both removed
by main) and touches the webpack policies. No new packages were introduced by this
merge, and `@metamask/perps-controller`'s patched 9.2.1 pin is unchanged from the
branch, so the webpack policies were not regenerated. Worth a reviewer glance since
the branch previously carried a dedicated policy-regeneration commit.

## Risks / needs manual verification

1. **Controller-owned close events.** The merge removes main's client-side
   `PerpsPositionCloseTransaction` emission from the close modal on the assumption that
   `@metamask/perps-controller@9.2.1` emits it. That was the PR's premise and is
   documented on the branch, but it is worth confirming on a live close that the event
   still lands exactly once (not zero, not twice).
2. **`SOURCE.BOTTOM_NAV_BAR`** is now an Extension-only override rather than part of the
   controller contract. If the controller later adds a bottom-nav source, this should be
   collapsed into the alias pattern used for the other deprecated keys.
3. **Dropped helpers.** `deriveTpslType` and `buildPerpsVipTrackingData` no longer exist
   in the merged tree. Confirmed no remaining consumers, but any main-side work in flight
   that expects them will need to rebase.
4. **`close-position-modal.tsx` dep array** now carries the union of both sides' deps;
   any that are genuinely unnecessary should surface as lint warnings.

## Validation (post-merge)

| Gate | Result |
| --- | --- |
| `yarn lint` (includes full `tsc`, prettier, eslint, styles, images) | pass |
| `yarn verify-locales --quiet` | pass (`No invalid entries!`) |
| `yarn circular-deps:check` | pass |
| `yarn jest` on the 3 conflicted component suites | **180/180 pass** |
| `artifacts/recipe.json` re-run post-merge | **pass, 19/19 nodes** |
| `gh pr view 44324 --json mergeable` | `MERGEABLE` |

The full validation recipe was re-executed against the post-merge tree after a fresh
webpack build (`artifacts/recipe-run/`, 8/8 ACs proven, live UI screenshot at
`recipe-run/live-capture-error-screen.png`). See `artifacts/recipe-coverage.md` —
notably `ac5-assert-no-duplicate-close-modal` is what independently confirms the
close-modal tracking removal described above. `mergeStateStatus` is `BLOCKED`, which
reflects pending CI and required reviews, not conflicts.

Two notes rather than silent passes:

- The `yarn lint` prettier stage reported "Code style issues found in 133 files". All 133
  are framework-injected paths (`.omx/`, `.omc/`, `temp/`), zero are repo files. Per the
  agent rules these are surfaced here, not silenced by editing `.prettierignore`.
- `mm-harness launch` refused to take CDP port 6662 ("held by a browser this harness did
  not launch"), which is correct — the orchestrator owns that browser. The build step
  still ran (319s) and the recipe then attached via `--launch-existing-dist`.

## Push

Because the update used `merge`, the push was a normal (non-force) push:

```bash
git push origin MANUAL-000001-feat-consume-perps-controller-analy
```

---

## Self-Review Fixes

All 21 self-review findings were re-checked against the current tree first — the review
predates the merge, so staleness was possible. None had been fixed incidentally; all 21
were still present.

### CI-blocking lint errors

- `ui/components/app/perps/close-position/close-position-modal.tsx:737` — removed
  `closeNotionalUsd`, `closePercent`, `effectivePnl`, `youWillReceive` from the
  `handleClose` dep array. Confirmed unused across the whole callback body (585–736)
  before removing; they were left behind when the merge dropped main's client-side
  `PerpsPositionCloseTransaction` emissions.
- `ui/hooks/perps/usePerpsAbandonOrderTracking.test.ts:1` — deleted the dead
  `@typescript-eslint/naming-convention` disable. Verified dead: the file has no
  snake_case *declarations*, only string values (`'abandon_order'`) and member access
  (`properties.time_on_screen_ms`), neither of which the rule flags.

### Mobile-parity gaps in the market-list search funnel

- `ui/pages/perps/market-list/index.tsx` — `mode` can now be `discovery`, derived from
  an `activeChips` list (the category filter; mobile also counts its watchlist chip).
- Same file — a query abandoned inside the 500 ms debounce is no longer dropped. Added
  `pendingQueryRef` plus `flushPendingSearchQuery()`, called on unmount before
  `emitSearchAbandoned()`. Mid-load flushes omit the count props rather than reporting a
  mid-load zero, matching mobile.
- Same file — the search clock now starts on the first keystroke instead of inside the
  debounce callback, so `time_in_search_ms` / `time_to_tap_ms` no longer run ~500 ms
  short of mobile for identical behaviour.
- Same file — `PERPS_SEARCH_QUERY` now carries `query_text`, `query_length`,
  `has_results`, `active_chips`. The four keys were added to the Extension-only block in
  `shared/constants/perps-events.ts` (the controller contract does not export them),
  following the existing `QUERY_COUNT` / `TIME_IN_SEARCH_MS` pattern.
- Emptying the search box now resets the pending query and the clock, mirroring mobile's
  `resetSearchSession`.

### Correctness / hygiene

- `perps-order-entry-page.tsx:341` — `tradingScreenDefaults` reuses the `market` memo
  instead of re-deriving it with a second `allMarkets.find`; dep array narrowed from
  `allMarkets` to `market`.
- `perps-order-entry-page.tsx` — named `DEFAULT_MAX_LEVERAGE = 50` (used at both former
  bare-`50` sites) and `TRANSACTION_CONSIDERED_DEBOUNCE_MS = 1000`.
- `perps-order-entry-page.tsx:8`, `close-position-modal.tsx:9` — restored
  `import type { Json }`.
- `edit-margin-modal-content.tsx` — extracted `getMarginAdjustmentFailedToast()`, shared
  by the `{ success: false }` branch and the `catch`. It takes the resolved fallback
  string rather than `t`, because this file's `t` is typed `Function` and passing it
  would need a cast.
- `shared/constants/perps-events.ts` — deleted the fake
  `PERPS_VERIFY_LOCALE_FALSE_POSITIVES` export. Confirmed empirically that `tutorial`
  was genuinely unused (the perps tutorial UI uses `perpsTutorial*` keys), so the message
  was removed via `yarn verify-locales --fix` — 51 deletions across 17 locale files
  rather than adding a second fake consumer or an allowlist entry.

### Churn reverts

- `edit-margin-modal-content.tsx` — restored main's hook order (`usePerpsToast` before
  `usePerpsEventTracking`) and dep-array order.
- `perps-controller-init.test.ts` — restored the three single-line
  `Object.assign(..., { name, cause })` literals.
- `perps-market-detail-page.test.tsx` / `perps-order-entry-page.test.tsx` — restored the
  `TAT-3264` and `TAT-3053` ticket IDs.
- `edit-margin-modal-content.test.tsx:266` — assertion now reads
  `messages.perpsToastMarginAdjustmentFailedDescriptionFallback.message`.
- `perps-order-entry-page.test.tsx:2227` — now `messages.somethingWentWrong.message`.
  Only this one assertion was changed; the file's three other identical literals are
  pre-existing on main and were left alone.

### Where I did not follow the prescription

- **`latestAbandonPropsRef` written during render** (flagged in both
  `perps-order-entry-page.tsx:615` and `close-position-modal.tsx:443`). Moving the write
  into a `useEffect` is right, but a **dependency-free** effect reproducibly broke
  `close-position-modal` → "forces Market behavior when the flag is disabled mid-session"
  (5500 ms timeout). This was bisected, not assumed: full-file run with the render-body
  version passed 52/52 (control), the dep-free effect version failed the same run twice.
  Fixed by scoping the effect to the values it snapshots
  (`[position.symbol, position.size, closeNotionalUsd]`, and the form-state equivalents
  in order-entry); both suites then pass, 151/151 together under `--runInBand`.
- **`recipe-coverage.md:22` proof-mode label** — relabelled `live UI` → `visual` as
  prescribed; the artifact-contract gate now passes.

### Deliberately not fixed (flagged, out of scope for a review-fix pass)

- **`package.json:429`** — the `@metamask/perps-controller` pin to a local patch of
  exactly `9.2.1` is called out below for the PR description, with a follow-up to drop
  the patch once upstream republishes without the `require("file:///home/runner/...")`
  statements. No code change.
- **`test/mocks/metamask-perps-controller.js:23`** — `TIMESTAMP` moving from
  `perps_timestamp` to the controller's `timestamp` renames that property on every perps
  event. Correct per the contract, but it is a breaking analytics-schema change; flagged
  for the data consumers rather than altered.
- **`test/jest/console-baseline-unit.json:1015`** — the baselined uncaught error from the
  deliberate "throws outside provider" test is left as-is; restructuring that assertion
  is a test-harness change beyond this pass.
- **8 pre-existing `eslint-disable` directives.** `mm-harness check diff` fails its
  `policy-suppressions` check on 8 file-level naming-convention disables added earlier by
  this PR (deeplink and perps analytics test files). These are *not* mine — this pass
  removed one and added none. They are load-bearing: those files declare snake_case
  object keys (`interaction_type:`, `sort_field:`), and `yarn lint` passes with them
  while having correctly flagged the one that was dead. Removing them means rewriting
  assertions across 8 test files, which the Scope Discipline section of this task forbids.
  Surfaced here for the PR author to decide.

### Validation

| Gate | Result |
| --- | --- |
| `yarn lint` (includes full `tsc`) | **pass** |
| `yarn verify-locales --quiet` | pass (`No invalid entries!`) |
| `yarn circular-deps:check` | pass |
| Touched suites (market-list, edit-margin, abandon hook) | **85/85** |
| Touched suites (order-entry, market-detail, close-position, controller-init) | **151/151** serial |
| All recipe AC nodes, run directly | **8/8 ACs pass** |
| `check-task-artifact-contract.mjs` | `TASK_ARTIFACT_CONTRACT_PASS` |

Two tooling problems were hit and are reported rather than worked around:

- **`yarn lint:changed` is broken in this checkout** — it invokes ESLint 9 without the
  legacy config flag, so it dies with "couldn't find an eslint.config.js"; forcing
  `ESLINT_USE_FLAT_CONFIG=false` then dies on a circular-structure error in
  `@eslint/eslintrc`. The full `yarn lint` (which passes `-c ./.eslintrc.js`) works and
  was used instead — justified here because two of the findings *were* ESLint gate
  failures.
- **The recipe launcher cannot start** — slot `macwork-mmedev-2` is missing
  `resources.dev-server.metro_port`. See `recipe-coverage.md` for what this does and does
  not leave proved.

The prettier stage of `yarn lint` reports 134 style issues; all 134 are
framework-injected paths (`.omx/`, `.omc/`, `temp/`) and zero are repo files.

---

## Second merge + CI-recovery pass (rev6/rev7 review fixes)

The branch had gone `CONFLICTING` again and 7 checks were red. This pass merged main,
regenerated the LavaMoat policies, and fixed the review issues.

### Merge

`origin/main` had moved 41 commits ahead (`171ed202b7`). Merged (not rebased, same
rationale as the first pass). Two conflicted files, both dependency metadata:

| File | Resolution |
| --- | --- |
| `package.json` | kept the branch's `@metamask/perps-controller` patch specifier, took main's `@metamask/phishing-controller@^17.3.0` |
| `yarn.lock` | took main's copy, then `yarn install` to re-resolve against the merged manifest |

No perps source file conflicted — `git log 3d79f566f9..origin/main -- '**/perps/**'` is
empty, so main touched nothing this PR owns. The lockfile delta against main is 66 lines
and confined to `@metamask/perps-controller` and its `@nktkas` / `@noble/hashes` /
`decimal.js` subtree.

### Self-Review Fixes

- `ui/pages/perps/market-list/index.tsx:76` — extracted `deriveSearchMode(activeChips,
  normalizedQuery)` plus a `SEARCH_MODE` constant map and a named `TICKER_LIKE_QUERY`
  regex. Clears the CI-blocking `no-nested-ternary` error and gives the three inline mode
  literals a home. Values are unchanged, so the emitted vocabulary still matches mobile.
- `ui/pages/perps/market-list/index.tsx:508` — the search-result tap is now gated on what
  is in the box (`trimmedQueryRef`) instead of on `emittedQueryRef`, and calls
  `flushPendingSearchQuery()` before emitting. A result tapped inside the 500 ms debounce
  now produces `PERPS_SEARCH_QUERY` followed by `PERPS_SEARCH_RESULT_TAPPED` instead of
  nothing. `resultTappedRef` is set *after* the flush because the flush re-arms it.
- `ui/pages/perps/market-list/index.tsx:344` — the debounce effect's empty branch now calls
  `emitSearchAbandoned()` then a new `resetSearchSession()`, mirroring mobile. Backspacing
  to empty now reports the abandonment, and clears `emittedQueryRef`,
  `emittedResultsCountRef` and `queryCountRef` so the next session cannot inherit a stale
  query or an inflated `query_count`. `handleSearchClear` no longer emits directly — every
  emptying path (clear button, Escape, backspace) now runs through that one branch.
- `ui/pages/perps/perps-order-entry-page.tsx:1310` — `hasSubmittedOrderRef.current = false`
  in `surfaceControllerFailure`, which is the single funnel for every `{ success: false }`
  return and for the transport `catch`. A failed submit leaves the user on the form, so
  abandon tracking has to re-arm; mobile does the equivalent on focus.
- `ui/pages/perps/perps-order-entry-page.tsx:234` — hoisted `DEFAULT_LEVERAGE` to module
  scope next to `DEFAULT_MAX_LEVERAGE`.
- `shared/constants/perps-events.ts:107` — added `ERROR_TYPE.MARKET_NOT_FOUND` and
  `ORDER_CONTEXT.TRADE` to the Extension-only block; `perps-market-detail-page.tsx:489`,
  `perps-order-entry-page.tsx:496` and `perps-order-entry-page.tsx:594` now read from the
  constants layer instead of inline literals.
- `ui/components/app/perps/update-tpsl/update-tpsl-modal-content.tsx:76` — named
  `TPSL_RECONCILE_DELAY_MS`, and the delayed refetch's `console.warn` is now
  `captureException`, matching the siblings converted in `perps-view.tsx` and
  `perps-market-detail-page.tsx`.
- `ui/components/app/perps/edit-margin/edit-margin-modal-content.test.tsx:6` — imports
  `enLocale as messages` from `test/lib/i18n-helpers` instead of reaching into
  `app/_locales`, clearing the CI-blocking `import-x/no-restricted-paths` error.
- `ui/components/app/perps/edit-margin/edit-margin-modal-content.tsx:67` — documented
  `errorMessage` and `fallbackDescription`, clearing two `jsdoc/require-param` errors.
- `ui/pages/perps/perps-market-detail-page.test.tsx:471` — the `watchlisted` assertion now
  pins values, not the type: one case asserts `false` and a new case seeds
  `watchlistMarkets.mainnet = ['ETH']` and asserts `true`. A wrong selector now fails.
- `ui/components/app/perps/utils/track-perps-error-screen.test.ts:19` — folded the
  redundant second test into the first by asserting the literal `'perps_market_details'`
  inside the single payload assertion.

### New regression tests

Behavioural fixes were pinned so a revert fails:

- `market-list/index.test.tsx` — "emits the query then the tap when a result is picked
  inside the debounce window" and "abandons and resets the session when the query is
  backspaced to empty" (the latter also asserts that a later row tap does not report a
  bogus `search_result_tapped` against the stale query).
- `perps-order-entry-page.test.tsx` — "still reports abandonment after a failed submit
  leaves the user on the form". Verified it is not vacuous: reverting the one-line fix
  makes it fail (`1 failed, 99 skipped`), and it asserts the `perpsPlaceOrder` precondition
  so it cannot pass by simply never submitting.

### Test-suite timer leak

`update-tpsl-modal-content.test.tsx:156` now installs `jest.useFakeTimers({ advanceTimers:
true })` per test and drains in `afterEach`, so the deliberate 2.5 s post-close
reconciliation can no longer outlive a test and fire a stray `perpsGetPositions` inside a
later one. The `afterEach` guards on `jest.isMockFunction(setTimeout)` because the existing
delayed-refetch test restores real timers itself. 68/68 pass, with no new console-baseline
entries.

The reviewer's alternative — clearing the timeout on unmount — was **not** taken: the
timer is meant to fire *after* the modal closes and unmounts, so clearing it on unmount
would delete the reconciliation in production, not just in tests.

### Where I did not follow the prescription

- **`perps-market-detail-page.tsx:487` — "consider also requiring the market list to be
  non-empty".** Implemented, measured, then reverted. It does not fix the flagged race: the
  double emission happens when a symbol arrives in a *later* snapshot, and in the common
  case the list is already non-empty at that point, so the guard changes nothing. What it
  does do is silence a legitimate `error` screen view when the stream genuinely returns an
  empty list (a stream failure still renders "Market not found" to the user). Trading a
  real missing event for a partial fix on a rare one is a bad deal, so the condition is
  unchanged and the residual double-emit is documented here instead.
- **`package.json:429` — the exact-version patch pin.** No code change. The specifier
  mirrors the repo's existing precedent for `@metamask/jazzicon` (`package.json:397`),
  which is also pinned to its full `patch:` specifier with a matching `resolutions` key. It
  needs a tracked follow-up to drop the patch once upstream republishes 9.2.x without the
  `require("file:///home/runner/...")` lines — not a silent unpin here.

### Finding raised by rev6 that this pass did NOT fix

`ui/components/app/perps/edit-margin/edit-margin-modal-content.tsx:335` drops the client
`PerpsRiskManagement` FAILED emission on the `{ success: false }` branch, on the assumption
that the controller emits it. **It does not, in the pinned 9.2.1.** Verified in
`node_modules`:

- `TradingService.updateMargin` (`dist/services/TradingService.cjs:1081`) tracks
  `RiskManagement` only inside `if (result.success)` (:1111) and in its `catch` (:1134).
  The non-throwing `{ success: false }` path tracks nothing.
- `HyperLiquidProvider.updateMargin` (`dist/providers/HyperLiquidProvider.cjs:1292-1301`)
  catches its own errors and *returns* `{ success: false, error }`, so every real failure
  ("No position found", "Insufficient balance for margin addition", "Margin adjustment
  failed") lands on exactly that untracked path.

So a failed margin add/remove currently emits no terminal risk event at all. The sibling
removals are safe — close (`#trackPositionCloseResult`), batch close (`finally`), cancel
(explicit `else`), flip (explicit `else`) and TP/SL (`finally`) all cover their
`{ success: false }` path; `updateMargin` is the only hole. It is left as-is because the
choice — restore the client emit now and risk double-counting when core #9471 ships, or
wait for the controller bump — is a product/analytics call for the PR author, not a
review-fix decision.


### Second merge, LavaMoat regeneration and push (post-reboot resume)

The machine rebooted mid-pass. State on disk was the first merge commit (`f66e05a316`)
plus the uncommitted fix edits; everything was recovered without rework.

- **`origin/main` had moved again** (2 commits: DeFiPositionsControllerV2 + a
  `LegacyBackgroundApiService` migration). Re-merged into `1b3622203a` — clean, no
  conflicts, and no overlap with any file this PR touches. `package.json` / `yarn.lock`
  were unchanged by that merge, so no reinstall was needed.
- **LavaMoat policies regenerated** with `yarn lavamoat:auto` (webpack:tsc + build + MV2 +
  MV3, exit 0). The result is a single added global in each of the eight webpack policies:
  `"URL": true` under `@metamask/perps-controller>@nktkas/hyperliquid>@nktkas/rews`. That
  is the `@nktkas/rews` 2.x -> 4.x bump (the reconnecting-WebSocket layer now parses URLs),
  and it is exactly what the two red *Validate LavaMoat webpack MV2/MV3 policy* checks were
  reporting. No other policy entry changed, and the build policy stage produced no diff.
- **Pushed** `3d79f566f9..8334ae523f` as three commits (merge, fixes, policy
  regeneration). Nothing was posted to the PR — no comments, no labels, no review
  re-request.

### Validation (post-merge, pre-push)

| Gate | Result |
| --- | --- |
| ESLint over all 57 changed JS/TS files (`-c ./.eslintrc.js --no-cache`) | **pass** (0 problems) |
| `yarn lint:tsc` | **pass** (exit 0, no output) |
| `yarn lint:format` (oxfmt) | pass — only `CLAUDE.local.md`, which is framework-injected and untracked |
| `yarn lint:json` (Prettier) | pass — 135 warnings, **zero** on tracked files (all `temp/`, `.omc/`, `.omx/`) |
| `yarn lint:styles`, `yarn messenger-action-types:check` | pass |
| `yarn verify-locales --quiet`, `yarn circular-deps:check` | pass |
| `yarn lint:lockfile`, `yarn --check-resolutions`, `yarn lint:baseline`, `yarn lint:changelog` | pass |
| `./development/shellcheck.sh` over tracked scripts | pass (all findings are in gitignored `temp/`) |
| Touched suites (market-list, order-entry, market-detail, update-tpsl, edit-margin, error-screen) | **309/309** |
| Remaining PR suites (15) | **434/434** |
| Static recipe AC nodes (gate-repo-root, ac1, ac2 x2, ac5 x3) | **7/7 pass** |

### CI checks: what this pass fixes and what it cannot

| Failing check | Status |
| --- | --- |
| CONFLICTING with main | fixed by the re-merge, which rides along with the push |
| Validate LavaMoat webpack MV2 policy | fixed by the regeneration |
| Validate LavaMoat webpack MV3 policy | fixed by the regeneration |
| Test lint | fixed — the three ESLint errors are gone and the full changed-file lint, tsc, oxfmt, styles and locales gates all pass locally |
| repository-health-checks | every step of that workflow passes locally now. The most likely original cause was the lockfile being out of sync with the merged manifest, which the first merge repaired. Its audit step reports 3 production advisories (brace-expansion, postcss x2), but the lockfile delta against main is 66 lines confined to the perps-controller subtree and touches neither package, so they are inherited from main rather than introduced here. |
| ci-status-gate / Triage / Retry | aggregate jobs; they should clear once the above are green |
| **check-pr-max-lines** | **NOT fixed — needs a human decision.** |

**check-pr-max-lines** counts 5,386 changed lines against a 1,000 limit (the action
ignores `.lock`, `.snap`, `lavamoat/**/policy.json` and `.agents|.claude|.cursor` paths, all
of which are already excluded from that figure). The split is ~2,835 lines of tests/mocks
and ~2,551 of source; the largest single files are `perps-order-entry-page.test.tsx` (553),
`perps-order-entry-page.tsx` (548) and `PerpsAttributionContext.tsx` (364). There is no
legitimate way for a review-fix pass to get under the limit — deleting tests to satisfy a
line counter would be gaming the metric. It needs either a PR split (the attribution
provider and the market-search funnel are the two natural seams) or an exemption, and both
are the author's call. Applying a label would be a PR mutation, which this pass does not do.

### Recipe re-run after the fixes

`mm-harness run` is still blocked by the slot-config bug reported in earlier passes
(`Slot macwork-mmedev-2 is missing resources.dev-server.metro_port`), so the nodes were
executed directly, as before:

- 7 deterministic nodes (`gate-repo-root`, `ac1`, both `ac2`, all three `ac5`) — **pass**.
- 6 behaviour nodes — the Jest suites above, **743/743**.
- 6 live nodes driven with `mm-harness call` against a build made from this HEAD:
  `ensure_unlocked`, `ui.navigate page=perps`, `ui.navigate hash=#/perps/market/DOESNOTEXIST`,
  `ui.wait_for text="Market not found"` → `matched: true`, `ui.screenshot` → fresh capture
  at `artifacts/recipe-run-rev7-live/call.png` (provider `capture-helper`), read back and
  confirmed to show the claimed error state.
- `check-task-artifact-contract.mjs` → `TASK_ARTIFACT_CONTRACT_PASS`.

**Runtime disturbance, disclosed and repaired.** The reboot left the slot with no webpack
watcher and a `dist` from the pre-fix commit, so the live nodes would have exercised stale
code. Rebuilding with `yarn build:test` was the wrong flavour for this runtime: it enables
LavaMoat scuttling, and the harness CDP probe then fails with `property
"requestAnimationFrame" of globalThis is inaccessible under scuttling mode`. Repaired by
rebuilding through the slot's own `temp/recipe/runtime/refresh-build.sh` (dev build, no
scuttling) and relaunching with `mm-harness runtime-launch`, which now reports
`runtime_ready` and `runtime-health` `PASS` with exactly one extension page target. An
intermediate attempt to close/reopen the page over raw CDP briefly left the tab on
`chrome-error://chromewebdata/`; that was also cleared by the sanctioned relaunch. The
slot is left healthy.

### `mm-harness check diff`

`--profile fast` fails its `policy-suppressions` check on the **8 pre-existing** file-level
`@typescript-eslint/naming-convention` disables in perps/deeplink test files, and
short-circuits the remaining checks. None were added by this pass (`git show d61334a766 |
grep '^+.*eslint-disable'` is empty), and an earlier review measured that removing all 8
produces **33** naming-convention errors, because those suites assert snake_case MetaMetrics
keys as object literals. Removing them means rewriting the assertions onto computed
`PERPS_EVENT_PROPERTY.*` keys across 8 files — a refactor outside this fix pass. The
underlying gates that CI actually runs (`lint:eslint`, `lint:tsc`, `lint:format`,
`lint:styles`, locales, circular deps) were all run directly instead and pass.

---

## Third review-fix pass (5 findings)

- `ui/components/app/perps/close-position/close-position-modal.tsx:667,703` — re-arm
  `hasConfirmedCloseRef` on both failure paths (`{ success: false }` and the transport
  `catch`). Both leave the modal open on an uncommitted form, so dismissing it is a real
  abandonment; previously the flag stayed committed until the modal was reopened. Same bug
  and same one-line shape as the order-entry fix from the previous pass.
- `shared/constants/perps-events.ts` — deleted the dead `TRADE_ACTION` and
  `RISK_MANAGEMENT_TYPE` blocks and their mirrors in
  `test/mocks/metamask-perps-controller.js`. Verified zero consumers across `ui/`,
  `shared/`, `app/` and `test/` before deleting; both lost their last callers in this PR
  (`deriveTradeAction` inlined -> `derivePerpsTradeAction` on `ACTION.*`, and the deleted
  `deriveTpslType` / client risk emits). `yarn lint:tsc` re-run clean afterwards, since
  deleting exported constants is exactly the case where the type gate matters.
- `app/scripts/messenger-client-init/perps-controller-init.ts:204,531` — dropped
  `perpsGetAttributionContext`, `perpsClearAttributionContext` and
  `perpsMergeAttributionContext` from the background API union and registrations, plus
  their three unit tests and the now-unused `PerpsAnalyticsProperties` import. Only
  `perpsSetAttributionContext` has a UI caller; the merge into controller-emitted events
  goes through the `mergeAttributionContext` closure handed to
  `createPerpsInfrastructure`, not through a background action. A comment at the
  registration now says so.
- `ui/components/app/perps/edit-margin/edit-margin-modal-content.tsx:340` — **restored**
  the client `PerpsRiskManagement` FAILED emit on the `{ success: false }` branch. Of the
  two options the review offered, recording the gap on the ticket is not available to this
  pass (it does not touch GitHub), and leaving it silent ships a regression against main:
  every provider-rejected margin adjustment would emit no terminal risk event at all. The
  emit is shaped like the controller's own margin event (`status`, `asset`, `action`,
  `margin_used`, `error_message`) so the two line up when core #9471 lands, and carries a
  `REMOVE when the controller bump lands` marker. The transport `catch` deliberately does
  **not** emit — a throw that reaches the controller is caught by
  `TradingService.updateMargin`, which emits the failed event itself; the comment there now
  explains the asymmetry.

### New regression tests

- `close-position-modal.test.tsx` — "reports abandonment when the modal is dismissed after
  a failed close". Probed: reverting the `{ success: false }` re-arm makes it fail.
- `edit-margin-modal-content.test.tsx` — "emits a failed risk-management event when
  perpsUpdateMargin returns success false". Probed: removing the restored emit makes it
  fail. The suite's `usePerpsEventTracking` mock now returns a stable `mockTrack` so the
  emit is assertable; the assertion uses computed `PERPS_EVENT_PROPERTY.*` keys rather
  than snake_case literals, which keeps the file free of a naming-convention
  `eslint-disable`.

### Validation

| Gate | Result |
| --- | --- |
| ESLint over the 8 changed files | pass (0 problems) |
| `yarn lint:tsc` | pass (exit 0) — run because exported constants were deleted |
| `yarn lint:format` (oxfmt) | pass after formatting the touched test; only `CLAUDE.local.md` remains, which is untracked |
| `yarn verify-locales --quiet`, `yarn circular-deps:check` | pass |
| Affected suites (close-position, edit-margin, controller-init, deriveTradeAction, order-entry) | **310/310** |
| Static recipe AC nodes | **7/7 pass** (incl. `ac5-assert-no-duplicate-close-modal`) |
| `mm-harness check diff --profile fast` | still red on `policy-suppressions` for the **8 pre-existing** eslint-disables; this pass added none, and deliberately avoided a 9th |

Recipe re-run for this pass: `mm-harness run` remains blocked by the slot `metro_port`
config bug, so the nodes were driven individually as before — 7 static asserts pass, the
behaviour nodes are the suites above, and the live nodes were re-driven against a dev build
made from this working tree (`dist/chrome` rebuilt 16:10 via the slot's `refresh-build.sh`,
runtime relaunched to `runtime_ready` / health `PASS`). `ui.wait_for` matched "Market not
found" and the screenshot at `artifacts/recipe-run-rev8-live/call.png` was read back and
confirms the rendered error state. `check-task-artifact-contract.mjs` →
`TASK_ARTIFACT_CONTRACT_PASS`.

---

## Fourth pass — CI recovery (`aba477d058`)

CI on `47f0578e77` had three real failures. Root causes and fixes:

- **repository-health-checks** — `yarn dedupe --check` exited 1: `decimal.js@npm:^10.2.1`
  and `^10.4.2` were dedupable. Caused by this PR — perps-controller 9.2.1 pulls
  `@nktkas/hyperliquid@0.33`, which added `decimal.js@^10.6.0`, making the two older
  ranges collapse under the `highest` strategy. Ran `yarn dedupe` (−8/+1 lockfile lines,
  three ranges → one entry at 10.6.0). No LavaMoat regeneration needed: the other
  consumers are jsdom (test-only) and decimal.js is only reachable through hyperliquid's
  `./utils` subpath, which the controller never imports, so it is not in the bundle graph
  or any policy.
- **Run tests / Unit tests (2)** — all 4008 tests passed; the job failed the
  console-baseline gate because `close-position-modal.test.tsx` React act warnings went
  4 → 6. The new "abandonment after a failed close" test repeated the same failing submit
  as the existing `ORDER_SIZE_MIN` test, and each such flow emits ~2 act warnings. The
  assertion was folded into that existing test so the failing submit is driven once.
  (The rev10 pass then removed that assertion entirely — see below.)
- **e2e-chrome-webpack (11)** — `send-erc20-max-balance-validation.spec.ts` timing out in
  `checkAmountInputValue`. Not caused by this PR (it touches no send or balance code) and
  already owned elsewhere: issue **#44947** (AssetsController discards a WebSocket balance
  update when a stale accounts-API snapshot commits after it) and open PR **#44952**
  ("test: skip ERC20 max balance WS update test", touching exactly that spec). Left
  untouched to avoid colliding with #44952.

`check-pr-max-lines` was confirmed advisory by the operator (the last three merged size-XL
PRs all show it FAILURE) and is not being addressed.

## Fifth pass — rev10 review fixes

- **`close-position-modal.tsx` — removed both `hasConfirmedCloseRef` re-arms.** The rev9
  pass added them on the `{ success: false }` and `catch` paths by analogy with the
  order-entry page. That analogy was wrong, and the review caught it: `onClose()` is
  called at :639 *before* the `await`, and the host renders the modal conditionally
  (`{position && isCloseModalOpen && <ClosePositionModal … onClose={() => setIsCloseModalOpen(false)}>}`,
  `perps-market-detail-page.tsx:2159`), so the component unmounts while the request is in
  flight. The abandon hook's cleanup has already run with the commit flag set, and the
  re-arm wrote to a ref nobody reads. Reverted both; the flag now behaves exactly as
  mobile's (`PerpsClosePositionView.tsx:473`: set on submit, reset only on reopen).
- **Removed the test that asserted that unreachable state.** It only passed because it
  stubbed `onClose={jest.fn()}`, keeping the modal mounted so `isOpen={false}` reached the
  hook as an activation change — a state no real caller produces.
- **`close-position-modal.tsx:455` — added `LEVERAGE_USED` to the abandon payload**, which
  mobile sends (`PerpsClosePositionView.tsx:422`) and the order-entry page already reports.
  Close-modal abandonments were the only ones missing it.
- **Replaced the removed test with one that exercises the real path**: render the modal,
  dismiss it *without submitting*, unmount, and assert the emitted `abandon_order` carries
  `asset` and `leverage_used`. Probed both ways — it fails when `LEVERAGE_USED` is removed,
  and the act-warning count stays at the baseline 4.
- **Refreshed `recipe-coverage.md`**: added a "Current status" block for HEAD, replaced the
  stale "not re-proved post-fix" claim about the live nodes (re-proved in rev9 and rev10
  against HEAD builds), and corrected the supporting-evidence figure from the merge-time
  180/180 to the current 742/742 across 21 suites.

**Where I did not follow the prescription:** the review offered moving `onClose()` onto the
success path as an alternative, so a failed close would leave the modal open. That is a UX
change beyond an analytics PR — it would alter what users see on failure and invalidate the
existing tests that assert `onClose` fires — so I took the revert instead. It does leave a
pre-existing oddity untouched: `setError` on the failure path writes to an unmounted
component, and the user sees only the failure toast. Worth a follow-up, not a drive-by here.

Note on the review's figures: it cited "955/955 across 29" suites. The measured number for
the PR's changed test files is **742/742 across 21** (`yarn jest <21 changed test files>
--runInBand`, console-baseline clean); the larger figure appears to count perps suites this
PR does not touch.

## Sixth pass — rev11 (final round, `0f6a89ee8e`)

Two of the four were mock-fidelity gaps, both confirmed by probe rather than inspection —
a throwaway suite importing `shared/constants/perps-events` printed the resolved values
before and after:

| Constant | Before | After | Real package |
| --- | --- | --- | --- |
| `PERPS_EVENT_PROPERTY.MARGIN_USED` | `undefined` | `"margin_used"` | `margin_used` |
| `SCREEN_TYPE.CREATE_TP_SL` | `undefined` | `"create_tpsl"` | `create_tpsl` |
| `SCREEN_TYPE.UPDATE_TP_SL` | `undefined` | `"edit_tpsl"` | `edit_tpsl` |

- **`MARGIN_USED`** was absent from the mock's property map, so the margin-failure
  regression test added in the fifth pass keyed its expectation on `undefined` — it
  asserted a payload production never emits and could not have caught a wrong key.
- **`SCREEN_TYPE.CREATE_TPSL` / `EDIT_TPSL`** were absent from the mock's `SCREEN_TYPE`
  block. This PR rewrote `perps-events.ts:68,70` to alias the Extension's historical
  `CREATE_TP_SL` / `UPDATE_TP_SL` onto those controller keys, so under Jest the TP/SL
  modal's screen view (`update-tpsl-modal.tsx:58-60`) carried `screen_type: undefined` in
  every run. Before this PR those were plain local literals, so it is a test-fidelity
  regression this PR introduced. (The mock's existing `CREATE_TP_SL` at :222 is in the
  `ACTION` block and does not cover it.)
- **Leverage fallback** — dropped `?? 0` on both abandon payloads
  (`close-position-modal.tsx:455`, `perps-order-entry-page.tsx:637`). A real position never
  has 0x leverage, so a zero was indistinguishable from a genuine reading; the key is now
  omitted when leverage is unknown, which is what mobile does.
- **`recipe-coverage.md`** — refreshed the currency header to the final code commit and
  pointed the live-capture row at `recipe-run-rev11-live/shot/call.png` (verified by
  reading the image: "Market not found" for `DOESNOTEXIST`, provider `capture-helper`,
  `runStatus: pass`). The header now scopes itself to the last *code* commit rather than
  the branch tip, so a docs-only commit after it does not stale it again — that drift is
  what rev10 and rev11 both flagged.

Validation: 742/742 across all 21 changed suites (console-baseline clean), ESLint clean on
changed files, `yarn lint:tsc` exit 0, oxfmt clean, 7/7 static AC nodes,
`TASK_ARTIFACT_CONTRACT_PASS`.
