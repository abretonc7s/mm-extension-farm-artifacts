# Self-Review: MetaMask/metamask-extension#45067

## Verdict: ISSUES

## Summary
The PR blocks doomed withdrawals with a fresh account-state read keyed to a stream
revision, retries `cancelOrder` once after `init()` on `ORDER_UNKNOWN_COIN`, closes the
cancel dialog quietly when the order is already off the book, translates raw provider
prose into cancel-flow copy, and drops the UI-side `Perp Withdrawal Transaction` events
the controller already emits. Both rev6 findings are genuinely fixed. One new issue: the
pass-5 fix for the latched error over-corrected — the render-phase `setSubmitError(null)`
clears **every** submit outcome message on any balance tick, so a genuine `perpsWithdraw`
failure (which has no other surface on this page) can vanish before the user reads it.
Verified, not theoretical.

**Diff base note:** local `main` is stale; `main...HEAD` shows 196 files because 52
upstream commits are merged in. The worker's own scope is `5b44454253..HEAD` (13 commits):
**15 files, +1354 / −114**. Everything below is reviewed against that range.

## Type Check
- Result: PASS
- New errors: none in changed files.
- Broad `yarn lint:tsc` deliberately **not** run — no `package.json` / `yarn.lock` /
  dependency change in this diff. Instead ran a scoped `tsc -p` (root tsconfig, `include`
  limited to `perps-withdraw-page.tsx(.test)`, `translate-perps-error.ts`,
  `cancel-order-modal.tsx`, `perps-controller-init.ts`): **clean, exit 0**. That covers the
  one exported-type-surface change (`ERROR_CODE_TO_I18N_KEY` switching from a
  `Record<PerpsErrorCode, string>` annotation to `as const satisfies …`), whose only two
  consumers are inside those files.

## Tests
- Result: PASS
- Details: `perps-controller-init.test.ts`, `cancel-order-modal.test.tsx`,
  `orderUtils.test.ts`, `translate-perps-error.test.ts`, `perps-withdraw-page.test.tsx` —
  **311/311 pass, 5/5 suites**, no console-baseline violations.
- Gates: `yarn verify-locales --quiet` → "No invalid entries!"; `yarn circular-deps:check`
  → pass. `yarn lint:changed` is a no-op (working tree is clean), so ESLint was run
  directly over all 13 branch-changed TS/TSX files with the same config: **0 errors,
  0 warnings** — the two `react-hooks/set-state-in-effect` warnings rev6 saw are gone.

## Test Quality
- Findings: none.
  - No `should` in any added test name (`shouldDisplayOrderInMarketDetailsOrders` at
    `orderUtils.test.ts:142` is a pre-existing function name, not a test name). No
    `toBeTruthy()` / `toBeDefined()` added. `userEvent` throughout, async updates wrapped
    in `act()`, `renderWithProvider` used.
  - i18n copy asserted via `messages.<key>.message`, never as a raw literal. The only new
    string literals are provider prose (`'cancel 0: Order was never placed, already
    canceled, or filled. asset=4'`, `'ORDER_UNKNOWN_COIN'`) and mock-`t` sentinels
    (`'[perpsCancelOrderFailed]'`) — neither is user-facing copy sourced from a message key.
  - No `as never` / `as any` in the added `AccountState` fixtures; `makeAccountState` /
    `makeSubAccount` (`perps-withdraw-page.test.tsx:137`, `:157`) are typed against the real
    controller type.
  - Assertions check specific call arguments (exact `Perp Error` payloads including
    `stale_balance_shortfall: 80` / `50`), not mock return values, and the guard tests fail
    if the fix is reverted.

