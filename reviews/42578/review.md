# PR Review: #42578 — fix(perps): adjust market filter modal design to match Figma

**Tier:** standard

## Summary
This PR updates the perps market filter/sort modal and dropdown components to match the Figma design spec. Changes include: renaming the modal title from "Sort" to "Filter", adding "SORT BY" and "RANK" section headers, changing selected state from blue text differentiation to grey background highlight (`bg-hover`), and using consistent `TextDefault` color for all option text. The PR achieves its stated goal cleanly with minimal, focused changes.

## Recipe Coverage

| # | AC (verbatim) | Target env | Recipe nodes (IDs) | Screenshot filename | Visual verdict | Justification |
|---|---------------|------------|---------------------|---------------------|----------------|---------------|
| 1 | "Then the modal title shows 'Filter' centered" | fullscreen | ac1-open-sort-modal, ac1-wait-sort-modal, ac1-assert-modal-open, ac1-assert-title-filter | evidence-ac1-5-sort-modal-design-*.png | PROVEN | Screenshot shows "Filter" title centered in modal header; assertion confirmed text content equals "Filter" |
| 2 | "And the modal displays a 'SORT BY' section header above the sort field options" | fullscreen | ac2-assert-sort-by-header | evidence-ac1-5-sort-modal-design-*.png | PROVEN | Screenshot shows "SORT BY" header above Volume/Price change/etc; assertion confirmed text presence |
| 3 | "And the modal displays a 'RANK' section header above the direction options" | fullscreen | ac3-assert-rank-header | evidence-ac1-5-sort-modal-design-*.png | PROVEN | Screenshot shows "RANK" header above High to low/Low to high; assertion confirmed text presence |
| 4 | "And a border separator divides the two sections" | fullscreen | ac4-assert-border-separator | evidence-ac1-5-sort-modal-design-*.png | PROVEN | Assertion confirmed border-bottom on last sort field option (fundingRate); visually confirmed in screenshot |
| 5 | "Then the selected option has a grey background highlight AND the selected option does not use blue text or accent AND a checkmark icon appears on the selected option" | fullscreen | ac5-assert-selected-bg, ac5-select-different-field, ac5-assert-new-selection-bg | evidence-ac1-5-sort-modal-design-*.png, evidence-ac5-selection-change-*.png | PROVEN | Assertions confirmed bg-hover class on selected item, checkmark SVG present, no blue text. Selection change screenshot shows bg/check moves correctly. |
| 6 | "Then the currently selected filter option has a grey background AND all option text uses the default color" | fullscreen | ac6-assert-filter-selected-bg, ac6-assert-unselected-text-default | evidence-ac6-filter-dropdown-selected-*.png | PROVEN | Screenshot shows "All" selected with grey bg and checkmark; assertion confirmed bg-hover class and aria-selected. Text color assertion confirmed selected and unselected options use same TextDefault color. |

Overall recipe coverage: 6/6 ACs PROVEN
Untestable: none

## Prior Reviews

| Reviewer | State | Date | Addressed? | Notes |
|----------|-------|------|------------|-------|
| gambinish | APPROVED | 2026-05-12 | N/A | Approved |
| aganglada | APPROVED | 2026-05-13 | N/A | Approved |

No CHANGES_REQUESTED reviews.

## Acceptance Criteria Validation

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Modal title shows "Filter" centered | PASS | ac1-assert-title-filter: title eq "Filter"; screenshot confirms centered layout |
| 2 | "SORT BY" section header above sort options | PASS | ac2-assert-sort-by-header: text found in modal; screenshot confirms position |
| 3 | "RANK" section header above direction options | PASS | ac3-assert-rank-header: text found in modal; screenshot confirms position |
| 4 | Border separator between sections | PASS | ac4-assert-border-separator: border-bottom on fundingRate option confirmed |
| 5 | Grey background + no blue text + checkmark on selected | PASS | ac5-assert-selected-bg + ac5-assert-new-selection-bg: bg-hover class, SVG checkmark, TextDefault color confirmed |
| 6 | Filter dropdown grey bg + default text color | PASS | ac6-assert-filter-selected-bg + ac6-assert-unselected-text-default: bg-hover on selected, matching text colors |

## Code Quality
- Pattern adherence: Follows codebase conventions — uses design system components, Tailwind utilities, `useI18nContext` for i18n
- Complexity: Appropriate — minimal changes for the styling update
- Type safety: No type issues. Clean `lint:tsc` pass
- Error handling: N/A — purely UI styling changes
- Anti-pattern findings: None. Uses `!p-0` on ModalBody (sort-dropdown.tsx:123) — standard pattern for overriding component-library defaults

## Fix Quality
- **Best approach:** Yes, this is the minimal correct fix. Uses existing design system tokens (`bg-hover`, `TextDefault`, `FontWeight.Medium`) rather than custom values. The approach of conditional class composition is consistent with the Dropdown component pattern.
- **Would not ship:** Nothing blocking
- **Test quality:** 28 existing unit tests pass. Tests cover the component logic (selection, apply, cancel) but not visual styling specifics, which is appropriate since styling is covered by screenshot evidence.
- **Brittleness:** Low. No magic values, no import-time constants, no mock coupling. Standard Tailwind classes.

## Live Validation
- Recipe: generated (generate-ui)
- Result: PASS — 25/25 nodes passed in 7.9s
- Evidence: 3 screenshots (video skipped: standard tier)
- Webpack errors: none
- Log monitoring: N/A (standard tier)

## Correctness
- Diff vs stated goal: Aligned — all stated changes (title, headers, bg color, text color) implemented correctly
- Edge cases: The `isLast` border logic only applies to the last sort field option, correctly placing the divider only between sections
- Race conditions: None — standard React state management
- Backward compatibility: Preserved — no API changes, locale string additions are backwards-compatible

## Static Analysis
- lint:tsc: PASS — 0 errors
- Tests: 28/28 pass (dropdown + sort-dropdown test suites)

## Mobile Comparison
- Status: DIVERGES (intentional)
- Details: Mobile's `PerpsMarketSortFieldBottomSheet` uses a flat list with direction toggle on selected item and "Sort by" title. Extension uses separate "SORT BY" and "RANK" sections with individual direction options and "Filter" title. This is an intentional design divergence following the extension-specific Figma spec referenced in the PR. The interaction pattern differs but both achieve the same goal of sort field + direction selection.

## Architecture & Domain
- No MV3/service worker implications (UI-only change)
- No LavaMoat impact (no dependency changes)
- Import boundaries preserved — changes stay within `ui/pages/perps/market-list/components/`
- New locale key `perpsSortByRank` added correctly in both en and en_GB

## Risk Assessment
- [LOW] — Purely visual styling changes within existing components. No logic changes, no API changes. 2 human approvals already in place.

## Recommended Action
APPROVE
Clean implementation that achieves its design goals. All 6 review claims validated in browser with assertion + screenshot evidence.
