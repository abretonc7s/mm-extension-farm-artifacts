# Self-Review: MetaMask/metamask-extension#45067

## Verdict: ISSUES

## Summary
The PR blocks doomed withdrawals with a fresh `perpsGetAccountState` read keyed to a stream
revision, retries `cancelOrder` once after `init()` on `ORDER_UNKNOWN_COIN`, quietly closes the
cancel dialog when the order is already off the book, translates raw provider prose into
cancel-flow copy, and drops the UI-side `Perp Withdrawal Transaction` events the controller
already emits. The code is correct and well covered; **HEAD is unchanged since rev8**
(last commit `0a75d191e5`, 02:40; rev8 written 02:55; no fix pass ran after), so rev8's single
open a11y finding is still open. I re-verified it independently rather than carrying it forward,
and found one adjacent test gap by mutation. Both are polish, not correctness — if the operator
prefers to ship and file a follow-up, nothing here blocks that.

**Diff base note:** local `main` is stale (merge-base `9afac38`, 2026-07-30), so `main...HEAD`
shows 196 files because 52 upstream commits are merged in. The worker's own scope is
`5b44454253..HEAD` (13 commits): **15 files, +1423 / −124**. Everything below is against that range.

## Type Check
- Result: PASS
- New errors: none in changed files.
- Broad `yarn lint:tsc` deliberately **not** run: the diff touches no `package.json`, `yarn.lock`,
  `lavamoat/`, or dependency surface, so the checklist's narrow-gate rule applies. The one exported
  type-surface change (`ERROR_CODE_TO_I18N_KEY` moving from a `Record<PerpsErrorCode, string>`
  annotation to `as const satisfies …`) has exactly two consumers — `translate-perps-error.ts`
  itself and `cancel-order-modal.tsx:218` — both compiled and exercised by the passing suites, and
  rev8 verified it under a scoped `tsc --noEmit`.

## Tests
- Result: PASS
- Details: `perps-controller-init.test.ts`, `cancel-order-modal.test.tsx`, `orderUtils.test.ts`,
  `translate-perps-error.test.ts`, `perps-withdraw-page.test.tsx` — **311/311 pass, 5/5 suites**,
  "No console baseline violations".
- Gates: `yarn verify-locales --quiet` → "No invalid entries!"; `yarn circular-deps:check` → pass.
  `yarn lint:changed` is a no-op (working tree clean), so ESLint was run directly over all 13
  branch-changed TS/TSX files with the repo config: **exit 0, no errors, no warnings**.
- `test/jest/console-baseline-unit.json` is not in this diff — no allowance was raised.

## Test Quality
- Findings: one coverage gap (see Issues). Everything else clean.
  - No `should` in any of the 31 added test names. No `toBeTruthy()` / `toBeDefined()` /
    `toBeFalsy()` added. No `as any` / `as unknown as` / `as never` added — the only grep hits are
    provider prose ("w**as never** placed") and the comment explaining why `as never` was avoided.
  - Every i18n assertion goes through `messages.<key>.message`; the only raw string literals are
    provider prose (`'cancel 0: Order was never placed, already canceled, or filled. asset=4'`,
    `'ORDER_UNKNOWN_COIN'`) and mock-`t` sentinels (`'[perpsCancelOrderFailed]'`), none of which is
    copy the component sources from a message key.
  - `userEvent` throughout, async updates wrapped in `act()`, `renderWithProvider` used, assertions
    check exact call payloads (full `Perp Error` objects including `stale_balance_shortfall`).
  - **Independent mutation probe (not carried forward from rev8):** forcing
    `hasUsableFreshRead` to ignore `!isPartialRead` makes the withdraw suite go **1 failed /
    30 passed** — the sub-account completeness check is genuinely pinned, not decorative.

