# Self-Review: MetaMask/metamask-extension#45067

## Verdict: ISSUES

## Summary
The PR adds a fresh account-state read that blocks doomed withdrawals against a stale
streamed balance, retries `cancelOrder` once after `init()` on `ORDER_UNKNOWN_COIN`,
closes the cancel dialog quietly when the order is already off the book, translates raw
provider prose into cancel-flow copy, and removes UI-side `Perp Withdrawal Transaction`
events the controller already emits. The fixes are correct and well-tested; two issues
remain — one verified UI-state bug where a stale "insufficient balance" error survives a
stream recovery, and one test-hygiene nit.

**Diff base note:** local `main` is stale (2026-07-30). Reviewed against `origin/main`
(`9def44e4a6`): **15 files, +1269 / −111**.

## Type Check
- Result: PASS
- New errors: none
- Broad `yarn lint:tsc` deliberately **not** run (no `package.json`/`yarn.lock`/dependency
  change; the only type-surface change, `ERROR_CODE_TO_I18N_KEY` switching from a
  `Record<PerpsErrorCode, string>` annotation to `as const satisfies …`, is consumed only
  inside `translate-perps-error.ts` and its own test). Instead ran a scoped
  `tsc --noEmit --strict` over `translate-perps-error.ts` (clean) and over
  `perps-withdraw-page.tsx` / `cancel-order-modal.tsx` / `perps-controller-init.ts`
  (only `TS7016` artifacts of the ad-hoc `allowJs:false` config on untyped `.js` imports —
  no real errors in changed files).

## Tests
- Result: PASS
- Details: `perps-withdraw-page.test.tsx`, `cancel-order-modal.test.tsx`,
  `orderUtils.test.ts`, `translate-perps-error.test.ts`,
  `perps-controller-init.test.ts` — **311/311 pass, 5/5 suites**.
  Console baseline clean: act-warning counts (148 / 36) match `console-baseline-unit.json`
  unchanged from `origin/main`, so the ~20 new tests add no act warnings.
- Gates: `yarn verify-locales --quiet` → "No invalid entries!"; `yarn circular-deps:check`
  → pass. `yarn lint:changed` is a no-op here (it only inspects the working tree, which is
  clean), so ESLint was run directly over the 13 branch-changed JS/TS files with the same
  config: **0 errors, 2 warnings**, both pre-existing `react-hooks/set-state-in-effect` on
  untouched lines (`cancel-order-modal.tsx:88`, `perps-withdraw-page.tsx:185`).

## Test Quality
- Findings:
  - No `should` in any test name; assertions are specific (no `toBeTruthy`/`toBeDefined`
    added); `userEvent` throughout; async updates wrapped in `act()`.
  - i18n copy is asserted via `messages.<key>.message`, not raw literals — the diff in fact
    *replaces* three hardcoded literals (`'Order not found'`, `'Network error'`,
    `'Cancel request rejected'`) with message references. Good direction.
  - Replacing the hand-maintained `PERPS_TOAST_KEYS` mock with `jest.requireActual` is a
    real robustness win (the old subset would silently emit `key: undefined`).
  - Tests are not tautological: the report documents two new regression tests verified to
    fail on the pre-fix code, and the `guardCancelOrder` / `isOrderNoLongerOpenError` /
    fresh-balance tests all fail if the corresponding fix is reverted.
  - One nit below (`as never`).

## Domain Anti-Patterns
- Findings: none blocking.
  - **Import boundaries** — clean. `shared/constants/perps-events.ts` imports nothing from
    `app/`/`ui/`; the UI reaches the background only through
    `submitRequestToBackground`, matching the file's existing calls.
  - **Controller usage** — no direct state mutation; `perpsGetAccountState` is an existing
    messenger-client method, not new plumbing.
  - **MV3** — `guardCancelOrder`'s `controller.init()` retry sits on the same path
    `guardWrite`/`withAutoInit` already uses; no new keep-alive concern.
  - **Shared state** — `ORDER_NO_LONGER_OPEN_PATTERN` is module-level but has no `g` flag,
    so `.test()` carries no `lastIndex` state. Correct.
  - **Accessibility** — the validation and submit-error lines gained `role="alert"`, which
    is the right call: the blocked-withdrawal path has no other feedback. Verified the
    already-closed toast carries `dataTestId: perps-toast-cancel-order-already-closed`.
  - **Error handling** — the two new swallows are both justified inline:
    `perps-withdraw-page.tsx:299` `.catch(() => undefined)` (fail-open, explained in the
    comment block directly above) and `perps-controller-init.ts:342` `catch { return result }`
    (explained on the lines above). No bare `catch (e) {}`.
  - **Magic numbers** — `SHORTFALL_CENTS_ROUNDING` / `STALE_BALANCE_FAILURE_REASON` are
    named constants; no new `.toFixed(N)` or `{min:2,max:2}` anywhere in the diff.

