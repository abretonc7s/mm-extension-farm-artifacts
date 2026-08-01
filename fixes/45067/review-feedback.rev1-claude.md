# Self-Review: MetaMask/metamask-extension#45067

## Verdict: ISSUES

## Summary

Second-pass review after the rev-claude fixes. All four code issues from the previous round are
genuinely fixed (cancel-context i18n override, revision-keyed fresh balance, already-closed funnel
event, locale description), the recipe now **passes end-to-end live** on this slot, and the withdraw
half of the PR is sound. The remaining issues are all on the cancel analytics: the fix added to
close the previous round's "attempt leaves the funnel" gap was written against a false premise —
the controller already emits `Perp Order Cancel Transaction` for that attempt, with the opposite
`status` — so the PR now ships a contradictory duplicate and leaves AC5 unmet for the cancel half.

**Diff scope note:** local `main` is stale at `9afac38fe7`, so `git diff main...HEAD` reports 196
files of upstream drift. The real PR diff is `git diff 5b44454253...HEAD` — **16 files, +1118/−111**.
All findings below are against that range.

## Type Check
- Result: PASS
- New errors: none. `yarn lint:tsc` was **not** run — the diff touches no `package.json`,
  `yarn.lock`, shared exported type, or controller/mock type contract, so the bounded gate applies.
- `yarn lint:changed` reports "No changed JS/TS/TSX/MTS/SNAP files to lint" (it diffs the working
  tree, which is clean on a fully-committed branch). Ran the same ESLint invocation the script uses
  on all 13 changed JS/TS files: **0 errors, 2 warnings**, both pre-existing
  `react-hooks/set-state-in-effect` on untouched lines (`cancel-order-modal.tsx:90`,
  `perps-withdraw-page.tsx:185`). No new warning from the render-phase `setStreamReading` adjustment.
- `yarn verify-locales --quiet` → "No invalid entries!". `yarn circular-deps:check` → passed.

## Tests
- Result: PASS
- Details: 6 suites / **326 tests** pass — `perps-withdraw-page.test.tsx`,
  `cancel-order-modal.test.tsx`, `orderUtils.test.ts`, `translate-perps-error.test.ts`,
  `perps-controller-init.test.ts`, `perps-toast-provider.test.tsx`. No console-baseline violations
  (the PR lowers the withdraw-page act-warning baseline 148 → 147).

## Test Quality
- Findings: none found.
  - No `should` in any new/modified test name; no `toBeTruthy()`/`toBeDefined()`/`toBeFalsy()` added.
  - Assertions are specific: exact-object `mockTrack` assertion including
    `stale_balance_shortfall: 80`, `toStrictEqual` on the four `guardCancelOrder` results,
    `findByRole('alert')` for the blocked-withdrawal message.
  - i18n copy is sourced, not duplicated — every new assertion uses `messages.<key>.message`. The
    one raw string, `queryByText('ORDER_UNKNOWN_COIN')` (`cancel-order-modal.test.tsx:504`), asserts
    the raw provider code is **absent**, which is the correct use.
  - AAA blank-line separation is absent in the four new `translate-perps-error.test.ts` cases
    (`:284`, `:294`, `:301`, `:308`), but that matches the uniform style of all ~30 pre-existing
    cases in the same file. Not flagged — changing it would make the new tests the odd ones out.
  - Failure paths are covered and revert-sensitive: fresh read rejects → fail open and submit;
    partial sub-account read → fail open; retry `init()` throws → original failure preserved;
    retried cancel throws → that throw surfaces; stream re-reports the earlier value → no re-pin.
  - Verified the constants the analytics tests key on are real, not `undefined`-keyed tautologies:
    `PERPS_EVENT_PROPERTY.FAILURE_REASON` / `.SIZE` and `PERPS_EVENT_VALUE.ERROR_TYPE.VALIDATION` /
    `.ERROR_MESSAGE_KEY.INSUFFICIENT_BALANCE` all exist and match the controller's canonical values
    (`node_modules/@metamask/perps-controller/dist/constants/eventNames.mjs:320`, `:326`).

