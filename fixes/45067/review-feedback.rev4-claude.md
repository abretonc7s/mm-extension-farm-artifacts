# Self-Review: MetaMask/metamask-extension#45067

## Verdict: ISSUES

## Summary

The worker fixed two perps reliability bugs: (1) the withdraw page now re-reads
account state before submitting so a stale streamed balance cannot produce an
`Insufficient balance` rejection, adopting the fresh figure into the displayed
balance/Max/validation so the block is actionable; (2) the cancel-order flow
retries once on `ORDER_UNKNOWN_COIN` (unhydrated symbol→asset map), closes out
quietly with a neutral toast when the order is already off the book, and renders
cancel copy instead of order-placement copy. Both fixes are correct, well
tested, and match how the controller actually behaves — I verified the retry
trigger, the fail-open read semantics, and the controller-side analytics
emission against `node_modules/@metamask/perps-controller` source rather than
trusting the report. Three findings, one of them a real fail-closed gap in the
withdraw guard.

**Note on diff base:** local `main` is 34 commits stale, so `git diff main...HEAD`
shows unrelated upstream churn. The branch's own work is
`5b44454253...HEAD` — 15 files, +1159/−110.

## Type Check
- Result: PASS
- New errors: none
- `yarn lint:tsc` was run (clean) despite the checklist default, because the diff
  changes a shared public API surface: `translatePerpsError` gains a third
  parameter and is called from 4+ sites. `yarn eslint` on all 13 changed
  JS/TS/TSX files: 0 problems. `yarn lint:changed` reports "No changed
  JS/TS/TSX/MTS/SNAP files" — it only inspects the working tree/index, and all
  work is committed, so it is a no-op here rather than a pass; the explicit
  eslint run above is what covers the diff.

## Tests
- Result: PASS
- Details: 5 suites / 310 tests pass — `perps-withdraw-page.test.tsx`,
  `cancel-order-modal.test.tsx`, `orderUtils.test.ts`,
  `translate-perps-error.test.ts`, `perps-controller-init.test.ts`. No console
  baseline violations. `yarn verify-locales --quiet` and
  `yarn circular-deps:check` both pass.

## Test Quality
- Findings: none found.
  - No "should" in any new test name.
  - Assertions are specific: `toHaveBeenCalledWith('perpsGetAccountState', [])`,
    exact analytics payload objects including
    `STALE_BALANCE_SHORTFALL: 80`, `expect(cancelOrder).toHaveBeenCalledTimes(2)`.
    No `toBeTruthy()`/`toBeDefined()` added.
  - User-facing copy is asserted through `messages.*.message`, not hardcoded
    literals. The two raw strings that do appear
    (`'ORDER_UNKNOWN_COIN'`, `'cancel 0: Order was never placed, already
    canceled, or filled. asset=4'`) are provider protocol strings, not i18n copy.
  - Async state updates are wrapped in `act()`; the one added console-baseline
    increment (147→148) is justified — the mid-read race test must hold the read
    unresolved across an `act` boundary, which is the condition under test.
  - Failure paths are covered on both halves: read rejects (fail open), partial
    sub-account read (fail open), stream ticks mid-read, retry `init()` throws,
    retried cancel throws. Two regression tests were verified by the worker to
    fail without their fix; the suite would not pass with the fix reverted.

## Domain Anti-Patterns
- Findings: none found.
  - **Import boundaries** — clean. `ui/` imports only from `ui/`, `shared/`, and
    `@metamask/perps-controller`; `shared/constants/perps-events.ts` imports
    nothing from `app/` or `ui/`.
  - **Controller usage** — `guardCancelOrder` sits in the existing
    `withAutoInit`/`guardRead`/`guardWrite` family in
    `perps-controller-init.ts` and reuses `guardWrite` underneath. The retry is
    genuinely safe: `HyperLiquidProvider.cancelOrder` validates the coin before
    `#ensureReadyForTrading`, so nothing has reached the socket
    (`HyperLiquidProvider.mjs:595-602`).
  - **MV3 / shared state** — no module-level mutable state, no timers, no
    storage access added.
  - **Error handling** — every new swallow has an inline justification comment:
    the `perpsGetAccountState` `.catch(() => undefined)` (fail-open, page 290-296)
    and `guardCancelOrder`'s `catch { return result; }`
    (`perps-controller-init.ts:205-209`). No bare `catch (e) {}`.
  - **Accessibility** — the withdraw error lines gained `role="alert"`, and the
    duplicate is suppressed when `submitError === validationMessage` so a single
    block does not announce twice.
  - **testIDs** — the new toast carries
    `data-testid="perps-toast-cancel-order-already-closed"`, which the recipe
    waits on. No new interactive element lacks one.
  - **LavaMoat / magic numbers / feature flags** — no deps, no flags, thresholds
    named (`STALE_BALANCE_FAILURE_REASON`, `SHORTFALL_CENTS_ROUNDING`).

