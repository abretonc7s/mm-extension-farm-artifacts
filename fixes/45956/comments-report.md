# PR #45956 comment triage

## Integration (step 3)

Guard tripped: remote tip `7dc2aaf` was not an ancestor of local HEAD. Cause: a previous run rebased the branch onto main `3f7c837` locally and added `39cc61c` without pushing. Verified no remote work is lost before continuing:
- `git range-diff 0ef25c9..7dc2aaf 3f7c837..de831d0` — all 12 remote commits `=` their local counterparts (remote-only merge commit `d76f143` is dropped by the rebase, as intended).
- Net PR patch (`-U0`, sorted +/- lines) for `0ef25c9..7dc2aaf` vs `3f7c837..de831d0`: identical, 2494 lines each, same file set.

Then rebased cleanly onto `origin/main` `e325afe`; `yarn install --immutable` run because `yarn.lock` changed on main. Push uses `--force-with-lease` pinned to `7dc2aaf`.

## Triage

| # | Author | Source | File | Triage | Action |
|---|--------|--------|------|--------|--------|
| 1 | aganglada | review_comment 3988690168 | ui/components/app/perps/constants.ts:186 | REAL | Drop the hand-kept Products order; chips follow the controller's `MARKET_CATEGORIES` (via `MARKET_CATEGORY_FILTERS`), the same order the market-list rail uses |
| 2 | aganglada | review_comment 3990013492 (reply) | ui/components/app/perps/constants.ts:186 | REAL | Same fix as #1 |
| 3 | cursor[bot] | review_comment 3979413768 | ui/components/app/perps/perps-market-categories/perps-category-rail.tsx | REAL | Thread auto-resolved by cursor[bot] (outdated lines), but HEAD still reserves one clipped row of `h-8` skeletons while Products renders wrapping 40px (`ButtonBaseSize.Md`) chips. Wrap-layout skeleton now wraps, reserves one pill per category, and matches the pill variant's height |
| 4 | cursor[bot] | review_comment 3926005019 | ui/components/app/perps/dropdown/dropdown.tsx | already replied | Resolved thread; HEAD focuses the first option when there is no selection (`focusIndexOnOpen`) |
| 5 | cursor[bot] | review_comment 3949510605 | ui/pages/perps/market-list/index.tsx:278 | already replied | Resolved thread, fixed in a5d94a0 |

Skipped status-only automation (no reply): 14 issue comments (github-actions CLA, metamask-ci codeowners + builds-ready x11, sonarqubecloud quality gate).

CHANGES_REQUESTED reviews (geositta 5096562114: no horizontal scroll; aganglada 5143630141: follow Figma) were addressed by earlier commits on the branch (wrap / overflow-menu rails, Products section per design); no new action this pass.

## Validation

- `mm-harness check diff --profile fast`: eslint, oxfmt, jest, policy-suppressions pass. Coverage VERDICT PASS (new code 95%).
- `yarn jest perps-products.test.tsx perps-category-rail.test.tsx`: 36 passed.
- Inherited recipe (`artifacts/recipe.json`): FAIL, stale and unrelated to this pass. It invokes a jest helper on `perps-market-categories.test.tsx`, deleted by earlier branch commits, and still targets CDP 7665, an `All` pill and an `overflow-x-auto` rail that the current design removed.
- Review-fix proof recipe (`artifacts/recipe-review-fix.json`, run in `artifacts/recipe-review-fix-run`): PASS on CDP 6663 after a page reload onto the rebuilt bundle. Asserts the Products rail wraps, crypto is chip 1, index 4, commodity 6, new 8 and last (controller order). Screenshot `screenshots/products-controller-order.png`, provider capture-helper.
- Skeleton height: jsdom cannot lay out, so unit tests prove the Wrap skeleton renders one `h-10` pill per category in a `flex-wrap` row; chip height `ButtonBaseSize.Md` = `h-10` confirmed in design-system `ButtonBase.constants`.

## Summary

- Total comments triaged: 5 inline (4 REAL, 1 FALSE POSITIVE, 0 OUT OF SCOPE); 2 of them (3926005019, 3949510605) were already replied in earlier rounds, so no new reply. 14 status-only issue comments skipped.
- Fix commit: `e86c0725d5` (pushed with `--force-with-lease` pinned to `7dc2aaf`)
- Files changed: `ui/components/app/perps/constants.ts`, `ui/components/app/perps/perps-market-categories/perps-category-rail.tsx`, `ui/components/app/perps/perps-market-categories/perps-category-rail.test.tsx`, `ui/components/app/perps/perps-products/perps-products.test.tsx`
- Replies: 3988690168 (aganglada, thread resolved), 3979413768 (cursor[bot], thread already resolved)
- Recipe re-validation: inherited recipe FAIL (stale, unrelated); review-fix proof recipe PASS
- Integration status: `rebased` onto origin/main `e325afe`