## Mobile Comparison
- Status: DIVERGES (intentionally, and in the right direction)
- Details:
  - `PerpsWithdrawView.tsx:247` (mobile) submits straight to `controller.withdraw()` with no
    fresh account-state read. The extension's new pre-read
    (`perps-withdraw-page.tsx:297`) is an extension-specific fix — mobile has no suspending
    MV3 service worker, so the stale-stream driver differs. Justified divergence, not drift.
  - **ALIGNED (new):** mobile fires no UI-side `Perp Withdrawal Transaction`; it relies on
    the controller. Removing the extension's UI copies converges on mobile. Verified the
    controller is the emitter and is wired in the extension:
    `AccountService.cjs:183/233/277` → `infrastructure.ts:176` `trackPerpsEvent`.
  - `PerpsOrderDetailsView.tsx:217` (mobile) has no already-closed special case and no
    `ORDER_UNKNOWN_COIN` retry — the extension is ahead here. Worth porting back to mobile.
  - Pre-existing, out of scope: mobile passes `trackingData` (source/attribution) to
    `cancelOrder`; the extension does not.
  - Formatting: no divergence — `getTradeableBalance()` is byte-identical to the
    `withdrawableBalance ?? spendableBalance ?? '0'` it replaced.

## LavaMoat Policy
- Status: N/A
- Details: no `package.json` / `yarn.lock` / dependency changes and no `lavamoat/` files in
  the diff. Consistent.

## Fix Quality
- Best approach: yes, with one caveat.
  - The revision-keyed adoption (`perps-withdraw-page.tsx:133-152`) is the right shape: it
    correctly distinguishes "stream still stale" from "stream re-reported the same number",
    which a value-keyed guard cannot. Implementing it as adjust-state-during-render rather
    than a `useRef` counter is the correct call — the ref version trips `react-hooks/refs`.
  - Removing `perpsValidateWithdrawal` costs nothing: `HyperLiquidProvider.validateWithdrawal`
    is a `return { isValid: true }` placeholder, so the round trip was pure latency. Good
    simplification, though the PR description should say so explicitly since the diff reads
    like validation was dropped.
  - The `guardCancelOrder` retry correctly targets the pre-socket failure:
    `HyperLiquidProvider.cancelOrder` runs `validateCoinExists` *before*
    `#ensureReadyForTrading()`, so `ORDER_UNKNOWN_COIN` means nothing reached the exchange
    and the retry cannot double-cancel.
  - Caveat (observation, not a blocker): the retry causes `TradingService.cancelOrder` to
    emit `Perp Order Cancel Transaction` twice (submitted → failed, then submitted →
    executed) for one user action. Inherent to the retry and consistent with `withAutoInit`
    elsewhere, but the analytics owner should know.
- Would not ship: the stale `submitError` below. Everything else is shippable.
- Test quality: good — regression tests verified against pre-fix code, failure paths
  covered (partial sub-account read, read rejection, mid-read stream tick, retry-init throw,
  retry-cancel throw), and the guard tests fail if the fix is reverted.
- Brittleness: none material. No import-time evaluation, no mock coupling; the one
  module-level value (`ORDER_NO_LONGER_OPEN_PATTERN`) is stateless. The documented
  KNOWN GAP (spot/abstraction leg invisible to the sub-account count check) is honestly
  scoped in-comment and self-heals on the next stream tick.

## Diff Quality
- Minimal: yes — 15 files, all in the perps withdraw/cancel path. No reformatting, no
  import churn, no unrelated edits.
- Debug code: none — no `console.log`, no `eslint-disable`, no ticketless TODO, no
  commented-out alternatives. Comment density is high but every block explains a
  non-obvious decision.

