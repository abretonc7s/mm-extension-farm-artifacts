# Self-Review: MetaMask/metamask-extension#45067

## Verdict: ISSUES

## Summary
The branch fixes two Perps reliability gaps: the withdraw page now re-reads account state
before submitting so a stale streamed balance cannot produce a doomed withdrawal, and the
cancel flow now retries once on `ORDER_UNKNOWN_COIN`, closes out quietly when the order is
already off the book, and shows translated copy instead of raw provider prose. Both fixes are
technically correct — I verified the guard against the real `@metamask/perps-controller@10.0.0`
and `@nktkas/hyperliquid` error paths, and the recipe now runs **green end-to-end** on this slot
(28/28 nodes), proving AC1/AC2 live rather than by carry-forward. Two issues remain: a blocked
withdrawal can produce zero user feedback when the stream ticks during the fresh read, and the
already-closed cancel path emits a UI analytics event that contradicts the one the controller
emits for the same attempt.

Note on scope: local `main` is 3 days stale, so `git diff main...HEAD` shows 196 files. The
task diff (`5b44454253..HEAD`, 9 commits) is **16 files, +1118/−111**; this review covers that.

## Type Check
- Result: PASS
- New errors: none. Broad `yarn lint:tsc` was **not** run (per checklist default — no
  dependency/public-type surface changed; `package.json`/`yarn.lock`/policy files are untouched
  by the task diff). ESLint over the 16 changed files: **0 errors, 2 warnings**, both
  pre-existing `react-hooks/set-state-in-effect` on untouched lines
  (`cancel-order-modal.tsx:90`, `perps-withdraw-page.tsx:185`).
- `yarn verify-locales --quiet` → `No invalid entries!`; `yarn circular-deps:check` → pass.
  `yarn lint:changed` reports "No changed JS/TS/TSX/MTS/SNAP files" because it lints the
  working tree only and everything is committed — hence the direct ESLint run above.