## Domain Anti-Patterns
- Findings: one accessibility nit (see Issues).
  - Import boundaries clean: `ui/` reaches the background only via `submitRequestToBackground`;
    `shared/` imports nothing from `app/`/`ui/`; the new `AccountState` import is `import type`, so
    it does not pull the ESM-only controller graph into the Jest module graph.
  - No direct controller mutation from UI. `perpsGetAccountState` is a registered read on the
    background API (`perps-controller-init.ts:157`, `:457`), not an invented method.
  - Error handling: every new swallow carries an explanatory comment on the line above — the
    `.catch(() => undefined)` fail-open (`perps-withdraw-page.tsx:290-299`) and the `catch { return
    result; }` around the retry `init()` (`perps-controller-init.ts:344-353`). No bare `catch (e) {}`.
  - Magic numbers named: `STALE_BALANCE_FAILURE_REASON`, `SHORTFALL_CENTS_ROUNDING`. No inline
    thresholds.
  - MV3: no module-level mutable state, no timers, no long-running SW work. The retry is one-shot.
  - No new interactive elements, so no missing testIDs; the new toast carries
    `data-testid="perps-toast-cancel-order-already-closed"` and the recipe asserts on it.
  - LavaMoat: no `package.json`, `yarn.lock`, or `lavamoat/**` file in the PR range.

## Mobile Comparison
- Status: DIVERGES (extension ahead on behaviour; behind on analytics ownership)
- Details:
  - `PerpsWithdrawView.tsx:109-121` reads only the streamed `withdrawableBalance` — no fresh-read
    guard. The extension's guard is net-new and worth porting back.
  - Mobile has no `isOrderNoLongerOpenError` equivalent; it shows a generic cancellation-failed
    toast for every failure. Extension ahead.
  - **Divergence that matters:** mobile emits **no** UI-side `Perp Order Cancel Transaction` or
    `Perp Withdrawal Transaction` — a grep across `metamask-mobile-ref/app/components/UI/Perps/`
    finds zero call sites; both are left entirely to the controller. The PR applies that reasoning
    to withdraw and the opposite to cancel. See Issues.
  - Minor: mobile maps `ORDER_UNKNOWN_COIN` to its own string
    (`translatePerpsError.ts:64` → `perps.errors.orderValidation.unknownCoin`); the extension routes
    it to the generic `perpsCancelOrderFailed` via the new override. Acceptable, and a strict
    improvement over the previous "Order could not be placed" copy.
  - No `.toFixed(N)` or `{min:2,max:2}` introduced anywhere in the diff.

## LavaMoat Policy
- Status: N/A
- Details: the PR range touches no dependency or policy file. The 8 policy files visible in the
  stale-`main` diff are upstream churn the rebase pulled in, not PR content.

## Fix Quality
- Best approach: **withdraw yes, cancel partially**.
  - **Withdraw.** Replacing `perpsValidateWithdrawal` with a fresh account-state read loses nothing
    (`HyperLiquidProvider.validateWithdrawal` is a stub returning `{ isValid: true }`, and
    `withdraw()` re-runs `validateWithdrawalParams` itself). Dropping the UI-side
    `Perp Withdrawal Transaction` events is correct dedup — the controller emits them
    (`PerpsController.mjs:1402`/`:1465`, `AccountService.mjs:180`/`:230`/`:274`) and the extension
    wires that sink (`app/scripts/controllers/perps/infrastructure.ts:389`). Verified, not assumed.
  - **Value parity is complete:** `availableNum` is the single source for all five render paths —
    display (`:565`), `validationMessage` (`:229`), `hasValidInputs` (`:239`) and both percentage
    paths (`:252`, `:255`). The blocked-submit path needs no `setSubmitError` because adoption is
    provably non-redundant whenever the block fires.
  - **The revision-keyed adoption is now correct.** Walked the state machine: no path re-pins a
    released figure, and the redundant-read short-circuit cannot mask a block.
  - **Cancel — pragmatic, not durable.** The root cause is provider-side ordering:
    `HyperLiquidProvider.cancelOrder` runs `validateCoinExists` (`:599`) *before*
    `#getAssetIdWithRepair` (`:607`), so the repair path built for exactly this case never runs and
    `ORDER_UNKNOWN_COIN` is returned without anything reaching the socket. An extension-side
    `init()` + retry is a defensible stopgap, but the durable fix is reordering those two calls in
    `@metamask/perps-controller`, which would also fix mobile and remove the double-emission in
    Issue 3. Worth an upstream ticket; not a blocker for this PR.
