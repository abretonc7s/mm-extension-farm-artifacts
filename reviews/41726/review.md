# PR Review: #41726 — fix(perps): polish order entry, leverage slider, market detail, and onboarding UI

**Tier:** standard

## Summary
The PR delivers the stated perps polish updates across order entry, market detail, recent activity, balance dropdown, explore markets, and tutorial copy. I did not find any PR-specific correctness regressions in the changed files, and the browser validation passed across all enumerated acceptance criteria.

## Recipe Coverage
| # | AC (verbatim) | Target env | Recipe nodes (IDs) | Screenshot filename | Visual verdict | Justification |
|---|---|---|---|---|---|---|
| 1 | "Order entry shows `Available to trade` above `Size`, displays the balance as a plain number with `USDC`, and uses the alternative add-funds icon color." | fullscreen | `ac1-open-order-entry`, `ac1-assert-order-entry`, `ac1-screenshot-order-entry` | `evidence-ac1-order-entry-available-to-trade.png` | PROVEN | Screenshot shows `Available to trade` above `Size` with `25.30 USDC`; trace records `balanceText:"25.30 USDC"`, `availableTop:174 < sizeTop:208`, and add-funds icon color matching the alternative token. |
| 2 | "The leverage slider uses a smaller thumb, shows tick marks, and renders min/max leverage labels below the track." | fullscreen | `ac2-assert-leverage-slider`, `ac2-screenshot-leverage-slider` | `evidence-ac2-leverage-slider.png` | PROVEN | Screenshot shows the smaller thumb, five tick marks, and `1x` / `25x` labels beneath the track; trace records `marks:5`, `thumbWidth:16`, and `labelsBelow:["1x","25x"]`. |
| 3 | "Long/Short direction tabs fill the container evenly." | fullscreen | `ac3-assert-direction-tabs`, `ac3-screenshot-direction-tabs` | `evidence-ac3-direction-tabs.png` | PROVEN | Screenshot shows equal-width pills spanning the segmented control; trace records `longWidth:229`, `shortWidth:229`, and only `remaining:10` px inside the container. |
| 4 | "Market detail info icons next to Open Interest, Funding Rate, and Oracle Price use the lighter unfilled info icon with tooltips." | fullscreen | `gate-nav-market-detail`, `ac4-assert-market-detail-tooltips`, `ac4-screenshot-market-detail-tooltips` | `evidence-ac4-market-detail-tooltips.png` | PROVEN | Screenshot visibly shows the three unfilled info icons beside Open Interest, Funding Rate, and Oracle Price; trace records `iconCount:3` and `legacyInfoTooltipCount:0`, confirming the old `InfoTooltip` wrapper is gone. |
| 5 | "Recent Activity cards use the updated spacing and show top-border dividers between cards." | fullscreen | `gate-scroll-recent-activity`, `ac5-assert-recent-activity`, `ac5-screenshot-recent-activity` | `evidence-ac5-recent-activity.png` | PROVEN | Screenshot shows the stacked Recent Activity cards with visible dividers between rows; trace records `count:3` and `borders:["0px","1px","1px"]`, matching first-card/no-border and subsequent-card/top-border behavior. |
| 6 | "The balance dropdown uses a smaller chevron and the P&L row no longer shows a border gap/overlap." | fullscreen | `gate-open-balance-dropdown`, `gate-wait-balance-dropdown`, `ac6-assert-balance-dropdown`, `ac6-screenshot-balance-dropdown` | `evidence-ac6-balance-dropdown.png` | PROVEN | Screenshot shows the open dropdown with the smaller chevron and a flush join between the balance row and Unrealized P&L row; trace records `chevronHeight:12` and `rowGap:1`. |
| 7 | "The Explore markets header button has no rounded corners." | fullscreen | `gate-scroll-explore-markets`, `ac7-assert-explore-markets`, `ac7-screenshot-explore-markets` | `evidence-ac7-explore-markets.png` | PROVEN | Screenshot shows the Explore markets header row with square corners; trace records all four radii as `0px`. |
| 8 | "The onboarding tutorial `What are perps` description uses em-dashes." | fullscreen | `gate-open-tutorial`, `ac8-wait-tutorial`, `ac8-assert-tutorial-em-dashes`, `ac8-screenshot-tutorial` | `evidence-ac8-tutorial-em-dashes.png` | PROVEN | Screenshot clearly shows `MetaMask now supports perpetual futures — aka perps — ...`; trace records the same em-dash text in the tutorial body. |
| 9 | "Perps onboarding/balance copy uses `Total balance` casing." | fullscreen | `gate-nav-perps-home-again`, `ac9-assert-total-balance-copy`, `ac9-screenshot-total-balance-copy` | `evidence-ac9-total-balance-copy.png` | PROVEN | Screenshot shows `Total balance` in the perps balance row; trace records `label:"Total balance"`. |

Overall recipe coverage: 9/9 ACs PROVEN
Untestable: none

