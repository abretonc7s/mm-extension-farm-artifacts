# PR 44002 — Interactive PR-Complete Report (re-entry `44002-0630-090132`)

**PR:** [feat(perps): [Extension] Spike: de-risk performance impact of the expanded (extended) view [NOT-READY]](https://github.com/MetaMask/metamask-extension/pull/44002)
**Branch:** `TAT-3461-feat-spike-expanded-view-perf` · **Family:** `e20e0dd0` (TAT-3461) · parent run `a76774ba`
**Mode:** interactive re-entry, operator-supervised. **Committed + pushed + replies posted** (operator-authorized).

## Summary

Re-entered the PR with inherited family context present. Re-fetched live PR comments,
re-triaged, and re-validated the prior run's fix. The two `cursor[bot]` order-correctness
findings on `perps-expanded-trade-panel.tsx` were already fixed in the uncommitted working
tree; this run re-verified exact parity with the reference order-entry page and re-ran the
validation recipe (32/33). **No new code changes required.**

## Comments handled

| Finding | Verdict | Resolution |
|---|---|---|
| cursor[bot] — Expanded market TP/SL wrong path (id 3494838412) | REAL | Fixed — two-step `perpsPlaceOrder` (TP/SL stripped) → `perpsUpdatePositionTPSL` |
| cursor[bot] — Expanded trades skip slippage guards (id 3494838418) | REAL (data-correctness) | Fixed — gated `maxSlippageBps` passed into `formStateToOrderParams`. Pre-submit confirmation modal = follow-up (OUT_OF_SCOPE) |
| abretonc7s conversation comments | N/A | Auto-posted Farmslot worker reports, not regressions |
| CI / CLA / sonarqube / codeowners bots | OUT_OF_SCOPE | Standard CI; SonarQube informational on a `[NOT-READY]` spike |

No new comments since the prior run. No `CHANGES_REQUESTED` reviews.
Full triage rationale: `artifacts/comments-report.md`.

## Files changed

- `ui/components/app/perps/perps-market-expanded/perps-expanded-trade-panel.tsx` (uncommitted; +76 / −2)
  - Adds `usePerpsLivePositions` (current position for symbol), `usePerpsMaxSlippage`, `getIsPerpsSlippageConfigEnabled`.
  - `handleSubmit` builds order params with mode `'new'`, position size, and gated `maxSlippageBps`; replicates the reference `shouldHandleTpslSeparately` two-step TP/SL flow with `normalizeTpslPrices` + a TP/SL-specific failure toast.
  - Imports `normalizeTpslPrices`, `willFlipPosition` from `../utils`.

## Parity evidence

Reference `ui/pages/perps/perps-order-entry-page.tsx` (lines ~1219-1290) uses the identical
pattern: `formStateToOrderParams(..., isSlippageConfigEnabled ? maxSlippageBps : undefined)`
→ `shouldHandleTpslSeparately` (`willFlipPosition`) → strip TP/SL → `perpsPlaceOrder`
→ `perpsUpdatePositionTPSL` with `normalizeTpslPrices`. `order-params.ts:18` confirms
`maxSlippageBps` is the 5th param of `formStateToOrderParams`. The expanded panel mirrors
this exactly.

## Validation

| Check | Command | Result |
|---|---|---|
| Auto-fix | `yarn lint:changed:fix` | ✅ ran (best-effort) |
| Changed-file lint | `yarn lint:changed` | ✅ pass (1 file) |
| Locales | `yarn verify-locales --quiet` | ✅ pass — "No invalid entries!" |
| Circular deps | `yarn circular-deps:check` | ✅ pass (compound gate exit 0) |
| Jest (changed file) | — | n/a — no test exists for `perps-expanded-trade-panel.tsx`; reused helpers (`order-params`, `normalizeTpslPrices`, `willFlipPosition`) unchanged, keep existing tests |
| Runtime health | `metamask-recipe runtime-health` | ✅ healthy (hyperliquid, background responsive) |
| Recipe (render/stream/perf) | `metamask-recipe run artifacts/recipe.json --launch-existing-dist` | ⚠️ **32/33 pass** — only `ac4` screenshot node failed |

**Recipe failure detail (honest):** the single failing node captures a screenshot via
`capture-helper snapshot` (→ `evidence-ac4-expanded-view.png`), which timed out after 15s.
This is a macOS Screen & System Audio Recording (TCC) permission issue on this host, not a
functional regression. All 32 functional nodes (render, streaming, TBT/perf assertions)
passed. Artifacts: `artifacts/recipe-run/summary.json`, `trace.json`.

**Submit-path coverage note:** the inherited recipe validates render + stream + perf; it
does not place a funded order, so it does not directly exercise the submit-path fix. The
slot account is unfunded (`perps.sufficient_balance` fails). The submit-path fix is
validated by exact code parity with the reference order-entry page (confirmed this run).

## Commit / push status

**Committed and pushed** (operator-authorized this session).
- Commit `09ed8c1f3d` — `fix(perps): mirror order-entry submit flow in expanded trade panel` (1 file, +76/−2).
- Pushed `241ac084c3..09ed8c1f3d` → `TAT-3461-feat-spike-expanded-view-perf`.
- Replies posted to both cursor[bot] threads (Fixed in `09ed8c1f3d`):
  - TP/SL finding → https://github.com/MetaMask/metamask-extension/pull/44002#discussion_r3499252834
  - Slippage finding → https://github.com/MetaMask/metamask-extension/pull/44002#discussion_r3499253176
  - Threads auto-resolve on cursor[bot] re-review of the new commit.

## Remaining manual work

1. Operator review of the submit-path change; optionally a funded manual run to confirm
   TP/SL tagging end-to-end on Hyperliquid.
2. To get a passing screenshot node: grant Screen Recording permission to the
   terminal/launcher (System Settings → Privacy & Security → Screen & System Audio
   Recording), then re-run the recipe. Functional pass is already established.
3. **Follow-up (not done):** replicate the reference pre-submit estimated-slippage
   confirmation modal (`PerpsSlippageConfigModal` + estimated-slippage hook) in the
   expanded panel. Current fix enforces the cap at the controller level only.
4. Shared perps nav leak fix tracked as **TAT-3462** (prerequisite, out of scope here).
5. Suggested GitHub replies once operator approves (operator to post):
   - Both cursor threads: "Fixed in <sha>. Expanded trade panel now mirrors the
     order-entry page: two-step TP/SL via `perpsUpdatePositionTPSL`, and the gated
     `maxSlippageBps` is passed into `formStateToOrderParams`. Pre-submit slippage
     confirmation modal tracked as follow-up."
6. PR remains `[NOT-READY]` spike; broader productionization items stay out of scope.

## Family scope

See `artifacts/family-scope.json` — verdict `partial-symptom-only` (full family scope
addressed upstream by the spike run; this re-entry resolved the narrower review symptoms).
