# PR 44002 — Comment Triage & Context (Interactive Re-Entry `44002-0630-090132`)

**PR:** feat(perps): [Extension] Spike: de-risk performance impact of the expanded (extended) view [NOT-READY]
**Branch:** `TAT-3461-feat-spike-expanded-view-perf` · **Family:** `e20e0dd0` (TAT-3461) · parent run `a76774ba`
**Mode:** interactive re-entry, operator-supervised. **Not committed / not pushed.**

## Context reload

Inherited context: **present** (`inputs/inherited-context.json`, `inputs/inherited/`).
Read prior `report.md`, `recipe.json`, `recipe-quality.json`, `evidence-manifest.json`.

Prior re-entry (`44002-0630-073950`) already fixed both `cursor[bot]` order-correctness
findings in the uncommitted working tree and re-validated the recipe (32/33;
only `ac4-screenshot` failed on macOS Screen-Recording TCC permission, not a regression).

This run re-fetched live PR data, re-confirmed the working-tree fix is present, and
re-verified exact parity against the reference `ui/pages/perps/perps-order-entry-page.tsx`
submit flow. **No new code changes required.**

## Live PR state (this run)

- Inline review comments: 2, both `cursor[bot]`, both on
  `ui/components/app/perps/perps-market-expanded/perps-expanded-trade-panel.tsx:84`,
  both for commit `241ac084c3` (current HEAD). No new comments since prior run.
- CHANGES_REQUESTED reviews: **none**.
- Issue/conversation comments: auto-posted Farmslot worker reports by `abretonc7s`
  (spike + prior pr-complete runs). Not regression reports.

## Triage

| # | Source | Finding | Verdict | Resolution |
|---|---|---|---|---|
| 1 | cursor[bot] (id 3494838412) | Expanded market TP/SL wrong path — single `perpsPlaceOrder` mis-tags TP/SL instead of two-step `perpsUpdatePositionTPSL` | **REAL** | Fixed in working tree. `handleSubmit` now strips TP/SL on new/flipping market orders and attaches via `perpsUpdatePositionTPSL`, mirroring reference order-entry page (`shouldHandleTpslSeparately` + `willFlipPosition` + `normalizeTpslPrices`). |
| 2 | cursor[bot] (id 3494838418) | Expanded trades skip slippage guards — no `maxSlippageBps` passed; no pre-submit estimated-slippage check | **REAL (data-correctness portion)** | Fixed in working tree. Gated `maxSlippageBps` (`isSlippageConfigEnabled ? maxSlippageBps : undefined`) now passed into `formStateToOrderParams` — controller-level cap enforced, parity with reference. Pre-submit estimated-slippage **confirmation modal** = **OUT_OF_SCOPE** follow-up on this `[NOT-READY]` spike. |
| 3 | abretonc7s ×N | Conversation comments | **N/A** | Auto-posted Farmslot worker reports, not regressions. |
| 4 | CI / CLA / sonarqube / codeowners bots | build/CLA/quality/codeowners | **OUT_OF_SCOPE** | Standard CI; SonarQube informational on a `[NOT-READY]` spike. |

## Parity evidence

Reference `ui/pages/perps/perps-order-entry-page.tsx` (lines ~1219-1290) uses the
identical pattern the expanded panel now replicates:
`formStateToOrderParams(..., isSlippageConfigEnabled ? maxSlippageBps : undefined)`
→ `shouldHandleTpslSeparately` (`willFlipPosition`) → strip TP/SL → `perpsPlaceOrder`
→ `perpsUpdatePositionTPSL` with `normalizeTpslPrices`. `formStateToOrderParams`
signature (`order-params.ts:18`) confirms `maxSlippageBps` is the 5th param.

## Validation
See `report.md` for commands and exact results.