## Prior Reviews
No prior reviews.

## Acceptance Criteria Validation
| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Order entry shows `Available to trade` above `Size`, displays the balance as a plain number with `USDC`, and uses the alternative add-funds icon color. | PASS | `ac1-assert-order-entry` + `evidence-ac1-order-entry-available-to-trade.png` |
| 2 | The leverage slider uses a smaller thumb, shows tick marks, and renders min/max leverage labels below the track. | PASS | `ac2-assert-leverage-slider` + `evidence-ac2-leverage-slider.png` |
| 3 | Long/Short direction tabs fill the container evenly. | PASS | `ac3-assert-direction-tabs` + `evidence-ac3-direction-tabs.png` |
| 4 | Market detail info icons next to Open Interest, Funding Rate, and Oracle Price use the lighter unfilled info icon with tooltips. | PASS | `ac4-assert-market-detail-tooltips` + `evidence-ac4-market-detail-tooltips.png` |
| 5 | Recent Activity cards use the updated spacing and show top-border dividers between cards. | PASS | `ac5-assert-recent-activity` + `evidence-ac5-recent-activity.png` |
| 6 | The balance dropdown uses a smaller chevron and the P&L row no longer shows a border gap/overlap. | PASS | `ac6-assert-balance-dropdown` + `evidence-ac6-balance-dropdown.png` |
| 7 | The Explore markets header button has no rounded corners. | PASS | `ac7-assert-explore-markets` + `evidence-ac7-explore-markets.png` |
| 8 | The onboarding tutorial `What are perps` description uses em-dashes. | PASS | `ac8-assert-tutorial-em-dashes` + `evidence-ac8-tutorial-em-dashes.png` |
| 9 | Perps onboarding/balance copy uses `Total balance` casing. | PASS | `ac9-assert-total-balance-copy` + `evidence-ac9-total-balance-copy.png` |

## Code Quality
- Pattern adherence: follows existing perps component/page patterns and keeps the changes localized to UI surfaces.
- Complexity: appropriate for a UI-polish batch; no unnecessary abstraction added.
- Type safety: no PR-specific type issues found in changed files. Repo-wide `lint:tsc` currently fails in unrelated files: `app/scripts/controllers/app-state-controller.ts(1485,7)` and `app/scripts/controllers/metametrics-controller.ts(668,7)`.
- Error handling: adequate for the touched surfaces; no new async/controller paths were introduced.
- Anti-pattern findings: no import-boundary, LavaMoat, MV3, or missing-`data-testid` issues found in the changed files.

## Fix Quality
- **Best approach:** pragmatic and shippable. The changes are narrowly scoped, map directly to the reported polish issues, and avoid unnecessary controller or state-flow churn.
- **Would not ship:** none.
- **Test quality:** one existing order-entry unit test was updated for the new `USDC` plain-number format, and browser validation covered the other visual changes. Residual gap: most of the polish changes remain unguarded by component/unit tests, so visual regressions would be caught primarily by browser/manual validation.
- **Brittleness:** low. The new `markInterval` logic is isolated and optional, and the rest of the changes are styling/copy updates rather than import-time or stateful behavior changes.

## Live Validation
- Recipe: generated
- Result: PASS with trace-derived `38/38` steps passed
- Evidence: 9 AC screenshots + `final-after-validation.png`
- Webpack errors: none observed in `temp/.agent/webpack.log`
- Log monitoring: watcher health checked via `webpack.log`; no separate 30s tail was required on the generated-recipe path

## Correctness
- Diff vs stated goal: aligned
- Edge cases: covered for the targeted fullscreen perps flows; residual risk remains for adjacent visual states not exercised here (for example other markets or alternative account balances)
- Race conditions: none apparent in the changed code
- Backward compatibility: preserved; UI-only changes do not alter controller APIs or persisted data

## Static Analysis
- lint:tsc: FAIL — 2 errors in unrelated files (`app-state-controller.ts`, `metametrics-controller.ts`)
- Tests: 1/1 pass (`ui/components/app/perps/order-entry/order-entry.test.tsx`), no existing targeted tests for the other changed files

## Mobile Comparison
- Status: ALIGNED
- Details: The `Total balance` casing now matches mobile (`PerpsTabControlBar.tsx`), and the unfilled `IconName.Info` / alternative-color tooltip treatment matches mobile’s perps order/detail icon usage. The change does not introduce new perps price-formatting drift such as `.toFixed(2)` in price paths.

## Architecture & Domain
The PR stays within UI components/pages and locale strings. No controller changes, no MV3/service-worker changes, no LavaMoat policy impact, and no new cross-boundary imports were introduced.

## Risk Assessment
- LOW — visual polish only, with live browser evidence across all enumerated ACs

## Recommended Action
COMMENT
No blocking findings. The PR-specific behavior matches the stated goal, browser evidence covers all enumerated acceptance criteria, and the remaining typecheck failures appear unrelated to this diff.