## Mobile Comparison
- Status: DIVERGES (intentionally, extension is ahead)
- Details:
  - **Withdraw stale balance** — mobile has no equivalent guard.
    `PerpsWithdrawView.tsx:100,109-114` validates only against the streamed
    `account.withdrawableBalance`, and `getAccountState` is exposed by
    `usePerpsTrading.ts:153-157` but called nowhere outside the HIP-3 debug
    view. The extension is adding a protection mobile lacks, not drifting from
    a solved pattern. Mobile also never calls `validateWithdrawal`
    (`usePerpsTrading.ts:308-314` is an unused passthrough), so this diff's
    removal of the `perpsValidateWithdrawal` call converges with mobile — and it
    lost nothing: `HyperLiquidProvider.validateWithdrawal` is a stub returning
    `{ isValid: true }` (`HyperLiquidProvider.mjs:2657-2660`), while
    `withdraw()` re-validates params and asset support itself.
  - **Cancel already-closed** — mobile has no special case; that HyperLiquid
    rejection falls into the generic error toast
    (`PerpsOrderDetailsView.tsx:242-244` → `cancellationFailed` in
    `usePerpsToasts.tsx:703-710`). The extension's neutral "This order is no
    longer open" is the better behavior; worth a mobile follow-up ticket.
  - **`ORDER_UNKNOWN_COIN` retry** — mobile has none; extension-only addition.
  - **Per-flow i18n override** — mobile has no equivalent mechanism (single
    global `ERROR_CODE_TO_I18N_KEY` + a `fallbackMessage` on
    `handlePerpsError`). The extension's `i18nKeyOverrides` argument is a new
    pattern, but it is additive and backward compatible.
  - **Withdrawal analytics** — aligned. Mobile's withdraw UI does not emit
    `Perp Withdrawal Transaction` either; it is delegated to the controller via
    `adapters/mobileInfrastructure.ts:94-112`. The extension's removal of the
    UI-side event is therefore convergence, and I confirmed the controller does
    emit it (`AccountService.mjs:180-184` executed, `:229-235` failed) and that
    the extension routes it to MetaMetrics
    (`app/scripts/controllers/perps/infrastructure.ts:169-190`).
  - **Formatting** — no new `.toFixed(N)` or `{min:2,max:2}` anywhere in the
    diff. Mobile truncates the withdraw balance to 2 decimals
    (`PerpsWithdrawView.tsx:109-114`) while the extension keeps full precision,
    but that predates this PR and is unchanged by it.

## LavaMoat Policy
- Status: N/A
- Details: no `package.json` / `yarn.lock` / policy changes in
  `5b44454253...HEAD`. The 8 policy files in `main...HEAD` are upstream churn
  the rebase pulled in, not this PR's.

## Fix Quality
- Best approach: mostly yes — with one gap, see Issue 1.
  - The stream-revision keying (page 126-152) is the right call over
    value-keying: a reconnect replaying an old figure cannot re-pin a stale
    balance the user has no way to clear from this page. The React
    "adjust state during render" form is a documented pattern and avoids the
    `react-hooks/refs` violations the `useRef` variant produced.
  - Value parity is complete: every consumer of the balance goes through
    `availableNum` — validation (229), submit gate (239), Max (252), percentage
    buttons (255), displayed balance (573). No path was missed.
  - `guardCancelOrder` retrying the raw `fn` rather than the guarded one is
    deliberate and correct (a throw from the retry is the real failure and must
    not be masked by `ORDER_UNKNOWN_COIN`).
  - The override map keyed on the *resolved i18n key* rather than on error codes
    is the better of the two designs — it stays correct as the controller adds
    more `ORDER_*` codes.
