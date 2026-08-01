# Self-Review: MetaMask/metamask-extension#45067

## Verdict: PASS

## Summary
The PR blocks doomed perps withdrawals with a fresh `perpsGetAccountState` read keyed to a stream
revision, retries `cancelOrder` once after `init()` on `ORDER_UNKNOWN_COIN`, closes the cancel
dialog quietly when the order is already off the book, translates raw provider prose into
cancel-flow copy, and drops the UI-side `Perp Withdrawal Transaction` events the controller already
emits. Both findings from rev9 (the conditionally-mounted `aria-live` region and the unpinned
`role="alert"`) were fixed in `420471c2d5`, and I mutation-probed both rather than trusting the
report. I found no new defect.

**Diff base note:** local `main` is stale (merge-base `9afac38`), so `main...HEAD` shows 196 files
because 52 upstream commits are merged in. The worker's own scope is `origin/main...HEAD`
(`5b44454253..HEAD`, 15 commits): **15 files, +1438 / −127**. Everything below is against that range.

## Type Check
- Result: PASS
- New errors: none in changed files.
- Broad `yarn lint:tsc` deliberately **not** run. The diff touches no `package.json`, `yarn.lock`,
  `lavamoat/`, or dependency surface. The one exported type-surface change
  (`ERROR_CODE_TO_I18N_KEY` moving from a `Record<PerpsErrorCode, string>` annotation to
  `as const satisfies …`) has exactly two consumers — `translate-perps-error.ts` itself and
  `cancel-order-modal.tsx:218` — and it is unchanged since the last full `lint:tsc` clean recorded
  in `report.md` (pass 7). The three commits after that (`4abe7c5ac9`, `0a75d191e5`, `420471c2d5`)
  touch only `perps-withdraw-page.tsx` / `.test.tsx`, no type surface.
- ESLint run directly over all 13 branch-changed TS/TSX files with the repo config: **0 errors,
  2 warnings**, both pre-existing `react-hooks/set-state-in-effect` on untouched lines
  (`cancel-order-modal.tsx:88`, `perps-withdraw-page.tsx:202`). `yarn lint:changed` itself is a
  no-op because the working tree is clean.

## Tests
- Result: PASS
- Details: `perps-controller-init.test.ts`, `cancel-order-modal.test.tsx`, `orderUtils.test.ts`,
  `translate-perps-error.test.ts`, `perps-withdraw-page.test.tsx` — **311/311 pass, 5/5 suites**,
  "No console baseline violations". `test/jest/console-baseline-unit.json` is not in this diff, so
  no allowance was raised.
- Gates: `yarn verify-locales --quiet` → "No invalid entries!"; `yarn circular-deps:check` → pass.