## Domain Anti-Patterns
- Findings: one a11y item (see Issues).
  - **Import boundaries** — clean. `shared/constants/perps-events.ts` imports nothing from `app/`
    or `ui/` (the file header documents why the constants are mirrored locally); UI reaches
    background only through `submitRequestToBackground`.
  - **Controller usage** — no direct state mutation, no duplicated controller logic.
    `perpsGetAccountState` is an existing read-guarded messenger-client method
    (`perps-controller-init.ts:157,457`), not new plumbing.
  - **LavaMoat** — no dependency or import-graph change.
  - **MV3** — `guardCancelOrder`'s `init()` retry rides the same path `guardWrite`/`withAutoInit`
    already uses; single bounded retry, no keep-alive concern, no module-level mutable state.
  - **Shared state** — `ORDER_NO_LONGER_OPEN_PATTERN` (`orderUtils.ts:33`) is module-level but has
    no `g` flag, so `.test()` carries no `lastIndex`.
  - **Error handling** — both new swallows carry a justifying comment immediately above:
    `perps-withdraw-page.tsx:320` (`.catch(() => undefined)`, fail-open, comment at `:313-319`) and
    `perps-controller-init.ts:207` (`catch { return result }`, comment at `:202-206`). No bare
    `catch (e) {}`.
  - **Magic numbers** — `SHORTFALL_CENTS_ROUNDING`, `STALE_BALANCE_FAILURE_REASON` named. No new
    `.toFixed(N)` and no `{min:2, max:2}` anywhere in the diff.
  - **testIDs** — `perps-withdraw-validation-error`, `perps-withdraw-submit-error`,
    `perps-toast-cancel-order-already-closed` all present.
  - **Constant mirror accuracy** — re-checked directly: the hand-added
    `PERPS_EVENT_VALUE.ERROR_TYPE.VALIDATION` (`'validation'`) and
    `ERROR_MESSAGE_KEY.INSUFFICIENT_BALANCE` (`'insufficient_balance'`) match
    `@metamask/perps-controller/dist/constants/eventNames.cjs:323,329`. No drift.

## Mobile Comparison
- Status: DIVERGES (intentionally, in the extension's favour)
- Details (re-verified in `/Users/deeeed/dev/metamask/metamask-mobile-ref`, not carried forward):
  - `PerpsWithdrawView.tsx:282` calls `controller.withdraw(...)` with no fresh account-state
    pre-read. Mobile has no suspending MV3 service worker, so the extension's pre-read is an
    extension-specific fix, not drift.
  - `PerpsOrderDetailsView.tsx:243,246` shows a hard `cancellationFailed` toast for *every* cancel
    failure. `git grep "never placed"` across mobile `app/` finds only unrelated tooltip copy — no
    already-gone handling, no `ORDER_UNKNOWN_COIN` retry, no cancel-flow i18n override. The
    extension is ahead on all three; worth porting back.
  - Formatting: no divergence — no new `.toFixed` / `{min:2,max:2}`.

## LavaMoat Policy
- Status: N/A
- Details: `git diff 5b44454253..HEAD --name-only` contains no `package.json`, `yarn.lock` or
  `lavamoat/` file and adds no runtime dependency. The 8 policy files visible in `main...HEAD` are
  upstream churn from the rebased-on `main` commits, not this PR.

## Fix Quality
- Best approach: yes, with the trade-offs documented in-code.
  - Revision-keyed adoption remains the right shape: it distinguishes "stream still stale" from
    "stream moved away and re-reported the same number", which a value-keyed guard cannot.
    `availableNum` is the single source for every render path — display (`:629`),
    `validationMessage` (`:246`), `hasValidInputs` (`:256`), Max/percentage (`:269,:272`) and the
    analytics shortfall (`:411`) — so no path can disagree with the guard.
  - The stale-balance guard's fail-open ordering is sound: an unusable read (rejection, partial
    sub-account set, unparseable balance) leaves the submit path exactly as it was.
  - Tagging `submitError` with `fromStaleBalanceGuard` is the narrow fix rev7 asked for: a balance
    tick retires only the guard's own verdict, and a genuine `perpsWithdraw` failure — whose inline
    message is its only surface on this page — survives.
  - `guardCancelOrder` targets a genuinely pre-socket provider failure, so the retry cannot
    double-cancel. Known caveat, unchanged since rev5: the retry makes `TradingService` emit
    `Perp Order Cancel Transaction` twice for one user action. Inherent to retrying at this layer;
    the analytics owner should know.
