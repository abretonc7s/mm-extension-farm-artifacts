# PR Review: #41881 — fix(perps): polish market detail page layout, typography, and icons

**Tier:** standard

## Summary
This PR delivers a batch of UI polish changes to the perps market detail page and related components. All changes are visual-only: sentence case for labels and buttons, icon size reductions, layout alignment adjustments, hover effects, and replacing "See All" text with an arrow icon. The `perpsSeeAll` i18n key is cleanly removed from all 16 locale files. The PR also switches to `formatSignedChangePercent` for explicit +/- prefix on 24h change display. All changes achieve their stated goals.

## Recipe Coverage

| # | AC (verbatim) | Target env | Recipe nodes (IDs) | Screenshot filename | Visual verdict | Justification |
|---|---------------|------------|---------------------|---------------------|----------------|---------------|
| 1 | "Market symbol header uses HeadingMd typography" | fullscreen | ac1-check-heading-md, ac1-screenshot-heading | evidence-ac1-heading-md.png | PROVEN | H3 tag confirmed in DOM eval; screenshot shows larger "ETH-USD" heading |
| 2 | "Stats labels use sentence case" | fullscreen | ac2-check-sentence-case, ac2-screenshot-stats | evidence-ac2-sentence-case-stats.png | PROVEN | DOM text confirmed: "Open interest", "Funding rate", "Oracle price", "Recent activity" all sentence case |
| 3 | "Action button text uses sentence case" | fullscreen | ac3-check-submit-text, ac3-screenshot-order-entry | evidence-ac3-ac8-order-entry.png | PROVEN | Button text matches `^Open (long\|short)` regex; screenshot shows "Open long ETH" |
| 4 | "Info tooltip icons reduced to Xs (12px)" | fullscreen | ac4-check-info-icon-size, ac4-screenshot-icons | evidence-ac4-info-icons.png | PROVEN | DOM eval captured icon bounding rects; small info circles visible |
| 5 | "See All replaced with arrow icon" | fullscreen | ac5-check-arrow-icon, ac5-screenshot-arrow | evidence-ac5-arrow-icon.png | PROVEN | SVG present, no text content; arrow visible next to "Recent activity" |
| 6 | "Candle period selector left-aligned" | fullscreen | ac6-check-left-align, ac6-screenshot-candle | evidence-ac6-candle-left-aligned.png | PROVEN | justifyContent != "center"; buttons aligned left in screenshot |
| 7 | "Position/Orders sections bottom padding removed" | fullscreen | (none) | (none) | UNTESTABLE | No open position or orders in current wallet state |
| 8 | "Order entry submit button reduced from Lg to Md" | fullscreen | ac8-check-button-size, ac3-screenshot-order-entry | evidence-ac3-ac8-order-entry.png | PROVEN | Button height recorded; medium-sized button visible |
| 9 | "Favorite star has 1.1x scale hover effect" | fullscreen | ac9-check-hover-class, ac9-screenshot-star | evidence-ac9-favorite-star.png | PROVEN | `hover:scale-110` class confirmed on favorite button |
| 10 | "Change percentage uses BodySm with +/- prefix" | fullscreen | ac10-check-change-display, ac10-eval-change-format, ac10-screenshot-change | evidence-ac10-change-percentage.png | PROVEN | Text matches `^[+-]` regex; "+0.31%" visible |

Overall recipe coverage: 9/10 ACs PROVEN
Untestable: AC7 — no open position in wallet state; padding removal verified in code diff (trivial one-prop change)

## Prior Reviews

| Reviewer | State | Date | Addressed? | Notes |
|----------|-------|------|------------|-------|
| cursor | COMMENTED | 2026-04-17 | N/A | Automated Cursor Bugbot review — informational only |

No CHANGES_REQUESTED reviews.

## Acceptance Criteria Validation
| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | HeadingMd for market symbol | PASS | ac1-check-heading-md: H3 tag, text "ETH-USD" |
| 2 | Sentence case stats labels | PASS | ac2-check-sentence-case: all labels confirmed |
| 3 | Sentence case button text | PASS | ac3-check-submit-text: "Open long ETH" |
| 4 | Info icons Xs (12px) | PASS | ac4-check-info-icon-size: DOM sizes captured |
| 5 | Arrow icon replaces See All | PASS | ac5-check-arrow-icon: SVG present, no text |
| 6 | Candle selector left-aligned | PASS | ac6-check-left-align: justifyContent != center |
| 7 | Position/Orders padding removed | SKIPPED | No position in wallet state; code review confirms trivial change |
| 8 | Submit button Lg to Md | PASS | ac8-check-button-size: height recorded |
| 9 | Hover scale on star | PASS | ac9-check-hover-class: hover:scale-110 class present |
| 10 | Change % with +/- prefix | PASS | ac10-eval-change-format: regex match confirmed |

## Code Quality
- Pattern adherence: follows codebase conventions — uses design-system-react components, i18n for text, data-testid for test hooks
- Complexity: appropriate — minimal prop changes, no over-engineering
- Type safety: no type issues (lint:tsc passes clean)
- Error handling: N/A — no new logic paths
- Anti-pattern findings: none — no import boundary violations, no missing LavaMoat updates, no hardcoded values, no missing data-testids

## Fix Quality
- **Best approach:** Yes — sentence case changes at i18n level (correct place), UI prop changes are direct and minimal. `formatSignedChangePercent` is the right abstraction for signed display.
- **Would not ship:** Nothing — all changes are straightforward.
- **Test quality:** Tests properly updated to match new text values. `perpsSeeAll` removal tested via data-testid selector switch (more robust than text matching).
- **Brittleness:** No concerns — standard i18n and component prop changes.

## Live Validation
- Recipe: generated
- Result: PASS — 26/26 nodes passed (trace-verified)
- Evidence: 8 AC-bound screenshots
- Webpack errors: none
- Log monitoring: webpack build complete, no errors

## Correctness
- Diff vs stated goal: aligned — all stated changes are implemented
- Edge cases: covered — `formatSignedChangePercent` handles empty strings, already-signed values, zero values
- Race conditions: none
- Backward compatibility: preserved — no API or state shape changes

## Static Analysis
- lint:tsc: PASS — 0 errors
- Tests: 181/181 pass across 4 test suites

## Mobile Comparison
- Status: ALIGNED
- Details: Mobile uses `formatPercentage` for change display; extension now uses `formatSignedChangePercent` which similarly ensures +/- prefix. Sentence case and icon sizing are extension-specific design decisions, no mobile divergence concern. No new `.toFixed(2)` or `{min:2, max:2}` formatting introduced.

## Architecture & Domain
- No MV3 implications — purely UI changes
- No LavaMoat impact — no dependency changes
- Import boundaries respected — all changes within ui/ perps components
- No controller changes — no state migrations needed
- `perpsSeeAll` i18n key cleanly removed from all 16 locale files

## Risk Assessment
- [LOW] — UI-only changes (text case, icon sizes, padding, hover effects). No business logic, state, or data flow modifications.

## Recommended Action
APPROVE
Clean UI polish PR with thorough test updates and no code quality concerns.
