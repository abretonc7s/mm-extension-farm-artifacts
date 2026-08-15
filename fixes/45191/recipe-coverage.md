# Recipe coverage — TAT-3632 (PR 45191 pr-complete re-validation)

Recipe: `artifacts/recipe.json` (family-inherited, unmodified this run)
Run: `artifacts/recipe-run/summary.json` → `status: pass`, `failed: 0`, `22/22` nodes, 22s
Trace: `artifacts/recipe-run/trace.json` · Report: `artifacts/recipe-run/report.md`
Target state: branch `TAT-3632-fix-extension-use-a-fresh-perps-ba` **rebased onto
`origin/main@9e713efc26`**, dist rebuilt at HEAD `eaa84b92d4`, live extension over CDP 7667.

**Purpose of this run is narrower than the original.** No code changed here; the inherited
recipe was re-executed to prove the fix still holds on top of new `main` after the rebase
resolved three conflicts (`'use no memo'` removal from #45257, locale key churn, an
added/added test-block collision). The per-AC verdicts below are this run's, measured from
this run's artifacts — not copied from the parent.

## Per-AC coverage matrix

| # | AC (verbatim) | Proof mode | Primary evidence | Recipe nodes (IDs) | Visual file if any | Evidence verdict | Justification |
|---|---------------|------------|------------------|---------------------|--------------------|------------------|---------------|
| 1 | `ui/pages/confirmations/hooks/alerts/transactions/usePerpsWithdrawInsufficientBalanceAlert.ts` bases the blocking decision on a fresh account-state result for Perps withdrawals; check `yarn jest ui/pages/confirmations/hooks/alerts/transactions/usePerpsWithdrawInsufficientBalanceAlert.test.ts --no-coverage`. | state | test (`recipe-run` node output → `ac1-jest.json`) | `ac1-run-fresh-balance-tests`, `ac1-assert-no-failures`, `ac1-assert-cases-ran` | — | PROVEN | The AC names the jest command as its own check. Filter `-t 'fresh balance source'` matched **4 passed / 0 failed** (16 skipped of 20) on the rebased tree. Each case seeds the streamed cache with the value that would produce the opposite decision, so they pass only if the decision comes from the fresh read. The matched-case count is asserted (`ac1-assert-cases-ran`), so an empty filter cannot pass silently. |
| 2 | Non-Perps confirmations do not initialize or query the Perps controller, and degraded reads fail safely without inventing a balance; check `usePerpsWithdrawInsufficientBalanceAlert.test.ts`. | state | test (`ac2-jest.json`) | `ac2-run-perps-scope-tests`, `ac2-assert-no-failures`, `ac2-assert-cases-ran` | — | PROVEN | Filter `-t 'perps scope\|degraded read'` matched **5 passed / 0 failed**. "Never queried" is a negative assertion on background traffic, observable only as mock call counts: the contract-interaction case asserts `submitRequestToBackground` was not called at all, and a re-mount inside the coalescing window asserts exactly one request. The two degraded-read cases keep the streamed cache funded and assert the block carries the *balance-unavailable* key and copy rather than "Insufficient funds", so no path invents a balance. The `ALERTS_HIDE_RESULTS` and `ALERTS_NAME_METRICS` entries that key depends on survived the rebase and are covered by `useTransactionCustomAmountAlerts.test.ts` and `useConfirmationAlertMetrics.test.ts` (both green this run — see step 9, 37/37 across the three changed suites). |
| 3 | A recipe or state-level proof demonstrates stale streamed balance diverging from the fresh balance and the confirmation blocking the invalid withdrawal; artifact: `artifacts/recipe-run/summary.json`. | mixed | state (`live-perps-balance-divergence.json`) + test (`ac3-jest.json`), with one screenshot for orientation | `ac3-probe-live-balance-divergence`, `ac3-assert-streamed-cache-empty`, `ac3-assert-balances-diverge`, `ac3-assert-decisions-disagree`, `ac3-verify-blocking-under-divergence`, `ac3-assert-blocking-no-failures`, `ac3-assert-blocking-test-ran`, `ac3-open-perps-balance`, `ac3-wait-for-fresh-balance`, `ac3-screenshot-live-fresh-balance` | `evidence-ac3-live-fresh-perps-balance.png` | PROVEN | **Divergence** reproduced live and read-only on the merged tree, from a non-Perps screen so nothing re-subscribes the streamed channel: `{"streamedAccountPresent": false, "streamedBalance": "0", "freshBalance": "756.36175", "diverges": true, "validWithdrawal": "378", "decisionFromStreamed": "blocked", "decisionFromFresh": "allowed", "decisionsDisagree": true}`. **Blocking of the invalid withdrawal** is proven by the stale-high case (`ac3-verify-blocking-under-divergence`, 1 passed / 0 failed). The screenshot is orientation only. |