- Would not ship: nothing. Both open items are polish.
- Test quality: good. Failure paths covered — partial sub-account read, read rejection, mid-read
  stream tick, retry-`init()` throw, retry-cancel throw, adopted-balance release, non-re-pin,
  negative-shortfall regression, genuine failure surviving a price tick. Gap: the submit-error
  box's assertive semantics are unpinned (see Issues).
- Brittleness: none material. No import-time evaluation, no mock coupling — the
  `perps-controller-init.test.ts` factory spreads `test/mocks/metamask-perps-controller.js` so
  `PERPS_ERROR_CODES` resolves through the real stub rather than a hand-maintained subset. The
  documented KNOWN GAP (`perps-withdraw-page.tsx:330-343`: the spot/abstraction leg is invisible to
  the sub-account count check) is honestly scoped and self-heals on the next stream tick.

## Diff Quality
- Minimal: yes — 15 files, all in the perps withdraw/cancel path. No reformatting, no import churn,
  no unrelated edits, no dead constants.
- Debug code: none — no `console.log`, no `eslint-disable`, no `.only(`, no ticketless TODO, no
  commented-out alternatives.
- Value parity: verified by enumerating every `availableNum` render path (listed above); all apply
  the same figure. `formatAmountInputFromNumber` rounds down, so Max can never overshoot the
  adopted balance.
- Out-of-scope observation (not a finding): `perpsValidateWithdrawal` now has no UI caller — its
  only one was this page. It remains a legitimate messenger-client bridge method
  (`perps-controller-init.ts:143,428`) that predates this PR, so removing it is an API-surface
  change for a separate PR, not an orphan this diff created.
- Out-of-scope observation (unchanged from rev7/rev8): the cancel-**all**-orders path in
  `ui/components/app/perps/perps-view.tsx` still shows a bare `t('somethingWentWrong')` for every
  failure. Same class of bug, different component, pre-existing — follow-up ticket.

## Recipe
- Present: yes
- Quality: good (one documented coverage gap)
- **Re-ran it myself at HEAD** against the live CDP runtime: `runtime-health` → `hasStore: true`,
  `hasSubmitRequest: true`, `perpsManagerInitialized: true`; `mm-harness run … --cdp-port 7666` →
  **status pass, 28/28 nodes** (`artifacts/recipe-run-rev9/`). I confirmed the on-disk dist is
  current before trusting the run: `dist/chrome/9247.js` contains the `aria-live="polite"` /
  `perps-withdraw-validation-error` markup introduced by the final commit, so the build is not
  stale. The checklist's `--project-root` / `--launch-existing-dist` form remains wrong for harness
  0.29.3; `--cdp-port 7666` alone is the working invocation.
- `trace.json` shows the AC-bound nodes actually executing, all `status=true`: `ac1-press-cancel`,
  `ac1-assert-orders-absent`, `ac2-cancel-out-of-band`, `ac2-press-cancel`, `ac2-wait-toast`,
  `ac2-screenshot`, `ac2-assert-orders-absent`.
- Seeds its own data: yes — `setup-start-state` → `ac*-ensure-order-open` → `ac2-cancel-out-of-band`
  → `teardown-state`. It cannot pass on an empty wallet.
- Uses `call`-style library actions (`metamask.perps.*`), not raw steps; assertions are specific
  (`assert_orders`, `ui.wait_for` on named testIds), never `not_null`.
- `recipe-quality.json` present, verdict `pass`; the AC3 gap is recorded honestly.
- Gap (accepted, pre-existing): AC3 — the withdraw stale-balance guard, the ticket's largest bucket
  — has no live coverage because a suspended service worker cannot be staged today. Unit-proven
  only, and `recipe-coverage.md` says so.
- Side findings from my run: 7 events (1 warning, 6 errors), all either environmental or the
  *expected* `cancel 0: Order was never placed, already canceled, or filled` errors the graph stages
  on purpose — proof the controller still logs the provider failure while the UI shows the neutral
  toast.

