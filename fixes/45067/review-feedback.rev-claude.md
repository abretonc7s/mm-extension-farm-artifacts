# Self-Review: MetaMask/metamask-extension#45067

## Verdict: ISSUES

## Summary

This is an **update-branch** run (rebase onto `origin/main` `5b44454253`, 8 commits replayed, 3
conflict hunks + 1 silent test-mock breakage resolved). The PR itself is a perps reliability fix:
a fresh account-state read guards stale-balance withdrawals, an `ORDER_UNKNOWN_COIN` cancel is
retried once after `init()`, an already-closed order closes quietly, and duplicated
`Perp Withdrawal Transaction` UI analytics are dropped in favour of the controller's own emission.
The rebase resolutions are correct and the fix logic is sound; the issues below are one wrong
user-facing string, one staleness edge in the adopted-balance logic, one analytics gap, and a
non-passing recipe re-run (environmental).

**Diff scope note:** local `main` is stale at `9afac38fe7`, so `git diff main...HEAD` reports 194
files of main-drift. The real PR diff is `git diff origin/main...HEAD` — **14 files, +902/−108**.
All findings below are against `origin/main`.

## Type Check
- Result: PASS
- New errors: none. `yarn lint:tsc` was **not** run — the diff touches no dependency, public type,
  or controller/mock type contract (no `package.json`/`yarn.lock` change), so the bounded gate
  applies. ESLint ran on all 11 changed JS/TS files with the project config: 0 errors, 2 warnings,
  both pre-existing `react-hooks/set-state-in-effect` on untouched lines
  (`cancel-order-modal.tsx:85`, `perps-withdraw-page.tsx:166`).
- `yarn lint:changed` reports "No changed JS/TS/TSX/MTS/SNAP files to lint" — it diffs the working
  tree only, which is clean on a fully-committed branch. Ran `npx eslint <changed files>` instead.
  `yarn verify-locales --quiet` PASS, `yarn circular-deps:check` PASS.

## Tests
- Result: PASS
- Details: 4 suites / **268 tests** pass — `perps-withdraw-page.test.tsx`,
  `cancel-order-modal.test.tsx`, `orderUtils.test.ts`, `perps-controller-init.test.ts`.
  No console-baseline violations (the PR lowers the withdraw-page act-warning baseline 148 → 147).

## Test Quality
- Findings: none found.
  - No `should` in any new/modified test name; no `toBeTruthy()`/`toBeDefined()` added.
  - Assertions are specific: `toStrictEqual` on the guard results, an exact-object `mockTrack`
    assertion for the blocked-withdrawal event including `stale_balance_shortfall: 80`.
  - i18n copy is sourced, not duplicated — `messages.perpsCancelOrderFailed.message`,
    `messages.perpsWithdrawInsufficient.message`, `` `${messages.perpsAvailableBalance.message}$20.00` ``.
    The PR actively *removed* hardcoded copy (`'Order not found'`, `'Network error'`).
  - Failure paths are covered: fresh-read rejects → fail open and submit; partial sub-account read →
    fail open; retry `init()` throws → original failure preserved; retried cancel throws → that throw
    surfaces. Reverting either fix fails these tests.
  - `cancel-order-modal.test.tsx:29` replaces a hand-maintained `PERPS_TOAST_KEYS` mock with
    `jest.requireActual` — good catch, the stub was silently emitting `key: undefined`.
  - `as never` casts on mocked account state match the pre-existing pattern in the same file
    (lines 224/359/516 on `origin/main`), so not flagged as new.

## Domain Anti-Patterns
- Findings: none found.
  - Import boundaries clean: `ui/` reaches the background only via `submitRequestToBackground`;
    `shared/` imports nothing from `app/`/`ui/`.
  - No direct controller mutation from UI; `perpsGetAccountState` is a read through the background API.
  - Error handling: every new swallow is documented on the line above — the `.catch(() => undefined)`
    fail-open on the fresh read (`perps-withdraw-page.tsx:271-280`) and the `catch {}` around the
    retry `init()` (`perps-controller-init.ts:349-357`). No bare `catch (e) {}`.
  - No new interactive elements, so no missing testIDs; the blocked-withdrawal message got
    `role="alert"` (`perps-withdraw-page.tsx:565`, `:576`) and is asserted via `findByRole('alert')`.
  - MV3: no module-level mutable state, no timers, no long-running SW work added.