## Visual evidence

One capture, `recipe-run/screenshots/evidence-ac3-live-fresh-perps-balance.png` — the live
Perps home the probe read its fresh balance from (Total balance $761.21, i.e. the $756.36
withdrawable plus the open $10.10 BTC position's value). `recipe-run/artifact-manifest.json`
records `provider: capture-helper`, `mode: snapshot`, no fallback, so it is a real
capture-helper snapshot and not a silent `Page.captureScreenshot` fallback.

No before/after pair this run: nothing in the fix changed, so there is no new "before" state
to capture. The parent run's baseline recipe (`recipe-baseline.json`, run green against the
unfixed tree) remains the before-evidence and is referenced in the PR body.

## Screen-level visual, still recorded as UNTESTABLE (infrastructure)

| Item | Verdict | Rationale |
|---|---|---|
| Screenshot of the MM Pay Perps withdraw **confirmation screen** with the blocking alert visible | UNTESTABLE | Unchanged from the parent run: `createPerpsWithdrawTransaction` needs Arbitrum gas estimation, and EVM RPC in this slot fails with `Failed to execute 'fetch' on 'WorkerGlobalScope': Illegal invocation`. Environmental, not state-related. No AC depends on it — AC1/AC2 are `state` ACs whose own checks are jest runs, and AC3 explicitly accepts "a recipe **or state-level proof**" and names `recipe-run/summary.json` as its artifact. |

## Forbidden-pattern scan

1. `switch` with a `default` routing around an AC assertion — none; the recipe has no `switch` node.
2. Read-only check returning a "skip reason" string — none; every assertion is a strict `eq` on a recorded JSON value.
3. `wait > 500ms` substituting for `wait_for` — none; no `wait` node, and the one capture is preceded by `ui.wait_for` (3.8s, `matched: true`).
4. DOM-only assertion for a visual-ordering/portal/z-index claim — not applicable; no such claim.
5. Node ID without an `ac<N>-` / `setup-` / `gate-` / `teardown-` prefix — none (5 `setup-`, 16 `ac<N>-`, 1 `teardown-`).
6. Missing screenshot for a `visual`/`mixed` AC — AC3 (mixed) has one, capture-helper, no fallback; AC1/AC2 are `state` and deliberately carry none.
7. `end` node claiming UNTESTABLE for state a runner action could build — none; the run ends `pass`.
8. UI value injection — none. The probe only calls `Page.reload` and two read-only evaluations (`getCachedData()`, `submitRequestToBackground('perpsGetAccountState')`).

## Side findings

8 non-blocking application events during the run (`autoLockTimeLimit` metadata error, redux
selector warnings, React Router v7 flag warning, `0xa4b1` polling warning, a 404 resource).
None reference perps or the alert hook; recorded in `recipe-run/diagnostics.json` and treated
as generic runtime noise.

Overall recipe coverage: **3/3 ACs PROVEN** on the rebased state (untestable:
confirmation-screen screenshot only — EVM RPC unavailable in slot; weak: 0; missing: 0).