## Tests
- Result: PASS
- Details: 5 suites / **309 tests** pass —
  `perps-controller-init.test.ts`, `cancel-order-modal.test.tsx`, `orderUtils.test.ts`,
  `translate-perps-error.test.ts`, `perps-withdraw-page.test.tsx`. No console-baseline
  violations (the withdraw suite's act-warning budget was correctly decremented 148 → 147).

## Test Quality
- Findings: none found.
  - No `should` in any new test name; AAA with blank-line separation; async interactions
    wrapped in `act()`; assertions are specific (`toStrictEqual`, `toHaveBeenCalledWith` with
    full property objects, `not.toHaveBeenCalledWith('Perp Error', …)`).
  - i18n copy comes from `messages.*.message`, never hardcoded literals — e.g.
    `cancel-order-modal.test.tsx:452` uses `messages.perpsCancelOrderFailed.message`.
  - Replacing the hand-maintained `PERPS_TOAST_KEYS` mock with `jest.requireActual`
    (`cancel-order-modal.test.tsx:32`) is a genuine improvement: the old stub would have
    silently emitted `key: undefined` for the new toast.
  - Failure paths are covered (init throws during retry, retried cancel throws, partial
    sub-account read, fresh-read rejection) and the tests would fail if the fix were reverted —
    the worker reports verifying the re-pin regression test fails on the pre-fix code.
  - Gap tied to Issue 1 below: no test drives a stream update *while* the fresh read is in
    flight.

## Domain Anti-Patterns
- Findings: none found.
  - **Error handling**: both new swallows are documented on the line above, as the rule
    requires — `perps-withdraw-page.tsx:290-299` (`.catch(() => undefined)`, "Fails open") and
    `perps-controller-init.ts:341-347` (`catch { return result; }`).
  - **Shared state**: `ORDER_NO_LONGER_OPEN_PATTERN` (`orderUtils.ts:27`) is module-level but
    has no `g` flag, so no `lastIndex` carry-over.
  - **Magic numbers**: `STALE_BALANCE_FAILURE_REASON` / `SHORTFALL_CENTS_ROUNDING` are named
    constants; the new analytics keys live in `shared/constants/perps-events.ts`.
  - **testIDs / a11y**: the new toast carries `perps-toast-cancel-order-already-closed`; both
    error messages gained `role="alert"` wrappers (`perps-withdraw-page.tsx:585,596`).
  - **Import boundaries / controller usage / MV3 / LavaMoat**: clean. `submitRequestToBackground`
    is called directly from the page, matching the file's three pre-existing call sites.

## Mobile Comparison
- Status: DIVERGES (deliberately, and defensibly)
- Details:
  - **Aligned** — dropping the UI-side `Perp Withdrawal Transaction` events matches mobile:
    `PerpsWithdrawView.tsx:250-330` emits nothing itself and leaves the event to the controller.
    I confirmed `AccountService.withdraw` emits `executed` / `failed` / catch-`failed`, so this
    is a de-duplication, not analytics loss.
  - **Aligned** — showing translated copy instead of provider prose matches mobile's generic
    `cancellationFailed` toast (`PerpsOrderDetailsView.tsx:240-245`).
  - **Diverges (extension-only, justified)** — the pre-submit fresh account-state read has no
    mobile equivalent; mobile has no service worker to suspend the account stream. Same for the
    `ORDER_UNKNOWN_COIN` retry (`perps-controller-init.ts:315-360`).
  - **Diverges (worth back-porting)** — the already-closed quiet close is extension-only; mobile
    still shows "cancellation failed" for an order that is already gone.
  - No formatting drift: no new `.toFixed(n)` or `{min:2, max:2}` anywhere in the diff.

## LavaMoat Policy
- Status: N/A
- Details: the task diff touches no `package.json`, `yarn.lock`, or `lavamoat/` file. The policy
  churn visible against stale local `main` comes from the 34 upstream commits the branch rebased
  onto, not from this PR.

## Fix Quality
- Best approach: yes, with one correction — see Issue 1. The withdraw guard is the right shape
  (fail open on read failure, fail open on partial HIP-3 reads, adopt the fresh figure so the
  block is actionable), and the cancel retry sits at the right layer. I verified both against the
  real dependency code rather than the mocks:
  - `HyperLiquidProvider.cancelOrder` throws `new Error('ORDER_UNKNOWN_COIN')` from
    `validateCoinExists` *before* the exchange client is prepared, and `createErrorResult` turns
    it into `{ success: false, error: 'ORDER_UNKNOWN_COIN' }` — exactly the resolved-value shape
    `guardCancelOrder` inspects.
  - The already-closed string is produced by `@nktkas/hyperliquid`'s bulk-error formatter
    (`api/exchange/_methods/_base/errors.js`) as `cancel 0: <status error>`, so the
    `/never placed, already canceled, or filled/iu` regex matches the real message. The recipe
    re-run captured that exact string in the service-worker log while the UI showed the neutral
    toast — live confirmation, not inference.
  - `getTradeableBalance` is byte-equivalent to the expression it replaced.
  - Dropping `perpsValidateWithdrawal` loses nothing: `HyperLiquidProvider.validateWithdrawal`
    is a placeholder that returns `{ isValid: true }`, and `withdraw()` re-validates params.
- Would not ship: Issue 1 (silent blocked submit). Issue 2 is an analytics-fidelity call the
  analytics owner should make, not a functional blocker.
- Test quality: good — see above.
- Brittleness: acceptable and documented. String-matching provider prose is inherently fragile
  but mirrors the existing `API_ERROR_PATTERNS` convention and is commented as needing to stay in
  sync with mobile. Comparing sub-account completeness by *count* is an approximation (the stream
  keys main as `'main'`, the fresh read as `''` — I confirmed both in the controller source), and
  the comment says so. The set-state-during-render revision counter is the sanctioned React
  pattern and introduces no new lint warnings.

## Diff Quality
- Minimal: yes. No reformatting, no import churn, no unrelated edits. Every hunk maps to a stated
  AC. Non-blocking observation: `perpsValidateWithdrawal` (`perps-controller-init.ts:143,428`)
  now has no UI caller; leaving it as an API mirror of the controller is a defensible choice,
  deleting it would touch the action-type contract.
- Debug code: none (no `console.log`, `TODO`, `.only`, or commented-out code in the diff).

## Recipe
- Present: yes
- Quality: good (with one coverage gap) — **and it now passes end-to-end, which it did not at the
  previous review.** `mm-harness run` on the current HEAD: **status pass, 28/28 nodes ok**
  (`artifacts/recipe-run-rev3/`). The earlier `--launch-existing-dist` / `--project-root`
  invocation from the checklist is stale for this harness build; attaching to the live CDP
  runtime (`--cdp-port 7666`, no `--slot`) works, and `runtime-health` reports
  `hasStore: true`, `hasSubmitRequest: true`, `perpsManagerInitialized: true`.
  - It tests the actual fix, not "app boots": AC1 cancels a live resting order and asserts it is
    gone on the provider; AC2 creates an order, cancels it **out of band** via
    `metamask.perps.close_orders`, then drives the modal into the already-closed path.
  - It seeds its own data (`metamask.perps.ensure_orders` at notional 12 / 3x, teardown restores
    clean state) — it cannot pass on an empty wallet.
  - Assertions are meaningful (`metamask.perps.assert_orders state=none`, testId-scoped
    `ui.wait_for` on `perps-toast-cancel-order-already-closed`, modal-gone assertion).
  - Gap: AC3 (the withdraw stale-balance guard — the larger half of the diff) has **no live
    coverage**; it is unit-proven only. Reproducing a suspended service worker in a recipe is
    genuinely hard, so this is a documented limitation rather than an oversight, but the ticket's
    "largest withdraw bucket" is therefore not proven on a live runtime.
  - `recipe-quality.json` and `recipe-coverage.md` both exist.

## Visual Evidence
- Status: OK — read every PNG rather than trusting filenames.
  - `before-ac2-cancel-order-error.png`: modal open, raw
    `cancel 0: Order was never placed, already canceled, or filled. asset=4` in the in-modal error
    banner *and* the "Failed to cancel order" toast. Faithful "before".
  - `evidence-ac2-cancel-order-already-closed.png` and the new
    `recipe-run-rev3/screenshots/evidence-ac2-cancel-order-already-closed.png`: modal dismissed,
    green success toast reading "This order is no longer open", no error banner. The claimed
    element is fully visible and above the fold in both.
  - `recipe.json` gates the screenshot behind `ui.wait_for` on the toast testId before capturing.
  - Artifact contract gate: `TASK_ARTIFACT_CONTRACT_PASS`; no `FAIL_*`, no `MISSING:`, no invalid
    screenshot provider.

## Issues

- **ui/pages/perps/perps-withdraw-page.tsx:337** — a blocked withdrawal can give the user *no*
  feedback at all. The block branch only tracks and returns; the message reaches the user solely
  through `setFreshBalance`, which is discarded when `freshBalance.streamRevision !== streamRevision`
  (line 150). `handleContinue` closes over `streamRevision` at click time, so if the stream emits
  any new tradeable balance while `perpsGetAccountState` is in flight, the adoption is stale-keyed
  and inert: `availableNum` falls back to the streamed figure, `validationMessage` is `null`
  (amount ≤ streamed balance), `submitError` is never set, and the button re-enables — the user
  sees the click do nothing. This is likely precisely in the targeted scenario: clicking Withdraw
  wakes the service worker, which reconnects the account socket and pushes a new balance during
  the read window. Either surface the block explicitly (`setSubmitError(t('perpsWithdrawInsufficient'))`
  when the adoption cannot apply, guarding against rendering the same string in both alert boxes),
  or treat a revision change as "the read is outdated" and fail open / re-read instead of blocking
  on data the same render deems too stale to display. Worth a test that ticks the stream between
  the click and the read resolving.

- **ui/components/app/perps/cancel-order/cancel-order-modal.tsx:190** — the already-closed path
  emits `Perp Order Cancel Transaction` with `status: success`, but the controller has already
  emitted `Perp Order Cancel Transaction` with `status: failed` for the same attempt:
  `TradingService.cancelOrder` tracks `submitted` before the round-trip and `executed`/`failed`
  after, unconditionally, and the extension wires `trackPerpsEvent` into MetaMetrics via
  `app/scripts/controllers/perps/infrastructure.ts:176`. One user action therefore produces two
  contradictory-status events under the same name. This also makes the diff internally
  inconsistent: the withdraw half deletes the UI-side `Perp Withdrawal Transaction` events on
  exactly the grounds that the controller already emits them (`perps-withdraw-page.tsx:362-371`),
  while the cancel half adds another. The funnel gap that motivated this event does not exist —
  the controller keeps the attempt in the funnel. Either drop the UI event and put
  `cancel_outcome` on a distinct extension-only event name, or state explicitly why cancel is
  treated differently from withdraw.

- **temp/tasks/fix/45067-0801-230839/artifacts/recipe-coverage.md:1** — AC5 is stated as "The UI
  no longer emits duplicate `Perp Withdrawal Transaction` / `Perp Order Cancel Transaction`" and
  marked PROVEN. Only the withdrawal half is true; the UI still emits
  `Perp Order Cancel Transaction` on both the success and the already-closed paths
  (`cancel-order-modal.tsx:171,190`). Restate the claim to cover only withdrawal, or resolve it
  with the fix for the issue above. The same document's "recipe halts at `setup-select-account`"
  status is also now out of date — the graph runs 28/28 green on this slot.