## Mobile Comparison
- Status: DIVERGES (extension ahead on behaviour, behind on one string)
- Details:
  - `PerpsWithdrawView.tsx:109-121` (mobile) reads only the streamed `withdrawableBalance` — there is
    no fresh-read guard. The extension's guard is net-new and worth porting back.
  - Mobile has no equivalent of `isOrderNoLongerOpenError`; `PerpsOrderDetailsView.tsx:242-247` shows a
    generic `cancellationFailed` toast for every failure, including already-closed. Extension ahead.
  - **Divergence that matters:** mobile maps `ORDER_UNKNOWN_COIN` to a dedicated string
    (`translatePerpsError.ts:64` → `perps.errors.orderValidation.unknownCoin`), while extension maps it
    to `perpsOrderFailed` — see Issues.
  - No `.toFixed(N)` or `{min:2,max:2}` introduced anywhere in the diff.

## LavaMoat Policy
- Status: N/A
- Details: the PR touches no `package.json`, `yarn.lock`, or `lavamoat/**` file. The 8 policy files in
  the stale-`main` diff are upstream churn the rebase pulled in, not PR content.

## Fix Quality
- Best approach: **yes**, with one caveat.
  - Replacing `perpsValidateWithdrawal` with a fresh account-state read loses nothing:
    `HyperLiquidProvider.validateWithdrawal` (`node_modules/@metamask/perps-controller/dist/providers/HyperLiquidProvider.mjs:2657`)
    is a stub returning `{ isValid: true }`, and `withdraw()` runs `validateWithdrawalParams` itself.
  - Dropping the UI-side `Perp Withdrawal Transaction` events is correct dedup — the controller emits
    them (`PerpsController.mjs:1402`/`:1465`, `AccountService.mjs:180`/`:230`/`:274`).
  - `guardCancelOrder` is correctly layered on `guardWrite` (no benign-disconnect retry for a write),
    checks the resolved value rather than a throw because the provider returns `success: false`, and
    keeps the retried call outside the guard so a real throw is not masked.
  - Value parity is complete: `availableNum` feeds all five render paths — display (`:545`),
    `validationMessage` (`:210`), `hasValidInputs` (`:220`), and both percentage/Max paths (`:233`, `:236`).
  - Caveat: the adopted-balance state machine is the one place a simpler shape exists (see Brittleness).
- Would not ship: the `perpsOrderFailed` copy in the cancel dialog (Issue 1). Everything else is
  shippable as-is.
- Test quality: **good** — see Test Quality.
- Brittleness: the adopted fresh balance is keyed on the streamed *value*
  (`perps-withdraw-page.tsx:130-133`, `:300-303`). Value equality cannot distinguish "stream still
  stale" from "stream genuinely returned to that number", and the fresh read only runs inside
  `handleContinue`, which the disabled submit button blocks after a block. See Issue 2.

## Diff Quality
- Minimal: **yes** — 14 files, all perps-scoped. No reformatting, no import churn, no unrelated edits.
  The `console-baseline-unit.json` 148 → 147 edit is required by the baseline gate.
- Debug code: none — no `console.log`, `TODO`, `FIXME`, `debugger`, or commented-out alternatives in
  the diff.

## Recipe
- Present: yes (`artifacts/recipe.json`, plus `recipe-quality.json` verdict `warn` and
  `recipe-coverage.md`).
- Quality: **weak** — for environmental reasons, not authoring reasons. The graph seeds its own
  testnet order state (`start_state` / `ensure_orders` / `close_orders` / `teardown_state`), uses
  manifest-declared actions, and asserts on specific testIDs, so the design is sound. But the re-run
  required by this checklist **did not pass**:
  - `runtime-health` on CDP 7666 reports `hasStore: false`, `hasSubmitRequest: false`,
    `backgroundProbeError: "submitRequestToBackground is not a function"` — the slot is running a
    production LavaMoat build with no state hooks.
  - The recorded run halts at node 6/6, `setup-select-account`, with
    `stateHooks.store.getState is unavailable` (`recipe-run/trace.json`). No AC node executes, so
    AC1/AC2 rest on inherited parent-run evidence.
  - I could not produce a fresh run at all: `mm-harness` 0.26.5 rejects `--project-root`, and with
    `--target`/`--slot` it exits `no configured slot maps to this repo`. Harness/slot-config defect,
    not a product defect — same tree passes ESLint, locales, circular-deps, and 268 unit tests.
  - Per the checklist's own rule ("Did the re-run actually pass? If not, verdict must be `ISSUES`"),
    this alone sets the verdict.

