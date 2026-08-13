# PR 45191 — Comments Report (interactive re-entry)

PR: https://github.com/MetaMask/metamask-extension/pull/45191
Branch: `TAT-3632-fix-extension-use-a-fresh-perps-ba`
Ticket: TAT-3632 (follow-up TAT-3661 filed for the deferred display/Max parity issue)

## Inherited context

Inherited: **yes** — family `8131e414-8a76-4d3b-8883-5c46170fe9ef`, root TAT-3632.
Materialized under `inputs/inherited/`: `TASK.md`, `report.md`, `learnings.md`, `recipe.json`,
`recipe-quality.json`, `recipe-coverage.md`, `evidence-manifest.json`. Task recipe library missing.
Trusted recipe promoted to `artifacts/recipe.json` (`RECIPE_SOURCE: family-inherited`).

Summary of prior run:

- Fix replaces the synchronous `PerpsStreamManager` cache peek in
  `usePerpsWithdrawInsufficientBalanceAlert` with a `perpsWithdraw`-gated, coalesced fresh
  `perpsGetAccountState` read; adds explicit loading and degraded-read handling with its own alert
  key (`PerpsWithdrawBalanceUnavailable`), metrics name and hide-results entry.
- Seven self-review rounds already applied (rounds 5 and 7 were "no change required" — stale
  review lists).
- Prior validation: 20 passing cases in the alert suite, revert check fails 18/20, scoped lint gate
  green, recipe run `passed: 22 / failed: 0`, coverage 96%.
- Known environmental limitation, unchanged: the MM Pay withdraw **confirmation screen** cannot be
  opened in this slot — EVM RPC fails with
  `Failed to execute 'fetch' on 'WorkerGlobalScope': Illegal invocation`, so
  `createPerpsWithdrawTransaction` cannot estimate Arbitrum gas. AC3 was proven at state level
  (`live-perps-balance-divergence.json`).

## Live comment fetch (step 5, re-fetched at HEAD `6dee7b7a9f`)

| Source | Count | Notes |
|---|---|---|
| Inline review comments (`pulls/45191/comments`) | **0** | none, including replies |
| Issue comments from `User` accounts | **0** | |
| Issue comments from bots | 4 | CLA, CODEOWNERS, SonarQube (quality gate **passed**), build-ready |
| Reviews with `CHANGES_REQUESTED` | **0** | no reviews of any state |

## Triage

| # | Item | Class | Action |
|---|---|---|---|
| 1 | `github-actions[bot]` — CLA signed | FALSE_POSITIVE (noise) | none |
| 2 | `metamask-ci[bot]` — CODEOWNER review list (`@MetaMask/confirmations`, 7 files) | FALSE_POSITIVE (noise) | none — informational; confirmations team review still needed |
| 3 | `sonarqubecloud[bot]` — Quality Gate **passed** | FALSE_POSITIVE (noise) | none |
| 4 | `metamask-ci[bot]` — Builds ready `[6dee7b7]` | FALSE_POSITIVE (noise) | none |

**No `REAL` review comments exist. No code fixes were applied in this session.**

## Blocker found outside the comment stream

`gh pr view` at HEAD reports:

- `state: OPEN`, **`isDraft: true`**
- **`mergeable: CONFLICTING`, `mergeStateStatus: DIRTY`**
- `reviewDecision: REVIEW_REQUIRED`

The branch conflicts with `origin/main` (`d40252b130`). Verified with
`git merge-tree --write-tree HEAD origin/main` — exactly two conflicting files, both trivial:

- `app/_locales/en/messages.json`
- `app/_locales/en_GB/messages.json`

Cause: adjacent-key churn, not semantic overlap. This branch inserts
`alertPerpsWithdrawBalanceUnavailable` and `alertReasonPerpsWithdrawBalanceUnavailable`; `main`
independently added the `activity_rampBuy_*` / `activity_rampSell_*` block and removed
`alertMessageChangeInSimulationResults` (and neighbours) in the same regions.

Resolution is "keep both sides": take `main`'s additions/removals and re-insert this branch's two
keys in alphabetical position. No source file conflicts — `useConfirmationAlertMetrics.test.ts`
auto-merges. Re-run `yarn verify-locales --quiet` after the merge, since `main` deleted keys.

**Not applied here** — merging/rebasing `main` rewrites this branch's shape and this is an
interactive re-entry with no push mandate. Left as an explicit operator decision (merge vs rebase).
