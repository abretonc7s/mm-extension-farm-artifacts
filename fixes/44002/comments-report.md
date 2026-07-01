# PR #44002 — Comment Triage & Fix Report

PR: feat(perps): [Extension] Spike: de-risk performance impact of the expanded (extended) view
Branch: TAT-3461-feat-spike-expanded-view-perf

## Integration (step 3)
- Rebased onto origin/main (4 commits replayed cleanly, no conflicts). yarn.lock unchanged.
- Prior uncommitted staged changes (8 files, oxfmt-only formatting) stashed to unblock rebase; oxfmt regenerates them in step 9.

## Triage

| # | ID | Author | File | Triage | Action |
|---|----|--------|------|--------|--------|
| 1 | 3494838412 | cursor[bot] | perps-expanded-trade-panel.tsx:79-84 | REAL (already fixed) | TP/SL two-step flow (place order w/o TP/SL then `perpsUpdatePositionTPSL`) already present at lines 104-158 via branch commit 09ed8c1f3d. |
| 2 | 3494838418 | cursor[bot] | perps-expanded-trade-panel.tsx:67-84 | REAL | Part (a) `maxSlippageBps` passed to `formStateToOrderParams` — fixed by 09ed8c1f3d (line 101). Part (b) pre-submit estimated-slippage block was still missing — fixed this run. |

Conversation comments (issues API): 8 comments, all automated farmslot run-summary posts by `abretonc7s` → **OUT_OF_SCOPE** (bot status posts, no action).
CHANGES_REQUESTED reviews: none.

## CI status (step 6e)
| Check | Status | Class |
|-------|--------|-------|
| Test lint | fail | REAL — oxfmt format issues on 8 PR files (no source edits committed for oxfmt). Fixed via `lint:format:fix`. |
| SonarCloud Code Analysis | fail | OUT_OF_SCOPE — spike PR |
| check-pr-max-lines | fail | OUT_OF_SCOPE — spike PR |
| policy-bot / policy-bot: main | pending | OUT_OF_SCOPE — review gate |

## Fixes applied (step 7)
- `perps-expanded-trade-panel.tsx`: added the estimated-slippage pre-submit block mirroring order-entry-page — snapshots form state locally (leaf panel, no page-tree lift), subscribes to `usePerpsEstimatedSlippage`, and blocks market submits whose estimated slippage exceeds the user's cap (toast). Resolves cursor #3494838418 part (b).
- oxfmt: 8 PR files were format-dirty (CI `Test lint` fail) with no source edits committed; ran `lint:format:fix`.
- `perps-market-detail-page.test.tsx`: added 2 tests for `handleExpandClick` (fullscreen navigate + popup `openExtensionInBrowser`) to clear the new-code coverage gate.

## Coverage (step 9)
- After main-ref correction (local `main` was stale → `origin/main`), PR-scoped coverage: VERDICT **PASS** (new code ≥80%).
- `perps-market-detail-page.tsx` New 88% (7/8); only line 978 uncovered — a defensively-unreachable `!decodedSymbol` guard (page redirects before the button renders). Pre-existing PR code, not this run's change.
- No-test WARNING files (informational, spike PR): expanded chart/order-book/skeleton/trade panels, routes.component.tsx.

## Recipe (step 10)
- Trusted family-inherited recipe re-validated against branch+origin/main merged: **PASS 35/35** (14.9s). Confirms no regression from rebase or review fixes.

## Summary
- Total comments: 2 inline (2 REAL) + 8 conversation (all OUT_OF_SCOPE — automated farmslot run-summary posts, no action).
- Commit SHA for fixes: 5999a4f2a8 (TP/SL parity already landed in 956fb1b0e6).
- Files changed this run: perps-expanded-trade-panel.tsx (slippage guard), perps-market-detail-page.test.tsx (handleExpandClick tests), + 7 oxfmt-only PR files.
- Recipe re-validation: PASS (35/35).
- Merge-main status (step 3): rebased (see integration-status.txt).
- Both inline threads replied + resolved.
