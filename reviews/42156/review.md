# PR Review: #42156 — feat(perps): add Clear buttons for TP/SL inputs in order entry

**Tier:** full

## Summary
This PR adds TP and SL Clear buttons in the perps order-entry Auto Close panel, keeps those buttons hidden when the corresponding field is empty, and preserves the estimated P&L label/value on the right side of the same row. The implementation matches the stated goal and live validation proved the main user flows.

## Recipe Coverage
| # | AC (verbatim) | Target env | Recipe nodes (IDs) | Screenshot filename | Visual verdict | Justification |
|---|---------------|------------|---------------------|---------------------|----------------|---------------|
| 1 | "Given I am on the perps order entry page with Auto Close enabled; When I enter a value in the Take Profit price or percent field; Then a \"Clear\" button appears on the left below the Take Profit inputs; And the \"Est. P&L at take profit\" label and value appear on the right" | fullscreen | ac1-enter-tp-price, ac1-wait-tp-clear, ac1-assert-tp-clear-layout, ac1-scroll-tp-clear-layout, ac1-screenshot-tp-clear-layout | evidence-ac1-tp-clear-layout.png | PROVEN | Screenshot shows TP price populated, Clear below the TP inputs on the left, and estimated take-profit P&L label/value on the right; bounding-box assertion confirmed clearLeftOfPnl and sameRow. |
| 2 | "Given the Take Profit field has a value and the Clear button is visible; When I click the \"Clear\" button below Take Profit; Then the Take Profit price and percent fields are reset to empty; And the Clear button disappears" | fullscreen | ac2-click-tp-clear, ac2-wait-tp-cleared, ac2-assert-tp-cleared, ac2-screenshot-tp-cleared | evidence-ac2-tp-cleared.png | PROVEN | Trace shows the TP Clear click passed; assertion confirmed empty TP price/percent fields and hidden TP Clear button; screenshot shows the cleared TP inputs. |
| 3 | "Given I am on the perps order entry page with Auto Close enabled; When I enter a value in the Stop Loss price or percent field; Then a \"Clear\" button appears on the left below the Stop Loss inputs; And the \"Est. P&L at stop loss\" label and value appear on the right" | fullscreen | ac3-enter-sl-price, ac3-wait-sl-clear, ac3-assert-sl-clear-layout, ac3-scroll-sl-clear-layout, ac3-screenshot-sl-clear-layout | evidence-ac3-sl-clear-layout.png | PROVEN | Screenshot shows SL price populated, Clear below the SL inputs on the left, and estimated stop-loss P&L label/value on the right; bounding-box assertion confirmed clearLeftOfPnl and sameRow. |
| 4 | "Given the Stop Loss field has a value and the Clear button is visible; When I click the \"Clear\" button below Stop Loss; Then the Stop Loss price and percent fields are reset to empty; And the Clear button disappears" | fullscreen | ac4-click-sl-clear, ac4-wait-sl-cleared, ac4-assert-sl-cleared, ac4-screenshot-sl-cleared | evidence-ac4-sl-cleared.png | PROVEN | Trace shows the SL Clear click passed; assertion confirmed empty SL price/percent fields and hidden SL Clear button; screenshot shows the cleared SL inputs. |
| 5 | "Given the Take Profit or Stop Loss field is empty; Then no \"Clear\" button is shown for that section" | fullscreen | ac5-assert-clear-hidden-initially, ac5-screenshot-empty-auto-close, ac5-assert-clear-hidden-after-clears, ac5-screenshot-clear-hidden-final | evidence-ac5-empty-auto-close.png, evidence-ac5-clear-hidden-final.png | PROVEN | Assertions and screenshots cover both the initial empty Auto Close state and the post-clear state with no TP or SL Clear buttons visible. |

Overall recipe coverage: 5/5 ACs PROVEN
Untestable: none

## Prior Reviews
| Reviewer | State | Date | Addressed? | Notes |
|----------|-------|------|------------|-------|
| geositta | APPROVED | 2026-04-27T20:56:18Z | N/A | No CHANGES_REQUESTED reviews were present. |

## Acceptance Criteria Validation
| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | TP Clear appears on the left and TP estimated P&L appears on the right after TP has a value | PASS | ac1-* nodes passed; `evidence-ac1-tp-clear-layout.png`; bounding-box assertion passed |
| 2 | TP Clear resets TP price/percent and disappears | PASS | ac2-* nodes passed; `evidence-ac2-tp-cleared.png` |
| 3 | SL Clear appears on the left and SL estimated P&L appears on the right after SL has a value | PASS | ac3-* nodes passed; `evidence-ac3-sl-clear-layout.png`; bounding-box assertion passed |
| 4 | SL Clear resets SL price/percent and disappears | PASS | ac4-* nodes passed; `evidence-ac4-sl-cleared.png` |
| 5 | Clear is hidden for empty TP/SL fields | PASS | ac5-* nodes passed; `evidence-ac5-empty-auto-close.png`, `evidence-ac5-clear-hidden-final.png` |

## Code Quality
- Pattern adherence: follows existing functional React/component-library patterns and uses existing i18n key `clear`.
- Complexity: appropriate; localized conditional rendering and callbacks.
- Type safety: no new type issues from `yarn lint:tsc`.
- Error handling: not applicable for this UI-only state reset.
- Anti-pattern findings: none. No import-boundary, LavaMoat, MV3, controller, state-migration, or missing-test-id concerns.

## Fix Quality
- **Best approach:** pragmatic and minimal for this PR. The buttons reuse existing TP/SL state callbacks and keep derived percentages empty through existing derived-state logic.
- **Would not ship:** none.
- **Test quality:** unit tests cover TP/SL button visibility and click callbacks, including empty and whitespace-only values. Browser recipe covers the visual layout that unit tests do not.
- **Brittleness:** low. No import-time state, module-level runtime coupling, or mock-only behavior introduced.

## Live Validation
- Recipe: generated
- Result: PASS, 29/29 executable nodes passed plus teardown
- Evidence: 7 screenshots; video skipped because `review.mp4` was not produced after recorder shutdown
- Webpack errors: none observed
- Log monitoring: recipe issue review captured 0 warnings, 0 errors, 0 exceptions

## Correctness
- Diff vs stated goal: aligned.
- Edge cases: empty and whitespace-only field values covered by unit tests; empty initial and post-clear states covered in browser.
- Race conditions: none identified.
- Backward compatibility: preserved; no state shape, controller, dependency, or routing changes.

## Static Analysis
- lint:tsc: PASS
- Tests: 44/44 pass for `auto-close-section.test.tsx`

## Mobile Comparison
- Status: ALIGNED
- Details: mobile TP/SL clear handlers clear price, percentage, selected preset, and source-of-truth state; extension has less local state but the PR clears the canonical price value and the derived percent resets accordingly. No new formatting divergence was introduced; P&L uses existing `formatPerpsFiat`.

## Architecture & Domain
UI-only change in `ui/components/app/perps`. No MV3 service-worker implications, no LavaMoat impact, no controller/storage changes, and no feature-flag drift beyond the existing perps surface.

## Risk Assessment
- LOW — localized UI rendering/change-handler addition with unit coverage and live browser validation across all stated ACs.

## Recommended Action
APPROVE
