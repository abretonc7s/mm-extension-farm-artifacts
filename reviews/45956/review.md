# PR Review: #45956 — feat(perps): add market category pills to the Perps tab

**Tier:** standard (static-code execution contract)

## Summary

The PR adds a shared `PerpsCategoryRail` on the Perps home tab so users can jump into the market list with `?filter=` set from live market data. Categories are derived via `usePerpsMarketCategories` and filtered with shared `marketMatchesCategory`, so empty categories are never offered. Skeleton loading reserves pill height to avoid layout shift.

Commit `40ec3706` substantially redesigns the approach after geositta's review: horizontal scroll is replaced by measured overflow into a **More** dropdown, and the market list drops `FilterSelect` in favor of the same rail (plus header search/watchlist toggles). The code, tests, and accessibility story are coherent for the new design. **PR body, manual testing steps, and the seeded validation recipe still describe the pre-redesign UX** (horizontal scroll + filter dropdown), so inherited live evidence cannot be forwarded unchanged.

## Recipe Coverage

| # | Claim (verbatim) | Target env | Recipe nodes / evidence | Visual verdict | Justification |
|---|------------------|------------|-------------------------|----------------|---------------|
| 1 | Confirm a row of category pills renders under the Withdraw / Add funds buttons — `All` plus each category present in live market data (currently Crypto, Stocks, Commodities). | fullscreen | Inherited `after-ac1-category-pills-visible.png`; unit tests | **PROVEN** | `PerpsView` renders `PerpsMarketCategories`; tests assert pill set and labels. |
| 2 | Narrow the window until the pills overflow and confirm the row scrolls horizontally instead of wrapping or clipping. | fullscreen | Inherited `ac1-assert-horizontal-scroller` | **MISSING** | HEAD uses `overflow-x-clip` + More menu; test explicitly forbids `overflow-x-auto`. |
| 3 | Click `Crypto`. The market list opens at `#/perps/market-list?filter=crypto` with the filter dropdown already reading `Crypto`. | fullscreen | Inherited `after-ac2-market-list-filtered-crypto.png` | **WEAK** | Navigation + filter query proven in tests; filter dropdown removed — active rail pill replaces it. |
| 4 | Go back, then Tab to a pill and press Enter — it navigates the same way a click does. | fullscreen | Inherited jest/trace; `perps-market-categories.test.tsx` | **PROVEN** | Keyboard activation test passes. |

Overall recipe coverage: 2/4 ACs PROVEN
Untestable: none

> ⚠ Coverage escalation: AC2 not proven; AC3 only partially proven on frozen HEAD.
>   Reason: Post-review overflow-menu redesign invalidates horizontal-scroll and filter-dropdown claims; inherited recipe selectors (`overflow-x-auto`, `filter-select-button`) no longer exist.
>   Human reviewer must re-run an updated recipe or manually validate narrow-window overflow + market-list filtered state on commit `40ec3706` before merging.

## Prior Reviews

| Reviewer | State | Date | Addressed? | Notes |
|----------|-------|------|------------|-------|
| geositta | CHANGES_REQUESTED | 2026-09-03 | addressed | Requested non-scroll web pattern. Commit `40ec3706` adds overflow menu + shared rail; horizontal scroll removed. |
| cursor | COMMENTED | 2026-09-03 | n/a | Bugbot automated summary. |

## Acceptance Criteria Validation

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Category pill rail under balance actions (`All` + live categories) | PASS | `perps-view.tsx`, `perps-market-categories.test.tsx` |
| 2 | Horizontal scroll on overflow | FAIL | `perps-category-rail.tsx`, test `never turns the rail into a horizontal scroller` |
| 3 | Crypto pill → `#/perps/market-list?filter=crypto` with Crypto filter visible | PASS (wording stale) | Navigation tests; market list uses rail not dropdown |
| 4 | Keyboard Enter on pill navigates like click | PASS | Accessibility test with `user.tab()` + `{Enter}` |

## Code Quality

- Pattern adherence: Strong — shared rail/pill/hook, centralized `MARKET_FILTER_LABEL_KEYS`, `marketMatchesCategory` shared with market list.
- Complexity: Appropriate for web overflow constraints; `useCategoryRailOverflow` is well documented.
- Type safety: `yarn lint:tsc` pass; casts removed in tests per self-review.
- Error handling: Rail hidden when only `all` would show after load (`categories.length <= 1`).
- Accessibility/fallbacks: `role="group"`, `aria-label`, `aria-pressed` only when clearable; skeleton reserves `h-8` footprint.
- Anti-pattern findings: No import-boundary violations observed. `FilterSelect` removed but `test/e2e/page-objects/pages/perps/perps-market-list-page.ts` still references `filter-select-button` (pre-existing E2E drift, outside this diff).

## Fix Quality

- **Best approach:** Overflow menu over horizontal scroll is the better web fix and matches reviewer intent. Ideal long-term: design-system `ButtonFilterGroup` when available.
- **Would not ship:** Merging without updating PR manual testing / validation recipe — reviewers and QA will follow stale steps.
- **Test quality:** Good — explicit skeleton count/height, overflow geometry mocked in rail tests, navigation and analytics covered. Keyboard test uses a fixed double-Tab focus path (brittle if tab order changes).
- **Brittleness:** `useCategoryRailOverflow` depends on `ResizeObserver` and layout measurement; jsdom tests mock geometry explicitly (good).

## Live Validation

- Recipe: existed (inherited, seeded) — **not re-run** (static-code contract)
- Result: SKIPPED live; inherited parent pass **not valid** for HEAD
- Evidence: 0 new screenshots; inherited manifest lists 3 PNGs from parent run (pre-redesign)
- Webpack errors: not checked (static review)
- Log monitoring: skipped (static review)

## Correctness

- Diff vs stated goal: **Partially misaligned on wording** — functionally delivers category shortcuts; horizontal scroll claim in PR body is false on HEAD.
- Edge cases: Empty markets hide rail; categories with no live markets omitted; active filter promoted to visible row on market list.
- Race conditions: None identified in category derivation (memoized from markets prop).
- Backward compatibility: Deeplinks `?filter=crypto` preserved; E2E selectors for old filter dropdown may break.

## Static Analysis

- lint:tsc: PASS
- Tests: 90/90 pass on affected suites

## Mobile Comparison

- Status: ALIGNED (behavioral intent)
- Details: Mobile Products rail uses horizontal scroll (gesture-native); Extension deliberately diverges with overflow menu per web a11y — documented in `PerpsCategoryRail`. Category derivation mirrors mobile's live-data gating.

## Architecture & Domain

- MV3: UI-only; no controller changes.
- LavaMoat: no dependency changes.
- Import boundaries: `Dropdown` promoted to shared perps component.
- Scope note: Market list header rework ships in the same PR — broader than ticket text but consistent with shared rail pattern.

## Risk Assessment

- **MEDIUM** — Touches primary Perps discovery; documentation/recipe drift creates merge risk if QA follows stale manual steps. Code and unit tests look solid.

## Recommended Action

**COMMENT**

1. Update PR description and manual testing steps to describe **More-menu overflow** (not horizontal scroll) and **category rail on market list** (not filter dropdown).
2. Refresh validation recipe selectors before citing 25/25 pass on this branch.
3. Consider a follow-up to update E2E page object `filter-select-button` references.