## Test Quality
- Findings: none found.
  - No `should` in any added test name. No `toBeTruthy()` / `toBeDefined()` / `toBeFalsy()` added.
    No `as any` / `as unknown as` / `as never` added — the only grep hits are provider prose
    ("w**as never** placed") and the comment explaining why `as never` was avoided. No `.only` /
    `.skip`.
  - Every i18n assertion resolves through `messages.<key>.message`. The only raw string literals in
    text assertions are provider prose (`'cancel 0: Order was never placed, already canceled, or
    filled. asset=4'`, `'ORDER_UNKNOWN_COIN'`), which the component does not source from a message
    key, so the anti-pattern does not apply.
  - `userEvent` throughout, async updates wrapped in `act()`, `renderWithProvider` used, assertions
    check exact call payloads (full `Perp Error` objects including `stale_balance_shortfall`).
  - `cancel-order-modal.test.tsx:29` replaces the hand-maintained `PERPS_TOAST_KEYS` mock with
    `jest.requireActual` — good change: the subset mock would have silently emitted
    `key: undefined` for the new toast.
  - **Independent mutation probes of the two contracts this pass fixed** (rev9 found one of them
    unpinned, so I did not take the report's word for it):
    - Removing `role="alert"` from `perps-withdraw-page.tsx:674` → **1 failed / 30 passed**.
    - Collapsing the live region back onto the conditional node → **1 failed / 30 passed**.
    Both now genuinely pinned. Working tree restored to clean afterwards.

## Domain Anti-Patterns
- Findings: none found.
  - **Import boundaries** — clean. `shared/constants/perps-events.ts` imports nothing from `app/`
    or `ui/` (its header documents why the constants are mirrored locally); UI reaches background
    only through `submitRequestToBackground`.
  - **Controller usage** — no direct state mutation, no duplicated controller logic.
    `perpsGetAccountState` is an existing read-guarded messenger-client method
    (`perps-controller-init.ts:157,457`), not new plumbing.
  - **LavaMoat** — no dependency or import-graph change.
  - **MV3** — `guardCancelOrder`'s `init()` retry rides the same path `guardWrite` / `withAutoInit`
    already uses; single bounded retry, no keep-alive concern, no module-level mutable state.
  - **Shared state** — `ORDER_NO_LONGER_OPEN_PATTERN` (`orderUtils.ts:27`) is module-level but has
    no `g` flag, so `.test()` carries no `lastIndex`.
  - **Error handling** — both new swallows carry a justifying comment immediately above:
    `perps-withdraw-page.tsx:320` (`.catch(() => undefined)`, fail-open, comment at `:313-319`) and
    `perps-controller-init.ts:344` (`catch { return result }`, comment at `:339-343`). No bare
    `catch (e) {}`.
  - **Accessibility** — the `aria-live="polite"` region is now mounted unconditionally with only its
    contents conditional (`:658`), and the submit-error box keeps `role="alert"` (`:674`). Both
    semantics are pinned by tests (probed above). Copy for the new toast and the new error string
    is i18n-backed in both `en` and `en_GB`; "cancelled" matches the adjacent perps copy
    (`perpsToastCancelOrderSuccess` = "Order cancelled").
  - **Magic numbers** — `SHORTFALL_CENTS_ROUNDING`, `STALE_BALANCE_FAILURE_REASON` named. No new
    `.toFixed(N)`, no `{min:2, max:2}` anywhere in the diff.
  - **testIDs** — `perps-withdraw-validation-error`, `perps-withdraw-submit-error`,
    `perps-toast-cancel-order-already-closed` all present; the new toast key is forced into
    `PERPS_TOAST_PRESENTATION_BY_KEY` by its exhaustive `Record<PerpsToastKey, …>` type.
  - **Constant mirror accuracy** — re-verified directly against
    `@metamask/perps-controller/dist/constants/eventNames.cjs:325-337`: `ERROR_TYPE.VALIDATION`
    (`'validation'`) and `ERROR_MESSAGE_KEY.INSUFFICIENT_BALANCE` (`'insufficient_balance'`) match.
    No drift.

## Mobile Comparison
- Status: DIVERGES (intentionally, in the extension's favour)
- Details (verified in `/Users/deeeed/dev/metamask/metamask-mobile-ref` @ `18737cb1df`):
  - `PerpsWithdrawView.tsx:282` calls `controller.withdraw(...)` with no fresh account-state
    pre-read. Mobile has no suspending MV3 service worker, so the extension's pre-read is an
    extension-specific fix, not drift.
  - `PerpsOrderDetailsView.tsx:243` shows a hard `cancellationFailed` toast for *every* cancel
    failure. `git grep "never placed"` across mobile `app/` finds only unrelated tooltip copy — no
    already-gone handling, no `ORDER_UNKNOWN_COIN` cancel retry, no cancel-flow i18n override.
    Mobile does handle `ORDER_UNKNOWN_COIN` (`usePerpsOrderValidation.ts:185`) but only on the
    *placement* path. The extension is ahead on all three; worth porting back.
  - Formatting: no divergence — no new `.toFixed` / `{min:2,max:2}`.

## LavaMoat Policy
- Status: N/A
- Details: `git diff origin/main...HEAD --name-only` contains no `package.json`, `yarn.lock` or
  `lavamoat/` file and adds no runtime dependency. The 8 policy files visible in `main...HEAD` are
  upstream churn from the rebased-on `main` commits, not this PR.

## Fix Quality
- Best approach: yes, with the trade-offs documented in-code.
  - Revision-keyed adoption is the right shape: it distinguishes "stream still stale" from "stream
    moved away and re-reported the same number", which a value-keyed guard cannot. `availableNum`
    is the single source for every render path — display (`:629`), `validationMessage` (`:246`),
    `hasValidInputs` (`:256`), Max/percentage (`:269,:272`) and the analytics shortfall (`:411`) —
    so no path can disagree with the guard.
  - Fail-open ordering is sound: an unusable read (rejection, partial sub-account set, unparseable
    balance) leaves the submit path exactly as it was.
  - I verified the two load-bearing claims in the comments against the installed package rather
    than accepting them: `HyperLiquidProvider.cancelOrder` runs `validateCoinExists` **before**
    `#ensureReadyForTrading` and before any `exchangeClient.cancel` call
    (`dist/providers/HyperLiquidProvider.cjs:598-604`), so `ORDER_UNKNOWN_COIN` is genuinely
    pre-socket and the retry cannot double-cancel; and `AccountService`
    (`dist/services/AccountService.cjs:183,233,277`) does emit `Perp Withdrawal Transaction`, wired
    to MetaMetrics through `app/scripts/controllers/perps/infrastructure.ts:389` → `createMetrics()`
    → `trackEvent`, so dropping the UI-side duplicates loses no funnel coverage.
  - Removing the `perpsValidateWithdrawal` pre-call costs nothing:
    `HyperLiquidProvider.validateWithdrawal` is a documented placeholder that always returns
    `{ isValid: true }` (`dist/providers/HyperLiquidProvider.cjs:2660-2663`).
  - The shortfall can never be reported negative: the guard only fires when
    `freshAvailableNum < requestedNum`, and `hasValidInputs` already caps `requestedNum` at
    `availableNum`, so `availableNum - freshAvailableNum > 0`. Pinned by the test at
    `perps-withdraw-page.test.tsx:1385`.
- Would not ship: nothing.
- Test quality: good. Failure paths covered — partial sub-account read, read rejection, mid-read
  stream tick, retry-`init()` throw, retry-cancel throw, adopted-balance release, non-re-pin,
  negative-shortfall regression, genuine failure surviving a price tick, and both a11y contracts.
- Brittleness: none material. No import-time evaluation, no mock coupling — the
  `perps-controller-init.test.ts` factory spreads `test/mocks/metamask-perps-controller.js` so
  `PERPS_ERROR_CODES` resolves through the real stub. The documented KNOWN GAP
  (`perps-withdraw-page.tsx:330-343`: the spot/abstraction leg is invisible to the sub-account
  count check) is honestly scoped and self-heals on the next stream tick.

## Diff Quality
- Minimal: yes — 15 files, all in the perps withdraw/cancel path. No reformatting, no import churn,
  no unrelated edits, no dead constants (`PERPS_EXTENSION_EVENT_PROPERTY.STALE_BALANCE_SHORTFALL`,
  `ERROR_TYPE.VALIDATION`, `ERROR_MESSAGE_KEY.INSUFFICIENT_BALANCE`,
  `CANCEL_ORDER_I18N_KEY_OVERRIDES`, `isOrderNoLongerOpenError` are each consumed).
  `test/jest/console-baseline-unit.json` was touched mid-branch and correctly reverted — it is not
  in the final diff.
- Debug code: none — no `console.log`, no `eslint-disable`, no `.only(`, no ticketless TODO, no
  commented-out alternatives.
- Value parity: verified by enumerating every `availableNum` consumer (listed above); all apply the
  same figure. `formatAmountInputFromNumber` rounds down, so Max can never overshoot the adopted
  balance. `perpsCancelOrder` has exactly one UI caller
  (`cancel-order-modal.tsx:160`), so the cancel-flow override reaches every cancel path.

## Recipe
- Present: yes
- Quality: good (one documented coverage gap)
- **Re-ran it myself at HEAD** against the live CDP runtime: `runtime-health` → `hasStore: true`,
  `hasSubmitRequest: true`, `perpsManagerInitialized: true`; `mm-harness run … --cdp-port 7666` →
  **status pass, exit 0, 28/28 entries `ok: true`** (`artifacts/recipe-run-rev10/`). I confirmed the
  on-disk dist matches HEAD before trusting the run: `dist/chrome/9247.js` contains the *current*
  structure — `Box aria-live="polite"` mounted unconditionally wrapping the conditional
  `perps-withdraw-validation-error` node, i.e. the markup introduced by `420471c2d5`, not the
  previous shape. The checklist's `--project-root` / `--launch-existing-dist` form remains wrong for
  harness 0.29.3; `--cdp-port 7666` alone is the working invocation.
- `trace.json` shows the AC-bound nodes actually executing, all `ok: true`: `ac1-press-cancel`,
  `ac1-assert-orders-absent` (`matchingCount: 0` from `background-perpsGetOpenOrders`),
  `ac2-cancel-out-of-band`, `ac2-press-cancel`, `ac2-wait-toast` (`matched: true`), `ac2-screenshot`,
  `ac2-assert-orders-absent`.
- Seeds its own data: yes — `setup-start-state` → `ac*-ensure-order-open` → `ac2-cancel-out-of-band`
  → `teardown-state`. It cannot pass on an empty wallet.
- Uses `call`-style library actions (`metamask.perps.*`), not raw steps; assertions are specific
  (`assert_orders`, `ui.wait_for` on named testIds), never `not_null`.
- `recipe-quality.json` present, verdict `pass`; the AC3 gap is recorded honestly.
- Gap (accepted, pre-existing): AC3 — the withdraw stale-balance guard, the ticket's largest bucket
  — has no live coverage because a suspended service worker cannot be staged today. Unit-proven
  only, and `recipe-coverage.md` says so.
- Side findings from my run: 7 events (1 warning, 6 errors), all either environmental
  (`ws://localhost:8080/ws` refused, 404s, `No metadata found for 'autoLockTimeLimit'`, "Sentry not
  initialized") or the *expected* `ApiRequestError: cancel 0: Order was never placed, already
  canceled, or filled` the graph stages on purpose — proof the controller still logs the provider
  failure while the UI shows the neutral toast.

## Visual Evidence
- Status: OK
- Both manifest-referenced PNGs were opened and read, not inferred from filename or run status.
  `before-ac2-cancel-order-error.png`: modal still open, raw prose `cancel 0: Order was never
  placed, already canceled, or filled. asset=4` in the in-modal banner **and** a "Failed to cancel
  order" toast — the bug, clearly visible above the fold.
  `evidence-ac2-cancel-order-already-closed.png`: modal dismissed, ETH market page, no error banner,
  green-check toast reading "This order is no longer open" — claimed element fully visible, on the
  right screen. My own re-run's capture
  (`recipe-run-rev10/screenshots/evidence-ac2-cancel-order-already-closed.png`) was read separately
  and reproduces it identically against the current dist.
- Protocol check in `recipe.json`: `ac2-screenshot` is reached only via
  `ac2-press-cancel → ac2-wait-toast (ui.wait_for, test_id perps-toast-cancel-order-already-closed,
  expected: visible) → ac2-screenshot`, so the capture cannot fire before the asserted element
  exists. No scroll node needed — the toast is fixed-position and in frame.
- AC2 is classified `mixed` in `recipe-coverage.md`, matching the visual claim.
- Artifact contract gate: `TASK_ARTIFACT_CONTRACT_PASS`. No `FAIL_VISUAL_CLASSIFICATION`, no
  `FAIL_EMPTY`, no `MISSING:`, no `FAIL_INVALID_SCREENSHOT_PROVIDER` (screenshots use the
  `capture-helper` provider).

## Issues

(none — verdict is PASS)

---

## Non-blocking observations (not issues; do not open a fix pass for these)

- **`ui/pages/perps/perps-withdraw-page.tsx:145-159`** — the render-phase clear retires the guard's
  message on *any* new streamed reading. If a tick arrives after the message renders and the new
  streamed figure is still stale-high, the user is briefly left with no feedback and a re-enabled
  button until they click again (which re-runs the guard and re-shows it). A narrower rule — clear
  only when the new reading would make the message contradictory — exists but needs the requested
  amount in state. Pass 6/7 weighed exactly this trade-off; the current choice is documented and
  defensible. Recording it so the next reviewer does not re-derive it.
- **`app/scripts/messenger-client-init/perps-controller-init.ts:317`** — the retry makes
  `TradingService` emit `Perp Order Cancel Transaction` twice (submitted+failed, then
  submitted+executed) for one user action. Inherent to retrying at this layer; the analytics owner
  should know. Unchanged since rev5.
- **`ui/components/app/perps/cancel-order/cancel-order-modal.tsx:167`** — when `result.error` is
  absent, the thrown message is *localized* copy (`t('somethingWentWrong')`), which then lands in
  the `Perp Error` / `Perp Order Cancel Transaction` `error_message` property. The controller's own
  constants file states message *keys* should be used instead of localized strings for consistent
  analytics. Pre-existing: introduced by `main`'s `handleCancel` restructure, not this PR.
- **`ui/components/app/perps/perps-view.tsx`** — the cancel-**all**-orders path still shows a bare
  `t('somethingWentWrong')` for every failure. Same class of bug, different component,
  pre-existing — follow-up ticket. Unchanged from rev7–rev9.
- **`temp/tasks/fix/45067-0801-230839/artifacts/recipe-coverage.md`** — Addendum 2 still cites
  `artifacts/recipe-run-rev3/` as "this run" and quotes per-pass test totals (69/69, 108/108) that
  later passes superseded. Documentation staleness in a task artifact, not in the PR.
