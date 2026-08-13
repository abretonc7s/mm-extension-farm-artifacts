# TAT-3632 — Use a fresh Perps balance in MM Pay withdrawal confirmation

## Summary

The MM Pay Perps withdrawal alert decided whether to block a withdrawal by reading the streamed
`PerpsStreamManager` account cache synchronously, while the provider validates the same withdrawal
against a fresh account-state read — so the two could disagree in both directions. The alert now
performs a fresh `perpsGetAccountState` read, gated on the confirmation actually being a
`perpsWithdraw` and coalesced so re-mounts add no extra Hyperliquid request weight, with explicit
loading and degraded-read handling.

## Root cause

`ui/pages/confirmations/hooks/alerts/transactions/usePerpsWithdrawInsufficientBalanceAlert.ts:43-47`
(pre-fix) derived the blocking decision from
`getPerpsStreamManager().account.getCachedData()`.

Data flow:

1. `getPerpsStreamManager()` (`ui/providers/perps/PerpsStreamManager.ts:194-225`) is a page-realm
   singleton whose `account` channel only holds data while something subscribes to it.
2. The alert hook never subscribed — it peeked at the cache. Its comment assumed the confirmation's
   own `PerpsWithdrawBalance` (`usePerpsLiveAccount`) had already warmed that cache, which is a race:
   after an MV3 UI/service-worker restart the singleton is rebuilt empty.
3. `getTradeableBalance(null)` (`ui/hooks/perps/getTradeableBalance.ts:17`) returns `'0'`, so the
   hook decided against a balance the account does not have.
4. The provider validates against a fresh `getAccountState()`
   (`app/scripts/messenger-client-init/perps-controller-init.ts:406`). A stale-high cache lets an
   over-balance withdrawal through; a stale-low/empty cache blocks a valid one.

Reproduced live and read-only in the slot (`artifacts/live-perps-balance-divergence.json`):
streamed cache absent → `'0'` while the fresh read returned `withdrawableBalance = "763.276429"`,
flipping a $381 withdrawal from `allowed` to `blocked`.

The hook runs for **every** confirmation type (`ui/pages/confirmations/hooks/useConfirmationAlerts.ts:59-60`),
which is why the original cache peek existed: an unconditional `usePerpsLiveAccount` would initialize
Perps on sends, swaps and contract interactions. The fix keeps that property by gating the fresh read
on `isPerpsWithdrawTransaction`. Mobile's equivalent (`useWithdrawValidation`) can use a live
subscription because its withdraw view is a dedicated Perps screen.

## Changes

| File | Change |
|---|---|
| `ui/pages/confirmations/hooks/alerts/transactions/usePerpsWithdrawInsufficientBalanceAlert.ts` | Replaced the synchronous streamed-cache read with `useFreshPerpsWithdrawableBalance`, a `perpsWithdraw`-gated async `perpsGetAccountState` read coalesced under the Perps scope key (5 s TTL); the blocking decision now handles loaded / loading / degraded explicitly. |
| `ui/pages/confirmations/hooks/alerts/transactions/usePerpsWithdrawInsufficientBalanceAlert.test.ts` | Re-pointed existing cases at the fresh source and added stale-high, stale-low, fresh-equal, in-flight, non-Perps-scoping, degraded-read (rejection and missing account) and scope-change cases; the Perps cases seed the streamed cache with the opposite-decision value and assert the singleton is never consulted. |
| `app/_locales/en/messages.json` | Added `alertPerpsWithdrawBalanceUnavailable` for the case where the balance could not be read. |
| `ui/hooks/perps/coalesceBackgroundRequest.ts` | Comment only: the module doc no longer claims the perps-home preview is the only TTL-cache reader. |

Commits: `04d8b476e9` (fix), `4fc8b7db7e`, `94e8a33f8a`, `02a4451ac2`, `c9a4fd8227` and `6dee7b7a9f` (self-review fixes) — local only, not pushed.

