# Self-Review: MetaMask/metamask-extension#45067

## Verdict: ISSUES

## Summary
The PR blocks doomed withdrawals with a fresh account-state read keyed to a stream
revision, retries `cancelOrder` once after `init()` on `ORDER_UNKNOWN_COIN`, quietly closes
the cancel dialog when the order is already off the book, translates raw provider prose
into cancel-flow copy, and drops the UI-side `Perp Withdrawal Transaction` events the
controller already emits. **All three rev7 findings are genuinely fixed** and each is now
pinned by a test. One remaining item, low severity and cosmetic-adjacent: the rev7 a11y fix
swapped `role="alert"` for `aria-live="polite"` on a box that is *mounted together with its
content*, which is the one live-region shape screen readers commonly fail to announce — so
the validation line may now not be announced at all on first appearance. Not a regression
against `main` (which had no live region), and the repo's only `aria-live` precedent shares
the flaw, so this is shippable if the operator prefers to stop here.

**Diff base note:** local `main` is stale; `main...HEAD` shows 196 files because 52 upstream
commits are merged in. The worker's own scope is `5b44454253..HEAD` (13 commits):
**15 files, +1423 / −124**. Everything below is reviewed against that range.

## Type Check
- Result: PASS
- New errors: none in changed files.
- Broad `yarn lint:tsc` deliberately **not** run — no `package.json` / `yarn.lock` /
  dependency change in this diff. Instead ran a scoped `tsc -p --noEmit` (root tsconfig,
  `include` limited to the six changed source files): **zero diagnostics in any changed
  file**. The scoped run reports pre-existing ambient errors (`globalThis` index signature,
  missing `@types/psl`, `react-tippy`) from files the narrowed `include` pulls in — none in
  this diff. That covers the one exported-type-surface change
  (`ERROR_CODE_TO_I18N_KEY` moving from a `Record<PerpsErrorCode, string>` annotation to
  `as const satisfies …`); `git grep` confirms its only consumers are
  `translate-perps-error.ts` itself and `cancel-order-modal.tsx:218`.

## Tests
- Result: PASS
- Details: `perps-controller-init.test.ts`, `cancel-order-modal.test.tsx`,
  `orderUtils.test.ts`, `translate-perps-error.test.ts`, `perps-withdraw-page.test.tsx` —
  **311/311 pass, 5/5 suites**, "No console baseline violations".
- Gates: `yarn verify-locales --quiet` → "No invalid entries!"; `yarn circular-deps:check` →
  pass. `yarn lint:changed` is a no-op (working tree clean), so ESLint was run directly over
  all 13 branch-changed TS/TSX files with the repo config: **0 errors, 2 warnings**, both
  `react-hooks/set-state-in-effect` on untouched pre-existing effects
  (`cancel-order-modal.tsx:88`, `perps-withdraw-page.tsx:202` — the routes fetch). Neither
  is introduced by this diff.
- Console baseline: `test/jest/console-baseline-unit.json` is **byte-identical to the base**
  (`perps-withdraw-page.test.tsx` = 148 at both `5b44454253` and HEAD, matching
  `origin/main`). Intermediate commits moved it and moved it back; no net allowance raise.
  Note `recipe-coverage.md`'s "baseline moved 147 → 148" line is stale.

