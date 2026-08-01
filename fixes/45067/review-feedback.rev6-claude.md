# Self-Review: MetaMask/metamask-extension#45067

## Verdict: ISSUES

## Summary
The PR blocks doomed withdrawals with a fresh account-state read keyed to a stream
revision, retries `cancelOrder` once after `init()` on `ORDER_UNKNOWN_COIN`, closes the
cancel dialog quietly when the order is already off the book, translates raw provider
prose into cancel-flow copy, and drops the UI-side `Perp Withdrawal Transaction` events
the controller already emits. The work is correct and unusually well tested. One issue
remains: the rev5 "latched error" finding was only half-fixed — the copy changed, the
latch did not, so a stale error still renders next to an enabled Submit button.

**Diff base note:** local `main` is stale; `main...HEAD` is 196 files because 52 upstream
commits are merged in. The worker's own scope is `5b44454253..HEAD` (12 commits):
**15 files, +1334 / −114**. Everything below is reviewed against that range.

## Type Check
- Result: PASS
- New errors: none in changed files.
- Broad `yarn lint:tsc` deliberately **not** run — no `package.json`/`yarn.lock`/dependency
  change, and the only exported-type-surface change (`ERROR_CODE_TO_I18N_KEY` switching
  from a `Record<PerpsErrorCode, string>` annotation to `as const satisfies …`) has exactly
  two consumers, both inside `translate-perps-error.ts` and `cancel-order-modal.tsx:50`.
  Instead ran a scoped `tsc -p` over `perps-withdraw-page.tsx` + `.test.tsx` (the only
  files changed since the last round): **clean**, which also validates the new typed
  `makeAccountState`/`makeSubAccount` helpers against the real `AccountState`.

## Tests
- Result: PASS
- Details: `perps-controller-init.test.ts`, `cancel-order-modal.test.tsx`,
  `orderUtils.test.ts`, `translate-perps-error.test.ts`, `perps-withdraw-page.test.tsx` —
  **311/311 pass, 5/5 suites**. Console baseline clean (act-warning counts 148 / 36 match
  `console-baseline-unit.json`; the new tests add none).
- Gates: `yarn verify-locales --quiet` → "No invalid entries!"; `yarn circular-deps:check`
  → pass. `yarn lint:changed` is a no-op here (it inspects the working tree, which is
  clean), so ESLint was run directly over the 13 branch-changed TS/TSX files with the same
  config: **0 errors, 2 warnings**, both pre-existing `react-hooks/set-state-in-effect` on
  untouched lines (`cancel-order-modal.tsx:88`, `perps-withdraw-page.tsx:185`).

## Test Quality
- Findings: none.
  - No `should` in any added test name; no `toBeTruthy()`/`toBeDefined()` added;
    `userEvent` throughout; async updates wrapped in `act()`; `renderWithProvider` used.
  - i18n copy asserted via `messages.<key>.message`, never as a raw literal. The only
    string literals in new assertions are provider prose
    (`'cancel 0: Order was never placed, already canceled, or filled. asset=4'`,
    `'ORDER_UNKNOWN_COIN'`) and mock-`t` sentinels (`'[perpsCancelOrderFailed]'`) — neither
    is user-facing copy sourced from a message key, so neither is flaggable.
  - The rev5 `as never` nit is fixed: all nine casts are gone, replaced by typed
    `makeAccountState`/`makeSubAccount` helpers (`perps-withdraw-page.test.tsx:145`, `:168`).
  - `PERPS_TOAST_KEYS` in `cancel-order-modal.test.tsx:29` now comes from
    `jest.requireActual`, so a missing key can no longer silently become `key: undefined`.