## Test plan

Automated:

- `yarn jest ui/pages/confirmations/hooks/alerts/transactions/usePerpsWithdrawInsufficientBalanceAlert.test.ts --no-coverage` → **20 passed**.
- Revert check: with the hook reverted and the new suite kept, **18 of 20 fail** — the tests bind to the fix, not to the file. Every branch flagged as mutation-surviving in self-review (missing account, per-scope guard, request coalescing, distinct alert key, short button label, hide-results entry, metrics entry) now fails at least one case.
- `yarn jest useTransactionCustomAmountAlerts.test.ts useConfirmationAlertMetrics.test.ts` and the confirmation footer suites → **pass** (the new alert key touches those files).
- `mm-harness check diff --profile fast` → policy-suppressions, eslint, oxfmt, jest all **pass**.
- `yarn lint:changed && yarn verify-locales --quiet && yarn circular-deps:check` → **pass**.
- `node temp/recipe/runtime/coverage-analyze.js` → **VERDICT: PASS** (96%, 43/45 lines).
- `mm-harness run artifacts/recipe.json` → **pass**, `passed: 22 / failed: 0` across all AC, setup
  and teardown nodes (`artifacts/recipe-run/summary.json`, `trace.json`).
- Baseline `mm-harness run artifacts/recipe-baseline.json` against the unfixed tree → **pass**,
  asserting the buggy shape (cache read present, 13 cases, zero fresh-balance cases).

Manual (Gherkin):

```gherkin
Feature: MM Pay Perps withdrawal blocks on a fresh balance

  Scenario: A stale-high streamed cache no longer approves an over-balance withdrawal
    Given the Perps account holds 20 USDC withdrawable
    And the streamed account cache still reports the pre-trade balance of 500 USDC
    When I open the MM Pay Perps withdraw confirmation and enter 100
    Then the confirmation shows the blocking "Insufficient funds" alert

  Scenario: A restarted UI no longer blocks a valid withdrawal
    Given the Perps account holds 763.276429 USDC withdrawable
    And the extension UI has just restarted, so the streamed account cache is empty
    When I open the MM Pay Perps withdraw confirmation and enter 381
    Then no insufficient-funds alert is shown and the withdrawal can be confirmed

  Scenario: A non-Perps confirmation never touches Perps
    When I open a contract-interaction confirmation
    Then no Perps account-state request is issued and the Perps controller is not initialized

  Scenario: A degraded read fails safe
    Given the fresh Perps account-state read fails
    When I open the MM Pay Perps withdraw confirmation and enter 100
    Then the confirmation blocks the withdrawal with "Couldn't check your Perps balance", not "Insufficient funds"
```

## Evidence

Produced in `temp/tasks/fix/tat-3632-0803-221700/artifacts/`:

- `live-perps-balance-divergence.json` — live read-only probe: streamed cache absent (`'0'`) vs fresh
  `763.276429`, decisions disagree. Primary AC3 state evidence.
- `ac1-jest.json` (4 passed / 0 failed), `ac2-jest.json` (5 / 0), `ac3-jest.json` (1 / 0) — per-AC
  jest results asserted by the recipe.
- `recipe-run/summary.json`, `recipe-run/trace.json`, `recipe-run/report.md` — verify run.
- `recipe-run-baseline/summary.json`, `recipe-run-baseline/trace.json` — baseline run on the buggy tree.
- `before-evidence-ac3-live-fresh-perps-balance.png`, `after-evidence-ac3-live-fresh-perps-balance.png`
  — live Perps balance the fresh read resolves to (orientation for the state proof).
- `before.mp4` — baseline run recording; `after.mp4` — final passing run. Both screenshots come from
  capture-helper snapshot with no fallback (`recipe-run/artifact-manifest.json`).
