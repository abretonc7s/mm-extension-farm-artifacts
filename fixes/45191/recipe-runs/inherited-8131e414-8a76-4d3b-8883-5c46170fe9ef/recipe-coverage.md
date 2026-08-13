# Recipe coverage — TAT-3632

Recipe: `artifacts/recipe.json` · baseline: `artifacts/recipe-baseline.json`
Run: `artifacts/recipe-run/summary.json` → `status: pass`, `failed: 0`
Trace: `artifacts/recipe-run/trace.json` → 22 nodes recorded (5 `setup-`, 16 `ac<N>-`, 1 `teardown-`), all `true`, terminal `teardown-done: pass`; `summary.json` reports `passed: 22`, `failed: 0`, `total: 22`.

## Per-AC coverage matrix

| # | AC (verbatim) | Proof mode | Primary evidence | Recipe nodes (IDs) | Visual file if any | Evidence verdict | Justification |
|---|---------------|------------|------------------|---------------------|--------------------|------------------|---------------|
| 1 | `ui/pages/confirmations/hooks/alerts/transactions/usePerpsWithdrawInsufficientBalanceAlert.ts` bases the blocking decision on a fresh account-state result for Perps withdrawals; check `yarn jest ui/pages/confirmations/hooks/alerts/transactions/usePerpsWithdrawInsufficientBalanceAlert.test.ts --no-coverage`. | state | test (`artifacts/ac1-jest.json`) | `ac1-run-fresh-balance-tests`, `ac1-assert-no-failures`, `ac1-assert-cases-ran` | — | PROVEN | The AC names the jest command as its own check. The four `fresh balance source` cases (stale-high, stale-low, fresh-equal, in-flight) each set the streamed cache to a value that would produce the opposite decision, so they pass only if the decision comes from the fresh read: `numPassedTests = 4`, `numFailedTests = 0`. Reverting the hook to its pre-fix form fails 18 of the 20 cases in this suite (re-measured against the current suite). |
| 2 | Non-Perps confirmations do not initialize or query the Perps controller, and degraded reads fail safely without inventing a balance; check `ui/pages/confirmations/hooks/alerts/transactions/usePerpsWithdrawInsufficientBalanceAlert.test.ts`. | state | test (`artifacts/ac2-jest.json`) | `ac2-run-perps-scope-tests`, `ac2-assert-no-failures`, `ac2-assert-cases-ran` | — | PROVEN | "Never queried" is a negative assertion on background traffic, observable only as mock call counts: the contract-interaction case asserts `submitRequestToBackground` was **not** called at all, and a re-mount inside the coalescing window asserts exactly one request is issued. A third `perps scope` case changes the Perps scope key mid-render and asserts the hook falls back to loading instead of reusing the previous scope's balance. The two `degraded read` cases (read rejects, read returns no account) keep the streamed cache at $500 and assert the withdrawal is blocked with the *balance-unavailable* copy rather than "Insufficient funds", so neither path invents a balance. Both degraded cases compare the whole alert with `toStrictEqual`, so they also pin its distinct `AlertsName` (alert telemetry cannot fold it into the insufficient-balance bucket) and its short `reason` (the disabled confirm button's label). Filter `-t 'perps scope|degraded read'`: `numPassedTests = 5`, `numFailedTests = 0`. The `ALERTS_HIDE_RESULTS` and `ALERTS_NAME_METRICS` entries that key depends on are covered in `useTransactionCustomAmountAlerts.test.ts` and `useConfirmationAlertMetrics.test.ts`; deleting either entry fails one case. |
| 3 | A recipe or state-level proof demonstrates stale streamed balance diverging from the fresh balance and the confirmation blocking the invalid withdrawal; artifact: `artifacts/recipe-run/summary.json`. | mixed | state (`artifacts/live-perps-balance-divergence.json`) + test (`artifacts/ac3-jest.json`), with one screenshot for orientation | `ac3-probe-live-balance-divergence`, `ac3-assert-streamed-cache-empty`, `ac3-assert-balances-diverge`, `ac3-assert-decisions-disagree`, `ac3-verify-blocking-under-divergence`, `ac3-assert-blocking-no-failures`, `ac3-assert-blocking-test-ran`, `ac3-open-perps-balance`, `ac3-wait-for-fresh-balance`, `ac3-screenshot-live-fresh-balance` | `before-evidence-ac3-live-fresh-perps-balance.png` / `after-evidence-ac3-live-fresh-perps-balance.png` | PROVEN | **Divergence** is proven live and read-only in the running extension: after the UI realm restarts, the streamed cache is absent (`streamedAccountPresent: false` → `"0"`) while the fresh `perpsGetAccountState` read returns `"763.276429"`, and the two sources disagree on a $381 withdrawal (`blocked` vs `allowed`). **Blocking of the invalid withdrawal** is proven by the stale-high case: streamed cache $500, fresh balance $20, entered $100 → blocking alert (`numPassedTests = 1`). The screenshot is orientation only — it shows the real $763.28 balance the probe read as the fresh source; it is not used as proof of hidden behaviour. Captured via capture-helper snapshot (`recipe-run/artifact-manifest.json`: `provider: capture-helper`, `mode: snapshot`, `fallbackFrom: null`). |

