# PR Review: #42261 — feat(perps): add editable close-amount USD input and normalize UI labels

**Tier:** standard

## Summary
The PR mostly implements the editable close-amount input, slider sync, lowercase candle labels, locale casing, and larger warning icon. One stated acceptance criterion is not met: the blurred close amount display cannot format with commas because it uses the no-grouping input formatter.

## Recipe Coverage
| # | AC (verbatim) | Target env | Recipe nodes (IDs) | Screenshot filename | Visual verdict | Justification |
|---|---------------|------------|---------------------|---------------------|----------------|---------------|
| 1 | "The close amount field is an editable text input prefixed with "$"." | fullscreen | ac1-assert-usd-input, ac1-screenshot-usd-input | evidence-ac1-usd-input-1777540705169.png | PROVEN | Trace confirms an HTML input, `$` prefix text, and decimal input mode; screenshot shows the close amount input prefixed by `$`. |
| 2 | "When the user types a USD value (e.g. "500"), the slider percentage updates to match the entered amount." | fullscreen | ac2-select-close-usd, ac2-set-close-usd, ac2-assert-slider-sync, ac2-screenshot-slider-sync | evidence-ac2-slider-sync-1777540705448.png | PROVEN | Trace shows typed value `5`, expected percent `48.92367906066536`, slider value `48.92607270414403`, and `matches: true`; screenshot shows the slider moved and chip rounded to 49%. |
| 3 | "When the input loses focus, the value formats with commas." | fullscreen | none | none | UNTESTABLE | Live slot balance only supports an approximately $10 test position, so it cannot create a >= $1,000 close amount where comma grouping is visible. Code review separately validates this formatter path. |
| 4 | "Period labels for days, weeks, and months display as "1d", "3d", "1w", "1m"." | fullscreen | ac4-open-candle-selector, ac4-wait-candle-modal, ac4-assert-lowercase-labels, ac4-screenshot-lowercase-labels | evidence-ac4-candle-labels-1777540706349.png | PROVEN | Trace confirms modal labels exactly `1d`, `3d`, `1w`, and `1m`; screenshot shows the Days section with lowercase labels. |
| 5 | "The warning icon renders at medium size and does not shrink." | fullscreen | ac5-select-close-usd, ac5-set-below-min, ac5-probe-warning-icon, ac5-assert-warning-icon, ac5-screenshot-warning-icon | evidence-ac5-warning-icon-1777540705690.png | PROVEN | Trace confirms warning text is present, icon has `shrink-0`, and icon dimensions are 20x20; screenshot shows the warning icon and message in the close modal. |

Overall recipe coverage: 4/5 ACs PROVEN
Untestable: AC3 — live slot cannot create comma-level close notional; code review found the formatter path does not satisfy the comma requirement.

> ⚠ Coverage escalation: AC3 not proven in browser.
> Reason: current slot balance cannot create a >= $1,000 close-position notional. Code review shows the blurred value uses a no-grouping formatter.
> Human reviewer must validate manually before merging if the implementation changes.

## Prior Reviews
No prior CHANGES_REQUESTED reviews. Existing reviews were COMMENTED only.

## Acceptance Criteria Validation
| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Editable text input prefixed with `$` | PASS | `ac1-assert-usd-input` + `evidence-ac1-usd-input-1777540705169.png` |
| 2 | Typed USD amount updates slider percentage | PASS | `ac2-assert-slider-sync` + `evidence-ac2-slider-sync-1777540705448.png` |
| 3 | Blur formats value with commas | FAIL | Code path uses `formatNumberForInput`, which disables grouping; CDP formatter probe returned `56250`, not `56,250`. |
| 4 | Candle period day/week/month labels are lowercase | PASS | `ac4-assert-lowercase-labels` + `evidence-ac4-candle-labels-1777540706349.png` |
| 5 | Partial-close warning icon is medium and does not shrink | PASS | `ac5-assert-warning-icon` + `evidence-ac5-warning-icon-1777540705690.png` |

## Code Quality
- Pattern adherence: mostly follows existing perps component patterns and uses stable test IDs.
- Complexity: appropriate for the requested editable input.
- Type safety: `yarn lint:tsc` passed.
- Error handling: unchanged and adequate for this UI layer.
- Anti-pattern findings: no dependency/LavaMoat changes, no controller/migration changes, no `chrome.runtime.getBackgroundPage()` usage, and interactive UI has test IDs.

## Fix Quality
- **Best approach:** keep raw, ungrouped input while focused, but use a grouped display formatter when blurred if comma formatting is a required acceptance criterion.
- **Would not ship:** `ui/components/app/perps/order-entry/components/close-amount-section/close-amount-section.tsx:62` blocks the stated comma-formatting behavior.
- **Test quality:** affected tests pass, but the close amount assertions use optional commas (`/56,?250/`), so they would pass even when comma formatting is absent.
- **Brittleness:** no import-time or mock-coupling issue found.

## Live Validation
- Recipe: generated
- Result: PASS, final trace `22/22` passed
- Evidence: 4 screenshots, video skipped (standard tier)
- Webpack errors: none observed
- Log monitoring: 30 seconds monitored, no new Webpack output beyond existing build completion/deprecation lines

## Correctness
- Diff vs stated goal: mostly aligned, except blur comma formatting.
- Edge cases: comma formatting for >= $1,000 close values is uncovered and currently unsupported.
- Race conditions: none found.
- Backward compatibility: preserved for close flow, candle period values, and warning modal behavior.

## Static Analysis
- lint:tsc: PASS
- Tests: 86/86 pass (`close-amount-section.test.tsx`, `perps-market-detail-page.test.tsx`)

## Mobile Comparison
- Status: ALIGNED
- Details: mobile close-position input also keeps raw USD strings and `formatCloseAmountUSD` returns ungrouped fixed-decimal strings. That means mobile does not provide a comma-formatting precedent; the requested comma behavior needs an explicit extension implementation and test.

## Architecture & Domain
No MV3, LavaMoat, controller, state migration, or import-boundary concerns. The recipe had to wait on visible modal controls instead of modal wrapper test IDs because the wrappers remain mounted while hidden.

## Risk Assessment
- MEDIUM — the main close-position behavior works, but one user-visible formatting AC is not implemented and the updated tests are too permissive to catch it.

## Recommended Action
REQUEST_CHANGES

Fix the blurred close amount display so values requiring grouping render with commas, and update tests so they require the comma-formatted result instead of accepting both grouped and ungrouped values.