## Domain Anti-Patterns
- Findings: one nit (see Issues).
  - **Import boundaries** — clean. `shared/constants/perps-events.ts` imports nothing from
    `app/`/`ui/`; the UI reaches the background only through `submitRequestToBackground`,
    matching the file's pre-existing calls.
  - **Controller usage** — no direct state mutation. `perpsGetAccountState` is an existing
    messenger-client method (`perps-controller-init.ts:157`, `:457`), not new plumbing.
  - **LavaMoat** — no dependency or import-graph change (see below).
  - **MV3** — `guardCancelOrder`'s `controller.init()` retry sits on the same path
    `guardWrite`/`withAutoInit` already uses; bounded, no keep-alive concern.
  - **Shared state** — `ORDER_NO_LONGER_OPEN_PATTERN` (`orderUtils.ts:28`) is module-level
    but has no `g` flag, so `.test()` carries no `lastIndex` state. Correct.
  - **Accessibility / loading fallback** — the validation and submit-error lines gained
    `role="alert"`, which is the right call: the blocked-withdrawal path has no other
    feedback. The already-closed toast carries
    `dataTestId: perps-toast-cancel-order-already-closed`. Loading fallback is unchanged
    from `main` (`getTradeableBalance` is byte-identical to the
    `withdrawableBalance ?? spendableBalance ?? '0'` it replaced), so no new
    misleading-default window.
  - **Error handling** — both new swallows are justified inline:
    `perps-withdraw-page.tsx:299` `.catch(() => undefined)` (fail-open, explained in the
    comment block directly above) and `perps-controller-init.ts:342` `catch { return result }`
    (explained on the lines above). No bare `catch (e) {}`.
  - **Magic numbers** — `SHORTFALL_CENTS_ROUNDING` and `STALE_BALANCE_FAILURE_REASON` are
    named constants; no new `.toFixed(N)` or `{min:2, max:2}` anywhere in the diff.

