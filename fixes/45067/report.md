# Update-Branch Report — PR #45067

## Strategy

**rebase** (`BRANCH_UPDATE_STRATEGY: rebase`) — `git rebase origin/main`.

- Base before: `1975751c14` → `5b44454253` (34 new commits on `main`)
- Branch commits replayed: 7
- Result: rebased tip `edd5bfe5db`

## Conflicted files

| File | Side preferred | Notes |
| --- | --- | --- |
| `shared/constants/perps-events.ts` | manual (both) | Additive on both sides |
| `ui/components/app/perps/cancel-order/cancel-order-modal.tsx` (commit `0c7f1712`) | manual (branch + main removal) | |
| `ui/components/app/perps/cancel-order/cancel-order-modal.tsx` (commit `83b1e434`) | main | |
| `test/mocks/metamask-perps-controller.js` | main | |

## Resolutions

### `shared/constants/perps-events.ts`

Both sides appended to the end of the file: `main` added the `PerpsAnalyticsEvent`
enum, the PR added `PERPS_EXTENSION_EVENT_PROPERTY` (the `stale_balance_shortfall`
key the withdraw guard reports). Kept both — they are independent additions.

**Follow-on fix (not a conflict hunk, but fallout):** `main` rewrote this file to
define `PERPS_EVENT_VALUE` as a local literal instead of spreading
`CONTROLLER_PERPS_EVENT_VALUE` from `@metamask/perps-controller`, and the pruned
literal dropped `ERROR_TYPE.VALIDATION` and the whole `ERROR_MESSAGE_KEY` group.
`ui/pages/perps/perps-withdraw-page.tsx` (PR code) references both, so the rebase
would not have compiled. Re-added `ERROR_TYPE.VALIDATION: 'validation'` and
`ERROR_MESSAGE_KEY.INSUFFICIENT_BALANCE: 'insufficient_balance'` with the same
values the controller exports — this preserves the PR's requirement that the
prevented withdrawal is reported as `error_type: validation`.

### `ui/components/app/perps/cancel-order/cancel-order-modal.tsx`

`main` deleted `ui/components/app/perps/utils/track-perps-error-screen.ts` and
renamed `SCREEN_NAME.PERPS_MARKET_DETAILS` → `SCREEN_NAME.MARKET_DETAIL`, and
restructured `handleCancel` so a `success: false` result throws into the `catch`
instead of being handled inline. Both conflict hunks were that restructure
colliding with the PR's edits to the inline branch.

