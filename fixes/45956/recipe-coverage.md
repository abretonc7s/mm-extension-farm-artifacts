# Recipe coverage — PR #45956 review-fix round

Recipe: `artifacts/recipe.json` ("PR #45956 review fixes — category rail contract, market count grammar, Products slot")
Run: `artifacts/recipe-run/` — **pass**, 22/22 nodes, exit 0, Hyperliquid mainnet, branch head `b875cfc948`.

The inherited family recipe is preserved at `artifacts/recipe-inherited-stale.json` and was **not** executed: it asserts the horizontally-scrolling rail and `All` pill that geositta's CHANGES_REQUESTED review required removing, and two of its command nodes point at `perps-market-categories.test.tsx`, renamed by this PR. See `comments-report.md` for the full rationale.

## What this round changed, and how each change is proved

| Review comment | Change | Proof | Kind |
|---|---|---|---|
| 4004409617 — active pill widens without a remeasure | Active key folded into the width-cache signature | `fix2-assert-crypto-pressed` shows the selected pill live with its clear glyph rendered on a rail that recomputed its fit; unit coverage in `perps-category-rail.test.tsx` (100% of new lines) | mixed |
| 4004409629 — per-tick layout reads | `useLayoutEffect` scoped to `[measure]` | Same rail nodes exercise mount + selection remeasure paths live; no visual regression in `market-list-filtered.png` | mixed |
| 4004409645 — hook mounted for `Wrap` | Empty category list passed for `Wrap` | `fix1-*` — Products renders, wraps (`.flex-wrap`) and keeps controller order with the hook neutered | state |
| 4004314719 / 4004409635 — Products jumps past the watchlist | Watchlist slot added to the loading tree, sized from persisted `watchlistCount` | `fix4-run-watchlist-slot-tests` + `assert_output "2 passed"` (starred and empty cases) | state |
| 4004409635 — `isLoading={marketsLoading}` never true | Replaced with explicit `false` plus rationale | Same suite; `perps-view.test.tsx` passes 47 tests | state |
| 4004409655 — `'watchlist'` passed as a category | Rail receives `null`; contract is category-or-nothing | `fix6-run-rail-contract-test` + `assert_output "1 passed"` | state |
| 4004409667 — `"1 markets"` | `perpsMarketCountSingular` pair added | `fix5` proves the singular branch; `fix3-assert-count-reads-plural` proves the plural branch still holds live (`178 markets`) | mixed |
| 4004314728 / 4004409672 / 4004409677 — stale JSDoc | Docs rewritten | Not executable — comment-only, no runtime behaviour | n/a |

## Gaps

- The `More` overflow trigger is not exercised live this round: at the runtime window width all 8 categories fit on one row (visible in `market-list-filtered.png`), so no trigger renders. Its behaviour is covered by `perps-category-rail.test.tsx`, and the prior round's evidence package captured it at a narrowed window.
- The stale-doc fixes have no runtime surface and are verified by reading the diff.
- Every `assert_output` names its source command node, so no jest gate can pass vacuously on a zero-match `-t` filter.