## Mobile Comparison
- Status: DIVERGES (intentionally, and in the extension's favour)
- Details (verified against `/Users/deeeed/dev/metamask/metamask-mobile-ref`):
  - `PerpsWithdrawView.tsx:275-285` submits straight to `controller.withdraw()` with no
    fresh account-state read; `useWithdrawValidation.ts:27-57` validates against the same
    streamed balance. The extension's pre-read is an extension-specific fix — mobile has no
    suspending MV3 service worker — so this is justified divergence, not drift.
  - Mobile never calls `validateWithdrawal` from any withdraw UI either
    (`usePerpsTrading.ts:308-313` is a passthrough with no production call sites), so
    dropping the extension's call converges with mobile rather than diverging.
  - `PerpsOrderDetailsView.tsx:243/246` shows a hard `cancellationFailed` toast
    ("Failed to cancel order" / "Order still active") for *every* cancel failure — mobile
    tells the user the order is still active when it has actually already filled. No
    already-gone handling, no `ORDER_UNKNOWN_COIN` retry, and no cancel-flow i18n override
    (`usePerpsToasts.tsx:703` discards the provider error entirely). The extension is ahead
    on all three; worth porting back to mobile.
  - Formatting: no divergence — no new `.toFixed`, and named constants are used where
    mobile would use them.

## LavaMoat Policy
- Status: N/A
- Details: the worker diff contains no `package.json`, `yarn.lock`, or `lavamoat/` files
  and adds no new runtime dependency (`git diff 5b44454253..HEAD --name-only` → none). The
  8 policy files that show up in `main...HEAD` are upstream churn from the 34 rebased-on
  `main` commits, not this PR.

## Fix Quality
- Best approach: yes, with one caveat.
  - The revision-keyed adoption (`perps-withdraw-page.tsx:133-152`) is the right shape:
    it distinguishes "the stream is still stale" from "the stream re-reported the same
    number", which a value-keyed guard cannot. Implementing it as adjust-state-during-render
    rather than an effect is correct and draws no lint warning.
  - Removing `perpsValidateWithdrawal` costs nothing — verified
    `HyperLiquidProvider.validateWithdrawal` (`dist/providers/HyperLiquidProvider.cjs:2660`)
    is a `return { isValid: true }` placeholder, so the round trip was pure latency. The PR
    description should say this explicitly, because the diff reads like validation was
    dropped.
  - Removing the UI-side `Perp Withdrawal Transaction` events is safe: verified the
    controller emits them on all three outcomes (`AccountService.cjs:183/233/277`) and that
    the extension wires `metrics.trackPerpsEvent` through
    `app/scripts/controllers/perps/infrastructure.ts:176`. The remaining UI-side `Perp Error`
    for the *prevented* withdrawal is correct — the controller never sees that path.
  - The `guardCancelOrder` retry correctly targets a pre-socket failure, so it cannot
    double-cancel. Caveat (observation, unchanged from rev5): the retry makes
    `TradingService.cancelOrder` emit `Perp Order Cancel Transaction` twice for one user
    action (submitted→failed, then submitted→executed). Inherent to the retry; the
    analytics owner should know.
- Would not ship: the latched `submitError` below. Everything else is shippable.
- Test quality: good — failure paths are covered (partial sub-account read, read rejection,
  mid-read stream tick, retry-init throw, retry-cancel throw, adopted-balance release and
  non-re-pin), assertions check specific call arguments rather than mock return values, and
  the guard tests fail if the fix is reverted.
- Brittleness: none material. No import-time evaluation, no mock coupling. The documented
  KNOWN GAP (the spot/abstraction leg is invisible to the sub-account count check) is
  honestly scoped in-comment and self-heals on the next stream tick.

## Diff Quality
- Minimal: yes — 15 files, all in the perps withdraw/cancel path. No reformatting, no
  import churn, no unrelated edits.
- Debug code: none — no `console.log`, no `eslint-disable`, no ticketless TODO, no
  commented-out alternatives. Comment density in `perps-withdraw-page.tsx` is very high
  (roughly 40% of added lines), but every block explains a non-obvious decision, so this is
  an observation rather than a finding.
- Value parity: `availableNum` is the single source for every render path of the balance —
  display (`:600`), `validationMessage` (`:229`), `hasValidInputs` (`:239`), Max and the
  percentage buttons (`:252`, `:255`), and the analytics shortfall (`:385`). No path was
  missed. The confirmations-backed withdraw
  (`ui/pages/confirmations/components/confirm/info/perps-withdraw-info/perps-withdraw-info.tsx:24`)
  still reads only the streamed balance, but it submits through the Pay/transaction flow
  rather than the `perpsWithdraw` background call, and is gated behind the Pay post-quote
  flag — noted as out of scope, not a parity break in this diff.

## Recipe
- Present: yes
- Quality: good (one documented coverage gap)
- Re-run at HEAD: `30f0ee936c` touches `perps-withdraw-page.tsx`, so the on-disk `dist/`
  was stale. Rebuilt via `refresh-build.sh --repo … --watcher-port 9012`, relaunched
  (`runtime-launch` → `runtime_ready`), then re-ran the recipe attached to the live CDP
  runtime: **pass, 28/28 nodes** (`artifacts/recipe-run-rev6/`). Note the checklist's
  `--project-root` / `--launch-existing-dist` invocation is stale for this harness build —
  it fails with `CLI_UNKNOWN_OPTION` and then "no configured slot maps to this repo";
  `--target … --cdp-port 7666` (no `--launch-existing-dist`) is the working form.
- `trace.json` shows the AC-bound nodes actually executing, not a drafted recipe:
  `ac1-assert-orders-absent`, `ac2-cancel-out-of-band`, `ac2-press-cancel`, `ac2-wait-toast`,
  `ac2-screenshot`, `ac2-assert-orders-absent` all `ok: true`.
- Seeds its own data: yes — `metamask.perps.start_state` → `ensure_orders` →
  `close_orders` → `teardown_state`. It cannot pass on an empty wallet.
- Uses `call`-style library actions (`metamask.perps.*`) rather than raw steps; assertions
  are specific (`assert_orders`, `ui.wait_for` on named testIds), not `not_null`.
- `recipe-quality.json` present, verdict `pass`, with the AC3 gap recorded honestly.
- Gap (accepted, pre-existing): AC3 — the withdraw stale-balance guard, the ticket's
  largest bucket — has no live recipe coverage, because a suspended service worker cannot
  currently be staged. Unit-proven only, and `recipe-coverage.md` says so.
- Side findings from my run: 8 events, all environmental (refused `ws://localhost:8080`,
  a 404, chain-ID polling warnings). Unrelated to the diff.

## Visual Evidence
- Status: OK
- Both manifest-referenced PNGs were opened and read, not inferred from filenames.
  `before-ac2-cancel-order-error.png`: modal still open, raw prose
  `cancel 0: Order was never placed, already canceled, or filled. asset=4` in the in-modal
  banner **and** a "Failed to cancel order" toast — the bug, clearly visible.
  `evidence-ac2-cancel-order-already-closed.png`: modal dismissed, ETH market page with no
  error banner, green-check toast reading "This order is no longer open" — the claimed
  element is fully visible, above the fold, on the right screen. My own re-run's capture
  (`recipe-run-rev6/screenshots/evidence-ac2-cancel-order-already-closed.png`) reproduces it
  identically at HEAD.
- `recipe.json` protocol check: the screenshot node is preceded by `ac2-wait-toast`
  (`ui.wait_for` on `perps-toast-cancel-order-already-closed`), so it cannot fire before the
  asserted element exists. No scroll needed — the toast is fixed-position.
- Artifact contract gate: `TASK_ARTIFACT_CONTRACT_PASS`; no `FAIL_*`, no `MISSING:`, no
  `FAIL_VISUAL_CLASSIFICATION`, no `FAIL_INVALID_SCREENSHOT_PROVIDER`.

## Issues

- **ui/pages/perps/perps-withdraw-page.tsx:368** — the rev5 latched-error finding is only
  half-fixed. `setSubmitError(t('perpsWithdrawFailed'))` is still never cleared when the
  stream recovers, so the stale error reappears the moment `validationMessage` clears.
  Repro: streamed balance 100, enter 50, submit, fresh read returns 20 → blocked
  (`submitError` set, `validationMessage` = "Amount exceeds your available Perps balance",
  the latter wins the dedup at `:632`). The stream then catches up at 150 → `availableNum`
  becomes 150, `validationMessage` goes `null`, `hasValidInputs` goes true — and
  `submitError && !validationMessage` now renders **"Withdrawal could not be completed. Try
  again."** beside a $150 balance and an **enabled** Submit button. Changing the copy from
  `perpsWithdrawInsufficient` to the generic `perpsWithdrawFailed` made the sentence vaguer
  but did not remove the latch, which is what the comment at `:361-367` claims to avoid.
  **Verified**, not theoretical: cloning the existing "releases the adopted fresh balance
  once the stream reports a new balance" test and appending
  `expect(screen.queryByText(messages.perpsWithdrawFailed.message)).not.toBeInTheDocument()`
  fails with `found <p …>Withdrawal could not be completed. Try again.</p>`. Fix: clear
  `submitError` when the stream reading advances — the render-phase adjustment at `:137-142`
  that bumps `streamReading` is the natural place — and add that assertion to the existing
  test so it stays fixed.

- **ui/pages/perps/perps-withdraw-page.tsx:620** — the two new `role="alert"` error boxes
  (also `:633`) carry no `data-testid`, so the withdraw error copy — the only user-visible
  surface of AC3, the ticket's largest bucket — is locatable only by its translated text.
  A recipe asserting the guard would have to match copy instead of a testId. Add
  `data-testid="perps-withdraw-validation-error"` and
  `data-testid="perps-withdraw-submit-error"`; under two minutes and it makes the AC3 gap
  closable if the harness ever gains service-worker suspension.
