# PR #43367 — Comments Report (interactive re-entry)

PR: fix(perps): navigation issue when you tap "add funds" in order screen
Branch: `TAT-3131-fix-fix-add-funds-nav`
Head SHA: `b8c962dc0f` (local HEAD == remote PR head; working tree had the comment edit below applied locally, uncommitted)
Inherited context: present (family `d964d349-d20a-41b8-a022-07537f97ade3`, root TAT-3131). Inherited report/learnings/recipe reloaded from `inputs/inherited/`.

## Context summary (reload)

Family-inherited PR bundling two fixes on the Add Funds flow:
- **TAT-3131** — phantom `confirm-transaction` history entry after visiting Add Funds. Root cause: `useConfirmActions.ts` `navigateBackToPreviousPage` branch used `navigate(goBackTo)` (push) while entry navigated with `{ replace: true }`. Fix: return with `{ replace: true }` (symmetric with confirm-context auto-exit). One-line behavior change + test assertions.
- **TAT-3272** (bundled) — Add Funds did nothing on a wallet without Arbitrum. `PerpsController.depositWithConfirmation` throws `Invalid chain ID "0xa4b1"`; deposit hook swallowed it. Fix: new `usePerpsNetworkManagement.ensureArbitrumNetworkExists`, called from `usePerpsDepositConfirmation` before creating the deposit tx.

## Live comment triage

| # | Author | Type | Where | Triage | Action |
|---|--------|------|-------|--------|--------|
| 1 | github-actions[bot] | Bot | conversation | N/A informational | CLA signature notice. No action. |
| 2 | mm-token-exchange-service[bot] | Bot | conversation | N/A informational | CODEOWNERS listing (`@MetaMask/confirmations`, 2 files). No action. |
| 3 | abretonc7s | User | conversation | N/A — orchestrator worker-report post, not review feedback | No action. |
| 4 | abretonc7s | User | conversation | N/A — orchestrator comments-report post, not review feedback | No action. |
| 5 | metamaskbotv2[bot] | Bot | conversation | N/A informational | "Builds ready" CI artifact links (x3). No action. |

- **Inline review comments (top-level):** 0
- **CHANGES_REQUESTED reviews:** 0
- **Actionable GitHub review comments requiring a code fix:** 0

## Operator-requested fix (this session)

The operator flagged that code comments referenced the JIRA ticket number (`TAT-3131`) and were too verbose — unacceptable for the **`@MetaMask/confirmations`-owned** files (`useConfirmActions.ts`, `useConfirmActions.test.ts`), which would block the confirmations team's review.

**Triage: REAL (style/codeowner).** Fixed minimally — removed the `TAT-3131` references and condensed both comments to a concise "why", touching only the two confirmation-owned files (the perps-owned files had no ticket refs, so were left untouched to keep the diff minimal).

- `ui/pages/confirmations/hooks/useConfirmActions.ts` — 7-line comment (with `TAT-3131`) → 3-line concise comment, no ticket number.
- `ui/pages/confirmations/hooks/useConfirmActions.test.ts` — 5-line comment (with `TAT-3131`) → 2-line concise comment, no ticket number.

No runtime behavior change. The shipped source fix (`navigate(..., { replace: true })`) is unchanged.

## Validation (this session)

- `yarn lint:changed` — PASS (2 changed files)
- `yarn verify-locales --quiet` — PASS
- `yarn circular-deps:check` — PASS
- `yarn jest ui/pages/confirmations/hooks/useConfirmActions.test.ts --no-coverage` — 7/7 PASS
- Full PR-delta jest (`usePerpsDepositConfirmation`, `usePerpsNetworkManagement`, `useConfirmActions`) — 17/17 PASS
- Recipe (`artifacts/recipe.json`, family-inherited/trusted) re-run against freshly rebuilt dist on CDP 7666 — **16/16 nodes pass** (`artifacts/recipe-run/summary.json`); screenshots `evidence-ac1-deposit-open.png`, `evidence-ac1-one-tap-back-to-market.png`.

## Status

No GitHub replies posted, no threads resolved, nothing pushed (interactive re-entry). The comment-cleanup edit is in the working tree, **uncommitted** — see `report.md` for handoff.