## Domain Anti-Patterns
- Findings: one a11y nit (see Issues).
  - **Import boundaries** — clean. `shared/constants/perps-events.ts` imports nothing from
    `app/`/`ui/`; the UI reaches background only via `submitRequestToBackground`.
  - **Controller usage** — no direct state mutation. `perpsGetAccountState` is an existing
    messenger-client method, not new plumbing.
  - **LavaMoat** — no dependency or import-graph change.
  - **MV3** — `guardCancelOrder`'s `controller.init()` retry sits on the same path
    `guardWrite`/`withAutoInit` already uses; single, bounded retry, no keep-alive concern.
  - **Shared state** — `ORDER_NO_LONGER_OPEN_PATTERN` (`orderUtils.ts:28`) is module-level
    but carries no `g` flag, so `.test()` holds no `lastIndex` state. Correct.
  - **Error handling** — both new swallows are justified by the comment block directly
    above them: `perps-withdraw-page.tsx:302` `.catch(() => undefined)` (fail-open, comment
    at `:295-301`) and `perps-controller-init.ts:349` `catch { return result }` (comment at
    `:344-348`). No bare `catch (e) {}`.
  - **Magic numbers** — `SHORTFALL_CENTS_ROUNDING`, `STALE_BALANCE_FAILURE_REASON` named;
    no new `.toFixed(N)` or `{min:2, max:2}` anywhere in the diff.
  - **testIDs** — the two error boxes now carry `perps-withdraw-validation-error` /
    `perps-withdraw-submit-error`; the toast carries
    `perps-toast-cancel-order-already-closed`.
  - **Local mirror accuracy** — re-verified that the hand-added
    `PERPS_EVENT_VALUE.ERROR_TYPE.VALIDATION` and `ERROR_MESSAGE_KEY.INSUFFICIENT_BALANCE`
    match the controller's canonical values
    (`@metamask/perps-controller/dist/constants/eventNames.cjs:323,329,334`). No drift.

