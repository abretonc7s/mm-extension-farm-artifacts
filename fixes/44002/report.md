# PR 44002 — Interactive PR-Complete Report (re-entry `44002-0630-164729`)

**PR:** [feat(perps): [Extension] Spike: de-risk performance impact of the expanded (extended) view [NOT-READY]](https://github.com/MetaMask/metamask-extension/pull/44002)
**Branch:** `TAT-3461-feat-spike-expanded-view-perf` · HEAD `09ed8c1f3d`
**Family:** `e20e0dd0` (TAT-3461) · parent run `1fe3a188`
**Mode:** interactive re-entry, operator-supervised.

## Summary

Re-entered the PR with inherited family context present. Re-fetched live PR comments and
reviews, re-triaged, and re-verified the prior run's submit-path fix against current HEAD.
The two `cursor[bot]` order-correctness findings on `perps-expanded-trade-panel.tsx` were
already fixed, committed, and pushed in `09ed8c1f3d` by the previous re-entry
(`44002-0630-090132`), with replies posted on both threads. **No new code changes required.**

## Comments handled

| ID | Source | Verdict | Resolution |
|---|---|---|---|
| 3494838412 | cursor[bot] — Expanded market TP/SL wrong path | REAL — already fixed | Two-step `perpsPlaceOrder` (TP/SL stripped) → `perpsUpdatePositionTPSL` in HEAD `09ed8c1f3d`. Reply id 3499252834 posted. |
| 3494838418 | cursor[bot] — Expanded trades skip slippage guards | REAL (data-correctness) — already fixed | Gated `maxSlippageBps` into `formStateToOrderParams` in HEAD `09ed8c1f3d`. Reply id 3499253176 posted. Pre-submit slippage modal = follow-up (OUT_OF_SCOPE). |
| 4837269569 / 4840231357 / 4840690296 / 4844645868 | abretonc7s | OUT_OF_SCOPE | Auto-posted Farmslot worker run summaries, not regressions. |

No new comments since the prior run. No `CHANGES_REQUESTED` reviews. PR `open`, not draft, `mergeable: true`.
Both cursor findings reference the pre-fix commit `241ac084c3`; threads auto-resolve on cursor re-review of `09ed8c1f3d`.

## Files changed (this re-entry)

**None.** Working tree clean (only untracked `.agent/`, framework-injected). The submit-path fix
(`ui/components/app/perps/perps-market-expanded/perps-expanded-trade-panel.tsx`, +76/−2) is already
committed as `09ed8c1f3d`.

## Code verification (current HEAD)

Confirmed both fixes present in `perps-expanded-trade-panel.tsx`:
- `usePerpsLivePositions`, `usePerpsMaxSlippage`, `getIsPerpsSlippageConfigEnabled` wired (L7, L11-12, L60-65).
- `formStateToOrderParams(..., isSlippageConfigEnabled ? maxSlippageBps : undefined)` (L96-101).
- `shouldHandleTpslSeparately` via `willFlipPosition` → strip TP/SL → `perpsPlaceOrder` → `perpsUpdatePositionTPSL` with `normalizeTpslPrices` (L112-141).

## Validation

| Check | Command | Result |
|---|---|---|
| Auto-fix | `yarn lint:changed:fix` | ✅ ran (best-effort) — no changed files |
| Changed-file lint | `yarn lint:changed` | ✅ pass — "No changed JS/TS/TSX/MTS/SNAP files to lint" (clean tree) |
| Locales | `yarn verify-locales --quiet` | ✅ pass — "No invalid entries!" |
| Circular deps | `yarn circular-deps:check` | ✅ pass — "Circular dependencies check passed." (gate exit 0) |
| Jest | — | n/a — no working-tree changes; no test exists for `perps-expanded-trade-panel.tsx`; reused helpers unchanged |
| Runtime health | `metamask-recipe runtime-health --cdp-port 7665` | ✅ PASS — CDP reachable, background responsive (`backgroundProbeOk: true`, provider hyperliquid) |
| Recipe | `metamask-recipe run artifacts/recipe.json --launch-existing-dist` | ✅ **PASS — 35/35 nodes, 0 failed, 16.3s** |

### Recipe / runtime validation (re-run succeeded)

After system resources freed up, the runtime came up cleanly on a retry. `ensure-runtime-ready.sh`
built the dev bundle (~89s), launched the browser, loaded the extension, and **the wallet-fixture
finalize step completed** (the earlier `connectOverCDP` 30s timeout did not recur). CDP listening on
port 7665, `runtime-health` PASS.

The trusted family recipe (`artifacts/recipe.json`) was then run and **passed fully: 35/35 nodes,
0 failed, 16342 ms**. This includes the AC4 expanded-view screenshot node — `evidence-ac4-expanded-view.png`
captured this run (the prior macOS Screen-Recording TCC failure also cleared). Artifacts:
`artifacts/recipe-run/summary.json`, `trace.json`, `artifact-manifest.json`, `evidence-ac4-expanded-view.png`.

This matches the upstream family run (`recipe-quality.json` verdict `pass`, 35/35). The submit-path
fix is additionally validated by exact code parity with the reference order-entry page.

## Commit / push status

Already committed and pushed by the prior re-entry (operator-authorized then):
- Commit `09ed8c1f3d` — `fix(perps): mirror order-entry submit flow in expanded trade panel`.
- Replies posted to both cursor[bot] threads.

**This re-entry made no commits and no pushes** (interactive, operator-supervised).

## Remaining manual work

1. Operator review of the already-pushed submit-path change; optionally a funded manual run to
   confirm TP/SL tagging end-to-end on Hyperliquid.
2. To re-run the recipe with proof: bring up the slot runtime/browser on CDP 7665 (orchestrator),
   then run `metamask-recipe run artifacts/recipe.json --launch-existing-dist --cdp-port 7665`.
   For a passing screenshot node, grant Screen Recording permission to the launcher.
3. **Follow-up (not done):** replicate the reference pre-submit estimated-slippage confirmation
   modal (`PerpsSlippageConfigModal` + estimated-slippage hook) in the expanded panel. Current fix
   enforces the cap at the controller level only.
4. Shared perps nav leak fix tracked as **TAT-3462** (prerequisite, out of scope here).
5. cursor threads: both already have "Fixed in 09ed8c1f3d" replies; they auto-resolve on cursor
   re-review. No further GitHub action needed unless operator wants to manually resolve.
6. PR remains `[NOT-READY]` spike; broader productionization items stay out of scope.

## Family scope

See `artifacts/family-scope.json` — verdict `partial-symptom-only` (full family scope addressed
upstream by the spike run; this re-entry re-verified the narrower review symptoms).