- Would not ship: the cancel analytics as written (Issues 1–2). The withdraw half is shippable as is.
- Test quality: **good** — see Test Quality. Reverting either fix fails the suite.
- Brittleness:
  - `ORDER_NO_LONGER_OPEN_PATTERN` matches free-form provider prose and breaks silently if
    HyperLiquid rewords the message. Documented as the analogue of `API_ERROR_PATTERNS`, which has
    the same exposure. Accepted.
  - `shared/constants/perps-events.ts` is a hand-maintained mirror of the controller contract; the
    re-added `ERROR_TYPE.VALIDATION` / `ERROR_MESSAGE_KEY` values were verified against the
    controller today, but nothing enforces that they stay in sync. Already recorded in `report.md`.

## Diff Quality
- Minimal: **yes** — 16 files, all perps-scoped plus the two locale files and the required
  `console-baseline-unit.json` 148 → 147 edit. `git diff -w` shows no whitespace-only hunks; no
  reformatting, no import churn, no unrelated edits.
- Debug code: none — no `console.log`, `debugger`, `TODO`, `FIXME`, or commented-out alternatives.

## Recipe
- Present: yes (`artifacts/recipe.json`, `recipe-quality.json`, `recipe-coverage.md`).
- Quality: **good** — and, unlike the previous round, it **passes**. Re-ran it against the current
  code on CDP 7666: `runtime-health` → `status: PASS` with `hasStore: true` / `hasSubmitRequest:
  true` (the production-LavaMoat blocker from the last review is gone on this slot), and
  `mm-harness run` → **`status: pass`, exit 0, all 28 nodes executed**
  (`artifacts/recipe-run-rev1/trace.json`). Notes:
  - It tests the actual fix, not "app boots": `ac2-cancel-out-of-band` closes the order via
    `metamask.perps.close_orders` so the modal holds a stale order, then `ac2-wait-toast` waits on
    `test_id: perps-toast-cancel-order-already-closed` — the exact testID this PR introduces.
  - It seeds its own data: `start_state` → `ensure_orders` places a live testnet ETH order per AC,
    `assert_orders` verifies removal, `teardown_state` cleans up. It cannot pass on an empty wallet.
  - Assertions are specific (testID + `assert_orders` against `background-perpsGetOpenOrders`), not
    `not_null`. The screenshot node follows a `ui.wait_for` on the claimed target.
  - `--project-root` is rejected by harness 0.29.3 (use `--target`), and `--launch-existing-dist`
    still exits "no configured slot maps to this repo"; the run succeeds against the live CDP
    session without it. Worth fixing in the checklist command, not in this diff.
  - Caveat: coverage is **cancel-only**. AC3 (stale-balance withdraw guard) and AC4
    (`ORDER_UNKNOWN_COIN` retry) have unit proof only — no live node exercises the withdraw page.
    Acceptable for this PR, but the recipe title/scope should say so.
  - Run diagnostics flag 5 app events; 2 are the AC2 scenario's own
    `cancel 0: Order was never placed, already canceled, or filled` logged by the controller (see
    Issue 1), the rest are unrelated (`autoLockTimeLimit` metadata, a 404, "Sentry not initialized").

