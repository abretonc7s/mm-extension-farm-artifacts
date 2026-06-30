# PR 44002 — Comment Triage & Context (Interactive Re-Entry `44002-0630-195057`)

**PR:** [feat(perps): [Extension] Spike: de-risk performance impact of the expanded (extended) view [NOT-READY]](https://github.com/MetaMask/metamask-extension/pull/44002)
**Branch:** `TAT-3461-feat-spike-expanded-view-perf`
**Family:** `e20e0dd0` (TAT-3461) · parent run `d8410b5e`
**Mode:** interactive re-entry, operator-supervised.

## Context reload

Inherited context: **present**.
- Manifest: `inputs/inherited-context.json`
- Inherited artifacts: `inputs/inherited/{TASK.md, report.md, recipe.json, recipe-quality.json, evidence-manifest.json}`
- Trusted family recipe staged at `artifacts/recipe.json` (`RECIPE_SOURCE: family-inherited`, HAS_RECIPE yes).

### Prior run summary (`44002-0630-164729`, report inherited)

The two `cursor[bot]` order-correctness findings on the expanded trade panel were fixed,
committed, and pushed in HEAD `09ed8c1f3d` by an earlier re-entry (`44002-0630-090132`),
with replies posted to both threads:

1. **3494838412** — Expanded market TP/SL took wrong submit path → REAL, fixed. Two-step
   `perpsPlaceOrder` (TP/SL stripped) → `perpsUpdatePositionTPSL`.
2. **3494838418** — Expanded trades skipped slippage guards → REAL, fixed. `maxSlippageBps`
   gated into `formStateToOrderParams`.

Prior re-entry made **no new code changes** — the fixes were already in HEAD. Validation passed
(lint:changed clean, locales, circular-deps; recipe 35/35 nodes, 0 failed).

## Live comment triage (this re-entry, HEAD `09ed8c1f3d`)

| ID | Source | Where | Verdict | Resolution |
|---|---|---|---|---|
| 3494838412 | cursor[bot] | `perps-expanded-trade-panel.tsx:130` — Expanded market TP/SL wrong path | REAL — already fixed | Two-step `perpsPlaceOrder` (TP/SL stripped via `shouldHandleTpslSeparately`) → `perpsUpdatePositionTPSL` present in HEAD (L106-141). Reply `3499252834` already posted. Thread auto-resolves on cursor re-review. |
| 3494838418 | cursor[bot] | `perps-expanded-trade-panel.tsx:130` — Expanded trades skip slippage guards | REAL — already fixed | `maxSlippageBps` gated into `formStateToOrderParams` via `getIsPerpsSlippageConfigEnabled`/`usePerpsMaxSlippage` (L11-12, L60-101). Reply `3499253176` already posted. |
| 4837269569 / 4840231357 / 4840690296 / 4844645868 / 4846391441 | abretonc7s | conversation | OUT_OF_SCOPE | Auto-posted Farmslot worker run summaries, not regression reports. No action. |
| 4844356355 | sonarqubecloud[bot] | conversation | OUT_OF_SCOPE (spike) | SonarCloud Quality Gate failed. PR is `[NOT-READY]` spike; gate items are productionization follow-ups, not review regressions. No fix this re-entry. |
| 4835238421 / 4835247809 / 4837083222 / 4844512414 | github-actions / token-exchange | conversation | INFRA | CLA, builds-ready, codeowner-bot notices. No action. |

**Verdict:** No new actionable comments since the prior re-entry. No `CHANGES_REQUESTED` reviews.
Both cursor findings (the only REAL review issues) are already fixed in HEAD `09ed8c1f3d` with
replies posted. PR `open`, not draft, `mergeable: true`. **No new code changes required.**

