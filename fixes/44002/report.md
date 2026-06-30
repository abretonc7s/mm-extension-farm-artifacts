# PR 44002 — Interactive PR-Complete Report (re-entry `44002-0630-213234`)

**PR:** [feat(perps): [Extension] Spike: de-risk performance impact of the expanded (extended) view [NOT-READY]](https://github.com/MetaMask/metamask-extension/pull/44002)
**Branch:** `TAT-3461-feat-spike-expanded-view-perf` · HEAD `09ed8c1f3d` (= origin = PR head)
**Family:** `e20e0dd0` (TAT-3461) · parent run `ac00dc9b`
**Mode:** interactive re-entry, operator-supervised.

## Summary

Re-entered PR with inherited family context. Re-fetched live PR comments/reviews, re-triaged, and
re-verified the prior submit-path fix against current HEAD. The two `cursor[bot]` order-correctness
findings on `perps-expanded-trade-panel.tsx` remain fixed in `09ed8c1f3d`, with "Fixed in 09ed8c1f3d"
replies on both threads. **No new code changes required.** Trusted family recipe re-ran green (35/35).

## Comments handled

| ID | Source | Verdict | Resolution |
|---|---|---|---|
| 3494838412 | cursor[bot] — Expanded TP/SL wrong path | REAL — already fixed | Two-step `perpsPlaceOrder` (TP/SL stripped) → `perpsUpdatePositionTPSL` in HEAD. Reply 3499252834 present. |
| 3494838418 | cursor[bot] — Expanded trades skip slippage guards | REAL — already fixed | `maxSlippageBps` gated into `formStateToOrderParams`. Reply 3499253176 present. |
| 4837269569 / 4840231357 / 4840690296 / 4844645868 / 4846391441 / 4847170158 | abretonc7s | OUT_OF_SCOPE | Farmslot worker run summaries, not regressions. |

No new comments since prior run. No `CHANGES_REQUESTED`. PR `open`, not draft, `mergeable: true`.

## Files changed (this re-entry)

Operator-reported UX fix (not a GitHub comment) — expanded order page accepted invalid
amounts (e.g. `09` = $9) because `OrderEntry`'s **internal** submit button had no validation,
while the regular order-entry page renders `OrderEntry` with `showSubmitButton={false}` and owns a
button gated by `isSubmitDisabled`. Added matching guards to the internal button:

| File | Change |
|---|---|
| `ui/components/app/perps/order-entry/order-entry.tsx` | Added `isBelowMinOrderSize` ($10 min, market), `isInsufficientFunds` (margin > balance), `isLimitPriceInvalid`, and `currentPrice<=0` guards → `isSubmitDisabled`; internal submit button now `disabled` + shows "Order size must be at least $10" / "Insufficient funds" text, mirroring the page. |
| `ui/components/app/perps/order-entry/order-entry.test.tsx` | New `submit guards` suite (below-min `09`, zero, insufficient funds, valid-amount enable); updated the limit-submit test to set a price first (empty limit price is now correctly blocked). |

Both flows share `usePerpsOrderForm`, so the default order amount (`TRADING_DEFAULTS.amount` = $10)
was already consistent — the gap was purely the missing submit-disable on the internal button.

## Validation

| Check | Command | Result |
|---|---|---|
| Auto-fix | `yarn lint:changed:fix` | ✅ ran — no changed files |
| Changed-file lint | `yarn lint:changed` | ✅ pass — "No changed JS/TS/TSX/MTS/SNAP files to lint" |
| Locales | `yarn verify-locales --quiet` | ✅ pass — "No invalid entries!" |
| Circular deps | `yarn circular-deps:check` | ✅ pass — "Circular dependencies check passed." |
| Runtime health | `ensure-runtime-ready.sh` + `runtime-health --cdp-port 7665` | ✅ PASS — CDP reachable, `backgroundProbeOk: true`, provider hyperliquid |
| Recipe | `metamask-recipe run artifacts/recipe.json --launch-existing-dist` | ✅ **PASS — 35/35 nodes, 0 failed, 19961 ms** (pre-fix; runtime uses an immutable static build) |
| Operator-fix unit tests | `yarn jest order-entry.test.tsx` | ✅ **PASS — 41/41** (4 new submit-guard tests incl. `09` below-min) |

Recipe artifacts: `artifacts/recipe-run/{summary.json, trace.json, artifact-manifest.json, recipe.json}`.

**Note on live validation of the operator fix:** this slot's runtime runs an immutable static dev
build (`watch=off`), so the source change is not reflected in `dist/` without a full `yarn build:test`.
The fix is proven by the new Jest guard tests rather than a live CDP run. A funded manual run on a
rebuilt dist is the remaining optional confirmation.

## Commit / push status

Operator explicitly asked to commit + push the expanded-panel submit-guard fix.
Committed as `76b604569c` and pushed to `origin/TAT-3461-feat-spike-expanded-view-perf`
(`09ed8c1f3d..76b604569c`). The two cursor-finding fixes were already in `09ed8c1f3d`.

## Operator-reported follow-up (new this session)

Operator noticed a UX bug on the full-screen (expanded) order page: it does **not** prevent
submitting an order on an invalid amount such as `09` (leading zero). Investigation appended in a
separate section / `comments-report.md` once analyzed. This is a new finding, not one of the
triaged GitHub comments.

## Remaining manual work

1. Operator review of the already-pushed submit-path change (`09ed8c1f3d`).
2. cursor threads: both already have "Fixed in 09ed8c1f3d" replies; auto-resolve on cursor re-review.
3. **New:** expanded order-page invalid-amount (`09`) validation — see operator follow-up section.
4. Out of scope for this `[NOT-READY]` spike: SonarCloud Quality Gate, pre-submit estimated-slippage
   confirmation modal replication, TAT-3462 shared nav leak.

## Family scope

See `artifacts/family-scope.json` — verdict `partial-symptom-only`.
