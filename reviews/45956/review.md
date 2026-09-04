# PR Review: #45956 — feat(perps): add market category pills to the Perps tab

**Tier:** standard

## Summary

The Perps tab now has a category rail (`PerpsMarketCategories`) under Withdraw / Add funds. Pills come from live markets via `usePerpsMarketCategories` + shared `marketMatchesCategory`, then navigate to `#/perps/market-list?filter=`. After geositta's request, overflow is a measured More menu, not a horizontal scroller. The same rail replaced FilterSelect on the market list.

That product change is coherent. The PR body and the author's recipe still describe the old scroll + dropdown UX. Keyboard unit test that assumed two Tab stops was fixed in 73d7e956 (`pill.focus()` then Enter). More-menu keyboard focus when `selectedId` is null is still weak.

Acceptance Criteria in the task file is `_Not specified_`. TAT-3848 is linked. This review uses verbatim PR-body claims, not invented ticket ACs.

## Recipe Coverage

| # | AC (verbatim) | Target env | Recipe nodes (IDs) | Screenshot filename | Visual verdict | Justification |
|---|---------------|------------|---------------------|---------------------|----------------|---------------|
| 1 | "This adds a horizontally scrollable rail of category pills between the balance actions and the user's positions, mirroring mobile's Products rail." | fullscreen | none | none | UNTESTABLE | Recipe decision skip-static-code. Review execution contract forbids CDP, recipes, and screenshots. Code at perps-category-rail.tsx never uses overflow-x-auto; overflow goes to a More menu. Claim text is stale vs HEAD. |
| 2 | "Tapping a pill opens the full market list already narrowed to that category." | fullscreen | none | none | UNTESTABLE | Static-code only. Source navigates to `${PERPS_MARKET_LIST_ROUTE}?filter=${category}`; market-list reads `filter` via normalizeMarketFilter. Not live-proven this run. |
| 3 | "Only categories that live market data actually contains get a pill, so a pill can never open an empty list." | fullscreen | none | none | UNTESTABLE | Static-code only. usePerpsMarketCategories filters MARKET_CATEGORIES with marketMatchesCategory. Not live-proven this run. |
| 4 | "Confirm a row of category pills renders under the Withdraw / Add funds buttons — `All` plus each category present in live market data (currently Crypto, Stocks, Commodities)." | fullscreen | none | none | UNTESTABLE | Static-code only. PerpsView places PerpsMarketCategories under PerpsMarketBalanceActions. Inherited Farmslot shots exist but this run did not recapture. |
| 5 | "Narrow the window until the pills overflow and confirm the row scrolls horizontally instead of wrapping or clipping." | fullscreen | none | none | UNTESTABLE | Static-code only. Implementation clips and opens More; it does not scroll. PR manual step is wrong for HEAD. |
| 6 | "Click `Crypto`. The market list opens at `#/perps/market-list?filter=crypto` with the filter dropdown already reading `Crypto`." | fullscreen | none | none | UNTESTABLE | Static-code only. FilterSelect is gone; destination is PerpsCategoryRail testId market-list-categories. PR testing step is stale. |
| 7 | "Go back, then Tab to a pill and press Enter — it navigates the same way a click does." | fullscreen | none | none | UNTESTABLE | Static-code only. Unit test now focuses the pill then sends Enter. No live keyboard run this review. |

Overall recipe coverage: 0/7 ACs PROVEN
Untestable: 1-7, static-code validation depth (no CDP, no recipe run, no new screenshots)

## Prior Reviews

| Reviewer | State | Date | Addressed? | Notes |
|----------|-------|------|------------|-------|
| geositta | CHANGES_REQUESTED | 2026-09-03T00:24:51Z | addressed | 2 commits after review (40ec3706, 73d7e956). Horizontal scroll replaced by More overflow. Do not re-request the scroll change. |
| cursor[bot] | COMMENTED | 2026-09-03T15:23:54Z | unaddressed | More menu still skips initial option focus when selectedId is null. Re-checked on 73d7e956. |

Previous Farmslot review (head 40ec3706, COMMENT) leftover items:
- Keyboard test Tab-count brittleness: **addressed** in 73d7e956 (`cryptoPill.focus()`).
- PR docs still describe horizontal scroll: **still open**.
- Manual step 4 still names FilterSelect / `filter-select-button`: **still open**.

