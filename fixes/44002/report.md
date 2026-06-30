# PR 44002 — Interactive PR-Complete Report (re-entry `44002-0630-195057`)

**PR:** [feat(perps): [Extension] Spike: de-risk performance impact of the expanded (extended) view [NOT-READY]](https://github.com/MetaMask/metamask-extension/pull/44002)
**Branch:** `TAT-3461-feat-spike-expanded-view-perf` · HEAD `09ed8c1f3d`
**Family:** `e20e0dd0` (TAT-3461) · parent run `d8410b5e`
**Mode:** interactive re-entry, operator-supervised.

## Summary

Re-entered PR with inherited family context present. Re-fetched live PR comments/reviews,
re-triaged, and re-verified the prior submit-path fix against current HEAD. The two `cursor[bot]`
order-correctness findings on `perps-expanded-trade-panel.tsx` were already fixed, committed, and
pushed in `09ed8c1f3d` by an earlier re-entry, with replies posted on both threads.
**No new code changes required.** Trusted family recipe re-ran green.

## Comments handled

| ID | Source | Verdict | Resolution |
|---|---|---|---|
| 3494838412 | cursor[bot] — Expanded TP/SL wrong path | REAL — already fixed | Two-step `perpsPlaceOrder` (TP/SL stripped) → `perpsUpdatePositionTPSL` in HEAD. Reply 3499252834 posted. |
| 3494838418 | cursor[bot] — Expanded trades skip slippage guards | REAL — already fixed | `maxSlippageBps` gated into `formStateToOrderParams`. Reply 3499253176 posted. |
| 4837269569 / 4840231357 / 4840690296 / 4844645868 / 4846391441 | abretonc7s | OUT_OF_SCOPE | Farmslot worker run summaries, not regressions. |
| 4844356355 | sonarqubecloud[bot] | OUT_OF_SCOPE (spike) | Quality Gate failed — productionization follow-up; PR is `[NOT-READY]` spike. |

No new comments since prior run. No `CHANGES_REQUESTED`. PR `open`, not draft, `mergeable: true`.

## Files changed (this re-entry)

**None.** Working tree clean (only untracked `.agent/`, framework-injected).
The submit-path fix is already committed as `09ed8c1f3d`. Code verified present in
`ui/components/app/perps/perps-market-expanded/perps-expanded-trade-panel.tsx`:
`usePerpsMaxSlippage`/`getIsPerpsSlippageConfigEnabled` (L11-12, L60-62),
`formStateToOrderParams(..., isSlippageConfigEnabled ? maxSlippageBps : undefined)` (L101),
`shouldHandleTpslSeparately` → strip TP/SL → `perpsUpdatePositionTPSL` (L106-141).

## Validation

| Check | Command | Result |
|---|---|---|
| Auto-fix | `yarn lint:changed:fix` | ✅ ran — no changed files |
| Changed-file lint | `yarn lint:changed` | ✅ pass — "No changed JS/TS/TSX/MTS/SNAP files to lint" |
| Locales | `yarn verify-locales --quiet` | ✅ pass — "No invalid entries!" |
| Circular deps | `yarn circular-deps:check` | ✅ pass — "Circular dependencies check passed." |
| Jest | — | n/a — no working-tree changes |
| Runtime health | `metamask-recipe runtime-health --cdp-port 7665` | ✅ PASS — CDP reachable, `backgroundProbeOk: true`, provider hyperliquid |
| Recipe | `metamask-recipe run artifacts/recipe.json --launch-existing-dist` | ✅ **PASS — 35/35 nodes, 0 failed, 16159 ms** |

Recipe artifacts: `artifacts/recipe-run/{summary.json, trace.json, artifact-manifest.json, recipe.json}`.

## Commit / push status

**No commits, no pushes this re-entry** (interactive, operator-supervised). The fix
(`09ed8c1f3d`) was already committed and pushed by the prior re-entry; local HEAD = origin =
PR head SHA.

## Remaining manual work

1. Operator review of the already-pushed submit-path change; optionally a funded manual run to
   confirm TP/SL tagging end-to-end on Hyperliquid.
2. cursor threads: both already have "Fixed in 09ed8c1f3d" replies; auto-resolve on cursor
   re-review. No further GitHub action needed unless operator wants to manually resolve.
3. **Follow-up (out of scope):** replicate the reference pre-submit estimated-slippage
   confirmation modal in the expanded panel. Current fix enforces the cap at controller level only.
4. SonarCloud Quality Gate failure — productionization follow-up, out of spike scope.
5. Shared perps nav leak fix tracked as **TAT-3462** (out of scope here).
6. PR remains `[NOT-READY]` spike; broader productionization stays out of scope.

## Family scope

See `artifacts/family-scope.json` — verdict `partial-symptom-only` (full family scope addressed
upstream by the spike run; this re-entry re-verified the narrower review symptoms and re-ran the recipe).
