# PR #45960 — Comment Triage Report

PR: feat(perps): update perps controller to latest version in extension 15.1.0
Branch: `TAT-3845-feat-update-perps-controller-latest`

## Fetched comments

Live re-fetch (step 5) returned:

- Inline review comments (`pulls/45960/comments`): **0**
- General PR-conversation comments (`issues/45960/comments`): **8**, all bot status-only automation
- `CHANGES_REQUESTED` reviews: **0** (the PR has no reviews at all yet)

No `cursor[bot]` / bugbot findings exist on this PR.

## Triage table

| # | ID | Author | File | Triage | Action |
|---|----|--------|------|--------|--------|
| 1 | 5507663366 | github-actions[bot] | — | STATUS-ONLY (skipped) | CLA signature confirmation, no code content |
| 2 | 5507665442 | metamask-ci[bot] | — | STATUS-ONLY (skipped) | CODEOWNERS file listing, no finding |
| 3 | 5507675029 | socket-security[bot] | package.json | STATUS-ONLY (skipped) | Dependency diff scan for `@metamask/perps-controller` 12.0.0 → 15.1.0; zero alerts, all five scores at 91–100 and every one improved. Nothing to action |
| 4 | 5507984976 | metamask-ci[bot] | — | STATUS-ONLY (skipped) | "Builds ready [4465fce]" artifact links |
| 5 | 5508117565 | metamask-ci[bot] | — | STATUS-ONLY (skipped) | "Builds ready [4465fce]" artifact links (duplicate) |
| 6 | 5508998062 | metamask-ci[bot] | — | STATUS-ONLY (skipped) | "Builds ready [0905ed7]" artifact links |
| 7 | 5509471283 | sonarqubecloud[bot] | — | STATUS-ONLY (skipped) | Quality Gate **passed** — 0 new issues, 0 accepted issues, 0 security hotspots, 0% duplication |
| 8 | 5509581914 | metamask-ci[bot] | — | STATUS-ONLY (skipped) | "Builds ready [20bc12b]" artifact links |

**Actionable comments: 0.** Status-only automation skipped without reply: **8**.

## CI status at fetch time

`gh pr checks 45960`: 70 pass / 57 pending / 4 skipping / **0 fail**. No red check to chase.

## Step 7 — Fixes applied

None. Zero comments triaged REAL, so no code change was made for review feedback. The only
history change this round is the step-3 rebase onto `origin/main` (`e6b1571e9e`).

## Step 8 — Self-review

Working tree is clean; there is no fix diff to critique. Reviewed the rebase instead:

- `git diff origin/main --stat` is still exactly the PR's 12 files (114+/14-) — the rebase
  introduced no drift into the PR's own surface area.
- `git diff ORIG_HEAD HEAD --stat` is 35 files, all of them upstream `main` work under
  `app/scripts/lib/money/pay/`, `ui/pages/confirmations/` and `ui/hooks/money/`. Zero overlap
  with the perps files this PR touches, so the rebase carried no semantic conflict.
- Rebase was clean (no conflict markers, no `git rebase --continue`), history stayed linear.

## Step 9 — Local validation

`mm-harness check diff --profile fast` → **pass** (12 changed files, base `origin/main`):
policy-suppressions pass, eslint pass, oxfmt pass, jest pass; typecheck skipped by the fast profile.

`coverage-analyze.js` → **VERDICT: PASS**. `ui/components/app/perps/utils/translate-perps-error.ts`
is at 100% (20/20).

