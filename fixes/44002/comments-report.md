# PR 44002 — Comment Triage & Context (Interactive Re-Entry `44002-0630-213234`)

**PR:** feat(perps): [Extension] Spike: de-risk performance impact of the expanded (extended) view [NOT-READY]
**Branch:** `TAT-3461-feat-spike-expanded-view-perf`
**Family:** `e20e0dd0` (TAT-3461) · parent run `ac00dc9b`
**Mode:** interactive re-entry, operator-supervised.

## Context reload

Inherited context: **present** (`inputs/inherited/` + `inputs/inherited-context.json`).

Read inherited `report.md` (re-entry `44002-0630-195057`), `recipe.json`, `recipe-quality.json`,
`evidence-manifest.json`, `TASK.md`. Key prior state:

- Two `cursor[bot]` order-correctness findings on the expanded trade panel were already fixed,
  committed, and pushed in `09ed8c1f3d` by an earlier re-entry, with replies posted on both threads.
- Trusted family recipe re-ran green (35/35 nodes) in the prior run.
- No new code changes were required in the prior re-entry; working tree clean.
- Outstanding items are all out-of-scope for this `[NOT-READY]` spike (SonarCloud quality gate,
  pre-submit slippage modal replication, TAT-3462 nav leak).

## Live comment triage (re-entry `44002-0630-213234`)

PR state: `open`, not draft, `mergeable: true`. HEAD = origin = PR head = `09ed8c1f3d`.
No `CHANGES_REQUESTED` reviews. Working tree clean (only framework-injected `.agent/`).

| ID | Source | Where | Verdict | Resolution |
|---|---|---|---|---|
| 3494838412 | cursor[bot] — Expanded market TP/SL wrong path | `perps-expanded-trade-panel.tsx:130` | REAL — already fixed | Two-step `perpsPlaceOrder` (TP/SL stripped) → `perpsUpdatePositionTPSL` present in HEAD (`shouldHandleTpslSeparately` L112-141). Reply `3499252834` already posted. |
| 3494838418 | cursor[bot] — Expanded trades skip slippage guards | `perps-expanded-trade-panel.tsx:130` | REAL — already fixed | `maxSlippageBps` gated into `formStateToOrderParams` (L60-62,101). Reply `3499253176` already posted. |
| 4837269569 / 4840231357 / 4840690296 / 4844645868 / 4846391441 / 4847170158 | abretonc7s | conversation | OUT_OF_SCOPE | Farmslot worker run summaries, not regression reports. |

**Verification this re-entry:** fix code confirmed present via grep on
`ui/components/app/perps/perps-market-expanded/perps-expanded-trade-panel.tsx`
(`usePerpsMaxSlippage` L11/62, `getIsPerpsSlippageConfigEnabled` L12/60,
`isSlippageConfigEnabled ? maxSlippageBps : undefined` L101, `shouldHandleTpslSeparately` →
strip TP/SL → `perpsUpdatePositionTPSL` L112-141).

**No new code changes required.** No new actionable comments since the prior re-entry.