- Would not ship: nothing blocking. Issue 1 is a narrow transient-failure window
  that should at minimum be documented in the code before merge.
- Test quality: good — assertions are behavioral, failure paths are covered, and
  the two regression tests were verified to fail without their fix.
- Brittleness: low.
  - `ORDER_NO_LONGER_OPEN_PATTERN` matches provider prose, which is inherently
    fragile, but it mirrors the existing `API_ERROR_PATTERNS` convention and the
    comment says so.
  - `CANCEL_ORDER_I18N_KEY_OVERRIDES` is stringly-typed (Issue 2), though
    `translate-perps-error.test.ts` would catch a rename.
  - No import-time evaluation or mock coupling introduced. The
    `perps-controller-init.test.ts` mock now spreads the real stub, which
    removes a class of silent-undefined failures rather than adding one.

## Diff Quality
- Minimal: yes. 15 files, all perps-scoped. No reformatting, no import
  reordering, no unrelated edits. `shared/constants/perps-events.ts` keeps the
  extension-only key in a separate namespace so the "must mirror the controller"
  rule on `PERPS_EVENT_PROPERTY` stays unambiguous.
- Debug code: none. No `console.log`, `TODO`, `debugger`, `eslint-disable`,
  `as any`, or commented-out alternatives in the added lines.

## Recipe
- Present: yes
- Quality: good — re-run and re-verified by this review.
  - I rebuilt `dist/` from the current tree
    (`refresh-build.sh --repo … --watcher-port 9012`) because the previous build
    predated HEAD (`b14b663d5f`), relaunched the runtime, and re-ran the graph:
    **pass, 28/28 nodes**, artifacts in `artifacts/recipe-run-rev4/`. So the
    green run exercises HEAD, not a stale bundle.
  - It tests the actual fix, not "app boots": `ac1-*` cancels a live resting
    order and asserts it gone via `perpsGetOpenOrders`
    (`matchingCount: 0`, `source: background-perpsGetOpenOrders`); `ac2-*`
    stages the already-closed race out of band with
    `metamask.perps.close_orders`, then waits on the
    `perps-toast-cancel-order-already-closed` testId before screenshotting.
  - It seeds its own state (`start_state` / `ensure_orders` / `close_orders` /
    `teardown_state`), so it cannot pass trivially on an empty wallet.
  - Assertions are specific (testId waits + provider-side order assertions), not
    `not_null`.
  - `recipe-quality.json` is present, verdict `pass`, with `ac_coverage` honestly
    left at `warn`.
  - **Known gap, disclosed by the worker, confirmed by me:** AC3 — the withdraw
    stale-balance guard, the larger half of the diff — has no live node. It is
    unit-proven only. Suggested delta for a future pass: the AC2 out-of-band
    mutation pattern could plausibly stage it too (open a margin-consuming
    position out of band, then press Max/withdraw before the stream ticks)
    rather than requiring a suspended service worker.

## Visual Evidence
- Status: OK
- `evidence-ac2-cancel-order-already-closed.png` — read with the Read tool, not
  judged by filename: the cancel modal is dismissed, the ETH market page shows
  no error banner, and a green-check toast reads "This order is no longer open".
  Claimed element is plainly visible, not below fold or obscured.
- `before-ac2-cancel-order-error.png` — genuine contrast: modal still open with
  the raw provider prose "cancel 0: Order was never placed, already canceled, or
  filled. asset=4" in both the in-modal banner and a "Failed to cancel order"
  toast.
- `recipe.json` gates the capture behind `ac2-wait-toast` (`ui.wait_for` on the
  claimed testId) immediately before `ac2-screenshot`, so the screenshot cannot
  precede the asserted element. Screenshot provider is `capture-helper`; the
  banned providers (`extension-dom-raster`, `macos-screencapture`,
  `Page.captureScreenshot`) do not appear in any manifest or trace.
