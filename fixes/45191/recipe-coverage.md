# Recipe coverage — TAT-3632 (PR 45191 re-entry)

Supersedes `inputs/inherited/recipe-coverage.md`. The inherited matrix recorded the confirmation-screen
visual as **UNTESTABLE** ("all EVM RPC is down in the slot"). That limitation was lifted this session:
after merging latest `main` and relaunching the dev build through the harness, EVM RPC became usable,
and the MM Pay Perps withdraw confirmation was opened and captured in both code versions.

Recipes:
- `artifacts/recipe.json` → run `artifacts/recipe-run/summary.json`: `status: pass`, `passed: 22`, `failed: 0`
- `artifacts/recipe-ab.json` → run `artifacts/recipe-ab-run/summary.json`: `status: pass`, `passed: 24`, `failed: 0`
- Live UI reproduction (not a recipe): `artifacts/repro/repro-withdraw-confirmation.mjs`, timelines and PNGs in `artifacts/repro/`

Scoped gates on the final merged tree (`4bdfc3bbd0`): **36 tests passed** across
`usePerpsWithdrawInsufficientBalanceAlert.test.ts`, `useTransactionCustomAmountAlerts.test.ts`,
`useConfirmationAlertMetrics.test.ts`; `yarn verify-locales --quiet` clean.

## Per-AC coverage matrix

| # | AC | Proof mode | Primary evidence | Nodes / driver | Visual | Verdict | Justification |
|---|----|-----------|------------------|----------------|--------|---------|---------------|
| 1 | The alert bases its blocking decision on a fresh account-state read for Perps withdrawals | state + visual | `artifacts/ac1-jest.json`; `artifacts/ab/prefix-observed.json` vs `postfix-observed.json`; live repro timelines | `ac1-run-fresh-balance-tests`, `ac1-assert-no-failures`, `ac1-assert-cases-ran`; A/B `ab-assert-prefix-read-streamed`, `ab-assert-postfix-read-fresh`, `ab-assert-postfix-ignores-streamed` | `repro/before-broken-ALERT-at-970ms.png` | PROVEN | The `fresh balance source` cases seed the streamed cache with the opposite-decision value, so they pass only if the decision comes from the fresh read. The A/B driver records which source each version touched: pre-fix `streamedCacheConsulted: true, freshReadCalled: false`; post-fix the inverse. Live: at 970 ms after a UI restart the pre-fix build blocks with `avail=$0.00` while the post-fix build does not. |
| 2 | Non-Perps confirmations never initialize or query Perps; degraded reads fail safe without inventing a balance | state | `artifacts/ac2-jest.json` | `ac2-run-perps-scope-tests`, `ac2-assert-no-failures`, `ac2-assert-cases-ran` | — | PROVEN | Negative assertion on background traffic, observable only as mock call counts: the contract-interaction case asserts `submitRequestToBackground` was never called; a re-mount inside the coalescing window asserts exactly one request. Both degraded-read cases compare the whole alert with `toStrictEqual`, pinning the distinct `AlertsName` and the short button `reason`. The `ALERTS_HIDE_RESULTS` / `ALERTS_NAME_METRICS` entries it depends on are covered in the two sibling suites; deleting either fails one case. |
| 3 | A recipe or state-level proof demonstrates the stale streamed balance diverging from the fresh balance and the confirmation blocking the invalid withdrawal | mixed | `artifacts/ab/live-input.json`, `artifacts/repro/*-timeline.json` | `ab-capture-live-state`, `ab-assert-streamed-cache-empty`, `ab-assert-live-diverges`, `ab-assert-prefix-blocked`, `ab-assert-prefix-alert-copy`, `ab-assert-postfix-allowed` | `repro/before-broken-ALERT-with-real-balance-4266ms.png`, `repro/after-fixed.png` | PROVEN | Divergence captured live and read-only: `streamedAccountPresent: false` → `"0"` vs fresh `"756.392549"`. Blocking of the invalid withdrawal is proven by the stale-high jest case. The AC's requirement is now exceeded by a real-UI reproduction (below). |

## Screen-level visual — previously UNTESTABLE, now PROVEN

| Item | Verdict | Evidence |
|---|---|---|
| Screenshot of the MM Pay Perps withdraw **confirmation screen** with the blocking alert visible | **PROVEN** | `repro/before-broken-ALERT-with-real-balance-4266ms.png`: `$378` entered, "Available balance: $756.39", confirm button reads **"Insufficient funds"** and is disabled. Paired with `repro/after-fixed.png` on the fixed build: same amount, same balance, button **"Withdraw"** enabled, fee `$0.72`, receive `$377.28`. |

Sampled DOM timeline, amount entered ~1 s after a UI restart in both runs
(`repro/before-broken-timeline.json`, `repro/after-fixed-timeline.json`):

```
before   970ms  avail=$0.00    insufficient=TRUE     <- blocks a withdrawal the account can cover
        4266ms  avail=$756.39  insufficient=TRUE     <- still blocking while the balance is displayed
        9180ms  avail=$756.39  insufficient=false
after    962ms  avail=$0.00    insufficient=false    <- never blocks
        4988ms  avail=$756.39  insufficient=false    Withdraw enabled
```

Only the hook differs between the two runs; the pre-fix version is `git show
bc55c67781:…/usePerpsWithdrawInsufficientBalanceAlert.ts`, restored afterwards (tree verified clean).
Corroboration that a blocking alert is genuinely active in the "before" capture: the fee and
"You'll receive" rows are absent, which is `ALERTS_HIDE_RESULTS` suppressing them.

Environment steps required to reach the screen, recorded so this is reproducible: merge latest `main`
and relaunch the dev build (`mm-harness launch --watch --verify`) so EVM RPC is usable; add Arbitrum
`0xa4b1` (absent from the default fixture, so `createPerpsWithdrawTransaction` cannot resolve a
network client); reload the UI if Perps hangs, which clears a stale page↔background stream.

## Retracted artifact

A synthesized HTML "before/after card" produced mid-session was **fabricated evidence** — it depicted
an alert that had not been observed. Removed from the PR body and deleted from the artifacts repo
(commit `dedb61d3b4`). No synthesized image is used anywhere in this coverage.

## Forbidden-pattern scan

1. `switch` with a `default` routing around an AC assertion — none.
2. Read-only check returning a "skip reason" string — none; every assertion is a strict `eq` on recorded JSON.
3. `wait > 500ms` substituting for `wait_for` — none in the recipes. The live repro samples the DOM every 400 ms and captures **on state detection**, not on a fixed delay.
4. DOM-only assertion for a visual claim — no; the visual claim carries real `Page.captureScreenshot` captures of the live extension.
5. Node ID without an `ac<N>-` / `setup-` / `ab-` / `evidence-` / `teardown-` prefix — none.
6. Missing screenshot for a `visual`/`mixed` AC — AC3 carries two, from opposite code versions.