## Visual Evidence
- Status: OK — all three PNGs read with the Read tool, not judged from filenames.
  - `before-ac2-cancel-order-error.png`: cancel modal open on `#/perps/market/ETH` with the raw
    provider prose in the in-modal error banner **and** a "Failed to cancel order" toast. Matches its
    label exactly.
  - `evidence-ac2-cancel-order-already-closed.png` (manifest, parent run): modal closed, market page
    clean, green-check "This order is no longer open" toast fully visible above the fold.
  - `recipe-run-rev1/screenshots/evidence-ac2-cancel-order-already-closed.png` (**captured live in
    this review's passing run**): same state on the current code — no error banner, success toast
    visible. AC2 is no longer inherited; it is proved on this tree.
  - `check-task-artifact-contract.mjs` → `TASK_ARTIFACT_CONTRACT_PASS`. No `FAIL_VISUAL_CLASSIFICATION`,
    no `FAIL_EMPTY`, no `MISSING:`, no `FAIL_INVALID_SCREENSHOT_PROVIDER`. `recipe-coverage.md` marks
    AC2 `mixed` and both manifest entries resolve to non-empty files.

## Issues

- **ui/components/app/perps/cancel-order/cancel-order-modal.tsx:190** — the already-closed path
  emits `Perp Order Cancel Transaction` with `status: success`, but the controller emits the **same
  event name with `status: failed`** for the same attempt. `TradingService.cancelOrder` tracks
  `OrderCancelTransaction` `{status: failed, error_message: 'cancel 0: Order was never placed…'}` on
  a `success: false` result (`node_modules/@metamask/perps-controller/dist/services/TradingService.mjs:448`),
  and the extension wires that metrics sink into the controller
  (`app/scripts/controllers/perps/infrastructure.ts:389`). Confirmed live: this review's passing
  recipe run logs `[extension:sw] ERROR ApiRequestError: cancel 0: Order was never placed…` at the
  exact AC2 node. So the premise this event was added on — "the attempt disappears from the funnel
  entirely" (rev-claude issue 3) — was wrong; the attempt was already in the funnel as `failed`, and
  the fix now ships two contradictory rows for one cancel (`submitted` + `failed` from the
  controller, `success` from the UI). Fix: drop the UI-side cancel-transaction emissions and let the
  controller own the funnel, as this PR already did for withdraw and as mobile does. If the
  `already_closed` distinction is wanted, it belongs on the controller event or on a separate
  extension-only event name — not as a `success` duplicate of a `failed` row.
- **ui/components/app/perps/cancel-order/cancel-order-modal.tsx:171** — AC5 ("the UI no longer emits
  duplicate `Perp Withdrawal Transaction` / `Perp Order Cancel Transaction`") is marked PROVEN in
  `artifacts/recipe-coverage.md`, but only the withdrawal half is done. The UI still emits
  `PerpsOrderCancelTransaction` on the success path (`:171`) and the failure path (`:207`), both
  duplicating the controller's `submitted`/`executed`/`failed` triplet, and this round added a
  third at `:190`. Either delete those emissions or narrow the AC statement to withdrawal — as
  written the artifact claims something the code does not do.
- **app/scripts/messenger-client-init/perps-controller-init.ts:355** — the retry calls `fn(...args)`,
  which re-enters `PerpsController.cancelOrder` → `TradingService.cancelOrder`, so one user cancel
  emits **two** `Perp Order Cancel Transaction` `submitted` events plus two terminal events
  (`failed`, then `executed`). That inflates the cancel funnel for exactly the service-worker-restart
  / HIP-3 population the retry targets. Not a correctness bug and there is no clean UI-layer fix, but
  it contradicts the PR's own "do not conflate outcomes" reasoning and should at minimum be stated in
  the guard's doc comment and flagged to the analytics owner.
- **ui/components/app/perps/cancel-order/cancel-order-modal.tsx:422** — the in-modal error banner has
  no `role="alert"`, while this same PR added `role="alert"` to both message surfaces on the withdraw
  page (`perps-withdraw-page.tsx:585`, `:596`). Same class of message, same PR, one-line fix — a
  screen reader announces the withdraw error and silently drops the cancel error.
- **temp/tasks/fix/45067-0801-230839/artifacts/recipe-quality.json:3** — stale and now misleading.
  It records `verdict: "warn"` with reasons "no AC node was reached" and "halts at
  setup-select-account … production LavaMoat build", and `recipe-coverage.md` marks AC1/AC2 as
  inherited on that basis. Both are false as of this review: `runtime-health` reports
  `hasStore: true` / `hasSubmitRequest: true`, and the recipe runs all 28 nodes to `status: pass`
  with a fresh AC2 screenshot (`artifacts/recipe-run-rev1/`). Refresh both sidecars so a human
  reviewer is not told the recipe cannot be driven on this slot.
