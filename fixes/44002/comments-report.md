# PR 44002 — Comment Triage & Context (Interactive Re-Entry `44002-0630-222718`)

**PR:** [feat(perps): [Extension] Spike: de-risk performance impact of the expanded (extended) view [NOT-READY]](https://github.com/MetaMask/metamask-extension/pull/44002)
**Branch:** `TAT-3461-feat-spike-expanded-view-perf`
**Family:** `e20e0dd0` (TAT-3461) · parent run `79bdc720`
**Mode:** interactive re-entry, operator-supervised.

## Context reload

Inherited context: **present** (`inputs/inherited-context.json` + `inputs/inherited/`).
Read prior `report.md` (run `44002-0630-213234`), inherited `recipe.json`, `recipe-quality.json`,
`evidence-manifest.json`, and live `pr-comments.json`.

Prior-run state carried forward:
- Two `cursor[bot]` order-correctness findings on `perps-expanded-trade-panel.tsx` (IDs 3494838412,
  3494838418) — **REAL, already fixed** in `09ed8c1f3d`; both threads have "Fixed in 09ed8c1f3d" replies.
- Operator-reported expanded-order-page invalid-amount (`09` = $9) UX bug — **fixed** in
  `76b604569c` via submit guards in `ui/components/app/perps/order-entry/order-entry.tsx`.
- Trusted family recipe re-ran green (35/35) on prior runs.
- All `abretonc7s` conversation comments are Farmslot run summaries → **OUT_OF_SCOPE**.

## Live triage (run `44002-0630-222718`)

PR state: `open`, not draft, `mergeable: true`. Local HEAD = PR head = `76b604569c`.
No new comments since prior run. **No `CHANGES_REQUESTED` reviews.**

| ID | Source | Where | Verdict | Resolution |
|---|---|---|---|---|
| 3494838412 | cursor[bot] — Expanded market TP/SL wrong path | `perps-expanded-trade-panel.tsx:130` | **REAL — already fixed** | Two-step `perpsPlaceOrder` (TP/SL stripped) → `perpsUpdatePositionTPSL` in `09ed8c1f3d`. Reply `3499252834` present ("Fixed in 09ed8c1f3d"). |
| 3494838418 | cursor[bot] — Expanded trades skip slippage guards | `perps-expanded-trade-panel.tsx:130` | **REAL — already fixed** | `maxSlippageBps` gated into order params in `09ed8c1f3d`. Reply `3499253176` present ("Fixed in 09ed8c1f3d"). |
| 4837269569 / 4840231357 / 4840690296 / 4844645868 / 4846391441 / 4847170158 / 4847626972 | abretonc7s | conversation | **OUT_OF_SCOPE** | Farmslot worker run summaries, not regression reports. |
| (bots) CLA / builds / CODEOWNERS / SonarCloud | github-actions, mm-token-exchange, sonarqubecloud | conversation | **OUT_OF_SCOPE** | Automated status. SonarCloud Quality Gate is out of scope for this `[NOT-READY]` spike. |

**No `REAL` issues require new code changes this run.** Both cursor findings are resolved in shipped
commits with replies posted; the operator `09` invalid-amount fix is in `76b604569c`.

