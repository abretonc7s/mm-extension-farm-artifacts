# PR 44002 — Comment Triage & Context (Interactive Re-Entry)

## Context reload

Inherited context: **present** (Farmslot family `e20e0dd0`, TAT-3461).
- Read `inputs/inherited/report.md` (spike report: expanded view has no perf cost;
  surfaced a pre-existing shared perps nav leak tracked separately as TAT-3462).
- Recipe present at `artifacts/recipe.json` (`RECIPE_SOURCE: family-inherited`, trusted).
- PR is a **spike** titled `[NOT-READY]`; not a merge-ready closure. This run is
  operator-supervised interactive re-entry — no push / no GitHub replies.

## Comment triage

| # | Source | Author | Where | Verdict | Action |
|---|---|---|---|---|---|
| 1 | review | cursor[bot] | `perps-expanded-trade-panel.tsx:84` — Expanded market TP/SL wrong path | **REAL** | Fixed |
| 2 | review | cursor[bot] | `perps-expanded-trade-panel.tsx:84` — Expanded trades skip slippage guards | **REAL** | Fixed (controller-level cap; UI confirmation modal noted as follow-up) |
| 3 | issue | abretonc7s | conversation | N/A | Worker-report auto-post (the spike summary), not a regression report. No action. |
| 4 | issue | github-actions / mm-token-exchange / sonarqube / codeowners bots | conversation | OUT_OF_SCOPE | CI/CLA/build bots; SonarQube quality-gate is informational for a spike. No code action. |

### Finding 1 — Expanded market TP/SL wrong path (REAL)
The expanded trade panel sent market orders with TP/SL in a single
`perpsPlaceOrder` call. The reference order-entry page
(`ui/pages/perps/perps-order-entry-page.tsx:1219-1311`) strips TP/SL from the
market fill on a new/flipping position and attaches them via a second
`perpsUpdatePositionTPSL` call so triggers are tagged `isPositionTpsl: true`
(`grouping: 'positionTpsl'`). Single-call submission falls back to the
controller's `normalTpsl` default → mis-tagged triggers → broken auto-close /
orders partition on the market-detail page. Confirmed by reading both paths.

**Fix:** mirror the reference two-step flow in the panel's `handleSubmit`
(`shouldHandleTpslSeparately` → strip TP/SL → place → `perpsUpdatePositionTPSL`
with `normalizeTpslPrices`, plus a TP/SL-specific failure toast).

### Finding 2 — Expanded trades skip slippage guards (REAL)
The panel called `formStateToOrderParams(formState, currentPrice)` with no
`maxSlippageBps`, so market orders always used
`ORDER_SLIPPAGE_CONFIG.DefaultMarketSlippageBps`, ignoring the user's configured
cap when the slippage config flag is on. Reference passes
`isSlippageConfigEnabled ? maxSlippageBps : undefined`
(`perps-order-entry-page.tsx:1224`).

**Fix:** read `usePerpsMaxSlippage()` + `getIsPerpsSlippageConfigEnabled`
selector and pass the same gated `maxSlippageBps` into `formStateToOrderParams`.
This restores controller-level cap enforcement. The reference page *also* shows a
pre-submit confirmation modal when estimated slippage exceeds the cap — that UX
guard (estimated-slippage hook + `PerpsSlippageConfigModal`) is **not**
replicated here; it's heavier productionization, recommended as a follow-up.
The data-correctness portion of the finding is resolved.

## Files changed
- `ui/components/app/perps/perps-market-expanded/perps-expanded-trade-panel.tsx`
