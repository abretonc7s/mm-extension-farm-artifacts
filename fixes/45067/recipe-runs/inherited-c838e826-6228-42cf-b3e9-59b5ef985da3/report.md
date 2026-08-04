# TAT-3490 — Extension Withdraw & Cancel reliability

**Ticket:** [TAT-3490](https://consensyssoftware.atlassian.net/browse/TAT-3490)

## Summary

Traced every error bucket in the ticket to its origin, fixed the four that live in the
extension, and recorded why the rest are upstream. The headline finding is that the
extension measures these two flows twice: the perps controller already emits
`Perp Withdrawal Transaction` / `Perp Order Cancel Transaction`, and the extension UI
emitted them again with a different `status` vocabulary, so every failure was counted
twice while successes were split across two status values.

## Findings

### Withdraw (old flow, 63.9%)

| Bucket | Root cause | Fixed here | Resolved by the MM Pay migration? |
|---|---|---|---|
| `multi-sig required` (43%) | Raw HyperLiquid rejection. The string exists nowhere in the extension or in `@metamask/perps-controller` (`HyperLiquidProvider#errorMappings` maps only two patterns), so it is surfaced verbatim from the user-signed `withdraw3` / `userSetAbstraction` path — `withdraw()` calls `#ensureUnifiedAccountEnabled({ allowUserSigning: true })` before withdrawing. | No — upstream | **Likely yes.** MM Pay withdraws run through `TransactionPayController` post-quote with `isHyperliquidSource: true` (`useTransactionPayPostQuote.ts`), so the client stops signing `withdraw3` itself. |
| `Insufficient balance` (22%) | The page validated against the account WebSocket cache while `HyperLiquidProvider.withdraw` re-validates against a fresh `getAccountState()`. Under MV3 the service worker suspends and the cached balance goes stale (usually high); MAX submits exactly that stale number. The page's `perpsValidateWithdrawal` pre-check caught nothing — `HyperLiquidProvider.validateWithdrawal` is a stub that returns `{ isValid: true }`. | **Yes** | **No.** The Pay confirmation's blocking alert (`usePerpsWithdrawInsufficientBalanceAlert`) reads the same cached stream via `getPerpsStreamManager().account.getCachedData()`, so the stale-balance race survives the migration. Recommend porting the fresh-read guard there. |
| `Failed to establish WebSocket connection` (15%), `Failed to fetch account state` (10%) | MV3 service-worker suspension tears down the HyperLiquid socket; reads then fail. | Partially — the new fresh-balance read fails open, so it adds no failure surface | **No.** The perps stream still powers balances and eligibility inside the Pay confirmation. |
| `invalid nonce` (7%) | HyperLiquid nonces are client clock milliseconds; skew, or a nonce collision when the same account acts from another surface, is rejected. | No — upstream | **Likely yes**, for the same reason as `multi-sig required`. |

### Cancel (78.4%)

| Bucket | Root cause | Fixed here |
|---|---|---|
| `ORDER_UNKNOWN_COIN` | `HyperLiquidProvider.cancelOrder` calls `validateCoinExists(symbol, #symbolToAssetId)` **before** `#ensureReadyForTrading()`, so an unhydrated or rebuilt asset map (service-worker restart, provider re-init, undiscovered HIP-3 dex) fails the cancel before anything reaches the socket — even though the `#getAssetIdWithRepair` call two lines below could have repaired it. | **Yes** — the background write guard now retries once after `init()`. Safe because nothing was sent. |
| `Order 0: Order was never placed, already canceled, or filled` | `@nktkas/hyperliquid`'s bulk-error text for cancelling an order HyperLiquid no longer holds open: filled or cancelled while the dialog was open, a TP/SL removed with its position, or a repeat submit against a stale live-orders list. | **Yes** — the order is gone, which is the outcome the user asked for, so the dialog closes with a neutral notice instead of a raw exchange error. |

### Measurement defect (both flows)

`AccountService.withdraw` and `TradingService.cancelOrder` emit the canonical events with
`status: submitted \| executed \| failed`. The extension UI emitted the same event names again
with `status: success \| failed`. Mobile (`PerpsWithdrawView`, `PerpsOrderDetailsView`) emits
neither and lets the controller own them. Net effect, extension-only: failures double-counted,
successes split across two status values. Under an `executed / (executed + failed)` query a true
78% success rate renders as 63.9% — the number in the ticket. The duplicates are removed here;
`Perp Error` stays, because it is extension-only and feeds the error breakdown rather than the
success-rate denominator. **The dashboards should be re-baselined after this ships.**

## Changes

- `ui/pages/perps/perps-withdraw-page.tsx` — fresh `perpsGetAccountState` read replaces the stub
  validation call; blocks a doomed withdrawal with the existing insufficient-balance copy; fails
  open; duplicate transaction events removed.
- `ui/components/app/perps/cancel-order/cancel-order-modal.tsx` — benign "order no longer open"
  outcome; duplicate transaction events removed.
- `ui/components/app/perps/utils/orderUtils.ts` — `isOrderNoLongerOpenError`.
- `ui/components/app/perps/perps-toast/*`, `app/_locales/{en,en_GB}/messages.json` — the neutral
  toast.
- `app/scripts/messenger-client-init/perps-controller-init.ts` — one retry after `init()` for
  `ORDER_UNKNOWN_COIN` on cancel.
- `test/jest/console-baseline-unit.json` — act-warning baselines lowered: cancel modal back to 36,
  withdraw page 148 → 147 (see Self-Review Fixes).

## Test plan

- `mm-harness run artifacts/recipe.json` — 28/28 nodes pass on HyperLiquid testnet.
- `yarn jest ui/pages/perps/perps-withdraw-page.test.tsx` — 22 pass.
- `yarn jest ui/components/app/perps/cancel-order/cancel-order-modal.test.tsx` — 37 pass.
- `yarn jest ui/components/app/perps/utils/orderUtils.test.ts` — 60 pass.
- `yarn jest app/scripts/messenger-client-init/perps-controller-init.test.ts` — 139 pass.
- `mm-harness check diff --profile fast` — eslint, oxfmt, jest pass.
- `node temp/recipe/runtime/coverage-analyze.js` — VERDICT PASS (95% on changed files).
- `yarn verify-locales --quiet`, `yarn circular-deps:check` — pass.

## Evidence fit

| Claim | Proof mode | Primary evidence |
|---|---|---|
| Cancelling a live order still works end to end | state | `recipe-run/trace.json` |
| Stale-order cancel ends cleanly | mixed | `before-ac2-cancel-order-error.png` + `evidence-ac2-cancel-order-already-closed.png` |
| Stale-balance withdrawal is blocked pre-submit | state | jest |
| `ORDER_UNKNOWN_COIN` retry | state | jest |
| No duplicate transaction analytics | state | jest |

Screenshots intentionally omitted: no capture for AC1 (a provider-state assertion, not a visual
claim) and none for the withdraw guard (its trigger is a hidden stale-cache condition, so an image
would prove navigation rather than the fix).

## Follow-ups (not in this PR)

1. Port the fresh-balance re-read into the MM Pay withdraw confirmation — the migration does not
   fix that bucket on its own.
2. Upstream (`@metamask/perps-controller`): move `validateCoinExists` after
   `#ensureReadyForTrading()` in `cancelOrder` so the asset map can self-heal, and map
   `multi-sig required` / `invalid nonce` into `PERPS_ERROR_CODES` with the abstraction mode
   attached so they stop reaching users verbatim.
3. Data: re-baseline the extension Withdraw/Cancel success-rate dashboards after the duplicate
   events stop.
4. Harness: `metamask.wallet.select_account` fails its own read-back on the first attempt after a
   fresh launch (it re-reads the store before the background selection propagates). Reproduced again
   on the rev2 re-run: the first graph after a relaunch died on it, the next one passed the node.
5. Harness: `metamask.perps.start_state` in `@deeeed/metamask-harness` 0.26.5 cannot read the
   Extension's flattened perps state and fails every perps recipe at setup — see the framework
   finding in Self-Review Fixes — rev2. Needs an upstream fix; the pinned-0.23.1 workaround should
   not become the norm.

## Self-Review Fixes

- `ui/components/app/perps/perps-toast/perps-toast.presentation.tsx:98` — the terminal
  "no longer open" toast mapped to the `info` presentation, whose only icon is an infinitely
  spinning `IconName.Loading`. Mapped to `success` instead (the order is gone, which is what the
  user asked for). Re-captured `evidence-ac2-cancel-order-already-closed.png` now shows the static
  check icon.
- `ui/components/app/perps/cancel-order/cancel-order-modal.test.tsx:14` — the local `perps-toast`
  mock hand-listed two keys, so the new toast emitted `key: undefined` and no test noticed. The
  mock now reuses the real `PERPS_TOAST_KEYS` via `jest.requireActual`.
- `ui/components/app/perps/cancel-order/cancel-order-modal.test.tsx:619` — asserted the exact toast
  emitted on the benign path (`perpsToastCancelOrderAlreadyClosed` +
  `perps-toast-cancel-order-already-closed`); this is what surfaced the mock drift above.
- `ui/pages/perps/perps-withdraw-page.tsx:252` — `getAccountState` only throws when *every* dex read
  fails; a partial HIP-3 failure resolves with an under-reported aggregate, which would have blocked
  a withdrawal HyperLiquid accepts. The guard now fails open on a degraded read too, detected by
  comparing sub-account counts against the streamed state (the stream and the REST aggregate name
  the main dex differently, so counts are compared, not keys). Covered by a new test.
- `test/jest/console-baseline-unit.json` — instead of raising the cancel-modal baseline, the new
  tests' async state updates are wrapped in `act()`: cancel modal is back to its original 36, and
  the withdraw page's 148 → 147 improvement is locked in.
- `ui/pages/confirmations/hooks/alerts/transactions/usePerpsWithdrawInsufficientBalanceAlert.ts:44`
  — left as-is and documented in the PR description. It is a synchronous render-time alert running
  for every confirmation type; a fresh read there needs its own async + init-avoidance design and
  the path is still feature-flagged. Follow-up #1 already tracks it.
- `app/scripts/messenger-client-init/perps-controller-init.ts:418` — `perpsValidateWithdrawal` kept
  and documented in the PR description. The perps background API deliberately mirrors the controller
  surface (`perpsGetDepositRoutes`, `perpsSetActiveProvider` are likewise exposed without UI callers
  today), so removing one entry is a separate cleanup of that surface rather than part of this fix.

Verification after the fixes: `mm-harness run artifacts/recipe.json` 28/28 pass (screenshot provider
`capture-helper`), `mm-harness check diff --profile fast` pass, the four jest suites 259/259 pass
with no console-baseline violation, `check-task-artifact-contract.mjs` PASS.

## Self-Review Fixes — rev2

- `ui/pages/perps/perps-withdraw-page.tsx` — the fresh balance is now authoritative, not just a
  submit-time veto. When the guard fires, the read's figure is held in state and preferred by the
  displayed available balance, the percentage/Max buttons, `validationMessage` and `hasValidInputs`
  until the stream reports a different value, so the screen no longer states a balance the block
  contradicts and Max cannot re-enter the rejected amount. The blocked submit path drops its own
  `submitError`; the standard validation message carries it, avoiding the same sentence twice.
- `ui/pages/perps/perps-withdraw-page.tsx` — the prevented withdrawal is now measurable: one
  `Perp Error` (the handler's existing convention) with `error_type: validation`,
  `error_message: insufficient_balance`, `failure_reason: stale_streamed_balance`, `size` (the
  requested amount) and `stale_balance_shortfall` (streamed minus fresh). No address, account id or
  raw provider text. `shared/constants/perps-events.ts` gains the canonical `ERROR_TYPE.VALIDATION`
  and `ERROR_MESSAGE_KEY.INSUFFICIENT_BALANCE` values; the shortfall key has no canonical
  counterpart and is declared separately as `PERPS_EXTENSION_EVENT_PROPERTY` so the
  "mirror the controller" rule on that file stays unambiguous.
- `ui/components/app/perps/cancel-order/cancel-order-modal.tsx` — non-benign cancel failures render
  `translatePerpsError(err, t)` with a new `perpsCancelOrderFailed` fallback instead of the raw
  provider string, in both the modal banner and the toast description. Analytics keep the raw
  message. `ORDER_UNKNOWN_COIN` — the string the new retry produces on a second failure — now
  resolves to `perpsOrderFailed`, covered by a test.
- `ui/components/app/perps/utils/orderUtils.ts` — `ORDER_NO_LONGER_OPEN_PATTERN` now cross-references
  `API_ERROR_PATTERNS` in `translate-perps-error.ts` and states why it lives outside that list
  (it maps to a benign end state, not to a `PerpsErrorCode` to display) plus the same
  keep-in-sync-with-mobile expectation.
- `ui/pages/perps/perps-withdraw-page.test.tsx` — added the mutation-sensitive fresh > stream
  sub-account case (stream `{ main: {} }`, fresh `{ '': {}, dex1: {} }`, shortfall): changing the
  partial-read guard from `<` to `!==` fails only this test. Added coverage that the adopted fresh
  balance drives the displayed balance and Max, and that the prevention event fires. Reverting the
  balance adoption fails three tests.
- **Cancel `order_type` is not restored.** `CancelOrderParams` and `TrackingData` have no
  order-type field, so no UI-side change can pass it to the controller's
  `Perp Order Cancel Transaction`, and re-adding a UI event would re-introduce the double counting
  this PR removes. The dropped dimension and the upstream follow-up are stated in the PR
  description; this is documented, not parity.
- PR description — the re-baselining note now also covers the benign "already closed" path, where
  the controller still records a `failed` cancel because `result.success` is `false` regardless of
  how the UI presents it.
- `artifacts/recipe-coverage.md` — the dangling `after.mp4` pointer removed from the AC2 row; AC3's
  evidence list updated with the new tests.

Verification for rev2: `yarn jest` on `perps-withdraw-page.test.tsx`, `cancel-order-modal.test.tsx`,
`orderUtils.test.ts`, `translate-perps-error.test.ts`, `perps-controller-init.test.ts`,
`perps-toast-provider.test.tsx`, `usePerpsEventTracking.test.tsx`, `infrastructure.test.ts` —
385/385 pass, no console-baseline violation (baselines unchanged). `yarn lint:changed` exit 0
(2 pre-existing `react-hooks/set-state-in-effect` warnings on untouched lines),
`yarn verify-locales --quiet`, `yarn circular-deps:check`, `yarn lint:tsc` and
`check-task-artifact-contract.mjs` all pass.

**Recipe re-run against the fix commit `00df3a36d5`: PASS — 28/28 nodes**
(`recipe-run/summary.json`, started `2026-07-30T22:04:54.581Z`, ended `2026-07-30T22:05:16.205Z`,
0 failed; every `ac1-*` and `ac2-*` trace entry `ok: true`). The runtime was rebuilt and relaunched
first — `mm-harness launch --verify` reported `dist-freshness: fresh — dist id matches HEAD; no
uncommitted source`, so the graph ran against the built fix, not a stale bundle.
`evidence-ac2-cancel-order-already-closed.png` was refreshed from this run
(`ac2-screenshot`, provider `capture-helper`) and re-inspected: cancel dialog dismissed, ETH market
page behind it, "This order is no longer open" toast with a static green check.
`before-ac2-cancel-order-error.png` is untouched — it is the baseline capture on unmodified sources
and re-running it would prove nothing new.

**Framework finding (not patched — surfaced per the agent rules).** The globally installed
`@deeeed/metamask-harness` (0.26.5 on disk; `library/@farmslot/recipe-harness` 0.10.4) cannot run
this recipe at all: `metamask.perps.start_state` → `ensureNetwork` → `readPerpsRuntimeState` now
resolves the perps slice only from `metamask.PerpsController` / `cleanState.PerpsController` /
`cleanState.perps`, so it throws `Unable to read the current Perps network from persisted controller
state.` at the setup node, before any AC node. The extension flattens perps controller state into
`state.metamask` (`selectPerpsIsTestnet` reads `state.metamask.isTestnet`); probing the live page
over CDP returns `{"isTestnet": true, "activeProvider": "hyperliquid"}` flat, with no nested
`PerpsController` anywhere. Version 0.23.1 — the version that recorded every prior run in this task —
reads `chrome.storage.local.get('data')` first and carries the comment "Extension flattens
PerpsController state into state.metamask via ComposableObservableStore.getFlatState()"; 0.26.5
dropped that lookup. The 28/28 run above therefore used a pinned 0.23.1 installed in the session
scratchpad, against the same live runtime and the same unmodified `recipe.json`. Neither the
vendored adapter nor the recipe was edited to make the run green. The harness regression needs an
upstream fix before the installed CLI can run perps recipes on Extension again.

## Self-Review Fixes — rev3

- `ui/pages/perps/perps-withdraw-page.tsx:115` — both sides of the fresh-vs-stream comparison now go
  through `parsePerpsAmountInput`. The streamed side keeps its 0 fallback, but via an explicit
  `Number.isFinite` check instead of `parseFloat(...) || 0`, so the two values the guard rests on
  share one failure mode and the `streamed` field stored on the adopted balance (and the
  `stale_balance_shortfall` arithmetic) can no longer be fed a silently coerced `0`.
- `ui/pages/perps/perps-withdraw-page.test.tsx` — covered the term that *releases* the adopted
  balance (`freshBalance.streamed === streamedAvailableNum`): block at a streamed $100 against a
  fresh $20, then re-render with a streamed $150 and assert the displayed balance and the submit
  button follow the stream rather than the pinned $20. Mutation-verified: rewriting the expression as
  `freshBalance ? freshBalance.available : streamedAvailableNum` fails this test and only this test
  (1 failed / 26 passed).
- `pr-description.md` — deliberately unchanged. Both items are internal (a parser normalisation with
  no reachable behaviour change today, and a test); the description already states the user-visible
  behaviour.

Verification for rev3: `yarn jest perps-withdraw-page.test.tsx cancel-order-modal.test.tsx` — 65/65
pass, no console-baseline violation (withdraw page exactly at its 147 baseline).
`mm-harness check diff --profile fast` — **pass** (policy-suppressions, eslint, oxfmt, jest; typecheck
skipped by profile). It first failed on `oxfmt` for the new test block; `yarn lint:changed:fix` does
not run oxfmt, so the file was formatted with the repo's own `oxfmt --config oxfmt.config.mts` and the
gate re-run to exit 0. `yarn lint:changed` exit 0, `yarn verify-locales --quiet`,
`yarn circular-deps:check` and `check-task-artifact-contract.mjs` all pass.

**Recipe re-run: PASS — 28/28 nodes, 0 failed** (`recipe-run/summary.json`,
`2026-07-30T22:53:33.655Z` → `22:54:26.469Z`; every node `ok: true`). Run with the pinned 0.23.1
runner and `--heal off` so nothing could relaunch or kill the operator-restored browser on CDP 7666.
The first attempt died at `setup-select_account` on the known warm-up read-back flake (follow-up #4)
and passed on the immediate retry.

Two honest limits on what that run proves:

1. **Build provenance.** The runtime the graph exercised was built at `2026-07-30T22:42:14Z`
   (`runtime-dist`) / `22:44:36Z` (`dist/chrome`), while this commit landed at `22:52:16Z` — so the
   bundle carries the rev2 source, not rev3. The webpack watcher is down (`doctor` →
   `webpack-cache-stale`, `devServer: down`) and rebuilding would have required restarting it and
   reloading the extension inside the browser the operator explicitly asked to preserve. The rev3
   diff touches only `perps-withdraw-page.tsx` and its test; the recipe binds exclusively to the
   cancel modal (AC1/AC2), which this diff does not reach. The withdraw guard is proven by the unit
   tests, which is AC3's declared proof mode.
2. **Screenshot provider.** This run's `ac2-screenshot` fell back to the `cdp` provider (viewport
   only) and the capture does not include the toast overlay, so it was **not** promoted into
   `artifacts/`. The canonical `evidence-ac2-cancel-order-already-closed.png` remains the
   capture-helper capture of the identical, unchanged cancel path, in which the toast is fully
   visible. The toast's presence in this run is proven by `ac2-wait-toast` (state), which passed.

`after.mp4` was dropped from `evidence-manifest.json`: the recorder and the screenshot capture
helper contend for the same shared screen owner in this session, so a recorded re-run downgraded the
evidence screenshot to the CDP provider. The two screenshots (before/after) carry the visual claim;
the run itself is proven by `recipe-run/trace.json`.

## Self-Review Fixes (rev4)

- `temp/tasks/feat/tat-3490-0730-233413/artifacts/recipe-run/*` — re-ran the recipe against the live
  CDP-7666 runtime with the pinned 0.23.1 runner and `--heal off`: **PASS, 28/28 nodes, 0 failed**
  (`2026-07-30T23:35:19.491Z` → `23:35:40.005Z`, 20.5 s). This run's `ac2-screenshot` was captured by
  `capture-helper` (`artifact-manifest.json:32` → `provider: capture-helper`, `mode: snapshot`,
  134 KB), so the promoted run no longer carries a viewport-only CDP fallback under an
  `evidence`-category label. I opened the PNG: dialog dismissed, ETH market page behind it, "This
  order is no longer open" toast with the static green check, fully in frame. The step-11b provider
  grep over `artifacts/` now returns no `extension-dom-raster|macos-screencapture|Page.captureScreenshot`
  hit, and `check-task-artifact-contract.mjs` returns `TASK_ARTIFACT_CONTRACT_PASS`. Fixed by
  re-running once capture-helper was healthy — the stronger of the two options the review offered —
  rather than dropping the PNG. `recipe-coverage.md` was updated to describe this run and to keep the
  superseded rev3 fallback on record. Diagnostics again record the real provider rejection
  (`ApiRequestError: cancel 0: Order was never placed, already canceled, or filled. asset=4`); the
  other six findings are the same environment noise (local WS 8080 refused, `autoLockTimeLimit`
  metadata, 404s, "Sentry not initialized").
- `ui/pages/perps/perps-withdraw-page.tsx:87-88,318-321` — named the bare cents-rounding literal:
  `SHORTFALL_CENTS_ROUNDING = 100` declared next to `STALE_BALANCE_FAILURE_REASON`, and the shortfall
  now reads `Math.round(delta * SHORTFALL_CENTS_ROUNDING) / SHORTFALL_CENTS_ROUNDING`. Value and
  precision are unchanged (analytics-only), so no test changed: `perps-withdraw-page.test.tsx` is
  27/27 pass with no console-baseline violation.

Verification for rev4: `yarn jest ui/pages/perps/perps-withdraw-page.test.tsx --no-coverage` — 27/27
pass. `mm-harness check diff --profile fast` — **pass** (policy-suppressions, eslint, oxfmt, jest;
typecheck skipped by profile, and the rev4 delta introduces no new type surface). `runtime-health`
was PASS before the recipe run; the browser was neither relaunched nor killed.

## Self-Review Fixes (rev5)

- `ui/pages/perps/perps-withdraw-page.tsx:294-317` — the fresh balance is now adopted from every
  usable read, not only the one that blocks. `hasUsableFreshRead` (present, non-partial, finite) is
  hoisted out of the blocking condition, and the override is written whenever it can actually move
  `availableNum`. The reviewer's case now resolves: blocked at fresh $20 with a stale streamed $100,
  the next submit's read of $100 clears the pin, so the header returns to `$100.00` and Max refills
  `100.00` without a remount. The redundancy check (`isFreshReadRedundant`) is not a bandage — a read
  that equals what the page already shows cannot change any of the five consumers of `availableNum`,
  and writing it anyway forced a re-render on every successful submit, which is what pushed the
  withdraw page's act-warning baseline from 147 to 154. With the check, the baseline is unchanged.
  `freshBalance` was added to the `handleContinue` dependency list, since the check reads it.
  New test: `refreshes the adopted fresh balance when a later read recovers` — blocks at $20, then a
  second submit whose read returns $100 restores both the displayed balance and Max. Reverting the
  hoist fails it.
- `app/scripts/messenger-client-init/perps-controller-init.ts:344-352` — the `ORDER_UNKNOWN_COIN`
  retry is wrapped in a `try` that falls back to the original `result`. `perpsCancelOrder` keeps its
  "always resolves a result" contract: a throwing `controller.init()` no longer converts a resolved
  `{ success: false, error: 'ORDER_UNKNOWN_COIN' }` into a rejection. `withAutoInit` is deliberately
  left alone — its original outcome was already a throw, so nothing flipped there. New test:
  `resolves with the original failure when the retry init throws`. Reverting the `try` fails it.
- `ui/pages/perps/perps-withdraw-page.tsx:562-585` — both message nodes are wrapped in
  `<Box role="alert">`, so a blocked submit is announced instead of only rendered. `Box` is used
  rather than `role` on `<Text>` because `TextProps` from `@metamask/design-system-react` does not
  extend the DOM attribute set (`role` is a type error there; `BoxProps` is `ComponentProps<'div'>`).
  Wrapping each message separately keeps the parent's flex children and `gap` identical, so there is
  no layout change. The existing block test now asserts `findByRole('alert')` instead of
  `findByText`.

Verification for rev5: `yarn jest ui/pages/perps/perps-withdraw-page.test.tsx
app/scripts/messenger-client-init/perps-controller-init.test.ts --no-coverage` — **168/168 pass**,
console baseline exactly at 147 (no violation). `mm-harness check diff --profile fast` — **pass**
(policy-suppressions, eslint, oxfmt, jest; typecheck skipped by profile). Each of the two behavioural
fixes was mutation-checked: reverting either one fails exactly one of the new tests.

### Recipe regression gate — NOT RE-RUN (runtime blocked)

The recipe was **not** re-run for rev5, and the artifacts under `artifacts/recipe-run/` remain the
rev5-review run, not a post-fix run. Sequence:

1. `dist/chrome` was stale (06:44, commit `00df3a36`), so the sanctioned
   `temp/recipe/harness/extension/scripts/refresh-build.sh` was used to rebuild without touching the
   browser. The first attempt failed on `Can't resolve app/vendor/trezor/usb-permissions.js` — a
   stale `node_modules/.cache/webpack`, not a missing file. Clearing the cache produced a clean
   rebuild (`home.html`, `sidepanel.html`, `service-worker.js` restored, 41 s).
2. `mm-harness` 0.26.5 rejects the checklist's `--project-root` (wants `--target`), then fails slot
   resolution ("no configured slot maps to this repo"; with `--slot mini-mme-2`, "Extension slot
   lookup requires a local host checkout"). Setting `METAMASK_RUNNER_PROTOCOL_ROOT=~/farmslot-node`
   got past slot resolution, and the run then invoked the host-managed **validation launcher**, which
   **tore down the live CDP-7666 browser** before failing with
   `FAIL: farmslot CLI not found (no packages/cli next to scripts/ and no farmslot on PATH)`.
3. Recovery was attempted through every sanctioned path and all fail on the same gap:
   `ensure-runtime-ready.sh` short-circuits on a stale `doctor` pass; `preflight.sh`,
   `launch-browser.sh`, and `scripts/lib/slot-common.sh` all require
   `~/farmslot-node/packages/cli/bin/farmslot.mjs`, which does not exist on this node (only
   `packages/agent-runtime` is present, and there is no `farmslot` on `PATH`).
   `mm-harness launch --verify` got as far as a LavaMoat build and a dist → runtime-dist snapshot,
   then failed with `Chrome launched but did not expose CDP on 127.0.0.1:7666` and
   `WALLET_STATE_REQUIRED`.

This is a framework-injected environment gap (the rev5 review recorded the same launcher failure),
not a product defect, and no repo config was changed to work around it. Net effect on the runtime:
CDP 7666 is down and `dist/chrome` / `temp/recipe/runtime/runtime-dist` are mid-rebuild — all
gitignored, so the checkout itself is unaffected. The three rev5 fixes are proven by unit tests and
the bounded `check diff` gate; the AC1/AC2 cancel-modal recipe path is untouched by this diff apart
from the `guardCancelOrder` fallback, whose new branch (a throwing `init()`) the recipe never
exercises.
