# PR #45986 — review comment triage (follow-up round)

Live fetch after the rebase: 1 unresolved review thread. The geositta review `5242211383` still
shows `CHANGES_REQUESTED`, but all 11 of its threads were answered in 3bbdb97bf4 and resolved.
Clearing that state needs the reviewer to re-review. New issue comments are status-only
(metamask-ci build-ready, SonarQube quality gate), so 2 were skipped without reply.

| # | ID | Author | File | Triage | Action |
|---|----|--------|------|--------|--------|
| 1 | 4074196442 | cursor[bot] | ui/components/app/perps/utils/unfunded-deposit-funnel.ts:48 | REAL | `markUnfundedDepositFunnel` keeps an existing confirmation for the same address instead of resetting `confirmedAt` to null |

Verified against HEAD: `markUnfundedDepositFunnel` unconditionally wrote `{address, confirmedAt: null}`.
After a confirmed deposit the live balance stream can lag, so `hasNoAvailableBalance` stays true and
the Add funds CTAs stay live. A second click wiped the confirmation, and `consumeUnfundedDepositFunnel`
then returned false on the first real post-deposit order, which dropped `trade_submitted_after_deposit`.
A different address still restarts the funnel.

Totals: **1 REAL, 0 FALSE POSITIVE, 0 OUT OF SCOPE**.

## Validation (step 9)

- `mm-harness check diff --profile fast`: **PASS** (policy-suppressions, eslint, oxfmt, jest)
- `coverage-analyze.js`: reported **FAIL**, but the failing files are not part of this PR.
  The two files below 80% new-code coverage are `app/scripts/lib/active-tab/active-tab-tracker.ts`
  (74%) and `ui/pages/custom-token-import/custom-token-import.tsx` (78%). Neither appears in
  `git diff origin/main --name-only`. The script diffs against the stale local `main` ref, so it
  counts commits that already landed on `origin/main`. Every PR file passes: `unfunded-deposit-funnel.ts`
  90% new, `perps-order-entry-page.tsx` 88%, the toast, hook, and amount-input files 100%.
  No tests were added to unrelated files.

## Recipe re-validation (step 10)

**PASS** on branch + origin/main after the rebase. The recipe is byte-identical to the family-inherited one.
Screenshot `recipe-run/screenshots/after-ac2-unfunded-cta.png` came from `capture-helper`, not the
fallback. It shows 0.00 USDC available, the labeled row Add funds button, the enabled Add funds to
trade CTA, and the $10 hint. Runtime needed the known `disable_reasons` recovery once after the rebase.

## Final summary (step 13)

- Total actionable comments: **1**, triaged 1 REAL, 0 FALSE POSITIVE, 0 OUT OF SCOPE.
- Fix commit: `0198df0f8e8e5ba38bfb94d58145cf6b19d58ae0`, pushed with `--force-with-lease` after the rebase.
- Files changed: `ui/components/app/perps/utils/unfunded-deposit-funnel.ts` and `unfunded-deposit-funnel.test.ts`.
- Thread 4074196442 was replied to with the SHA and resolved.
- Recipe re-validation: **PASS**.
- Integration status: **rebased** onto `origin/main` (0a5a16b38fb), clean, `yarn.lock` unchanged.
- Known remaining edge case, left out of scope: if a *second* deposit fails after a first one confirmed,
  the toast's failure branch clears the funnel, which also drops the earlier confirmation.
- Open item for humans: geositta's review still reads `CHANGES_REQUESTED` even though all its threads
  are resolved. It needs a re-review from them.
