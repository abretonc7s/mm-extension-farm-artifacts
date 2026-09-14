# PR #45956 — review comment triage

Fetched live 2026-09-14. 14 top-level inline review comments, 15 issue comments, 2 CHANGES_REQUESTED reviews.

5 inline threads were already resolved and replied to in earlier rounds (3926005019, 3949510605, 3979413768, 3988690168) — skipped, `already replied`.
Both CHANGES_REQUESTED reviews (geositta 5096562114 horizontal-scroll objection, aganglada 5143630141 Figma designs) were superseded by aganglada's APPROVED review 5196621007 on the current head — no further action.
15 issue comments are all routine status-only automation (1 CLA, 1 CODEOWNERS, 11 build-ready, 1 SonarQube quality-gate passed, 1 Cursor summary in the PR body) — skipped without reply.

## Open threads triaged

| # | ID | Author | File | Triage | Action |
|---|----|--------|------|--------|--------|
| 1 | 4004314719 | aganglada | ui/components/app/perps/perps-view.tsx:457 | REAL | Loading tree has no slot for `PerpsWatchlist`, so a user with starred markets sees Products pushed down after load — add a watchlist skeleton slot |
| 2 | 4004314728 | aganglada | ui/components/app/perps/dropdown/dropdown.tsx:29 | REAL | `selectedId` doc is stale (promote-the-active-pill wording) — rewrite to describe the split-in-source-order behaviour |
| 3 | 4004409617 | michalconsensys | use-category-rail-overflow.ts:58 | REAL | Active pill renders an extra `CircleX` + gap, so its width changes without a signature change — fold the active key into the width-cache signature |
| 4 | 4004409629 | michalconsensys | use-category-rail-overflow.ts:110 | REAL | `useLayoutEffect` with no dep array does a sync layout read on every live market tick — scope to `[measure]` |
| 5 | 4004409635 | michalconsensys | ui/components/app/perps/perps-view.tsx:457 | REAL | Same watchlist-slot issue as #1, plus `isLoading={marketsLoading}` on line 503 can never be true (the early return already requires it false) — both fixed |
| 6 | 4004409645 | michalconsensys | perps-category-rail.tsx:129 | REAL | `useCategoryRailOverflow` runs for the `Wrap` layout too — a ResizeObserver + layout effect the Products section never uses. First-paint flash noted as a deliberate tradeoff |
| 7 | 4004409655 | michalconsensys | ui/pages/perps/market-list/index.tsx:823 | REAL (partial) | Passing `'watchlist'` as `selectedCategory` is a contract wart — pass `null`. The stated consequence (cannot clear through More) does not reproduce: `'watchlist'` is never in `overflowCategories`, so `overflowSelection` is already `null` |
| 8 | 4004409667 | michalconsensys | app/_locales/en/messages.json:7771 | REAL (first half) | `"$1 markets"` reads "1 markets" at a count of one — add a Singular/Plural pair per repo convention. Second half (other locales keep `ETF`/`Index`) is the expected Crowdin flow — no change |
| 9 | 4004409672 | michalconsensys | ui/components/app/perps/dropdown/dropdown.tsx:28 | REAL | Duplicate of #2, same stale JSDoc |
| 10 | 4004409677 | michalconsensys | ui/components/app/perps/constants.ts:138 | REAL | `MARKET_FILTER_LABEL_KEYS` doc still names the deleted `filter-select` dropdown — name the real consumers |

## Validation

- `mm-harness check diff --profile fast`: **pass** (policy-suppressions, eslint, oxfmt, jest all pass; typecheck skipped by profile).
- Targeted `tsc --noEmit`: no diagnostics on any file in this diff.
- Unit tests: `perps-view.test.tsx`, `market-list/index.test.tsx`, `perps-market-categories/`, `dropdown/`, `usePerpsTabExploreData.test.ts` — 147 passed, 0 failed. 4 new tests added (watchlist skeleton slot present / absent, singular market count, rail unselected under the watchlist filter); the skeleton-slot test was confirmed to fail against the unfixed tree.
- `coverage-analyze.js`: VERDICT FAIL, but **no file in this PR's diff is below threshold on new code** — every touched file reports 80–100% on new lines (market-list/index.tsx 100% of 16 new, perps-category-rail.tsx 100% of 42, constants.ts 100% of 2, dropdown.tsx 80%). The 14 low files and the 2 failing `network-list-menu` tests are pre-existing on main and untouched here.

## Recipe re-validation

