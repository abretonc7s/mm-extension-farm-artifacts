# PR #43367 — Comments Report

PR: fix(perps): navigation issue when you tap "add funds" in order screen
Branch: `TAT-3131-fix-fix-add-funds-nav`
Base: `main` (merged `origin/main` @ `3c83fc8d86` into branch — clean, no conflicts)

## Triage

| # | Author | Type | File | Triage | Action |
|---|--------|------|------|--------|--------|
| 1 | github-actions[bot] | Bot | — (conversation) | N/A — informational | CLA signature notice. No action. |
| 2 | mm-token-exchange-service[bot] | Bot | — (conversation) | N/A — informational | CODEOWNERS review listing. No action. |
| 3 | abretonc7s | User | — (conversation) | N/A — not review feedback | farmslot worker report posted by orchestrator. No action. |
| 4 | metamaskbotv2[bot] | Bot | — (conversation) | N/A — informational | "Builds ready" CI artifact links. No action. |

## Summary

- **Inline review comments:** 0
- **CHANGES_REQUESTED reviews:** 0
- **Conversation comments:** 4, all informational bot/CI noise or the orchestrator's own worker-report post. None are actionable review feedback.

**Actionable comments requiring a code fix: 0.**

No review-fix commit was made — there is nothing to fix. The branch was brought up to date with `origin/main` (merge commit `da77714ea3`) and re-validated through the CI parity gate + recipe.

## CI parity gate (step 9)
- `yarn lint:changed` — PASS
- `yarn verify-locales --quiet` — PASS (No invalid entries)
- `yarn circular-deps:check` — PASS
- Unit tests (PR delta): `usePerpsDepositConfirmation.test.ts`, `usePerpsNetworkManagement.test.ts`, `useConfirmActions.test.ts` — 17/17 PASS
- Coverage: PASS — new code 100% (8/8 lines), all 3 source files ≥80%.
  - Note: first coverage run reported FAIL because the local `main` ref was stale (pre-merge); it diffed the branch against old main and pulled in `origin/main`'s batch-sell/bridge files. Synced `git branch -f main origin/main` → re-run PASS. None of the flagged files belong to this PR.

## Recipe re-validation (step 10) — post-merge state
- `RECIPE_SOURCE: family-inherited` (trusted). Recipe reviewed: pure UI/navigation flow, no `expression`/`eval`/`shell`/`exec` primitives.
- Reloaded extension (`Page.reload` ignoreCache) to load freshly-built dist, then ran recipe against `branch + origin/main` merged.
- **Result: PASS.** Proves TAT-3272 (Add Funds opens deposit; Arbitrum auto-added) + TAT-3131 (single back tap returns to market detail, no phantom history entry). Evidence screenshots: `evidence-ac1-deposit-open.png`, `evidence-ac1-one-tap-back-to-market.png`. No console errors/exceptions captured.

## Merge-main status (step 3)
clean — no conflicts. yarn.lock changed during merge → `yarn install --immutable` re-run successfully.

## Final summary

- **Total comments:** 4 (0 REAL, 0 FALSE POSITIVE, 4 OUT OF SCOPE — all bot/CI/worker-report noise, no review feedback)
- **Commit SHA (review fixes):** `628ded2d41` — `style(perps): apply prettier formatting to add-funds nav hooks`. No review comments existed; this commit only normalizes prettier formatting on the 3 PR-touched perps hooks (committed versions failed `prettier --check`, which would break CI lint). Verified via `prettier --check` before/after.
- **Merge commit:** `da77714ea3` (origin/main @ `3c83fc8d86` → branch). Pushed together with the format commit.
- **Files changed (this run):** `ui/components/app/perps/hooks/usePerpsDepositConfirmation.test.ts`, `ui/components/app/perps/hooks/usePerpsNetworkManagement.test.ts`, `ui/components/app/perps/hooks/usePerpsNetworkManagement.ts` (formatting only).
- **Recipe re-validation:** PASS (post-merge state).
- **Merge-main status:** clean / conflicts-resolved → clean.
- **PR mergeable state at start:** `blocked` (pending required checks/reviews, not a conflict).
