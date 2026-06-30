# PR 44002 — Comment Triage & Context (Interactive Re-Entry, run 44002-0630-073950)

## Context reload

**Inherited context: present** (family `e20e0dd0`, TAT-3461, parent run `c5fb046f`).

Materialized inherited artifacts read:
- `inputs/inherited/report.md` — prior interactive PR-complete report
- `inputs/inherited/recipe.json` (seeded → `artifacts/recipe.json`)
- `inputs/inherited/recipe-quality.json`, `evidence-manifest.json`, `TASK.md`
- Missing (per manifest): worker learnings, recipe-flows bundle, recipe-coverage.

**Working tree state:** `ui/components/app/perps/perps-market-expanded/perps-expanded-trade-panel.tsx`
carries the prior run's uncommitted fix (76 insertions, 2 deletions). Not committed, not pushed.

Prior run already triaged the two `cursor[bot]` findings as REAL and applied a minimal
parity fix to `handleSubmit`. This re-entry re-fetches live PR comments, re-triages,
re-validates, and prepares operator handoff.

## Live comment triage

Live fetch (commit under review `241ac084c3`) returned 2 inline review comments,
2 user issue comments, 0 CHANGES_REQUESTED reviews. Matches `inputs/pr-comments.json`.

| # | Source | Author | Where | Verdict | Action |
|---|---|---|---|---|---|
| 1 | review | cursor[bot] | `perps-expanded-trade-panel.tsx:79-84` — Expanded market TP/SL wrong path | **REAL** | Fixed (already in working tree) |
| 2 | review | cursor[bot] | `perps-expanded-trade-panel.tsx:67-84` — Expanded trades skip slippage guards | **REAL** | Fixed — controller-level cap restored. Pre-submit confirmation modal = OUT_OF_SCOPE follow-up |
| 3 | issue | abretonc7s | conversation (`e20e0dd0` spike report) | **N/A** | Worker-report auto-post, not a regression. No action |
| 4 | issue | abretonc7s | conversation (`c5fb046f` pr-complete report) | **N/A** | Worker-report auto-post, not a regression. No action |
| 5 | issue | github-actions / mm-token-exchange / sonarqube / codeowners bots | conversation | **OUT_OF_SCOPE** | CI/CLA/build/codeowners bots; SonarQube quality-gate informational on a `[NOT-READY]` spike. No code action |

### Finding 1 — Expanded market TP/SL wrong path (REAL)
Panel sent market orders with TP/SL in a single `perpsPlaceOrder` call. Reference
`ui/pages/perps/perps-order-entry-page.tsx` (new-order branch) strips TP/SL from the
market fill on a new/flipping position and attaches them via a second
`perpsUpdatePositionTPSL` so triggers are tagged under `grouping: 'positionTpsl'`.
Single-call submission falls back to the controller's `normalTpsl` default →
mis-tagged triggers → broken auto-close / orders partition.
**Fix (working tree):** `handleSubmit` now replicates `shouldHandleTpslSeparately`
→ strip TP/SL → place → `perpsUpdatePositionTPSL` with `normalizeTpslPrices`, plus a
TP/SL-specific `UPDATE_FAILED` toast. Verified byte-for-byte parity with reference
(`willFlipPosition`, same guard conditions).

### Finding 2 — Expanded trades skip slippage guards (REAL, data-correctness fixed)
Panel called `formStateToOrderParams(formState, currentPrice)` with no
`maxSlippageBps`, so market orders always used `DefaultMarketSlippageBps`, ignoring
the user's configured cap when the slippage-config flag is on. Reference passes
`isSlippageConfigEnabled ? maxSlippageBps : undefined`.
**Fix (working tree):** reads `usePerpsMaxSlippage()` + `getIsPerpsSlippageConfigEnabled`
and passes the gated `maxSlippageBps` into `formStateToOrderParams`. Restores
controller-level cap enforcement.
**Out of scope:** the reference page's pre-submit estimated-slippage **confirmation
modal** (`PerpsSlippageConfigModal` + estimated-slippage hook) is heavier UX
productionization; not replicated. Recommended as a follow-up. The data-correctness
half of the finding is resolved.

## Verdict
Both REAL findings already fixed in the (uncommitted) working tree by the prior
run; this re-entry re-verified parity against the live reference and re-validated.
No new code changes required.