**Result: PASS** — `artifacts/recipe-review-fix-round2.json`, 22/22 nodes, exit 0, on Hyperliquid mainnet at the rebased branch head.

The inherited family recipe (`artifacts/recipe.json`) could **not** be used: it encodes the *original* ticket's acceptance criteria, which review superseded. It asserts `[data-testid="perps-market-categories"].overflow-x-auto` (a horizontal scroller — the exact pattern geositta's CHANGES_REQUESTED review required removing), a `pill-all` control the rail deliberately no longer has, a `perps-market-categories-list` test id that no longer exists, and two `yarn jest` nodes pointed at `perps-market-categories.test.tsx`, a file this PR renamed to `perps-category-rail.test.tsx` (the runner aborts on it: "Command helper source does not exist"). Running it would have produced a FAIL that says nothing about the review fixes.

A replacement recipe was authored against the behaviour the PR actually ships and the fixes made this round:

| Node group | Claim proved | Proof kind |
|---|---|---|
| `fix1-*` | Products chips render, wrap (`.flex-wrap`) rather than scroll, lead with the controller's first category and still offer its last (`New`) | state |
| `fix2-*` | Following a Products chip lands on the market list with that pill `aria-pressed="true"` | state |
| `fix3-*` | The count line still reads the plural (`178 markets`) for a many-market filter, so the new singular branch did not capture the normal case | mixed |
| `fix4-*` | Both watchlist-skeleton-slot cases pass (`2 passed`) | state |
| `fix5-*` | The singular market count case passes (`1 passed`) | state |
| `fix6-*` | The rail-holds-no-selection-under-watchlist case passes (`1 passed`) | state |

Every `assert_output` is paired against a named command node, so no jest gate is vacuous.
Screenshot `screenshots/market-list-filtered.png` is provider `capture-helper` per `artifact-manifest.json` (not the silent CDP fallback). It shows the Crypto pill filled and carrying its `CircleX` clear glyph, all 8 categories fitting one row with no `More` trigger at this width, and `178 markets` beside the sort control.

Side findings: 2 console errors observed — 189 × `Failed to load resource: 404` (market token icons) and 1 × `Unknown action` (Redux). Both are ambient dev-runtime noise; nothing in this diff touches icon loading or action dispatch.

## Summary

- **Total comments considered: 29** (14 inline review comments, 15 issue comments), plus 2 CHANGES_REQUESTED reviews.
- **Triaged as actionable: 10** — all 10 REAL (2 of them partially: #7's stated symptom does not reproduce, #8's second half is expected Crowdin flow). 0 FALSE POSITIVE, 0 OUT OF SCOPE.
- **Skipped without reply: 4 inline** (already resolved and replied to in earlier rounds) + **15 issue comments** (status-only automation: 1 CLA, 1 CODEOWNERS, 11 build-ready, 1 SonarQube quality gate, 1 Cursor summary).
- **Both CHANGES_REQUESTED reviews are superseded** by aganglada's APPROVED review 5196621007 on the current head.
- **Commit SHA: `b875cfc948`** — `fix(perps): address review on the category rail and the Products slot`. Pushed with `--force-with-lease` (the branch was rebased in step 3; remote was verified unmoved first).
- **Replies: 9 posted, 10 threads resolved** (the two perps-view.tsx threads from different reviewers share one fix).

### Files changed

```
app/_locales/en/messages.json                                              |  4 +
app/_locales/en_GB/messages.json                                           |  4 +
ui/components/app/perps/constants.ts                                       |  6 +-
ui/components/app/perps/dropdown/dropdown.tsx                              |  8 +-
ui/components/app/perps/hooks/usePerpsTabExploreData.ts                    |  8 +
ui/components/app/perps/perps-market-categories/perps-category-rail.tsx    | 11 +-
ui/components/app/perps/perps-market-categories/use-category-rail-overflow.ts | 44 ++-
ui/components/app/perps/perps-view.test.tsx                                | 38 +
ui/components/app/perps/perps-view.tsx                                     | 15 +-
ui/pages/perps/market-list/index.test.tsx                                  | 39 +
ui/pages/perps/market-list/index.tsx                                       | 13 +-
11 files changed, 162 insertions(+), 26 deletions(-)
```

- **Recipe re-validation: PASS** (22/22 nodes, replacement recipe — see the section above for why the inherited one was unusable).
- **Integration status: `rebased`** (14 commits replayed onto `origin/main` at `31cd78a364`, clean, no conflicts; `yarn install --immutable` re-run because main's new commits moved `yarn.lock`).