## Visual Evidence
- Status: OK — both PNGs read and verified, not judged from filenames.
  - `before-ac2-cancel-order-error.png`: modal open on `#/perps/market/ETH`, raw provider prose
    `cancel 0: Order was never placed, already canceled, or filled. asset=4` visible in the in-modal
    error banner *and* in a "Failed to cancel order" toast. Matches its label exactly.
  - `evidence-ac2-cancel-order-already-closed.png`: modal closed, market page clean, green-check toast
    reading "This order is no longer open" fully visible above the fold. Matches its label exactly.
  - `check-task-artifact-contract.mjs` → `TASK_ARTIFACT_CONTRACT_PASS`; no `FAIL_VISUAL_CLASSIFICATION`,
    no `FAIL_EMPTY`, no `MISSING:`, no `FAIL_INVALID_SCREENSHOT_PROVIDER`. `recipe-coverage.md` marks
    AC2 `mixed` and both manifest entries resolve to non-empty files.

## Issues

- **ui/components/app/perps/cancel-order/cancel-order-modal.tsx:202** — the cancel dialog shows
  order-*placement* copy for cancel failures. `translatePerpsError` maps `ORDER_UNKNOWN_COIN` (and
  every other `ORDER_*` code) to `perpsOrderFailed` = "Order could not be placed. Try again.", which
  is wrong on a screen where the user just pressed Cancel order — and this PR makes that path more
  reachable by adding the retry. The correct string already exists in the same fallback:
  `perpsCancelOrderFailed` = "Order could not be cancelled. Try again.". The PR's own test
  (`cancel-order-modal.test.tsx:480`) asserts `messages.perpsOrderFailed.message`, so it codifies the
  wrong copy. Fix: resolve the code in the modal (or add a cancel-context override map to
  `translate-perps-error.ts`) so `ORDER_*` codes fall back to `perpsCancelOrderFailed`, then update
  that assertion. Mobile avoids this by giving the code its own string
  (`translatePerpsError.ts:64` → `perps.errors.orderValidation.unknownCoin`).
- **ui/pages/perps/perps-withdraw-page.tsx:130** — the adopted fresh balance can silently re-pin a
  stale, lower figure with no in-page way out. `availableNum` re-adopts `freshBalance.available`
  whenever `freshBalance.streamed === streamedAvailableNum`, so if the stream moves away from the
  captured value and later reports that same number again (reconnect replaying the cached figure, or
  the balance genuinely returning to it), the page snaps back to the older fresh read. Because
  `hasValidInputs` caps the amount at `availableNum` (`:220`) and the fresh read only runs inside
  `handleContinue` (`:278`), submit is disabled for anything above the pinned figure — the user cannot
  trigger a new read and must leave and re-enter the page. Fix: key the adoption on a stream revision
  instead of the value (a `useRef` counter bumped whenever `streamedAvailableNum` changes, compared
  against the revision captured in `freshBalance`).
- **ui/components/app/perps/cancel-order/cancel-order-modal.tsx:178** — the already-closed quiet-close
  path emits no analytics at all: no `PerpsOrderCancelTransaction` (success or failed), no
  `PerpsError`. The cancel attempt disappears from the funnel entirely. This contradicts the reasoning
  the same PR applies to the withdraw guard, which deliberately reports its prevented case
  ("prevented failures silently leave the funnel", `perps-withdraw-page.tsx:319-321`). Emit a
  cancel-transaction event with a distinguishing reason for the already-closed outcome, or state in
  the comment why this one is intentionally invisible.
- **app/_locales/en/messages.json:7558** — the `perpsToastCancelOrderAlreadyClosed` description says
  "Info toast text", but the toast is registered with the **success** presentation
  (`perps-toast.presentation.tsx:98`, green check). Success is the right variant (`info` renders a
  loading spinner, which would be wrong for a terminal state) — the description is what should change.
- **temp/tasks/fix/45067-0801-230839/artifacts/recipe-run/trace.json:1** — the recipe re-run does not
  pass on this slot: it halts at `setup-select-account` with `stateHooks.store.getState is unavailable`
  because the runtime is a production LavaMoat build (`runtime-health`: `hasStore: false`). No AC node
  executes, so AC1/AC2 evidence is inherited from the parent run rather than re-proved here. Not a
  product defect and not fixable in this diff — the runtime path (`ensure-runtime-ready.sh` /
  `mm-harness launch`) must produce a test build, or `metamask.wallet.select_account` needs a
  UI-driven fallback. Recorded so the ISSUES verdict is not read as a code regression.
