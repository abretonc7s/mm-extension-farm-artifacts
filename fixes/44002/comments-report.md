# PR 44002 — Comment Triage & Context (Interactive Re-Entry `44002-0630-164729`)

**PR:** feat(perps): [Extension] Spike: de-risk performance impact of the expanded (extended) view [NOT-READY]
**Branch:** `TAT-3461-feat-spike-expanded-view-perf` · HEAD `09ed8c1f3d`
**Family:** `e20e0dd0` (TAT-3461) · parent run `1fe3a188`

## Context reload

Inherited context: **present**.

- `inputs/inherited-context.json` — family manifest present.
- `inputs/inherited/report.md` — prior re-entry (`44002-0630-090132`) already committed + pushed the submit-path fix as `09ed8c1f3d` and posted replies to both cursor[bot] threads.
- `inputs/inherited/recipe.json` + `artifacts/recipe.json` — trusted family recipe (RECIPE_SOURCE: family-inherited).
- `inputs/inherited/recipe-quality.json` — verdict `pass` (35/35 nodes in the family run).
- `inputs/inherited/evidence-manifest.json` — expanded-view screenshot evidence.

### Prior-run state (carried forward)

The previous re-entry resolved the two `cursor[bot]` order-correctness findings on
`perps-expanded-trade-panel.tsx`:

1. **TP/SL wrong path** (id 3494838412) — REAL — fixed via two-step `perpsPlaceOrder` (TP/SL stripped) → `perpsUpdatePositionTPSL`.
2. **Trades skip slippage guards** (id 3494838418) — REAL (data-correctness) — fixed by passing gated `maxSlippageBps` into `formStateToOrderParams`. Pre-submit confirmation modal = follow-up (OUT_OF_SCOPE).

Both fixes are in commit `09ed8c1f3d` (current HEAD) and were pushed. Replies posted on both threads.

## Step 7 — Live comment triage (re-entry `44002-0630-164729`)

Re-fetched live comments, reviews, and thread replies. PR `open`, not draft, `mergeable: true`. **No CHANGES_REQUESTED reviews.**

| ID | Source | Where | Verdict | Resolution |
|---|---|---|---|---|
| 3494838412 | cursor[bot] — Expanded market TP/SL wrong path | `perps-expanded-trade-panel.tsx` L79-84 (commit `241ac084c3`) | REAL — **already fixed** | Two-step `perpsPlaceOrder` (TP/SL stripped) → `perpsUpdatePositionTPSL` in HEAD `09ed8c1f3d`. Reply already posted (id 3499252834). Thread auto-resolves on cursor re-review. |
| 3494838418 | cursor[bot] — Expanded trades skip slippage guards | `perps-expanded-trade-panel.tsx` L67-84 (commit `241ac084c3`) | REAL (data-correctness) — **already fixed** | Gated `maxSlippageBps` passed into `formStateToOrderParams` in HEAD `09ed8c1f3d`. Reply already posted (id 3499253176). Pre-submit estimated-slippage modal = follow-up (OUT_OF_SCOPE). |
| 4837269569 / 4840231357 / 4840690296 / 4844645868 | abretonc7s | conversation | OUT_OF_SCOPE | Auto-posted Farmslot worker run summaries, not regression reports. |

### Code verification (current HEAD `09ed8c1f3d`)

`ui/components/app/perps/perps-market-expanded/perps-expanded-trade-panel.tsx` confirmed to contain both fixes:
- `usePerpsLivePositions`, `usePerpsMaxSlippage`, `getIsPerpsSlippageConfigEnabled` imported and wired (L7, L11-12, L60-65).
- `formStateToOrderParams(..., isSlippageConfigEnabled ? maxSlippageBps : undefined)` (L96-101).
- `shouldHandleTpslSeparately` via `willFlipPosition` → strip TP/SL → `perpsPlaceOrder` → `perpsUpdatePositionTPSL` with `normalizeTpslPrices` (L112-141).

Both cursor findings reference the pre-fix commit `241ac084c3`; the fix commit `09ed8c1f3d` is the current HEAD. Working tree clean (only untracked `.agent/`).

**Conclusion: no new code changes required this re-entry.** All REAL findings resolved upstream; replies posted; threads pending cursor re-review.

## Step 11 — Validation / runtime blocker (honest)

- CI parity gate (step 10): ✅ `yarn lint:changed` (no changed files — clean tree) + `yarn verify-locales --quiet` ("No invalid entries!") + `yarn circular-deps:check` ("Circular dependencies check passed.") — gate exit 0.
- Recipe validation: ✅ **PASS this session.** Runtime came up cleanly on retry (build ~89s, browser + extension + wallet-fixture finalize all completed; the earlier `connectOverCDP` 30s timeout did not recur). `runtime-health` PASS (CDP on 7665, `backgroundProbeOk: true`).
- Trusted family recipe (`artifacts/recipe.json`) run with `--launch-existing-dist`: **35/35 nodes passed, 0 failed, 16.3s**, including the AC4 expanded-view screenshot node (`evidence-ac4-expanded-view.png` captured; prior TCC failure also cleared). Artifacts under `artifacts/recipe-run/`.
- Matches upstream family run (`recipe-quality.json` verdict `pass`, 35/35). Submit-path fix additionally validated by code parity with the reference order-entry page.