## Test Quality
- Findings: none.
  - No `should` in any added test name. No `toBeTruthy()` / `toBeDefined()` added. No
    `as any` / `as unknown as` / `as never` (the only grep hits are provider prose — "w**as
    never** placed" — and a comment explaining why `as never` was *avoided*).
  - Every i18n assertion goes through `messages.<key>.message`; the only raw literals are
    provider prose (`'cancel 0: Order was never placed, already canceled, or filled.
    asset=4'`, `'ORDER_UNKNOWN_COIN'`) and mock-`t` sentinels (`'[perpsCancelOrderFailed]'`),
    none of which is copy sourced from a message key.
  - `userEvent` throughout, async updates wrapped in `act()`, `renderWithProvider` used,
    assertions check exact call arguments (full `Perp Error` payloads including
    `stale_balance_shortfall`), not mock return values.
  - **Mutation-probed the newest fix myself:** replacing the render-phase
    `setSubmitError((current) => current?.fromStaleBalanceGuard ? null : current)` with the
    rev7 behaviour `setSubmitError(null)` makes the suite go **1 failed / 30 passed**;
    restored, **31/31**. The rev7 finding is pinned, not just patched.

## Domain Anti-Patterns
- Findings: one a11y item (see Issues).
  - **Import boundaries** — clean. `shared/constants/perps-events.ts` imports nothing from
    `app/` or `ui/`; the UI reaches background only through `submitRequestToBackground`.
  - **Controller usage** — no direct state mutation. `perpsGetAccountState` is an existing
    read-guarded messenger-client method (`perps-controller-init.ts:457`), not new plumbing.
  - **LavaMoat** — no dependency or import-graph change (see below).
  - **MV3** — `guardCancelOrder`'s `init()` retry sits on the same path
    `guardWrite`/`withAutoInit` already uses; single, bounded retry, no keep-alive concern.
  - **Shared state** — `ORDER_NO_LONGER_OPEN_PATTERN` (`orderUtils.ts:28`) is module-level
    but carries no `g` flag, so `.test()` holds no `lastIndex` state.
  - **Error handling** — both new swallows carry the required justifying comment directly
    above: `perps-withdraw-page.tsx:322` (`.catch(() => undefined)`, fail-open, comment at
    `:313-319`) and `perps-controller-init.ts:349` (`catch { return result }`, comment at
    `:344-348`). No bare `catch (e) {}`.
  - **Magic numbers** — `SHORTFALL_CENTS_ROUNDING`, `STALE_BALANCE_FAILURE_REASON` named; no
    new `.toFixed(N)` or `{min:2, max:2}` anywhere in the diff.
  - **testIDs** — `perps-withdraw-validation-error`, `perps-withdraw-submit-error`,
    `perps-toast-cancel-order-already-closed` all present.
  - **Constant mirror accuracy** — re-verified independently that the hand-added
    `PERPS_EVENT_VALUE.ERROR_TYPE.VALIDATION` and `ERROR_MESSAGE_KEY.INSUFFICIENT_BALANCE`
    match the controller's canonical values
    (`@metamask/perps-controller/dist/constants/eventNames.cjs:323,329`). No drift.

## Mobile Comparison
- Status: DIVERGES (intentionally, in the extension's favour)
- Details (verified directly in `/Users/deeeed/dev/metamask/metamask-mobile-ref`):
  - `PerpsWithdrawView.tsx:282` calls `controller.withdraw()` and `navigation.goBack()`
    *before* the call resolves — no fresh account-state read. Mobile has no suspending MV3
    service worker, so the extension's pre-read is an extension-specific fix, not drift.
  - `PerpsOrderDetailsView.tsx:243,246` shows a hard `cancellationFailed` toast for *every*
    cancel failure. Mobile has no already-gone handling, no `ORDER_UNKNOWN_COIN` retry and
    no cancel-flow i18n override; `git grep` finds no "never placed, already canceled"
    handling anywhere in mobile. The extension is ahead on all three — worth porting back.
  - Formatting: no divergence; no new `.toFixed` / `{min:2,max:2}`.

## LavaMoat Policy
- Status: N/A
- Details: `git diff 5b44454253..HEAD --name-only` contains no `package.json`, `yarn.lock`
  or `lavamoat/` file and adds no runtime dependency. The 8 policy files visible in
  `main...HEAD` are upstream churn from the rebased-on `main` commits, not this PR.

## Fix Quality
- Best approach: yes, with the trade-offs documented in-code.
  - The `guardCancelOrder` retry targets a genuinely **pre-socket** failure. Re-verified in
    the installed provider: `HyperLiquidProvider.cancelOrder`
    (`dist/providers/HyperLiquidProvider.cjs:598-607`) runs `validateCoinExists` and throws
    *before* `#ensureReadyForTrading()` and before any `exchangeClient.cancel(...)`, so the
    retry cannot double-cancel. The throw is converted to
    `{ success: false, error: 'ORDER_UNKNOWN_COIN' }` by `createErrorResult`
    (`utils/hyperLiquidValidation.cjs:18-24`) and returned unchanged by
    `TradingService.cancelOrder`, so the guard's check on the **resolved value** — not a
    rejection — is the correct shape, and `PERPS_ERROR_CODES.ORDER_UNKNOWN_COIN` really is
    the literal `'ORDER_UNKNOWN_COIN'` in both the real package and the test mock.
    Caveat unchanged from rev5–rev7: the retry makes `TradingService` emit
    `Perp Order Cancel Transaction` twice for one user action. Inherent to retrying at this
    layer; the analytics owner should know.
  - Dropping the UI-side `Perp Withdrawal Transaction` events is safe: the controller emits
    them on all three outcomes (`AccountService.cjs:183,233,277`) **and** the extension does
    still deliver controller-emitted perps events — I checked specifically because
    `8c52d6dd21` reverted "consume perps controller analytics contract"; the surviving path
    is `createPerpsInfrastructure().metrics.trackPerpsEvent` →
    `trackEvent(createEventBuilder(...))` (`app/scripts/controllers/perps/infrastructure.ts:169-190`),
    untouched by that revert. Keeping the UI-side `Perp Error` for the *prevented*
    withdrawal is right — the controller never sees that path.
  - Dropping the `perpsValidateWithdrawal` round-trip costs nothing:
    `HyperLiquidProvider.validateWithdrawal` (`dist/providers/HyperLiquidProvider.cjs:2660`)
    is a `return { isValid: true }` placeholder. It was pure latency.
  - Revision-keyed adoption is still the right shape: it distinguishes "stream still stale"
    from "stream re-reported the same number", which a value-keyed guard cannot.
- Would not ship: nothing. The one open item is an a11y refinement, not a blocker.
- Test quality: good. Failure paths covered (partial sub-account read, read rejection,
  mid-read stream tick, retry-`init()` throw, retry-cancel throw, adopted-balance release,
  non-re-pin, negative-shortfall regression, and now the genuine-failure message surviving a
  price tick). The rev7 gap is closed and I confirmed the new test fails without its fix.
- Brittleness: none material. No import-time evaluation, no mock coupling — the
  `perps-controller-init.test.ts` factory now spreads `test/mocks/metamask-perps-controller.js`
  so `PERPS_ERROR_CODES` resolves through the real proxy stub rather than a hand-maintained
  subset. The documented KNOWN GAP (`perps-withdraw-page.tsx:330-343`: the spot/abstraction
  leg is invisible to the sub-account count check) is honestly scoped and self-heals on the
  next stream tick.

## Diff Quality
- Minimal: yes — 15 files, all in the perps withdraw/cancel path. No reformatting, no import
  churn, no unrelated edits, no dead constants, no net console-baseline change.
- Debug code: none — no `console.log`, no `eslint-disable`, no ticketless TODO, no
  commented-out alternatives.
- Value parity: `availableNum` is the single source for every render path of the balance —
  display (`:629`), `validationMessage` (`:246`), `hasValidInputs` (`:256`), Max and the
  percentage buttons (`:269`, `:272`) and the analytics shortfall (`:411`). No path missed.
  `formatAmountInputFromNumber` truncates (`BigNumber.ROUND_DOWN`), so the Max preset can
  never overshoot the adopted balance.
- Out-of-scope observation (not a finding, unchanged from rev7): the cancel-**all**-orders
  path in `ui/components/app/perps/perps-view.tsx` still shows a bare
  `t('somethingWentWrong')` for every failure. Same class of bug, different component,
  pre-existing — follow-up ticket, not an expansion of this PR.

## Recipe
- Present: yes
- Quality: good (one documented coverage gap)
- Re-run at HEAD, my own run: the on-disk dist was stale (built 01:02; five later commits
  touched `cancel-order-modal.tsx` / `perps-withdraw-page.tsx`). Rebuilt with
  `refresh-build.sh --repo … --watcher-port 9012`, relaunched (`runtime-launch` →
  `runtime_ready`, `hasStore: true`, `hasSubmitRequest: true`), then re-ran attached to the
  live CDP runtime: **pass, 28/28 nodes** (`artifacts/recipe-run-rev8/`). The checklist's
  `--project-root` / `--launch-existing-dist` form is still stale for harness 0.29.3;
  `--cdp-port 7666` alone is the working invocation.
- `trace.json` shows the AC-bound nodes actually executing: `ac1-press-cancel`,
  `ac1-assert-orders-absent`, `ac2-cancel-out-of-band`, `ac2-press-cancel`, `ac2-wait-toast`,
  `ac2-screenshot`, `ac2-assert-orders-absent` — all `true`.
- Seeds its own data: yes — `start_state` → `ensure_orders` → `close_orders` →
  `teardown_state`, notional 12 / 3x. It cannot pass on an empty wallet.
- Uses `call`-style library actions (`metamask.perps.*`), not raw steps; assertions are
  specific (`assert_orders`, `ui.wait_for` on named testIds), never `not_null`.
- `recipe-quality.json` present, verdict `pass`; AC3 gap recorded honestly.
- Gap (accepted, pre-existing): AC3 — the withdraw stale-balance guard, the ticket's largest
  bucket — has no live coverage because a suspended service worker cannot be staged today.
  Unit-proven only, and `recipe-coverage.md` says so.
- Side findings from my run: 9 events. Seven environmental (refused `ws://localhost:8080`,
  a 404, `Invalid chain ID "0x89"` polling, `componentWillReceiveProps`, "Sentry not
  initialized"). The other two are the *expected* `cancel 0: Order was never placed, already
  canceled, or filled. asset=4` errors the graph stages on purpose — proof that the
  controller still logs the provider failure while the UI shows the neutral toast.

## Visual Evidence
- Status: OK
- Both manifest-referenced PNGs were opened and read, not inferred from filename or run
  status. `before-ac2-cancel-order-error.png`: modal still open, raw prose `cancel 0: Order
  was never placed, already canceled, or filled. asset=4` in the in-modal banner **and** a
  "Failed to cancel order" toast — the bug, clearly visible.
  `evidence-ac2-cancel-order-already-closed.png`: modal dismissed, ETH market page, no error
  banner, green-check toast reading "This order is no longer open" — claimed element fully
  visible, above the fold, on the right screen. My own re-run
  (`recipe-run-rev8/screenshots/…`) reproduces it identically against the rebuilt dist.
- Protocol check: `ac2-screenshot` is preceded by `ac2-wait-toast`
  (`ui.wait_for` on `perps-toast-cancel-order-already-closed`), so it cannot fire before the
  asserted element exists. No scroll needed — the toast is fixed-position and visible.
- Artifact contract gate: `TASK_ARTIFACT_CONTRACT_PASS`. No `FAIL_VISUAL_CLASSIFICATION`
  (AC2 is `mixed` in `recipe-coverage.md`), no `FAIL_EMPTY`, no `MISSING:`, no
  `FAIL_INVALID_SCREENSHOT_PROVIDER`.

## Issues

- **ui/pages/perps/perps-withdraw-page.tsx:655** — the rev7 a11y fix landed the one
  live-region shape that commonly announces nothing: the `aria-live="polite"` box is
  *conditionally mounted with its content* (`{validationMessage ? <Box aria-live="polite">…`),
  and a polite region inserted into the DOM already populated is frequently not announced —
  the region has to exist in the accessibility tree before its content changes. `role="alert"`,
  which this replaced, is announced on insertion by most AT, so the swap traded "announced
  but interrupts mid-word" for "possibly never announced". The suite's own comment at
  `perps-withdraw-page.test.tsx:614-616` states the requirement — "The block has no other
  feedback, so the message must reach a screen reader" — and jsdom can only assert the
  attribute, not the announcement, so nothing catches this. Keep the region mounted and move
  the condition inside it:
  ```tsx
  <Box aria-live="polite">
    {validationMessage ? (
      <Text data-testid="perps-withdraw-validation-error" variant={TextVariant.BodySm} color={TextColor.ErrorDefault}>
        {validationMessage}
      </Text>
    ) : null}
  </Box>
  ```
  That preserves every existing `queryByTestId('perps-withdraw-validation-error')`
  presence/absence assertion; only `perps-withdraw-page.test.tsx:617-620` needs the
  `aria-live` assertion re-pointed at the wrapper (`validationAlert.parentElement`, or read
  it via `container.querySelector('[aria-live="polite"]')`). Leave the submit-error box at
  `:670` alone — `role="alert"` is correct there.
  Severity note: this is **not a regression against `main`**, which rendered a bare `<Text>`
  with no live region at all, and the repo's only other `aria-live`
  (`ui/components/app/perps/order-entry/components/order-summary/order-summary.tsx:237-245`)
  is conditionally mounted the same way. If the operator would rather ship, this is a fair
  follow-up rather than a blocker — it is the only open item in this review.