## Recipe
- Present: yes
- Quality: good (one documented coverage gap)
- Re-run at HEAD: the on-disk `dist/` predated HEAD (`6891998067`, which touches
  `cancel-order-modal.tsx`, `translate-perps-error.ts` and `perps-withdraw-page.tsx`), so
  I rebuilt via `refresh-build.sh`, relaunched (`runtime-launch` → `runtime_ready`,
  `hasStore: true`, `perpsManagerInitialized: true`) and re-ran:
  **pass, 28/28 nodes** (`artifacts/recipe-run-rev5c/`). `trace.json` shows the AC-bound
  nodes actually executing (`ac1-assert-orders-absent`, `ac2-cancel-out-of-band`,
  `ac2-wait-toast`, `ac2-screenshot`, `ac2-assert-orders-absent`), not a drafted recipe.
- Seeds its own data: yes — `metamask.perps.start_state` → `ensure_orders` →
  `close_orders` → `teardown_state`. Cannot pass on an empty wallet.
- Uses `call`-style library actions (`metamask.perps.*`) rather than raw steps; assertions
  are specific (`assert_orders`, `ui.wait_for` on a named testId), not `not_null`.
- `recipe-quality.json` present, verdict `pass`, with `ac_coverage: warn` honestly
  recording the gap.
- Gap (accepted, not a new finding): AC3 — the withdraw stale-balance guard, the ticket's
  largest bucket — has no live recipe coverage because a suspended service worker cannot
  currently be staged. Unit-proven only, and documented as such in `recipe-coverage.md`.
- Side findings from the run (11 events) are environmental: `ws://localhost:8080` refused,
  a 404, `Invalid chain ID "0x89"` polling warnings. Unrelated to the diff.

## Visual Evidence
- Status: OK
- Both manifest-referenced PNGs were read, not inferred from filenames.
  `before-ac2-cancel-order-error.png` shows the modal still open with the raw prose
  `cancel 0: Order was never placed, already canceled, or filled. asset=4` in the banner and
  a "Failed to cancel order" toast. `evidence-ac2-cancel-order-already-closed.png` shows the
  modal dismissed, no error banner, and a green-check toast reading
  "This order is no longer open" — the claimed element is fully visible, above the fold, on
  the right screen. My re-run at HEAD reproduced an equivalent capture
  (`recipe-run-rev5c/screenshots/evidence-ac2-cancel-order-already-closed.png`).
- `recipe.json` protocol check: the screenshot node is preceded by `ac2-wait-toast`
  (`ui.wait_for` on `perps-toast-cancel-order-already-closed`), so it cannot fire before the
  asserted element exists. No scroll needed — the toast is fixed-position.
- Artifact contract gate: `TASK_ARTIFACT_CONTRACT_PASS`, no `FAIL_*`, no `MISSING:`, no
  `FAIL_VISUAL_CLASSIFICATION`, no `FAIL_INVALID_SCREENSHOT_PROVIDER`.

## Issues

- **ui/pages/perps/perps-withdraw-page.tsx:360** — a blocked withdrawal's `submitError` is
  never cleared when the balance recovers, so the page renders "Amount exceeds your
  available Perps balance." next to an **enabled** Submit button. Repro: enter 50 against a
  streamed 100, submit, fresh read returns 20 → blocked (`submitError` and
  `validationMessage` both set, deduped to one line at :624). The stream then catches up at
  150 → `availableNum` becomes 150, `validationMessage` goes `null`, `hasValidInputs` goes
  true, but `submitError` survives and now no longer matches `validationMessage`, so the
  dedup at :624 stops suppressing it and the stale error renders. Verified with a probe test
  bolted onto the existing "releases the adopted fresh balance once the stream reports a new
  balance" case: `queryByText(messages.perpsWithdrawInsufficient.message)` still finds
  `<p …>Amount exceeds your available Perps balance.</p>` after the stream reports $150.
  Fix: clear `submitError` when the blocking condition no longer holds (e.g. an effect keyed
  on `availableNum`, or reset it alongside the adopted balance), and add the assertion above
  to that test so it stays fixed.

- **ui/pages/perps/perps-withdraw-page.test.tsx:523** — seven new `as never` casts on
  partial `AccountState` mocks (also :592, :648, :796, :856, :873, :929, :1286), taking the
  file from 3 to 10. `as never` silences the type checker more completely than the `as any`
  the project rules and `extension-review-antipatterns.md` §7 already ban, so a real shape
  drift in `AccountState` would not surface here. It follows the file's existing convention,
  hence low severity — but a single typed `makeAccountState(partial)` helper would remove
  all ten and is a cheap win while this file is already being touched.