## Review claims validation

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Horizontally scrollable rail between balance actions and positions | FAIL vs HEAD / UNTESTABLE live | Code: PerpsCategoryRail `overflow-x-clip` + More. Placement in perps-view.tsx after balance actions. |
| 2 | Tap opens market list narrowed to category | PASS (code) / UNTESTABLE live | `navigate(...?filter=${category})`; market-list `initialFilter` from URL. |
| 3 | Only categories present in live data get a pill | PASS (code) / UNTESTABLE live | `usePerpsMarketCategories` + `marketMatchesCategory`. Empty rail hidden when `categories.length <= 1` after load. |
| 4 | All plus live categories under Withdraw / Add funds | PASS (code) / UNTESTABLE live | Pill order All first; labels from MARKET_FILTER_LABEL_KEYS. |
| 5 | Narrow window scrolls horizontally | FAIL vs HEAD / UNTESTABLE live | Tests assert no `overflow-x-auto`. |
| 6 | Crypto click + filter dropdown reads Crypto | FAIL vs docs / PASS destination code | URL `?filter=crypto` still works. Dropdown is gone; rail pill is the control. |
| 7 | Tab + Enter navigates like click | PASS (unit) / UNTESTABLE live | `perps-market-categories.test.tsx` keyboard case. |

## Code Quality

- Pattern adherence: matches perps UI (MMDS ButtonFilter, Box, colocated tests, data-testid prefixes). Shared Dropdown gained trigger/menu props for More.
- Complexity: overflow hook is the heavy piece. Measuring all pills then caching widths is justified. `useLayoutEffect` with no deps runs every commit; measure bails when widths are unchanged, so it should settle.
- Type safety: no `as any`. MarketFilter used consistently. lint:tsc not run (static-code contract).
- Error handling: unknown URL filters fall back to `all` via `normalizeMarketFilter`.
- Accessibility/fallbacks: rail is `role="group"` with aria-label. Nav pills omit `aria-pressed`. Filter pills on market list expose pressed + clear label. Skeleton uses `h-8` to match pills. More menu focus gap noted below.
- Anti-pattern findings: no yarn.lock / LavaMoat delta. New controls have test ids. No controller persist shape change, no migration. No `chrome.runtime.getBackgroundPage()`.

## Fix Quality

- **Best approach:** Sharing `marketMatchesCategory` with the list is the right lock. More instead of scroll matches geositta and web practice. Ticket TAT-3848 called market-list filter UI out of scope; this PR still rewrote that page. Fine if TAT-3854 is riding along, but the tickets should say so.
- **Would not ship:** nothing correctness-blocking in the rail/nav path. Would not ship the PR description as-is for QA.
- **Test quality:** categories, hide-empty, skeleton height, no-scroller, nav, analytics, overflow geometry stubs are pointed at real behavior. Keyboard test no longer depends on two Tab stops. Jest not executed this run.
- **Brittleness:** `RAIL_GAP_PX` must stay aligned with Tailwind `gap-2`. jsdom overflow tests mock width getters; that is honest.

## Live Validation

- Recipe: skipped (Recipe decision: skip-static-code)
- Result: SKIPPED
- Evidence: 0 screenshots this run (video skipped: static-code contract, no CDP). Inherited Farmslot captures still assume scroll + FilterSelect.
- Webpack errors: skipped (static-code)
- Log monitoring: skipped (static-code)

## Correctness

- Diff vs stated goal: tab discovery works. Stated overflow/dropdown behavior does not match HEAD.
- Edge cases: empty markets hide the rail; watchlist URL with empty watchlist falls back to all; active category promoted into the visible row on the list.
- Race conditions: categories take markets from the tab stream owner, so they do not tear down the shared price stream.
- Backward compatibility: `?filter=` deeplinks still work. FilterSelect removal is a test-id break; e2e page object was updated.

## Static Analysis

- lint:tsc: skipped (static-code)
- Tests: not executed (static-code). Coverage exists for rail, pill, hook, dropdown, market-list.

## Mobile Comparison

- Status: DIVERGES (intentional)
- Details: Mobile PerpsProducts / category badges sit on home and typically scroll. Extension uses ButtonFilter + More because there is no web FilterButtonGroup and because horizontal scroll failed review. No new `.toFixed(2)` / `{min:2,max:2}` in this diff. Category membership is shared through `marketMatchesCategory`, which keeps crypto bucketing.

## Architecture & Domain

UI-only. No MV3 background change, no LavaMoat, no persist migration. Import path stays inside `ui/components/app/perps` and `ui/pages/perps`.

## Risk Assessment

- MEDIUM — labels already say risk:medium. UX rewrite of market-list plus docs/recipe drift can fail human QA. Overflow keyboard path is the remaining a11y hole.

## Recommended Action

COMMENT

1. Rewrite PR description, manual steps, and validation recipe for More overflow and the market-list rail (not scroll, not FilterSelect).
2. Focus the first More-menu option when `selectedId` is null.
3. Confirm TAT-3848 vs TAT-3854 scope if market-list filter replacement was meant to stay a sibling ticket.