- `check-task-artifact-contract.mjs` → `TASK_ARTIFACT_CONTRACT_PASS`; no
  `FAIL_*` and no `MISSING:` from the visual-classification, empty-manifest,
  file-existence, or provider checks.

## Issues

- **ui/pages/perps/perps-withdraw-page.tsx:306** — the fail-open completeness
  check covers only one of the three reads that feed the number it compares.
  `HyperLiquidProvider.getAccountState` runs `Promise.allSettled` over
  `spotClearinghouseState`, the per-DEX perps states, and `userAbstraction`
  (`HyperLiquidProvider.mjs:2010-2014`). It throws only when *all* perps DEX
  reads fail; a rejected **spot** or **abstraction** read resolves normally with
  an unchanged `subAccountBreakdown` count, so `isPartialRead` stays `false`,
  but `withdrawableBalance` silently drops the free spot USDC
  (`accountUtils.mjs:126-151`: `spotBalance === 0` returns early, and
  `foldIntoCollateral` is `false` when the abstraction mode is unresolved).
  Failure scenario: a HL Unified-mode user with $500 perps + $200 free spot
  ($700 streamed, spot folded in from the stream's own cache) enters $600; the
  spot fetch times out; the fresh read returns $500; the guard blocks a
  withdrawal HyperLiquid would have accepted, sets "Insufficient balance", and
  adopts $500 into `availableNum` — pinning the displayed balance and Max to the
  wrong figure until the stream next ticks. That is the fail-closed outcome the
  surrounding comments explicitly set out to avoid. Cheapest correct action:
  state the window in the comment at 301-305 so the limitation is known; better,
  widen the fail-open condition (e.g. skip the block when the fresh read is
  lower than streamed by roughly the streamed free-spot component, or require a
  second confirming read before blocking).

- **ui/pages/perps/perps-withdraw-page.tsx:356** — the reported
  `stale_balance_shortfall` can be negative, because it is computed against
  `streamedAvailableNum` while the block is decided against `availableNum`,
  which may be a previously adopted fresh balance. Failure scenario: stream
  pinned at $10, first submit adopts a fresh $100, user enters $60, a second
  read returns $50 → blocked, and the event reports a shortfall of `-40`. A
  negative "shortfall" will read as noise or as a bug in whoever consumes this
  metric. One-line fix: subtract from `availableNum` instead of
  `streamedAvailableNum`.

- **ui/components/app/perps/utils/translate-perps-error.ts:112** —
  `CANCEL_ORDER_I18N_KEY_OVERRIDES` is typed `Record<string, string>`, so its
  key has no compile-time link to the `ERROR_CODE_TO_I18N_KEY` values it is
  meant to remap. Failure scenario: someone renames the `perpsOrderFailed` value
  in `ERROR_CODE_TO_I18N_KEY` (line 65-ish region); the override stops matching
  and the cancel dialog silently regresses to "Order could not be placed" —
  no type error at the definition site. `translate-perps-error.test.ts` would
  currently catch it, so this is a hardening nit rather than a live defect:
  type it as
  `Partial<Record<(typeof ERROR_CODE_TO_I18N_KEY)[PerpsErrorCode], string>>`.

- **ui/components/app/perps/cancel-order/cancel-order-modal.tsx:182** — the
  comment justifying zero analytics on the already-closed path ("a UI event
  would be a second, contradictory-status row … the controller already emitted
  `Perp Order Cancel Transaction`") is contradicted by the two adjacent call
  sites that do exactly that: line 169 (success) and line 198 (generic failure).
  Both predate this PR, so this is not a regression and removing them is out of
  scope — but as written the file states a principle it immediately violates
  twice, which will read as an oversight to the next reviewer. Failure scenario:
  a reviewer or a later agent "fixes" the inconsistency in the wrong direction
  and re-adds a duplicate event on the already-closed path, undoing the pass-2
  revert. Cheapest fix: scope the comment ("this path only; lines 169/198
  predate this PR and duplicate the controller's rows — tracked separately") or
  file the follow-up and reference it.
