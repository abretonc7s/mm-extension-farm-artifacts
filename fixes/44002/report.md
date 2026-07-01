# PR 44002 — Interactive PR-Complete Report (re-entry `44002-0630-222718`)

**PR:** [feat(perps): [Extension] Spike: de-risk performance impact of the expanded (extended) view [NOT-READY]](https://github.com/MetaMask/metamask-extension/pull/44002)
**Branch:** `TAT-3461-feat-spike-expanded-view-perf` · HEAD `76b604569c` (= origin = PR head)
**Family:** `e20e0dd0` (TAT-3461) · parent run `79bdc720`
**Mode:** interactive re-entry, operator-supervised.

## Summary

Re-entered PR with inherited family context. Re-fetched live PR comments/reviews, re-triaged, and
re-verified the prior fixes against current HEAD. **No new code changes required.** Both cursor[bot]
order-correctness findings remain fixed in `09ed8c1f3d` (verified in source), with replies present on
both threads. The operator `09` invalid-amount submit guard is in `76b604569c`. Trusted family recipe
re-ran green (35/35).

## Comments handled

| ID | Source | Verdict | Resolution |
|---|---|---|---|
| 3494838412 | cursor[bot] — Expanded TP/SL wrong path | REAL — already fixed | Two-step `perpsPlaceOrder` (TP/SL stripped) → `perpsUpdatePositionTPSL` in HEAD. Reply `3499252834` present. |
| 3494838418 | cursor[bot] — Expanded trades skip slippage guards | REAL — already fixed | `maxSlippageBps` gated into `formStateToOrderParams`. Reply `3499253176` present. |
| 4837269569 / 4840231357 / 4840690296 / 4844645868 / 4846391441 / 4847170158 / 4847626972 | abretonc7s | OUT_OF_SCOPE | Farmslot worker run summaries, not regressions. |
| CLA / builds / CODEOWNERS / SonarCloud bots | bots | OUT_OF_SCOPE | Automated status. |

No new comments since prior run. No `CHANGES_REQUESTED`. PR `open`, not draft, `mergeable: true`.

## Files changed (this re-entry)

**None.** All REAL findings were resolved in previously-shipped commits (`09ed8c1f3d`, `76b604569c`).
Working tree clean (only untracked `.agent/`).

## Validation

| Check | Command | Result |
|---|---|---|
| Auto-fix | `yarn lint:changed:fix` | ✅ ran — no changed files |
| Changed-file lint | `yarn lint:changed` | ✅ pass — "No changed JS/TS/TSX/MTS/SNAP files to lint" |
| Locales | `yarn verify-locales --quiet` | ✅ pass — "No invalid entries!" |
| Circular deps | `yarn circular-deps:check` | ✅ pass — "Circular dependencies check passed." |
| Runtime health | `ensure-runtime-ready.sh` + `runtime-health --cdp-port 7665` | ✅ PASS — CDP reachable, `backgroundProbeOk: true`, provider hyperliquid |
| Recipe | `metamask-recipe run artifacts/recipe.json --launch-existing-dist` | ✅ **PASS — 35/35 nodes, 0 failed, 25256 ms** |
| Source verify | `grep` of `perps-expanded-trade-panel.tsx` | ✅ `maxSlippageBps` gated + two-step TP/SL path present |

Recipe artifacts: `artifacts/recipe-run/{summary.json, trace.json, artifact-manifest.json, recipe.json}`.

## Commit / push status

**No commits, no pushes this run** — no code changes were needed and operator has not asked to push.
PR head already at `76b604569c` (origin in sync).

## CI check-runs (added after operator flagged missing CI review)

Fetched live via `gh pr checks 44002`. Failing checks the earlier passes missed:

| Check | Status | Root cause | Action |
|---|---|---|---|
| **Test lint** | ❌ fail → **fixed** | CI runs `yarn lint` = json+**oxfmt**+eslint+tsc+styles. `oxfmt -c oxfmt.config.mts --check` failed on 8 PR files (line-wrap; oxfmt is sole TS/TSX formatter, disagrees w/ prettier). Local gate only ran `lint:changed` (eslint) → never caught it; on re-entry it also saw "no changed files" since all committed. | Ran `yarn lint:format:fix` on the 8 files. oxfmt + eslint + locales + circular-deps now green. Staged, awaiting commit/push decision. |
| check-pr-max-lines | ❌ fail | PR = +2087 lines > 1000 limit. | Size-label/human override for a `[NOT-READY]` spike — not a code fix. |
| SonarCloud | ❌ fail | Quality Gate. | Out of scope for `[NOT-READY]` spike (prior triage). |
| policy-bot | ⏳ pending | 0/1 rules approved — needs human review. | Operator/reviewer action. |

### Template learning
The checklist's step-10 "CI parity gate" is **not** CI parity: it runs `lint:changed` (eslint only) and
skips `yarn lint:format` (oxfmt). It also never fetches `gh pr checks`, so a red PR passed local
validation ~6 re-entries in a row. Fix logged to memory `pr-complete-check-ci-checkruns.md`.
Recommended template change: add `gh pr checks <N>` fetch during comment triage, treat failing
check-runs as REAL, and run `yarn lint:format` in the parity gate.

## Files changed (oxfmt fix — this session)

8 PR files reformatted by oxfmt (formatting only, no logic): `order-entry.tsx`,
`perps-expanded-header.test.tsx`, `perps-expanded-positions-panel.test.tsx`,
`perps-expanded-trade-panel.tsx`, `use-auth-guard-redirect.test.tsx`,
`perps-market-expanded-page.test.tsx`, `perps-order-entry-page.tsx`, `routes.component.tsx`. Staged.

## Remaining manual work

1. Operator review of already-shipped fixes (`09ed8c1f3d`, `76b604569c`).
2. cursor threads: both already have "Fixed in 09ed8c1f3d" replies; auto-resolve on cursor re-review.
3. Out of scope for this `[NOT-READY]` spike: SonarCloud Quality Gate, pre-submit estimated-slippage
   confirmation modal replication, broader perf benchmarking vs popup baseline.
4. No GitHub replies/thread resolutions performed this run (interactive mode — operator owns those).

## Family scope

See `artifacts/family-scope.json` — verdict `partial-symptom-only`.