- `recipe-coverage.md` — per-AC coverage matrix: **3/3 PROVEN**, 0 weak, 0 missing.
- `recipe-quality.json` — verdict `pass`.
- `probe-perps-balance-divergence.mjs`, `recipe.json`, `recipe-baseline.json` — executable inputs.

Known limitation, recorded rather than worked around: the MM Pay withdraw **confirmation screen**
cannot be opened in this slot. `createPerpsWithdrawTransaction` needs Arbitrum gas estimation, and
every EVM RPC call in this slot fails with
`RPC 0xa4b1 Custom eth_getBlockByNumber: Failed to execute 'fetch' on 'WorkerGlobalScope': Illegal invocation`.
Verified environmental: the same URL fetched directly inside the service worker returns `200`, an
unbound `fetch` there throws the identical error, the home screen independently reports
`Unable to connect to Ethereum`, and it reproduces on both the LavaMoat one-shot dist and a fresh
non-LavaMoat `--watch` build with an unmodified tree. AC3 explicitly accepts "a recipe **or
state-level proof**", which is what was produced.

## Ticket

[TAT-3632](https://consensyssoftware.atlassian.net/browse/TAT-3632) — [Extension] Use a fresh Perps
balance in MM Pay withdrawal confirmation.

## Self-Review Fixes

- `ui/pages/confirmations/hooks/alerts/transactions/usePerpsWithdrawInsufficientBalanceAlert.ts:146` — a degraded read no longer renders "Insufficient funds", which claimed a balance nothing had read. The blocking decision now carries a reason (`exceedsBalance` vs `balanceUnavailable`) and the unverifiable case uses a new string, `alertPerpsWithdrawBalanceUnavailable` ("Couldn't check your Perps balance. Try again."). This also made the missing-account branch observable, which is what killed the mutation below.
- `ui/pages/confirmations/hooks/alerts/transactions/usePerpsWithdrawInsufficientBalanceAlert.ts:91` — the rejected fresh read is now logged (`console.error`, matching `PerpsStreamManager.ts:207`) with a comment saying why, so a withdrawal blocked by an unreachable provider is diagnosable.
- `ui/pages/confirmations/hooks/alerts/transactions/usePerpsWithdrawInsufficientBalanceAlert.ts:50` — documented that "fresh" means fresh as of mount, not live, and that the provider re-validates at submit.
- `ui/pages/confirmations/hooks/alerts/transactions/usePerpsWithdrawInsufficientBalanceAlert.test.ts` — added the two cases whose branches survived mutation: a fresh read that resolves `null` (must block with the unavailable copy, not by inventing `'0'`) and a Perps scope-key change mid-render (must fall back to `loading`, not reuse the previous scope's balance). Re-ran both mutations from the review: each now fails exactly one case.
- `ui/pages/confirmations/hooks/alerts/transactions/usePerpsWithdrawInsufficientBalanceAlert.test.ts:214` — moved `expect(mockGetPerpsStreamManager).not.toHaveBeenCalled()` out of the non-Perps case (where it could never fail) into the stale-high Perps case, where the pre-fix hook did read the cache. `setStreamedBalance` is now load-bearing and its doc comment says what it actually proves.
- `ui/pages/confirmations/hooks/alerts/transactions/usePerpsWithdrawInsufficientBalanceAlert.test.ts` — dropped the six test names that repeated their enclosing `describe`; `recipe.json` and `recipe-baseline.json` filters updated to the shorter `-t 'fresh balance source'` / `-t 'perps scope'`, and `ac2-assert-cases-ran` raised from 2 to 4 for the new cases.
- `ui/hooks/perps/coalesceBackgroundRequest.ts:14` — comment no longer claims the perps-home preview is the only TTL-cache reader; it now names the 5 s withdraw-alert caller.
- `app/_locales/en/messages.json` — added `alertPerpsWithdrawBalanceUnavailable`.
- `temp/tasks/fix/tat-3632-0803-221700/artifacts/recipe-quality.json` — the capture-provider claim was wrong at the time it was written. The root cause was a wedged capture-helper session (also what killed the first `after.mp4` attempt): the orphaned helper streams were cleared, `browser.pid` restored, and the evidence recaptured. The final run's `artifact-manifest.json` records `provider: capture-helper`, `mode: snapshot`, `fallbackFrom: null`, and `after.mp4` now exists, so the sidecar states that rather than the fallback.

### Not applied, with reasoning

- **`ui/pages/confirmations/components/confirm/info/perps-withdraw-info/perps-withdraw-info.tsx:23` — display/Max still read `usePerpsLiveAccount()`.** Taking the reviewer's second option: filed as a follow-up rather than changed here.

  `usePerpsLiveAccount` is a live subscription, not the synchronous cache peek this ticket removed. On the withdraw confirmation it converges to the real balance once the account channel resolves, so the mismatch the review describes is a transient loading state (`$0.00` and a `$0` Max until the stream lands), which predates this change — the display has always rendered "not loaded yet" as zero.

  Switching the two display consumers to the one-shot fresh read would trade that transient for a worse one: the readout would stop updating while the user is on the screen. The right fix is for the confirmation to own one account source that is both live and immediately populated, which means changing `PerpsWithdrawBalance` and `CustomAmountInfo`'s balance plumbing — outside this ticket's stated non-goals ("broad confirmation-alert refactoring") and larger than the alert fix itself.

  Filed as [TAT-3661](https://consensyssoftware.atlassian.net/browse/TAT-3661) — "[Extension] Perps
  withdraw confirmation shows a balance the blocking alert disagrees with" — linked to TAT-3632 so
  the user-visible half of this bug is not lost.

## Self-Review Fixes — round 2

- **Follow-up filed.** The deferred display/Max parity issue is now
  [TAT-3661](https://consensyssoftware.atlassian.net/browse/TAT-3661), a Bug in TAT linked to
  TAT-3632, so it exists as a tracked item rather than a paragraph in this report. Reasoning for
  deferring it out of this PR is unchanged and recorded above.
- `ui/pages/confirmations/hooks/alerts/transactions/usePerpsWithdrawInsufficientBalanceAlert.test.ts` —
  added `reuses one background request when the confirmation remounts inside the coalescing window`.
  Nothing had asserted the coalescing that `FRESH_BALANCE_TTL_MS` exists for; replacing the wrapper
  with a bare `submitRequestToBackground(…)` left the suite green. It now fails one case.
- `ui/pages/confirmations/hooks/alerts/transactions/usePerpsWithdrawInsufficientBalanceAlert.ts:22` —
  dropped the claim that a sibling Perps surface shares the coalesced request. No other caller uses
  the `perpsGetAccountState|<scope>` key and `PerpsStreamManager` issues its own uncoalesced request,
  so the comment now says the stream manager would have to route through the helper for that to hold.
- `ui/pages/confirmations/hooks/alerts/transactions/usePerpsWithdrawInsufficientBalanceAlert.test.ts` —
  moved the two degraded-read cases out of `describe('perps scope')` into their own `degraded read`
  block, so each block describes what it covers. `perps scope` now holds the three "who queries
  Perps" cases. `recipe.json`'s AC2 node filters on `-t 'perps scope|degraded read'` and asserts 5
  matched cases.
- `temp/tasks/fix/tat-3632-0803-221700/artifacts/recipe-coverage.md:5` and `recipe-quality.json` —
  refreshed the stale numbers. The trace records **22** nodes (5 `setup-`, 16 `ac<N>-`,
  1 `teardown-`), not 21, and `summary.json` reports `passed: 22 / failed: 0`. Re-measured the revert
  check against the current suite: reverting the hook fails **18 of 20** cases, not 15 of 19.

## Self-Review Fixes — round 3

- `ui/pages/confirmations/hooks/alerts/constants.ts` /
  `ui/pages/confirmations/hooks/useConfirmationAlertMetrics.ts` /
  `ui/pages/confirmations/hooks/transactions/useTransactionCustomAmountAlerts.ts` — the degraded-read
  block reused `AlertsName.InsufficientPayTokenBalance`, so `alert_triggered` / `alert_resolved`
  reported an unreadable balance as an insufficient-balance alert: the failure the `console.error`
  was added to make traceable was invisible in telemetry, and it inflated the insufficient-balance
  rate. Added `AlertsName.PerpsWithdrawBalanceUnavailable`, mapped it to
  `perps_withdraw_balance_unavailable` in `ALERTS_NAME_METRICS`, and added it to
  `ALERTS_HIDE_RESULTS` so the hide behaviour is unchanged.
- `ui/pages/confirmations/hooks/alerts/transactions/usePerpsWithdrawInsufficientBalanceAlert.ts:182` —
  `reason` becomes the disabled confirm button's label (`single-action-footer.tsx:53-63`), so the
  44-character explanation was going into a button. The unavailable case now carries a short
  `reason` (`alertReasonPerpsWithdrawBalanceUnavailable`, "Balance unavailable", 19 chars vs
  "Insufficient funds" at 18) and keeps the full sentence as `message`; because `reason !== message`,
  `useTransactionCustomAmountAlerts` surfaces the explanation inline instead of suppressing it.
- `ui/pages/confirmations/hooks/alerts/transactions/usePerpsWithdrawInsufficientBalanceAlert.test.ts` —
  added `reports the unverifiable block under its own alert key and a short button label`, asserting
  the key is not the insufficient-balance one and that `reason` stays button-sized. Mutation-checked:
  reusing the old key fails 3 cases, and putting the long copy back in `reason` fails 3 cases.
- `app/_locales/en/messages.json`, `app/_locales/en_GB/messages.json` — added
  `alertReasonPerpsWithdrawBalanceUnavailable`.
- Sidecars refreshed: AC2 now matches 6 cases (`recipe.json` `ac2-assert-cases-ran`), and the revert
  check re-measured against the current suite fails **19 of 21**.

### Already addressed before this round

- **`usePerpsWithdrawInsufficientBalanceAlert.ts:22-25` — "sibling Perps surface" coalescing claim.**
  Fixed in `94e8a33f8a` (round 2); the review was generated against the previous commit. The comment
  now reads that only this hook shares the key and that `PerpsStreamManager` issues its own
  uncoalesced `perpsGetAccountState`, so it would have to route through `coalesceBackgroundRequest`
  for the two to share a request. No further change made.

### Deviation from the prescription

The reviewer suggested shortening `alertPerpsWithdrawBalanceUnavailable` itself. Instead the long
copy stays as `message` and a new short string is used for `reason`. Collapsing both to
"Balance unavailable. Try again." would have made `reason === message`, which
`useTransactionCustomAmountAlerts.ts:54-55` treats as "no inline message" — the user would get a
terse button and no explanation. Splitting them keeps the button short *and* tells the user what
happened. The confirmation screen still cannot be rendered in this slot, so the button's wrap
behaviour remains unverified visually; the length is pinned by assertion instead.

## Self-Review Fixes — round 4

All three findings were coverage gaps in round 3's own additions; no product behaviour changed.

- `ui/pages/confirmations/hooks/transactions/useTransactionCustomAmountAlerts.test.ts` — added
  `sets hideResults to true when PerpsWithdrawBalanceUnavailable alert exists`, mirroring the
  existing `InsufficientPayTokenBalance` case. Without it, deleting the `ALERTS_HIDE_RESULTS` entry
  left every suite green while a blocked withdraw confirmation started rendering the bridge-fee /
  bridge-time / receive rows again. Mutation-checked: removing the entry now fails one case.
- `ui/pages/confirmations/hooks/useConfirmationAlertMetrics.test.ts` — added
  `reports an unreadable Perps balance under its own metrics name`, pinning
  `perps_withdraw_balance_unavailable`. `getAlertName` resolves
  `ALERTS_NAME_METRICS[alertKey] ?? alertKey`, so a rename or dropped entry does not break the
  property — it silently changes the metric's shape mid-flight, emitting the camelCase
  `perpsWithdrawBalanceUnavailable` among snake_case names, with no failure anywhere.
  Mutation-checked: removing the entry now fails one case.
- `ui/pages/confirmations/hooks/alerts/transactions/usePerpsWithdrawInsufficientBalanceAlert.test.ts` —
  removed `reports the unverifiable block under its own alert key and a short button label`. Taking
  the reviewer's second option: the case was redundant rather than weak. Both degraded-read cases
  already compare the whole alert with `toStrictEqual` against `EXPECTED_UNAVAILABLE_ALERT`, which
  pins the key and `reason: 'Balance unavailable'` exactly — a stronger check than
  `not.toBe(...)` plus an arbitrary `length <= 'Insufficient funds'.length + 4` bound, and without
  the `as string` cast. Re-verified the mutations it was added for: reusing the old key and putting
  the long copy back into `reason` each still fail 2 cases.
- Sidecars refreshed: AC2 matches 5 cases again (`recipe.json` `ac2-assert-cases-ran`), and the
  revert check re-measured against the current suite fails **18 of 20**.

## Self-Review Fixes — round 5: no change required

This round's issue list was a verbatim repeat of round 4's; the review ran against `02a4451ac2`,
one commit behind. All three findings were already fixed in `c9a4fd8227` — the `ALERTS_HIDE_RESULTS`
case, the `ALERTS_NAME_METRICS` assertion, and the removal of the redundant key/label case whose two
weak assertions were flagged. Re-proved by mutation on the current tree (deleting either wiring entry
fails one case) rather than by reading the diff. Gates re-run green: 35 tests across the three
affected suites, `check diff --profile fast` all pass, recipe `passed: 22 / failed: 0`, artifact
contract pass. Details in `artifacts/no-change-report.md`.

The only work needed was environmental: `doctor` reported `dist-stale` because the previous
test-only commit landed after the last build, so the dist was rebuilt to match HEAD before the
recipe re-run.

## Self-Review Fixes — round 6

- `ui/pages/confirmations/hooks/useConfirmationAlertMetrics.test.ts:90-92` — the comment justifying
  the case was factually wrong, and it was the only thing telling a future reader why the map entry
  matters. `getAlertName` (`useConfirmationAlertMetrics.ts:44-48`) resolves
  `ALERTS_NAME_METRICS[alertKey] ?? alertKey`, so a dropped or renamed entry never yields
  `undefined` — it emits the raw camelCase key. The comment now states the actual cost: the metric
  silently changes shape mid-flight, emitting `perpsWithdrawBalanceUnavailable` among snake_case
  names, with nothing failing. The reviewer is right and my round-3 reasoning had already noted the
  fallback; the round-4 comment contradicted it.
- `report.md` (round 4, second bullet) — corrected the same claim rather than leaving the two
  descriptions inconsistent.

Comment-and-prose only; no behaviour, assertion or recipe change. The case still fails when the map
entry is deleted, which is what it is there to catch.

## Self-Review Fixes — round 7: no change required

The served checklist carried the rev7/rev8 issue list again — the same one round 5 already exited on.
Newest review artifact is `rev9`, whose separate finding was fixed in `6dee7b7a9f`, so the list is two
rounds stale. All three findings verified fixed at HEAD and re-proved by mutation (deleting either
wiring entry fails one case). Gates re-run green: 35 tests across the three affected suites,
`check diff --profile fast` all pass, recipe `passed: 22 / failed: 0`, artifact contract pass.
Details in `artifacts/no-change-report.md`.

Environmental work only, as in round 5: `doctor` reported `dist-stale` after the previous
comment-only commit, so the dist was rebuilt to match HEAD before the recipe re-run.
