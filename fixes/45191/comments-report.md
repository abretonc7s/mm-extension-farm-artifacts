# PR 45191 — Comments Report

**Branch:** `TAT-3632-fix-extension-use-a-fresh-perps-ba`
**Ticket:** TAT-3632 (deferred display/Max parity filed as TAT-3661)
**PR state at fetch:** `open`, `mergeable: false` / `mergeable_state: dirty` (conflicts with `origin/main`)
**CI at pre-rebase head `65e6209`:** 97 success, 3 skipped, 0 failing

## Fetched inventory (live, not the snapshot)

| Source | Count |
|---|---|
| Inline review comments (`pulls/.../comments`) | 0 |
| `CHANGES_REQUESTED` reviews | 0 (1 `APPROVED` from OGPoyraz, empty body) |
| Issue/conversation comments | 9 |

8 of the 9 issue comments are status-only automation and were skipped without reply:
CLA signature (github-actions), CODEOWNERS list (metamask-ci), 5× "Builds ready"
(metamask-ci), SonarQube quality-gate passed (0 new issues, 98.4% coverage on new code).

## Triage

| # | ID | Author | File | Triage | Action |
|---|----|--------|------|--------|--------|
| 1 | 5278252244 | abretonc7s (farmslot run report) | `app/_locales/en/messages.json`, `app/_locales/en_GB/messages.json` | REAL | Merge blocker: branch conflicted with `origin/main`. Resolved by rebasing onto `origin/main` (step 3), not by a new code fix. |

No reviewer asked for a code change, so no review-fix commit was authored. The only
actionable finding — the conflict with `main` — is addressed by the rebase.

## Integration (step 3)

Rebased `TAT-3632-fix-extension-use-a-fresh-perps-ba` onto `origin/main` (`9e713efc26`).
Six commits replayed; three conflicts resolved:

1. `ui/pages/confirmations/hooks/alerts/transactions/usePerpsWithdrawInsufficientBalanceAlert.ts`
   — main's `perf(6562): remove 'use no memo' from confirmation alerts (#45257)` deleted the
   directive from every confirmation alert hook. Took main's intent (directive dropped) plus
   this branch's `useEffect`/`useState` imports and fresh-read logic. The hook uses only
   standard hooks, so React Compiler can process it.
2. `app/_locales/en/messages.json` + `app/_locales/en_GB/messages.json` — main removed
   `alertReasonChangeInSimulationResults`; this branch adds
   `alertPerpsWithdrawBalanceUnavailable` and `alertReasonPerpsWithdrawBalanceUnavailable`.
   Kept both sides' intent: the deleted key stays deleted, both new keys land in alphabetical
   position.
3. `ui/pages/confirmations/hooks/transactions/useTransactionCustomAmountAlerts.test.ts` —
   both sides added a test at the same spot. Kept both: main's `AccountNoFunds`
   (`disableUpdate: true`) case and this branch's `PerpsWithdrawBalanceUnavailable`
   (`disableUpdate: false`) case. The merged hook lists both keys, so both assertions hold.

`yarn.lock` unchanged by the rebase; `yarn install --immutable` run anyway after the
dependency-tree change from main. History is linear (no merge commit).

Integration status: `rebased` (see `integration-status.txt`).

## Validation

_(filled in by steps 9–10)_

### Step 9 — local validation

`mm-harness check diff --profile fast` (base `origin/main`, 10 changed files): **pass**
— policy-suppressions ✓, eslint ✓, oxfmt ✓, jest ✓ (typecheck skipped by profile).

Changed-file jest re-run explicitly: **37 passed / 37 total**, 3 suites
(`usePerpsWithdrawInsufficientBalanceAlert`, `useTransactionCustomAmountAlerts`,
`useConfirmationAlertMetrics`), no console-baseline violations.

`coverage-analyze.js` VERDICT: **FAIL — but not from this PR.** The tool scans 358 files
against a wider base than the PR diff. Every file this PR touches is at 100% new-line
coverage:

| File | New-line coverage |
|---|---|
| `ui/pages/confirmations/hooks/alerts/transactions/usePerpsWithdrawInsufficientBalanceAlert.ts` | 100% (20/20), 0 uncovered new lines |
| `ui/hooks/perps/coalesceBackgroundRequest.ts` | 100% overall (24/24) |
| `ui/pages/confirmations/hooks/transactions/useTransactionCustomAmountAlerts.ts` | 100% overall (9/9) |
| `ui/pages/confirmations/hooks/useConfirmationAlertMetrics.ts` | 100% overall (19/19) |

The 24 files driving the FAIL (`metamask-controller.js` 28%, `setupSentry.js` 0%,
`asset-page.tsx` 0%, …) and the 2 failing suites
(`ui/components/multichain/network-list-menu/network-list-menu.test.ts`) are pre-existing
and outside this PR's diff. Not fixed — per the checklist, pre-existing gaps and unrelated
files are out of bounds. SonarQube agrees: 98.4% coverage on new code, quality gate passed.

### Step 10 — recipe re-validation (post-rebase)

`temp/tasks/fix/45191-0815-091925/artifacts/recipe.json` (family-inherited, trusted) re-run
against `branch + origin/main`, live extension over CDP 7667, fresh dist built at rebased
HEAD `eaa84b9`.

**Result: PASS — 22/22 nodes, 22s.** Artifacts: `artifacts/recipe-run/`.

Key live evidence (`ac3-probe-live-balance-divergence`, from a non-Perps screen so nothing
re-subscribes the streamed channel):

```json
{"streamedAccountPresent": false, "streamedBalance": "0", "freshBalance": "756.36175",
 "diverges": true, "validWithdrawal": "378",
 "decisionFromStreamed": "blocked", "decisionFromFresh": "allowed",
 "decisionsDisagree": true}
```

The exact bug condition from TAT-3632 still reproduces on the merged state, and the hook's
decision follows the fresh read. AC1 (fresh balance source, 4 cases), AC2 (perps scoping +
degraded read, 5 cases) and AC3 (blocking under divergence) all pass, plus a live capture at
`recipe-run/screenshots/evidence-ac3-live-fresh-perps-balance.png`.

Side findings: 8 non-blocking application events (`autoLockTimeLimit` metadata error,
redux selector warnings, React Router v7 flag, `0xa4b1` polling warning, a 404 resource).
None touch perps or the alert hook — generic runtime noise, unrelated to this PR.

## Summary

- **Total comments triaged: 9** (1 REAL, 0 FALSE POSITIVE, 0 OUT OF SCOPE, 8 status-only
  automation skipped without reply). 0 inline review comments, 0 `CHANGES_REQUESTED`.
- **Commit SHA for fixes: none.** No reviewer asked for a code change, so no review-fix
  commit was created. The branch was published by force-pushing the rebase.
- **Pushed head:** `eaa84b92d4` (was `65e62094b7`).
- **Files changed vs `origin/main`** (10, unchanged in content by this run — only replayed
  onto new main):
  - `app/_locales/en/messages.json`
  - `app/_locales/en_GB/messages.json`
  - `ui/hooks/perps/coalesceBackgroundRequest.ts`
  - `ui/pages/confirmations/hooks/alerts/constants.ts`
  - `ui/pages/confirmations/hooks/alerts/transactions/usePerpsWithdrawInsufficientBalanceAlert.ts`
  - `ui/pages/confirmations/hooks/alerts/transactions/usePerpsWithdrawInsufficientBalanceAlert.test.ts`
  - `ui/pages/confirmations/hooks/transactions/useTransactionCustomAmountAlerts.ts`
  - `ui/pages/confirmations/hooks/transactions/useTransactionCustomAmountAlerts.test.ts`
  - `ui/pages/confirmations/hooks/useConfirmationAlertMetrics.ts`
  - `ui/pages/confirmations/hooks/useConfirmationAlertMetrics.test.ts`
- **Recipe re-validation: PASS** (22/22 nodes against `branch + origin/main`).
- **Integration status: `rebased`** (`artifacts/integration-status.txt`).
- **PR state after push:** `mergeable: true` (was `false` / `dirty`); `mergeable_state:
  blocked` only because the re-triggered required checks had not finished yet.
- Consolidated triage reply posted:
  https://github.com/MetaMask/metamask-extension/pull/45191#issuecomment-5300048902
