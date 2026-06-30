# PR 44002 — Interactive PR-Complete Report

**PR:** [feat(perps): [Extension] Spike: de-risk performance impact of the expanded (extended) view [NOT-READY]](https://github.com/MetaMask/metamask-extension/pull/44002)
**Branch:** `TAT-3461-feat-spike-expanded-view-perf` · **Family:** `e20e0dd0` (TAT-3461)
**Mode:** interactive re-entry, operator-supervised. **Not committed / not pushed.**

## Summary

Triaged the two `cursor[bot]` review findings on
`perps-expanded-trade-panel.tsx`. Both are **REAL** order-correctness divergences
from the reference order-entry page. Applied a minimal fix to the panel's
`handleSubmit` that mirrors the reference exactly. No unrelated refactor.

## Comments handled

| Finding | Verdict | Resolution |
|---|---|---|
| Expanded market TP/SL wrong path | REAL | Fixed — two-step `perpsPlaceOrder` (TP/SL stripped) → `perpsUpdatePositionTPSL` |
| Expanded trades skip slippage guards | REAL | Fixed (data-correctness) — gated `maxSlippageBps` now passed to `formStateToOrderParams`. UI confirmation-modal guard left as follow-up. |
| abretonc7s conversation comment | n/a | Auto-posted worker report (the spike summary), not a regression. |
| Bot CI/CLA/build/SonarQube comments | out-of-scope | Informational on a spike. |

Full triage rationale: `artifacts/comments-report.md`.

## Files changed

- `ui/components/app/perps/perps-market-expanded/perps-expanded-trade-panel.tsx`
  - Added `usePerpsLivePositions` (find current position for symbol),
    `usePerpsMaxSlippage`, and `getIsPerpsSlippageConfigEnabled`.
  - `handleSubmit` now builds order params with mode `'new'`, position size, and
    gated `maxSlippageBps`; replicates the reference `shouldHandleTpslSeparately`
    two-step TP/SL flow with `normalizeTpslPrices` + a TP/SL-specific failure toast.
  - Imports `normalizeTpslPrices`, `willFlipPosition` from `../utils`.

## Validation

| Check | Command | Result |
|---|---|---|
| Changed-file lint | `yarn lint:changed` | ✅ pass (1 file, no invalid entries) |
| Locales | `yarn verify-locales --quiet` | ✅ pass |
| Circular deps | `yarn circular-deps:check` | ✅ pass |
| Recipe (render/perf) | `metamask-recipe run artifacts/recipe.json --launch-existing-dist` | ✅ pass — **35/35** nodes, 58.9s |
| Runtime health | `metamask-recipe runtime-health` | ✅ healthy (hyperliquid, perps manager initialized) |

**Recipe scope note (honest):** the inherited recipe validates the expanded view
**renders + streams + perf (TBT)**; it does **not** place a funded order, so it
does not directly exercise the submit-path fix. The order account on this slot is
unfunded (`perps.sufficient_balance` fails), so funded order placement is not
available. The submit-path fix is validated by **exact code parity** with the
reference `perps-order-entry-page.tsx` new-order branch
(lines 1219–1311 for TP/SL, line 1224 for slippage). No Jest test exists for the
panel; the reused helpers (`order-params`, `normalizeTpslPrices`,
`willFlipPosition`) keep their existing tests and were not modified.

## Commit / push status

**Not committed, not pushed.** No GitHub replies or thread resolutions made
(interactive re-entry — operator owns those).

## Remaining manual work

1. Operator review of the submit-path change; optionally a funded manual run to
   confirm TP/SL tagging end-to-end on Hyperliquid.
2. **Follow-up (not done):** replicate the reference pre-submit estimated-slippage
   **confirmation modal** (`PerpsSlippageConfigModal` + estimated-slippage hook)
   in the expanded panel if the expanded ticket should warn before exceeding the
   cap. Current fix enforces the cap at the controller level only.
3. Suggested GitHub replies once operator approves:
   - Both cursor threads: "Fixed in <sha>. Expanded trade panel now mirrors the
     order-entry page: two-step TP/SL via perpsUpdatePositionTPSL, and the gated
     maxSlippageBps is passed into formStateToOrderParams. Pre-submit slippage
     confirmation modal tracked as follow-up."
4. PR remains `[NOT-READY]` spike; broader productionization items from the
   inherited report stay out of scope.