One gotcha worth recording: the first coverage run reported `VERDICT: FAIL — 1 file below 80%`
against `ui/pages/confirmations/utils/transaction-pay.ts` (lines 266, 270). That was a stale-base
artifact, not a real gap — `coverage-analyze.js` diffs against the **local** `main` ref, and step 3
only fetched `origin/main`, so local `main` still pointed at `b1e7ba396f`. The flagged lines belong
to upstream commit `e6b1571e9e` ("fund perps deposits from the money account", PR #45831), not to
this PR. Fast-forwarding local `main` to `origin/main` dropped the file set from 44 to 5 and the
verdict flipped to PASS. No test was added for another team's file.

## Step 10 — Recipe re-validation (post-rebase)

`mm-harness run temp/tasks/fix/45960-0902-210741/artifacts/recipe.json` → **PASS, 27/27 nodes**, 72s.
Run against a dist rebuilt from post-rebase HEAD (`launch --verify` reported
`dist-freshness: fresh — dist id matches HEAD`), so this proves the recipe on `branch + origin/main`.

- **C1** — `package.json` range, resolved `node_modules` version, `yarn.lock` pin all 15.1.0; the
  13.0.0-only symbol `ORDER_CHASE_MAX_DISTANCE_INVALID` is present in `dist/chrome/3960.js`.
- **C2** — `translate-perps-error.test.ts` 45 passed / 45 total; the title-filtered re-run reports
  `44 skipped, 1 passed, 45 total` (non-vacuous); `tsc --noEmit` exit 0.
- **C3** — perps home, market list and ETH market detail all render live data;
  `evidence-ac3-perps-market-live.png` captured with `provider: capture-helper` (not the CDP fallback).

Side findings (non-blocking, 2 distinct): a `MoneyAccountBalanceService:getMoneyAccountBalance`
revert and repeated `home.html` 404s. Neither touches perps controller code — the money-account
service arrived with upstream `e6b1571e9e` during this round's rebase, and both are environmental
to the slot rather than regressions from this PR.

## Step 11 — Commit and push

**No commit, no push.** Two independent reasons:

1. Zero comments triaged REAL, so there is no review fix to commit. Per the checklist, no empty
   commit was created.
2. The rebase from step 3 did **not** need publishing. While this round was running, the remote
   branch advanced from `20bc12bc01` to `6b4aba1e2d` — someone integrated `origin/main` there as a
   merge commit (`Merge branch 'main' into TAT-3845-feat-update-perps-controller-latest`).
   `git diff HEAD origin/TAT-3845-feat-update-perps-controller-latest` is **empty**: the remote tip's
   tree is byte-identical to my locally rebased HEAD, and `git diff origin/main <remote tip>` is still
   exactly the PR's 12 files (114+/14-).

The checklist's `git push --force-with-lease` branch was therefore **deliberately not taken**. Firing
it would have rewritten a teammate's merge commit to swap an already-integrated history for a
content-identical linear one — pure history destruction for zero diff benefit, and against the repo's
never-force-push rule. Local was instead fast-forwarded onto the remote tip (`git reset --hard`,
clean tree, identical content, nothing lost); local and remote are now `0 0` ahead/behind.

`integration-status.txt` was corrected from `rebased` to `skipped` to reflect that this round
published no history.

Final parity gate before this decision: `yarn lint:changed` (no changed files) +
`yarn verify-locales --quiet` ("No invalid entries!") + `yarn circular-deps:check` (passed) — exit 0.

## Step 12 — Replies

**No replies posted.** All 8 fetched comments are routine status-only automation (CLA, CODEOWNERS,
Socket dependency scan with zero alerts, three "Builds ready" posts, SonarCloud quality-gate pass),
which the checklist explicitly says to skip without replying. There were zero inline review comments,
so there is no review thread to reply to or resolve, and no consolidated top-level response is
warranted — posting one would be noise on a PR with no reviewer feedback.

Skipped without reply: **8**. Threads resolved: **0** (none exist).

---

## Summary

- **Total comments: 8** — 0 REAL, 0 FALSE POSITIVE, 0 OUT OF SCOPE, 8 status-only automation skipped.
- **Inline review comments: 0. `CHANGES_REQUESTED` reviews: 0.** The PR has no reviews at all yet.
- **Commit SHA for fixes:** none — no code change was required.
- **Files changed this round:** none. The PR's own diff is unchanged at 12 files (114+/14-).
- **Recipe re-validation:** **PASS** — 27/27 nodes against a dist rebuilt from the post-merge tree.
- **Integration status (step 3):** `skipped` — see step 11. The branch was rebased locally onto
  `origin/main` (`e6b1571e9e`), then the remote turned out to already carry the same integration as a
  merge commit with a byte-identical tree, so nothing needed publishing.
- **CI:** 70 pass / 57 pending / 4 skipping / **0 fail** at fetch time.

**Merge-readiness verdict:** the PR is green and has no outstanding feedback. It is blocked only on
human review — it has zero reviews so far, and the two reviewer-checklist boxes in the PR body are
still unchecked.