## Screen-level visual, recorded as UNTESTABLE (infrastructure)

| Item | Verdict | Rationale |
|---|---|---|
| Screenshot of the MM Pay Perps withdraw **confirmation screen** with the blocking alert visible | UNTESTABLE | The confirmation cannot be opened in this slot. `perps-balance-dropdown-withdraw` → `createPerpsWithdrawTransaction` needs an Arbitrum network client and gas estimation; Arbitrum was added through the real network picker (`network-list-item-0xa4b1`), after which the flow fails at the RPC layer: `Failed to open perps withdraw flow a: RPC 0xa4b1 Custom eth_getBlockByNumber: Failed to execute 'fetch' on 'WorkerGlobalScope': Illegal invocation`. Confirmed environmental, not state-related: the same URL fetched directly inside the service worker returns `200`, an *unbound* `fetch` in that same worker throws the identical error, the home screen independently reports `Unable to connect to Ethereum`, and it reproduces on both the LavaMoat one-shot dist and a fresh non-LavaMoat `--watch` build with zero source changes. This is a missing-infrastructure limit (all EVM RPC is down in the slot), not missing fixture state that a flow could build. |

No AC depends on this screenshot: AC1 and AC2 are `state` ACs whose own checks are jest runs, and AC3 explicitly accepts "a recipe **or state-level proof**" and names `artifacts/recipe-run/summary.json` as its artifact.

## Forbidden-pattern scan (step 7a)

1. `switch` with a `default` routing around an AC assertion — none; the recipe has no `switch` node.
2. Read-only check returning a "skip reason" string — none; every assertion is a strict `eq` on a recorded JSON value.
3. `wait > 500ms` substituting for `wait_for` — none; the recipe contains no `wait` node, and the one visual capture is preceded by `ui.wait_for` on `perps-balance-dropdown-balance`.
4. DOM-only assertion for a visual-ordering/portal/z-index claim — not applicable; no such claim.
5. Node ID without an `ac<N>-` / `setup-` / `gate-` / `teardown-` prefix — none.
6. Missing screenshot for a `visual`/`mixed` AC — AC3 (mixed) has one, captured by capture-helper with no fallback; AC1/AC2 are `state` and deliberately carry no screenshot.
7. `end` node claiming UNTESTABLE for state a runner action could build — none; the recipe ends `pass`, and the one UNTESTABLE item above is an RPC-layer infrastructure fault, not missing Perps state.
8. UI value injection — none. The probe only calls `Page.reload` and two read-only evaluations (`getCachedData()`, `submitRequestToBackground('perpsGetAccountState')`). No controller, store, DOM or form value is written anywhere in either recipe.

## Before/after delta

`recipe-baseline.json` ran green against the unfixed tree and captured
`before-evidence-ac3-live-fresh-perps-balance.png`, asserting the buggy state:
the hook source still contained `getPerpsStreamManager().account.getCachedData()`
(`ac3-assert-hook-reads-streamed-cache`), the suite held 13 cases
(`ac1-assert-baseline-case-count`), and **zero** of them were fresh-balance cases
(`ac2-assert-fresh-filter-empty`). After the fix the same filter matches 4 passing cases and the
streamed-cache read is gone. The two screenshots are the same Perps balance screen by design —
the visible balance is the fresh value in both, because the fix changes which source the *hidden*
alert decision reads, not what this screen renders. That is why AC1/AC2 are graded on test evidence
and AC3 on the live state probe, not on the image.

Overall recipe coverage: 3/3 ACs PROVEN (untestable: confirmation-screen screenshot only — EVM RPC unavailable in slot, weak: 0, missing: 0)