## Visual Evidence
- Status: OK
- Both manifest-referenced PNGs were opened and read, not inferred from filename or run status.
  `before-ac2-cancel-order-error.png`: modal still open, raw prose `cancel 0: Order was never
  placed, already canceled, or filled. asset=4` in the in-modal banner **and** a "Failed to cancel
  order" toast — the bug, clearly visible above the fold.
  `evidence-ac2-cancel-order-already-closed.png`: modal dismissed, ETH market page, no error banner,
  green-check toast reading "This order is no longer open" — claimed element fully visible, on the
  right screen. My own re-run's capture
  (`recipe-run-rev9/screenshots/evidence-ac2-cancel-order-already-closed.png`) was read separately
  and reproduces it identically against the current dist.
- Protocol check in `recipe.json`: `ac2-screenshot` is reached only via
  `ac2-press-cancel → ac2-wait-toast (ui.wait_for on perps-toast-cancel-order-already-closed,
  expected: visible) → ac2-screenshot`, so the capture cannot fire before the asserted element
  exists. No scroll node needed — the toast is fixed-position and in frame.
- AC2 is classified `mixed` in `recipe-coverage.md`, matching the visual claim.
- Artifact contract gate: `TASK_ARTIFACT_CONTRACT_PASS`. No `FAIL_VISUAL_CLASSIFICATION`, no
  `FAIL_EMPTY`, no `MISSING:`, no `FAIL_INVALID_SCREENSHOT_PROVIDER`.

## Issues

- **ui/pages/perps/perps-withdraw-page.tsx:655** — still open from rev8, re-verified independently
  rather than carried forward: the `aria-live="polite"` box is *conditionally mounted together with
  its content* (`{validationMessage ? <Box aria-live="polite" …>`), which is the one live-region
  shape assistive tech commonly fails to announce — the region must already be in the accessibility
  tree when its content changes. `role="alert"`, which this replaced in `0a75d191e5`, is announced
  on insertion by most AT, so the swap traded "announced but interrupts mid-word" for "possibly
  never announced". The suite's own comment at `perps-withdraw-page.test.tsx:615-617` states the
  requirement — "the message must reach a screen reader" — and jsdom can only assert the attribute,
  so nothing catches this. Fix: keep the region mounted and move the condition inside it —
  ```tsx
  <Box aria-live="polite">
    {validationMessage ? (
      <Text data-testid="perps-withdraw-validation-error" variant={TextVariant.BodySm} color={TextColor.ErrorDefault}>
        {validationMessage}
      </Text>
    ) : null}
  </Box>
  ```
  That preserves every existing `getByTestId` / `queryByTestId('perps-withdraw-validation-error')`
  presence and absence assertion (`:523`, `:618`, `:867`); only the `aria-live` assertion at `:620`
  needs re-pointing at the wrapper (`validationAlert.parentElement`, or
  `container.querySelector('[aria-live="polite"]')`). Leave the submit-error box at `:670` alone —
  `role="alert"` is correct there.
  Severity: **not a regression against `main`**, which rendered a bare `<Text>` with no live region
  at all, and the repo's only other `aria-live`
  (`ui/components/app/perps/order-entry/components/order-summary/order-summary.tsx:240`) is
  conditionally mounted the same way. A fair follow-up if the operator would rather ship.

- **ui/pages/perps/perps-withdraw-page.test.tsx:1014** — the submit-error box's assertive semantics
  are unpinned. I mutation-probed it: deleting `role="alert"` from
  `perps-withdraw-page.tsx:670` leaves the suite at **31/31 passing**, so the a11y contract on the
  *only* surface a blocked or failed withdrawal has can be dropped silently. Its sibling is pinned
  (`:620` asserts `aria-live="polite"`), so the gap is an inconsistency rather than a deliberate
  choice. One-line fix at either existing `getByTestId('perps-withdraw-submit-error')` site
  (`:1014` or `:1228`):
  ```ts
  expect(screen.getByTestId('perps-withdraw-submit-error')).toHaveAttribute('role', 'alert');
  ```
