# PR #42303 Comments Triage

## Summary
- Total comments: 6 (0 REAL, 0 FALSE POSITIVE, 0 OUT OF SCOPE — all 6 are non-actionable bot/CI/author)
- Commit SHA for fixes: none (no review-fix commit)
- Merge SHA pushed: a50e87dee0 (Merge origin/main into fix/tat-3077-fix-activity-row-tap)
- Files changed in push: merge of origin/main only
- Recipe re-validation: PARTIAL — AC1 (the actual fix surface) PASS, AC2 setup hangs in `perpsGetOrderFills` (regression from main, unrelated to this PR)
- Merge-main status: clean (auto-merge, no conflicts)

## Triage table

| # | Author | Source | File | Triage | Action |
|---|--------|--------|------|--------|--------|
| 1 | github-actions[bot] | conversation | n/a | n/a | CLA Signature Action — informational |
| 2 | metamaskbotv2[bot] | conversation | n/a | n/a | Builds ready notification |
| 3 | metamaskbotv2[bot] | conversation | n/a | n/a | CODEOWNERS review marker |
| 4 | sonarqubecloud[bot] | conversation | n/a | n/a | Quality Gate Passed |
| 5 | metamaskbotv2[bot] | conversation | n/a | n/a | Builds ready (b480b4f) |
| 6 | abretonc7s | conversation | n/a | n/a | PR author worker report — informational |

No inline review comments. No CHANGES_REQUESTED reviews.

## Merge / CI gate
- merge origin/main into branch: clean (ort strategy auto-merge, 64 files changed from main)
- yarn install --immutable: ok
- yarn lint:changed: no changed JS/TS to lint
- yarn verify-locales --quiet: ok
- yarn circular-deps:check: ok
- jest on PR-only test files (perps-recent-activity.test.tsx, perps-market-recent-activity.test.tsx): 25/25 PASS
- coverage on PR-only files: PASS, 100% on changed lines

## Recipe re-validation (post-merge)
- Recipe: `temp/tasks/fix/42303-0501-092220/artifacts/recipe.json` (TAT-3077)
- AC1 (perps tab Recent Activity row tap → /perps/activity): all nodes PASS — fix verified post-merge
- AC2 (market detail Recent Activity row tap): setup step `ac2-pick-symbol` hangs on `stateHooks.submitRequestToBackground('perpsGetOrderFills')`. Direct CDP eval of the same call also hangs. The hang is in the perps controller / stream bridge background path; not touched by this PR. The merge from main pulls in `app/scripts/controllers/perps/perps-stream-bridge.ts` changes, `ui/providers/perps/PerpsStreamManager.ts` updates, and other perps internals — those are the most plausible source.
- Verdict: AC1 (the actual fix surface) is green; AC2 setup hang is from main, unrelated to this PR. Logged as unrelated.