## Mobile Comparison
- Status: DIVERGES (intentionally, in the extension's favour)
- Details (verified against `/Users/deeeed/dev/metamask/metamask-mobile-ref`):
  - `PerpsWithdrawView.tsx:282` submits straight to `controller.withdraw()` with no fresh
    account-state read, and navigates back *before* the call resolves. Mobile has no
    suspending MV3 service worker, so the extension's pre-read is an extension-specific
    fix, not drift.
  - Mobile never calls `validateWithdrawal` from any withdraw UI, so dropping the
    extension's call converges with mobile. Independently confirmed the call was pure
    latency: `HyperLiquidProvider.validateWithdrawal`
    (`dist/providers/HyperLiquidProvider.mjs:2657`) is a `return { isValid: true }`
    placeholder.
  - `PerpsOrderDetailsView.tsx:243,246` shows a hard `cancellationFailed` toast for *every*
    cancel failure — mobile still tells the user the order is "still active" when it has
    already filled. No already-gone handling, no `ORDER_UNKNOWN_COIN` retry, no cancel-flow
    i18n override. The extension is ahead on all three; worth porting back.
  - Formatting: no divergence — no new `.toFixed`, named constants used.

## LavaMoat Policy
- Status: N/A
- Details: `git diff 5b44454253..HEAD --name-only` contains no `package.json`, `yarn.lock`,
  or `lavamoat/` file and adds no runtime dependency. The 8 policy files visible in
  `main...HEAD` are upstream churn from the rebased-on `main` commits, not this PR.

## Fix Quality
- Best approach: mostly yes — one over-correction (Issue 1).
  - Revision-keyed adoption (`perps-withdraw-page.tsx:133-157`) is the right shape: it
    distinguishes "stream still stale" from "stream re-reported the same number", which a
    value-keyed guard cannot. Implemented as adjust-state-during-render rather than an
    effect, which is correct and draws no lint warning.
  - The `guardCancelOrder` retry correctly targets a **pre-socket** validation failure —
    confirmed in the provider source: `HyperLiquidProvider.cancelOrder`
    (`dist/providers/HyperLiquidProvider.mjs:595-601`) throws `ORDER_UNKNOWN_COIN` from
    `validateCoinExists` *before* `#ensureReadyForTrading()` and before any exchange call,
    so the retry cannot double-cancel. Caveat unchanged from rev5/rev6: the retry makes
    `TradingService.cancelOrder` emit `Perp Order Cancel Transaction` twice for one user
    action (submitted→failed, then submitted→executed). Inherent to retrying at this layer;
    the analytics owner should know.
  - Not emitting a UI event on the already-closed path is right, and the comment's premise
    is verified: `TradingService.cancelOrder`
    (`dist/services/TradingService.cjs:426,450,469`) emits submitted then executed/failed
    unconditionally, so the attempt is already in the funnel.
  - Removing the UI-side `Perp Withdrawal Transaction` events is safe — the controller
    emits them on all three outcomes (`AccountService.cjs:183,233,277`). Keeping the
    UI-side `Perp Error` for the *prevented* withdrawal is correct: the controller never
    sees that path.
- Would not ship: Issue 1. A withdrawal that genuinely fails must not lose its only
  feedback on the next price tick.
- Test quality: good — failure paths covered (partial sub-account read, read rejection,
  mid-read stream tick, retry-init throw, retry-cancel throw, adopted-balance release and
  non-re-pin, negative-shortfall regression). Gap: no test pins the lifetime of a **genuine**
  `perpsWithdraw` failure message across a balance tick, which is why Issue 1 slipped
  through — my probe of exactly that scenario fails on HEAD.
- Brittleness: none material beyond Issue 1. No import-time evaluation, no mock coupling.
  The documented KNOWN GAP (`perps-withdraw-page.tsx:312-325`, spot/abstraction leg
  invisible to the sub-account count check) is honestly scoped and self-heals on the next
  stream tick; I re-verified the reasoning against `HyperLiquidProvider.getAccountState`
  and agree documentation is the right call here rather than a second confirming read.

## Diff Quality
- Minimal: yes — 15 files, all in the perps withdraw/cancel path. No reformatting, no
  import churn, no unrelated edits, no dead constants.
- Debug code: none — no `console.log`, no `eslint-disable`, no ticketless TODO, no
  commented-out alternatives, no `as any`/`as unknown as`/`as never` added.
- Value parity: `availableNum` is the single source for every render path of the balance —
  display (`:605`), `validationMessage` (`:234`), `hasValidInputs` (`:244`), Max and the
  percentage buttons (`:257`, `:260`), and the analytics shortfall (`:390`). No path missed.
- Out-of-scope observation (not a finding): the cancel-**all**-orders path
  (`ui/components/app/perps/perps-view.tsx:284-297`) still shows a bare
  `t('somethingWentWrong')` for every failure — no `translatePerpsError`, no already-closed
  handling. Same class of bug as AC2, different component, and pre-existing. Worth a
  follow-up ticket, not an expansion of this PR.

## Recipe
- Present: yes
- Quality: good (one documented coverage gap)
- Re-run at HEAD: the on-disk dist was stale (built 01:16, three later commits touched
  `perps-withdraw-page.tsx`). Rebuilt via `refresh-build.sh --watcher-port 9012`,
  relaunched (`runtime-launch` → `runtime_ready`, `hasStore: true`,
  `hasSubmitRequest: true`), then re-ran attached to the live CDP runtime: **pass, 28/28
  nodes** (`artifacts/recipe-run-rev7/`). Note the checklist's `--project-root` /
  `--launch-existing-dist` form is still stale for harness 0.29.3; `--cdp-port 7666` alone
  is the working invocation.
- `trace.json` shows the AC-bound nodes actually executing, not a drafted recipe:
  `ac1-press-cancel`, `ac1-assert-orders-absent`, `ac2-cancel-out-of-band`,
  `ac2-press-cancel`, `ac2-wait-toast`, `ac2-screenshot`, `ac2-assert-orders-absent` all
  `ok: true`.
- Seeds its own data: yes — `start_state` → `ensure_orders` → `close_orders` →
  `teardown_state`. It cannot pass on an empty wallet.
- Uses `call`-style library actions (`metamask.perps.*`) rather than raw steps; assertions
  are specific (`assert_orders`, `ui.wait_for` on named testIds), not `not_null`.
- `recipe-quality.json` present, verdict `pass`, AC3 gap recorded honestly.
- Gap (accepted, pre-existing): AC3 — the withdraw stale-balance guard, the ticket's
  largest bucket — has no live coverage, because a suspended service worker cannot be
  staged today. Unit-proven only, and `recipe-coverage.md` says so.
- Side findings from my run: 10 events. Eight environmental (refused `ws://localhost:8080`,
  a 404, `Invalid chain ID "0x89"` polling, `componentWillReceiveProps`, "Sentry not
  initialized"). The two remaining are the *expected* `cancel 0: Order was never placed,
  already canceled, or filled. asset=4` errors the graph stages on purpose — they are the
  proof that the controller still logs the provider failure while the UI shows the neutral
  toast.

## Visual Evidence
- Status: OK
- Both manifest-referenced PNGs were opened and read, not inferred from filename or run
  status. `before-ac2-cancel-order-error.png`: modal still open, raw prose `cancel 0: Order
  was never placed, already canceled, or filled. asset=4` in the in-modal banner **and** a
  "Failed to cancel order" toast — the bug, clearly visible.
  `evidence-ac2-cancel-order-already-closed.png`: modal dismissed, ETH market page, no
  error banner, green-check toast reading "This order is no longer open" — claimed element
  fully visible, above the fold, on the right screen. My own re-run's capture
  (`recipe-run-rev7/screenshots/evidence-ac2-cancel-order-already-closed.png`) reproduces
  it identically at HEAD.
- Protocol check: the screenshot node is preceded by `ac2-wait-toast` (`ui.wait_for` on
  `perps-toast-cancel-order-already-closed`), so it cannot fire before the asserted element
  exists. No scroll needed — the toast is fixed-position.
- Artifact contract gate: `TASK_ARTIFACT_CONTRACT_PASS`. No `FAIL_VISUAL_CLASSIFICATION`
  (AC2 is classified `mixed` in `recipe-coverage.md`), no `FAIL_EMPTY`, no `MISSING:`, no
  `FAIL_INVALID_SCREENSHOT_PROVIDER`.

## Issues

- **ui/pages/perps/perps-withdraw-page.tsx:146** — the pass-5 fix over-corrected: the
  render-phase `setSubmitError(null)` clears **every** submit outcome message whenever the
  streamed balance changes, not just the stale-balance guard's own. A genuine
  `perpsWithdraw` failure — set at `:411` (`result.success === false`) and `:429` (throw) —
  has *no other surface* on this page: no toast, no navigation, no controller-driven UI
  state. And `withdrawableBalance` moves with unrealized PnL, so for any user with an open
  position it ticks constantly. The error therefore disappears within a tick, leaving an
  enabled Submit button and a click that looks like it did nothing — the exact silent-no-op
  failure mode the pass-2 fix exists to prevent, reintroduced on the genuine-failure path.
  **Verified, not theoretical:** appending a single `$100 → $100.01` stream tick (one
  `rerender` with `makeAccountState({ spendableBalance: '100.01' })`) to the existing
  "shows failure message and clears withdraw result when perpsWithdraw throws" test
  (`perps-withdraw-page.test.tsx:1141`) makes
  `expect(screen.queryByText(messages.perpsWithdrawFailed.message)).toBeInTheDocument()`
  fail with `Received has value: null`. Fix: the narrower version the worker's own report
  offered as the alternative — tag the error with its origin and clear only the
  balance-derived one, e.g. `useState<{ message: string; fromStaleBalanceGuard: boolean }
  | null>` (or a separate `staleBalanceBlockMessage` state), and have the render-phase
  adjustment at `:137-147` clear only that one. Then pin both lifetimes with tests: the
  guard's message clears on a tick, a `perpsWithdraw` failure does not.

- **ui/pages/perps/perps-withdraw-page.tsx:625** — `role="alert"` is an *assertive* live
  region, but this box holds the typing-driven `validationMessage`, which changes as the
  user edits the amount (invalid → below-minimum → exceeds-balance). Each mount and each
  text change interrupts a screen reader mid-utterance while the user is still typing. The
  submit-error box at `:638` is genuinely submit-triggered and correctly assertive; this
  one should be polite. The closest repo precedent for a continuously-updating perps value
  is `aria-live="polite"`
  (`ui/components/app/perps/order-entry/components/order-summary/order-summary.tsx:240`) —
  `role="alert"` appears nowhere else in `ui/` except a loading spinner. Swap `:625` to
  `aria-live="polite"`, keep the `data-testid`, leave `:638` alone. Under two minutes.

- **ui/components/app/perps/cancel-order/cancel-order-modal.tsx:188** — the comment
  references sibling code by line number ("The success (~line 169) and generic-failure
  (~line 198) paths below"). The success reference is right, but the generic-failure
  `track` call is at `:202`, not `:198` — the reference rotted within the same PR that
  wrote it. The rest of the comment is valuable and should stay; just name the paths
  ("the success path above and the generic-failure path below") instead of pinning line
  numbers that no tooling maintains.
