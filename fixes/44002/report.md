# PR 44002 — Interactive PR-Complete Report (re-entry `44002-0630-073950`)

**PR:** [feat(perps): [Extension] Spike: de-risk performance impact of the expanded (extended) view [NOT-READY]](https://github.com/MetaMask/metamask-extension/pull/44002)
**Branch:** `TAT-3461-feat-spike-expanded-view-perf` · **Family:** `e20e0dd0` (TAT-3461) · parent run `c5fb046f`
**Mode:** interactive re-entry, operator-supervised. **Not committed / not pushed.**

## Summary

Re-entered the PR with inherited family context present. Re-fetched live PR
comments, re-triaged, and re-validated the prior run's fix. The two `cursor[bot]`
order-correctness findings on `perps-expanded-trade-panel.tsx` were already fixed
in the uncommitted working tree; this run re-verified exact parity with the
reference order-entry page and re-ran the validation recipe. **No new code changes
required.**

## Comments handled

| Finding | Verdict | Resolution |
|---|---|---|
| cursor[bot] — Expanded market TP/SL wrong path | REAL | Fixed — two-step `perpsPlaceOrder` (TP/SL stripped) → `perpsUpdatePositionTPSL` |
| cursor[bot] — Expanded trades skip slippage guards | REAL | Fixed (data-correctness) — gated `maxSlippageBps` passed into `formStateToOrderParams`. Pre-submit confirmation modal = follow-up (OUT_OF_SCOPE) |
| abretonc7s ×2 conversation comments | N/A | Auto-posted worker reports (spike + prior pr-complete), not regressions |
| github-actions / token-exchange / sonarqube / codeowners bots | OUT_OF_SCOPE | CI/CLA/build/codeowners; SonarQube informational on a `[NOT-READY]` spike |

Full triage rationale: `artifacts/comments-report.md`.

## Files changed

- `ui/components/app/perps/perps-market-expanded/perps-expanded-trade-panel.tsx`
  (uncommitted; +76 / −2)
  - Adds `usePerpsLivePositions` (current position for symbol), `usePerpsMaxSlippage`,
    `getIsPerpsSlippageConfigEnabled`.
  - `handleSubmit` builds order params with mode `'new'`, position size, and gated
    `maxSlippageBps`; replicates the reference `shouldHandleTpslSeparately` two-step
    TP/SL flow with `normalizeTpslPrices` + a TP/SL-specific failure toast.
  - Imports `normalizeTpslPrices`, `willFlipPosition` from `../utils`.

## Validation

| Check | Command | Result |
|---|---|---|
| Changed-file lint | `yarn lint:changed` | ✅ pass (1 file, no invalid entries) |
| Locales | `yarn verify-locales --quiet` | ✅ pass |
| Circular deps | `yarn circular-deps:check` | ✅ pass |
| Jest (changed file) | — | n/a — no test exists for `perps-expanded-trade-panel.tsx`; reused helpers (`order-params`, `normalizeTpslPrices`, `willFlipPosition`) unchanged, keep their existing tests |
| Runtime health | `metamask-recipe runtime-health` | ✅ healthy (hyperliquid, background responsive) |
| Recipe (render/stream/perf) | `metamask-recipe run artifacts/recipe.json --launch-existing-dist` | ⚠️ **32/33 pass** — only `ac4-screenshot` failed |

**Recipe failure detail (honest):** the single failing node is `ac4-screenshot`
(`ui.screenshot`), failing with `screen_recording_denied` — macOS Screen & System
Audio Recording TCC permission is not granted to the terminal/launcher on this host.
This is an **environment/permission** issue, not a functional regression. All 32
functional nodes (render, streaming, TBT/perf assertions) passed. Artifacts:
`artifacts/recipe-run/summary.json`, `trace.json`.

**Submit-path coverage note:** the inherited recipe validates the expanded view
**renders + streams + perf**; it does **not** place a funded order, so it does not
directly exercise the submit-path fix. The slot account is unfunded
(`perps.sufficient_balance` fails). The submit-path fix is validated by **exact code
parity** with the reference `perps-order-entry-page.tsx` new-order branch (TP/SL
two-step + gated slippage), confirmed by reading both paths this run.

## Commit / push status

**Not committed, not pushed.** No GitHub replies or thread resolutions made
(interactive re-entry — operator owns those).

## Remaining manual work

1. Operator review of the submit-path change; optionally a funded manual run to
   confirm TP/SL tagging end-to-end on Hyperliquid.
2. To get a passing screenshot node: grant Screen Recording permission to the
   terminal/launcher (System Settings → Privacy & Security → Screen & System Audio
   Recording), then re-run the recipe. Functional pass is already established.
3. **Follow-up (not done):** replicate the reference pre-submit estimated-slippage
   **confirmation modal** (`PerpsSlippageConfigModal` + estimated-slippage hook) in
   the expanded panel. Current fix enforces the cap at the controller level only.
4. Shared perps nav leak fix tracked as **TAT-3462** (prerequisite, out of scope here).
5. Suggested GitHub replies once operator approves (operator to post):
   - Both cursor threads: "Fixed in <sha>. Expanded trade panel now mirrors the
     order-entry page: two-step TP/SL via `perpsUpdatePositionTPSL`, and the gated
     `maxSlippageBps` is passed into `formStateToOrderParams`. Pre-submit slippage
     confirmation modal tracked as follow-up."
6. PR remains `[NOT-READY]` spike; broader productionization items stay out of scope.

## Family scope

See `artifacts/family-scope.json` — verdict `partial-symptom-only` (full family
scope addressed upstream by the spike run; this re-entry resolved the narrower
review symptoms).