- **Hunk 1 (catch block):** kept the PR's change — `translatePerpsError(...) ??
  t('perpsCancelOrderFailed')` feeding both `setError` and the failure toast —
  and dropped the `trackPerpsErrorScreenViewed(...)` call, whose helper no longer
  exists on `main`. The PR's intent (translated copy instead of raw provider
  prose) is preserved; only the deleted-upstream analytics call is gone.
- **Hunk 2 (`!result.success`):** took `main`'s `throw new Error(...)`. The PR's
  two behaviours for this path — quiet close on an already-closed order, and
  translated copy for everything else — are both already implemented in the
  `catch` block (the `isOrderNoLongerOpenError` early return merged cleanly from
  an earlier PR commit and runs before any analytics), so routing `success:
  false` through `catch` keeps them without resurrecting the deleted helper.
  Added a short comment stating why both paths converge there.

Verified against the PR's own merged test file: the already-closed cases still
close quietly with no `Perp Error`, `ORDER_UNKNOWN_COIN` still renders translated
copy, and untranslatable errors still fall back to `perpsCancelOrderFailed`.

### `test/mocks/metamask-perps-controller.js`

Took `main`. `main` pruned this Jest stub to the subset the code still imports
directly from `@metamask/perps-controller`; the PR's added
`ERROR_MESSAGE_KEY.INSUFFICIENT_BALANCE` entry (plus branch-base entries for
`SOURCE`/`ACTION`/`BUTTON_LOCATION`) is now dead — the UI reads those values from
the local `shared/constants/perps-events.ts` instead. Confirmed the only
remaining controller-sourced `PERPS_EVENT_VALUE` usage is
`SCREEN_TYPE.MARKET_LIST` in `perps-controller-init.test.ts`, which `main` keeps.

## Silent (non-conflicting) fallout found by validation

`app/scripts/messenger-client-init/perps-controller-init.test.ts` merged cleanly
but broke: `main` rewrote its local `jest.mock('@metamask/perps-controller', …)`
factory from a spread of the manual stub into a plain object literal, which drops
`PERPS_ERROR_CODES`. That was safe on `main`, but this branch reads
`PERPS_ERROR_CODES.ORDER_UNKNOWN_COIN` in `guardCancelOrder`, so 4 retry tests
failed with `Cannot read properties of undefined`. Restored the
`...jest.requireActual('…/test/mocks/metamask-perps-controller.js')` spread —
committed separately as `f5e8cc529b`. 141/141 tests pass after the fix.

## LavaMoat

The 34 incoming `main` commits changed 8 policy files
(`lavamoat/webpack/{mv2,mv3}/{main,beta,flask,experimental}/policy.json`), plus
`package.json`/`yarn.lock`. These are `main`-side changes only — the PR touches no
dependencies and no policy file conflicted, so nothing was regenerated. Worth a
glance from a reviewer only to confirm the incoming policy churn is the expected
upstream churn. `yarn install --immutable` succeeded against the updated lockfile.

## Push

```bash
git push --force-with-lease origin TAT-3490-feat-investigate-and-fix-reliabilit
```

## Validation

| Gate | Result |
| --- | --- |
| `yarn lint:json` / `lint:format` (prettier, oxfmt) | pass for all repo-tracked files |
| `yarn lint:eslint` | 0 errors in repo-owned code |
| `yarn lint:tsc` | pass (clean) |
| `yarn lint:styles` / `lint:images` / `messenger-action-types:check` | pass |
| `yarn verify-locales --quiet` | `No invalid entries!` |
| `yarn circular-deps:check` | pass |
| `cancel-order-modal.test.tsx` | 39/39 pass |
| `perps-controller-init.test.ts` | 141/141 pass (after `f5e8cc529b`) |
| `perps-withdraw-page.test.tsx`, `orderUtils.test.ts`, `perps-toast-provider.test.tsx` | pass |
| `mm-harness launch --verify` | pass — build + live verify, wallet fixture READY |

**Framework-injected paths tripping the lint gate (not patched, per agent rules):**
`yarn lint` fails only on paths the orchestrator/harness put in the tree, never on
project files. All 388 eslint error files are under `temp/recipe/runtime/runtime-dist/`
(the build snapshot step 7 creates); prettier/oxfmt additionally flag a stray
untracked `artifacts/recipe-run-current-harness/` at repo root plus
`temp/**`, `.claude/settings.local.json` and `licenseInfos.json` (all untracked or
gitignored). No project ignore/config file was modified — the gates were re-run
with the framework paths excluded to prove repo-owned code is clean.

## Risks / manual verification

- `main` now emits `Perp Order Cancel Transaction (failed)` + `Perp Error` for a
  `success: false` cancel, which the pre-rebase branch deliberately skipped to
  avoid duplicating controller-side analytics. That duplication risk is `main`'s
  behaviour, not something this rebase introduced, but it is worth a look from
  the analytics owner.
- `PERPS_EVENT_VALUE.ERROR_TYPE.VALIDATION` / `ERROR_MESSAGE_KEY` were re-added by
  hand to the local mirror of the controller contract. If the controller renames
  either, the mirror will drift silently.

---

## Self-Review Fixes

Review verdict was ISSUES (`artifacts/review-feedback.rev-claude.md`) — 4 code
issues plus 1 environmental finding. All 4 code issues fixed; the 5th is not
fixable in this diff (see below).

- **`ui/components/app/perps/utils/translate-perps-error.ts:104`** — added
  `CANCEL_ORDER_I18N_KEY_OVERRIDES` and an optional third `i18nKeyOverrides`
  argument to `translatePerpsError`, applied at all three resolution sites
  (code lookup, message-as-code, pattern match). Existing call sites are
  unchanged.
- **`ui/components/app/perps/cancel-order/cancel-order-modal.tsx:213`** — the
  cancel dialog now passes that override, so `ORDER_UNKNOWN_COIN` (and every
  other `ORDER_*` code) renders "Order could not be cancelled." instead of
  "Order could not be placed." on a screen where the user pressed Cancel order.
- **`ui/pages/perps/perps-withdraw-page.tsx:132`** — the adopted fresh balance is
  now keyed on a stream *revision* rather than the streamed value, so a stream
  that moves away and later reports the same number again no longer re-pins the
  older, lower fresh read (which the user could not clear from the page, because
  submit is capped at the pinned figure and the fresh read only runs from the
  submit handler).
- **`ui/components/app/perps/cancel-order/cancel-order-modal.tsx:187`** — the
  already-closed quiet-close path now emits `PerpsOrderCancelTransaction` with
  `status: success` and `cancel_outcome: already_closed`, so the attempt stays in
  the funnel; the real success path carries `cancel_outcome: cancelled` so the
  two are not conflated.
- **`shared/constants/perps-events.ts:195`** — added
  `PERPS_EXTENSION_EVENT_PROPERTY.CANCEL_OUTCOME` and
  `PERPS_EXTENSION_CANCEL_OUTCOME` to back the above. Not a flagged file, but the
  analytics fix needs a key and this is the extension-only namespace this PR
  already established for exactly this case (no controller equivalent exists).
- **`app/_locales/en/messages.json:7558`**, **`app/_locales/en_GB/messages.json:7558`**
  — `perpsToastCancelOrderAlreadyClosed` description corrected from "Info toast
  text" to "Success toast text", matching the `success` presentation the toast is
  actually registered with.

### Deviations from the prescribed fix

- Issue 2's prescription was a `useRef` counter. Implemented with the React
  "adjust state during render" pattern (`useState` + inequality guard) instead:
  the ref version is behaviourally identical but tripped
  `react-hooks/refs` — "Cannot access refs during render" — 4 times on the
  changed file. The state version introduces **zero** new lint warnings. Same
  revision semantics, same fix.

### Test updates

- `cancel-order-modal.test.tsx:494` — the assertion that codified the wrong copy
  now expects `perpsCancelOrderFailed` and asserts `perpsOrderFailed` is absent.
- `cancel-order-modal.test.tsx` — both already-closed tests assert the new funnel
  event; the success test asserts `cancel_outcome: cancelled`.
- `translate-perps-error.test.ts` — 4 new cases covering the override across all
  three resolution paths plus a key outside the map.
- `perps-withdraw-page.test.tsx` — new regression test
  "does not re-pin the released fresh balance when the stream reports the earlier
  value again". **Verified it fails on the old value-keyed code** (2 failures) and
  passes on the fix, so it is a real guard and not a tautology.

### Validation

| Gate | Result |
| --- | --- |
| `yarn jest` on the 3 changed suites | 108/108 pass |
| `mm-harness check diff --profile fast` | policy-suppressions / eslint / oxfmt / jest all **pass** |
| `yarn lint:changed` | 0 errors, 2 warnings — both pre-existing `react-hooks/set-state-in-effect` on untouched lines |
| `check-task-artifact-contract.mjs` | `TASK_ARTIFACT_CONTRACT_PASS` |

The `oxfmt` check initially failed on the stray untracked
`artifacts/recipe-run-current-harness/report.md` at repo root — a framework
leftover, not a repo file. Per agent rules it was not added to any ignore file;
the gate was re-run with it moved aside and passes on all repo-owned files.

### Issue 5 — recipe re-run (not fixable in this diff)

Re-ran the recipe after the fixes: **identical outcome to before them** — 5/6
nodes green, halting at `setup-select-account` with
`stateHooks.store.getState is unavailable`. `runtime-health` reports `status: PASS`
but `hasStore: false` / `hasSubmitRequest: false`, i.e. the slot is running a
production LavaMoat build with no state hooks. The graph never reaches an AC node,
so the run neither proves nor disproves these fixes — but the failure node and
cause are unchanged, so no regression was introduced. `--launch-existing-dist`
still exits `no configured slot maps to this repo`, matching the reviewer's
report. Fixing this needs the runtime path to produce a test build, or
`metamask.wallet.select_account` to gain a UI-driven fallback; both are outside
this diff.

---

## Self-Review Fixes — pass 2

Review verdict ISSUES (`artifacts/review-feedback.rev3-claude.md`) — 2 code issues plus
1 stale-evidence issue. All 3 addressed. **Two of the three were caused by the previous
fix pass**, so this pass partly reverts it.

- **`ui/pages/perps/perps-withdraw-page.tsx:345`** — a blocked withdrawal now always calls
  `setSubmitError(t('perpsWithdrawInsufficient'))`. Previously the message reached the user
  only as a side effect of the balance adoption, which goes inert when the stream ticks
  between the click and the read resolving (`handleContinue` closes over the revision
  captured at click time). In that race the user saw the click do nothing — and waking the
  service worker to serve the read is itself a common trigger for such a push, so the race
  sits directly in the targeted scenario.
- **`ui/pages/perps/perps-withdraw-page.tsx:602`** — the `submitError` alert is suppressed
  when it duplicates `validationMessage`, which is what the adopted balance produces on the
  same block. Guards against the same string rendering in two alert boxes.
- **`ui/components/app/perps/cancel-order/cancel-order-modal.tsx:185`** — **reverted the
  analytics event added in pass 1.** The already-closed path emits no UI transaction event;
  a comment states why. Verified the reviewer's claim in the dependency source before
  acting: `TradingService.cancelOrder`
  (`node_modules/@metamask/perps-controller/dist/services/TradingService.mjs:423-455`)
  tracks `submitted` before the round-trip and `executed`/`failed` after, unconditionally,
  and `app/scripts/controllers/perps/infrastructure.ts:176` wires that into MetaMetrics. The
  funnel gap that motivated the pass-1 event does not exist, and the event contradicted the
  controller's `failed` row for the same user action. Corroborated live: this pass's recipe
  run logs `ApiRequestError: cancel 0: Order was never placed, already canceled, or filled`
  from the service worker while the UI shows the neutral toast.
- **`shared/constants/perps-events.ts:196`** — removed `CANCEL_OUTCOME` and
  `PERPS_EXTENSION_CANCEL_OUTCOME`, now unused. No dead constants left behind.
- **`temp/tasks/fix/45067-0801-230839/artifacts/recipe-coverage.md`** — AC5 restated to
  cover the **withdrawal half only**. The cancel modal still emits
  `Perp Order Cancel Transaction` from the UI on the success and generic-failure paths
  (`cancel-order-modal.tsx:169,198`); both predate this PR. The stale "halts at
  `setup-select-account`" status is corrected throughout, and the superseded sections are
  labelled rather than silently rewritten.
- **`artifacts/recipe-quality.json`** — verdict `warn` → `pass`, `action_contract` /
  `perps_state_setup` / `evidence_contract_basics` `fail`/`warn` → `pass`, and the stale
  contextual findings replaced. `ac_coverage` stays `warn` for the AC3 gap below.
- **`artifacts/evidence-manifest.json`**, **`evidence-ac2-cancel-order-already-closed.png`**
  — refreshed with this run's own capture (read and verified visually, not trusted by
  filename: modal dismissed, green-check "This order is no longer open" toast, no error
  banner).

### Correction to my earlier reporting

My previous two passes reported that the recipe could not run on this slot because the
runtime was a production LavaMoat build with `hasStore: false`. That was wrong. The runtime
is fine; the checklist's `--launch-existing-dist` / `--project-root` invocation is stale for
harness 0.26.5. Attaching to the live CDP runtime (`--cdp-port 7666`, no `--slot`) runs the
graph green. I should have tried the plain invocation before concluding the environment was
at fault.

### Test updates

- `perps-withdraw-page.test.tsx` — new test "still tells the user why the withdrawal stopped
  when the stream ticks mid-read": holds `perpsGetAccountState` unresolved, ticks the stream
  via `rerender`, then resolves the read. **Verified it fails without the fix.**
- `cancel-order-modal.test.tsx` — both already-closed tests now assert
  `not.toHaveBeenCalledWith('Perp Order Cancel Transaction', …)`; the success test no longer
  asserts `cancel_outcome`.
- `test/jest/console-baseline-unit.json` — withdraw-page act-warning baseline 147 → 148.
  **Justification:** the new test deliberately holds the read open across an `act` boundary
  so the stream can tick mid-read; that is the condition under test, so the extra warning is
  not removable without removing the coverage. Tried wrapping the `rerender` in `act` and
  draining the pending promise inside `act` first — neither removed it.

### Validation

| Gate | Result |
| --- | --- |
| `yarn jest` on the 2 changed suites | 69/69 pass, no console-baseline violations |
| `mm-harness run` (recipe, rebuilt dist) | **pass — 28/28 nodes** |
| `mm-harness check diff --profile fast` | policy-suppressions / eslint / oxfmt / jest all pass |
| `yarn lint:changed` | 0 errors, 2 warnings — both pre-existing `react-hooks/set-state-in-effect` |
| `yarn verify-locales --quiet` / `circular-deps:check` | pass |
| `check-task-artifact-contract.mjs` | `TASK_ARTIFACT_CONTRACT_PASS` |

The recipe was re-run against a dist rebuilt from the current tree
(`refresh-build.sh --watcher-port 9012` then `runtime-launch`), so the green run exercises
these fixes rather than a stale build. Recipe side findings are environmental (dev-server
websocket refused, 404s, `Invalid chain ID "0x89"` from mock state) plus the two expected
already-closed provider errors the graph stages on purpose.

`oxfmt` again failed only on the stray untracked `artifacts/recipe-run-current-harness/report.md`
at repo root — a framework leftover, not a repo file. Not added to any ignore file; the gate
was re-run with it moved aside and passes on all repo-owned files.

### Known gap (not fixed, not fixable here)

AC3 — the fresh-read stale-balance guard, the larger half of the diff and the ticket's
largest failure bucket — has **no live recipe coverage**. It needs a suspended service
worker, which the harness cannot currently stage. It is unit-proven, including two
regression tests each verified to fail without their fix, but a reviewer should know the
live graph does not exercise it.

---

## Self-Review Fixes — pass 3

Review verdict ISSUES (`artifacts/review-feedback.rev4-claude.md`) — 4 findings, none
blocking. All 4 addressed.

- **`ui/pages/perps/perps-withdraw-page.tsx:301`** — documented the spot/abstraction
  read gap in the completeness check. **Chose documentation over the stronger options,
  deliberately** — see below.
- **`ui/pages/perps/perps-withdraw-page.tsx:371`** — `stale_balance_shortfall` is now
  measured against `availableNum` (the figure the block was decided on) instead of
  `streamedAvailableNum`, so it can no longer be reported negative once an earlier read
  has been adopted. Added `availableNum` to the `handleContinue` dependency array.
- **`ui/components/app/perps/utils/translate-perps-error.ts:9,118`** — typed
  `CANCEL_ORDER_I18N_KEY_OVERRIDES` against the literal key union. **The prescribed type
  alone does not work** — see below.
- **`ui/components/app/perps/cancel-order/cancel-order-modal.tsx:182`** — scoped the
  "no analytics here" comment to that path, named the two adjacent call sites that do
  duplicate the controller, said they predate this PR, and added an explicit "do not
  resolve this by re-adding an event here" so a later agent cannot undo the pass-2 revert
  in the wrong direction.

### Issue 1 — why documentation rather than a code change

The reviewer's analysis is correct and I verified it in the provider source:
`HyperLiquidProvider.getAccountState` (`:2010-2014`) `Promise.allSettled`s over spot,
per-dex perps, and `userAbstraction`; only the perps leg moves `subAccountBreakdown`, so a
failed spot or abstraction read passes the completeness check while
`addSpotBalanceToAccountState` (`accountUtils.mjs:122-151`) folds in no free spot USDC.

Both stronger options were rejected on evidence, not convenience:

- *"Skip the block when the fresh read is lower by roughly the streamed free-spot
  component"* — **not implementable.** `AccountState` exposes `totalBalance`,
  `spendableBalance`, `withdrawableBalance`, `marginUsed`, `unrealizedPnl`,
  `returnOnEquity`, `subAccountBreakdown`, `providerId`. There is no spot component to
  compare against, and the dropped-spot case is not even internally detectable: the early
  return on `spotBalance === 0` means *total and withdrawable both* lose spot together, so
  there is no inconsistency to spot.
- *"Require a second confirming read before blocking"* — closes the window, but pays for it
  on the wrong path. The extra round trip lands on every genuine stale-balance block, which
  is the exact case this PR exists to catch, to mitigate a rare transient that already
  self-heals on the next stream tick (the revision keying releases the adoption).

So the honest fix belongs in the controller: `getAccountState` should surface read
completeness. Until then the window is stated in the code where someone hitting it will
look. Trigger is narrow — HL Unified mode, free spot USDC, a transient spot/abstraction
failure, and a withdrawal above the perps-only figure — and the outcome is a false
"Insufficient balance" that clears on the next stream tick.

### Issue 3 — the prescribed type does not work as written

`Partial<Record<(typeof ERROR_CODE_TO_I18N_KEY)[PerpsErrorCode], string>>` resolves to
`Partial<Record<string, string>>` while `ERROR_CODE_TO_I18N_KEY` carries a
`Record<PerpsErrorCode, string>` annotation, because the annotation widens every value to
`string`. I confirmed this empirically: with only that change, a deliberately misspelled
override key (`perpsOrderFailedTYPO`) **still compiled**.

`satisfies` alone is also not enough — the map's keys are computed
(`[PERPS_ERROR_CODES.X]:`), so TS falls back to an index signature and re-widens the values.
The working form is `as const satisfies Record<PerpsErrorCode, string>`, which preserves the
literal union while keeping exhaustiveness. Re-planted the typo against that and it now
fails with `TS2561: 'perpsOrderFailedTYPO' does not exist in type 'Partial<Record<"somethingWentWrong" | … | "perpsNetworkError", string>>'. Did you mean to write 'perpsOrderFailed'?`

`translatePerpsError`'s `i18nKeyOverrides` parameter widened from `Record<string, string>`
to `Partial<Record<string, string>>` so the now-partial map is assignable; the existing
`?? i18nKey` fallback already handled a missing entry.

### Test updates

- `perps-withdraw-page.test.tsx` — new test "reports the shortfall against the adopted
  balance, never negative" reproducing the reviewer's scenario (stream $10, first read
  adopts $100, second read $50, request $60). **Verified it fails on the old formula with
  exactly the predicted `stale_balance_shortfall: -40`.**

### Validation

| Gate | Result |
| --- | --- |
| `yarn jest` on the 3 changed suites | 110/110 pass, no console-baseline violations |
| `yarn lint:tsc` (full) | **clean** — run deliberately: issue 3 changes a shared type surface |
| `mm-harness run` (recipe, rebuilt dist) | **pass — 28/28 nodes** |
| `mm-harness check diff --profile fast` | policy-suppressions / eslint / oxfmt / jest all pass |
| `yarn lint:changed` | 0 errors, 2 warnings — both pre-existing `react-hooks/set-state-in-effect` |
| `check-task-artifact-contract.mjs` | `TASK_ARTIFACT_CONTRACT_PASS` |

The recipe ran against a dist rebuilt from this tree (`refresh-build.sh` then
`runtime-launch`), and the AC2 screenshot was refreshed from this run and read to confirm
it shows the dismissed modal, the green-check "This order is no longer open" toast, and no
error banner.

Also corrected a stale artifact I left behind in pass 2: `recipe-quality.json`'s
`suggested_recipe_delta` still described the graph as blocked at `select_account`. It now
proposes the AC3 coverage route the reviewer suggested (stage the stale balance by
consuming margin out of band, as AC2 already does for the cancel race).

---

## Self-Review Fixes — pass 4

Review verdict ISSUES (`artifacts/review-feedback.rev5-claude.md`) — 2 findings. Both fixed.
Issue 1 was a **regression introduced by my own pass-2 fix**.

- **`ui/pages/perps/perps-withdraw-page.tsx:363`** — the blocked-withdrawal message no longer
  latches `perpsWithdrawInsufficient`. Pass 2 set that precise string into `submitError`,
  which nothing clears when the balance recovers, so once the stream caught up the page
  showed "Amount exceeds your available Perps balance." beside a **higher** balance and an
  **enabled** Submit button. The block now sets the generic
  `perpsWithdrawFailed` ("Withdrawal could not be completed. Try again."), which stays true
  about the past attempt and never contradicts the current screen. The precise message is
  left to `validationMessage`, which is derived from `availableNum` and therefore clears
  itself.
- **`ui/pages/perps/perps-withdraw-page.tsx:637`** — reverted the pass-2 string-equality
  dedup (`submitError !== validationMessage`) to a plain `!validationMessage` guard. With
  two distinct strings the equality hack no longer applies, and the rule is now simply
  "when the amount is invalid against the current balance, that message wins".
- **`ui/pages/perps/perps-withdraw-page.test.tsx:138`** — added typed `makeAccountState()` /
  `makeSubAccount()` helpers and removed **all nine** `AccountState`-shaped `as never` casts
  (the file had 3 before this PR; my earlier passes took it to 10). The remaining `as never`
  at :407 is an unrelated `getSelectedInternalAccount` selector stub, out of scope.

### Why the first shape of the fix was wrong

My first attempt scoped the block message to the stream revision it was decided at
(`blockedAtStreamRevision === streamRevision`). That cleanly fixed this issue but **broke the
pass-2 mid-read test**: in that race the stream ticks *during* the read, so the revision has
already advanced by the time the block is recorded and the message never rendered — exactly
the silent no-op pass 2 existed to prevent.

The two end states are indistinguishable (both show a higher balance and an enabled button),
so no revision or amount predicate can show the message in one and hide it in the other. The
resolution is not *when* to show it but *what* to say: a message that is still true after the
balance recovers. `perpsWithdrawFailed` already exists and reads correctly in both, so no new
copy was needed.

### Helper defaulting bug caught during the refactor

The first `makeAccountState()` defaulted `withdrawableBalance: '0'`. Because
`getTradeableBalance` is `withdrawableBalance ?? spendableBalance`, a *present* '0' beat the
`spendableBalance` the tests actually set, zeroing the balance and failing 8 tests. It now
mirrors `spendableBalance` unless the caller sets it explicitly.

### Test updates

- `perps-withdraw-page.test.tsx` — added the reviewer's assertion to "releases the adopted
  fresh balance once the stream reports a new balance"; updated the mid-read test to expect
  the generic copy and to assert the precise copy is **absent**. Both were confirmed to fail
  against the pass-2 behaviour (2 failures) and pass on the fix.

### Validation

| Gate | Result |
| --- | --- |
| `yarn jest` on the 3 changed suites | 110/110 pass, no console-baseline violations |
| `yarn lint:tsc` (full) | clean |
| `mm-harness run` (recipe, rebuilt dist) | **pass — 28/28 nodes** |
| `mm-harness check diff --profile fast` | policy-suppressions / eslint / oxfmt / jest all pass |
| `yarn lint:changed` | 0 errors, **1** warning (was 2 — the cancel-modal warning is gone; the remaining one is pre-existing `react-hooks/set-state-in-effect`) |
| `check-task-artifact-contract.mjs` | `TASK_ARTIFACT_CONTRACT_PASS` |

Type safety of the new helper was verified rather than assumed: planting
`spendableBalanceTYPO` produces `TS2561 … Did you mean to write 'spendableBalance'?`, which
`as never` had silenced. AC2 evidence refreshed from this run and read to confirm it shows
the dismissed modal, the green-check toast and no error banner.

---

## Self-Review Fixes — pass 5

Review verdict ISSUES (`artifacts/review-feedback.rev6-claude.md`) — 2 findings. Both fixed.
Issue 1 is the **rev5 finding I only half-fixed**, so this pass corrects my own pass-4 work.

- **`ui/pages/perps/perps-withdraw-page.tsx:143`** — `submitError` is now cleared where the
  streamed reading advances, in the same render-phase adjustment that bumps `streamReading`.
  This is the fix pass 4 should have made.
- **`ui/pages/perps/perps-withdraw-page.tsx:625,638`** — added
  `data-testid="perps-withdraw-validation-error"` and
  `data-testid="perps-withdraw-submit-error"` to the two `role="alert"` boxes, so the only
  user-visible surface of AC3 is locatable by testId instead of translated copy.

### What I got wrong in pass 4

Pass 4 answered the rev5 latched-error finding by changing the copy from
`perpsWithdrawInsufficient` to the generic `perpsWithdrawFailed`, on the reasoning that a
generic message "stays true about the past attempt" and so does not contradict a recovered
balance. That reasoning was wrong twice over:

1. It did not remove the latch, which was the actual defect. The stale error still rendered —
   it just took a different route there: `validationMessage` clears when the balance
   recovers, and the `submitError && !validationMessage` guard then *starts* rendering the
   error it had been suppressing. Vaguer wording beside a $150 balance and an enabled Submit
   button is still wrong.
2. I had considered and rejected exactly this fix earlier in the same pass, on the grounds
   that clearing `submitError` on a balance change could also clear a genuine withdrawal
   failure. That trade-off is real but it is the lesser problem, and it does not justify
   shipping a known stale-error render.

The rule now is uniform and easy to state: **a new balance reading retires the previous
submit's outcome message**, whatever that message was. It fires only when the parsed
tradeable balance actually changes, not on every stream tick.

**Trade-off worth a reviewer's eye:** a genuine `perpsWithdraw` failure message is now also
cleared by the next balance change. For a user with open positions, unrealized PnL moves the
withdrawable balance, so that message can be short-lived. I judged this better than the
alternative — the controller also surfaces withdrawal outcomes, and after the balance moves
the failed attempt's context has genuinely changed — but if the analytics/UX owner disagrees,
the narrower version is to clear only the guard's own message.

### Test updates

- `perps-withdraw-page.test.tsx` — the reviewer's assertion added to "releases the adopted
  fresh balance once the stream reports a new balance", covering **both** copies plus both
  new testIds. Confirmed it fails without the clear (`found <p …>Withdrawal could not be
  completed. Try again.</p>`) and passes with it.
- Added positive testId assertions to the mid-read test and the insufficient-amount test, so
  the new testIds are exercised rather than merely present.

### Validation

| Gate | Result |
| --- | --- |
| `yarn jest` on the 3 changed suites | 110/110 pass, no console-baseline violations |
| `mm-harness run` (recipe, rebuilt dist) | **pass — 28/28 nodes** |
| `mm-harness check diff --profile fast` | policy-suppressions / eslint / oxfmt / jest all pass |
| `yarn lint:changed` | 0 errors, 1 warning (pre-existing `react-hooks/set-state-in-effect`) |
| `check-task-artifact-contract.mjs` | `TASK_ARTIFACT_CONTRACT_PASS` |

`recipe-quality.json`'s `suggested_recipe_delta` was updated: the "assert the blocked message"
item now names the two testIds this pass added, which is what makes that node writable.

---

## Self-Review Fixes — pass 6

Review verdict ISSUES (`artifacts/review-feedback.rev7-claude.md`) — 3 findings. All fixed.
Issue 1 is the trade-off I flagged in pass 5 and chose to accept; the reviewer showed that
choice was wrong, and this pass implements the narrower version I had described as the
alternative.

- **`ui/pages/perps/perps-withdraw-page.tsx:116,150`** — `submitError` now carries its
  origin (`{ message, fromStaleBalanceGuard }`), and the render-phase clear retires only the
  guard's own message. A genuine `perpsWithdraw` failure survives balance ticks.
- **`ui/pages/perps/perps-withdraw-page.tsx:648`** — the validation-message box is
  `aria-live="polite"` instead of `role="alert"`. It re-derives while the user types, so an
  assertive region interrupts a screen reader mid-word. The submit-error box stays
  assertive: it is a discrete result of pressing Submit.
- **`ui/components/app/perps/cancel-order/cancel-order-modal.tsx:188`** — replaced the
  rotted `~line 169` / `~line 198` references with named paths ("the success path above and
  the generic-failure path below").

### Why pass 5 was wrong

Pass 5 cleared **all** submit errors on a balance change and I recorded the trade-off in
this report as acceptable, reasoning that "the controller also surfaces withdrawal
outcomes". That reasoning does not survive checking: on this page a failed `perpsWithdraw`
has no toast, no navigation and no controller-driven UI state — the inline message is its
only surface. Combined with `withdrawableBalance` moving with unrealized PnL, any user
holding a position would lose the failure message within a tick and see a click that did
nothing. That is the same silent-no-op failure the pass-2 fix exists to prevent, reintroduced
on a different path. Flagging a known trade-off in a report is not a substitute for fixing
it.

### Two mistakes I made during this pass, both caught before commit

1. **A JSX comment placed inside a ternary branch** (`{cond ? ( {/* … */} <Box/> ) : null}`)
   is a syntax error. The suite then reported `Tests: 0 total` **and** the console-baseline
   reporter cheerfully announced "All 148 occurrences eliminated!" — an apparent improvement
   produced entirely by the suite failing to run. I had already edited the baseline to `0`
   before noticing; that edit is reverted and `console-baseline-unit.json` is unchanged in
   this pass. Worth remembering: a sudden baseline "improvement" is a suite-failure smell.
2. Changing the validation box to `aria-live` broke an existing `findByRole('alert')`
   assertion. Updated it to target the testId and assert `aria-live="polite"` explicitly, so
   the test now pins the intended semantics rather than the old role.

### Test updates

- `perps-withdraw-page.test.tsx` — the reviewer's probe is now a permanent assertion on
  "shows failure message and clears withdraw result when perpsWithdraw throws": a
  `$100 → $100.01` tick must leave the message and its testId in place.
- Both lifetimes are pinned in opposite directions, and I verified each catches its own
  regression: reverting to pass-5's clear-everything fails the genuine-failure test;
  reverting to pass-4's never-clear fails the adopted-balance-release test.
- The insufficient-amount test asserts `aria-live="polite"` on the validation box.

### Validation

| Gate | Result |
| --- | --- |
| `yarn jest` on the 3 changed suites | 110/110 pass, no console-baseline violations |
| `yarn lint:tsc` (full) | clean |
| `mm-harness run` (recipe, rebuilt dist) | **pass — 28/28 nodes** |
| `mm-harness check diff --profile fast` | policy-suppressions / eslint / oxfmt / jest all pass |
| `yarn lint:changed` | 0 errors, 2 warnings — both pre-existing `react-hooks/set-state-in-effect` |
| `check-task-artifact-contract.mjs` | `TASK_ARTIFACT_CONTRACT_PASS` |

AC2 evidence refreshed from this run and read to confirm the dismissed modal, the green-check
toast and no error banner.

---

## Self-Review Fixes — pass 7

Review verdict ISSUES (`artifacts/review-feedback.rev9-claude.md`) — 2 findings, both
a11y polish on the withdraw error surfaces ("Would not ship: nothing"). Both fixed.

- **`ui/pages/perps/perps-withdraw-page.tsx:653`** — the `aria-live="polite"` region is now
  mounted unconditionally and only its contents are conditional. Previously the region was
  inserted together with its text, which assistive tech commonly misses: a live region has
  to already be in the accessibility tree for a change inside it to be announced. The
  `data-testid` stayed on the inner conditional node, so every existing presence/absence
  assertion still means what it did.
- **`ui/pages/perps/perps-withdraw-page.test.tsx:1015`** — pinned the submit-error box's
  `role="alert"`. It was unpinned, which is how pass 6 could have dropped it silently.

### On pass 6's a11y swap

Pass 6 changed this box from `role="alert"` to `aria-live="polite"` for a real reason — the
line re-derives while the user types, and an assertive region interrupts a screen reader
mid-word. But `role="alert"` is announced on insertion, so swapping it onto a
conditionally-mounted node traded "announced but interrupting" for "possibly never
announced". The fix keeps the polite semantics and restores reliable announcement by making
the region permanent. Both properties now hold at once.

Not a regression against `main`, which rendered a bare `<Text>` with no live region at all —
this path only ever improved — but it was worth finishing properly rather than shipping a
region that might never fire.

### Mutation-probed rather than assumed

Issue 2 existed because a passing suite is not evidence that a contract is pinned. I probed
both a11y contracts after fixing:

- Deleting `role="alert"` from the submit-error box → "still tells the user why the
  withdrawal stopped when the stream ticks mid-read" fails.
- Collapsing the live region back onto the conditional node → "blocks the withdrawal when
  the fresh balance is below the entered amount" fails.

### Validation

| Gate | Result |
| --- | --- |
| `yarn jest` on the 3 changed suites | 110/110 pass, no console-baseline violations |
| `yarn lint:tsc` (full) | clean |
| `mm-harness run` (recipe, rebuilt dist) | **pass — 28/28 nodes** |
| `mm-harness check diff --profile fast` | policy-suppressions / eslint / oxfmt / jest all pass |
| `yarn lint:changed` | 0 errors, 1 warning (pre-existing `react-hooks/set-state-in-effect`) |
| `check-task-artifact-contract.mjs` | `TASK_ARTIFACT_CONTRACT_PASS` |

AC2 evidence refreshed from this run and read to confirm the dismissed modal, the green-check
toast and no error banner.
