# PR Review: #41705 — fix: Close position calculation

**Tier:** standard

## Summary
This PR fixes the perps close-position modal so the displayed "You'll receive" amount no longer double-counts unrealized PnL and now uses the same rounded-component arithmetic as mobile. The browser validation and the code diff both support the stated goal, and I did not find a correctness issue in the implementation.

## Recipe Coverage
| # | AC (verbatim) | Target env | Recipe nodes (IDs) | Screenshot filename | Visual verdict | Justification |
|---|---------------|------------|---------------------|---------------------|----------------|---------------|
| 1 | "Fixed \"You'll receive\" in the close-position modal double-counting unrealized PnL." | fullscreen | ac1-assert-no-double-count, ac1-screenshot-no-double-count | evidence-ac1-no-double-count.png | PROVEN | The screenshot shows Margin `$4.15`, `includes P&L +$0.83`, Fees `-$0.02`, and You'll receive `$4.13`. `trace.json` records `roundedMargin=4.15`, `roundedPnl=0.83`, `displayedReceive=4.13`, `doubleCountedReceive=4.96`, `noDoubleCount=true`, and `doubleCounted=false`, which directly proves the modal does not add PnL on top of `marginUsed`. |
| 2 | "Aligned the formula with mobile: round2(margin) - round2(fees)." | fullscreen | ac2-assert-mobile-formula, ac2-screenshot-mobile-formula | evidence-ac2-mobile-formula.png | PROVEN | The screenshot visibly shows the rounded component values used by the formula: Margin `$4.15`, Fees `-$0.02`, Receive `$4.13`. `trace.json` records `roundedMargin=4.15`, `displayedFees=0.02`, `mobileFormulaReceive=4.13`, and `matchesMobileFormula=true`, confirming the extension now matches the mobile formula. |
| 3 | "with per-component rounding so the displayed breakdown is additive." | fullscreen | ac3-assert-additive-breakdown, ac3-screenshot-additive-breakdown | evidence-ac3-additive-breakdown.png | PROVEN | The screenshot shows an additive breakdown in the modal: `$4.15 - $0.02 = $4.13`. `trace.json` records `displayedMargin=4.15`, `displayedFees=0.02`, `displayedReceive=4.13`, `expectedReceive=4.13`, and `additiveBreakdown=true`, so the displayed rows and receive amount agree after per-component rounding. |

Overall recipe coverage: 3/3 ACs PROVEN
Untestable: none

## Prior Reviews
| Reviewer | State | Date | Addressed? | Notes |
|----------|-------|------|------------|-------|
| cursor | COMMENTED | 2026-04-13T21:06:16Z | N/A | No `CHANGES_REQUESTED` state. |
| gambinish | COMMENTED | 2026-04-13T21:23:15Z | N/A | No `CHANGES_REQUESTED` state. |
| gambinish | COMMENTED | 2026-04-13T21:23:21Z | N/A | No `CHANGES_REQUESTED` state. |
| geositta | APPROVED | 2026-04-14T00:49:28Z | N/A | Approval after the latest PR commit. |

No `CHANGES_REQUESTED` prior reviews were present.

## Acceptance Criteria Validation
| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Fixed "You'll receive" in the close-position modal double-counting unrealized PnL. | PASS | `ac1-assert-no-double-count` + `evidence-ac1-no-double-count.png` |
| 2 | Aligned the formula with mobile: round2(margin) - round2(fees). | PASS | `ac2-assert-mobile-formula` + `evidence-ac2-mobile-formula.png` |
| 3 | with per-component rounding so the displayed breakdown is additive. | PASS | `ac3-assert-additive-breakdown` + `evidence-ac3-additive-breakdown.png` |

## Code Quality
- Pattern adherence: Follows existing perps modal patterns and improves testability by adding stable `data-testid` hooks to the rendered summary values.
- Complexity: Appropriate for the scope. The implementation is a small, localized arithmetic fix in [close-position-modal.tsx](/Users/deeeed/dev/metamask/metamask-extension-1/ui/components/app/perps/close-position/close-position-modal.tsx:326).
- Type safety: No new type issues in the changed files. `yarn lint:tsc` still fails on unrelated repo-wide errors in `app/scripts/controllers/app-state-controller.ts(1485,7)` and `app/scripts/controllers/metametrics-controller.ts(661,7)`.
- Error handling: Unchanged and still adequate for this path.
- Anti-pattern findings: No import-boundary, MV3, LavaMoat, migration, or missing-`data-testid` issues in the PR diff.

## Fix Quality
- **Best approach:** This is the right pragmatic fix and also matches the longer-term mobile behavior. The cent-rounding and `marginUsed` semantics in [close-position-modal.tsx](/Users/deeeed/dev/metamask/metamask-extension-1/ui/components/app/perps/close-position/close-position-modal.tsx:326) line up with mobile's `PerpsClosePositionView.tsx` receive calculation at lines 283-290.
- **Would not ship:** None.
- **Test quality:** The new regression in [close-position-modal.test.tsx](/Users/deeeed/dev/metamask/metamask-extension-1/ui/components/app/perps/close-position/close-position-modal.test.tsx:590) correctly locks the PnL regression and the additive relationship between displayed rows. The remaining gap is that the chosen fixture does not specifically exercise a half-cent rounding boundary, so it would not catch a revert of `roundedFees`/`roundedMargin` if the final formatted receive still lands on the same cent.
- **Brittleness:** Low. The change stays inside render-time memoized values and does not introduce import-time or stateful coupling.

## Live Validation
- Recipe: generated
- Result: PASS with trace-derived execution count `7/7` (`ac1`, `ac2`, `ac3` assertion/screenshot pairs plus teardown).
- Evidence: 5 screenshots (`baseline-before-validation.png`, `evidence-ac1-no-double-count.png`, `evidence-ac2-mobile-formula.png`, `evidence-ac3-additive-breakdown.png`, `final-after-validation.png`)
- Webpack errors: none observed during validation
- Log monitoring: 30 seconds monitored; no new runtime failures, only existing webpack build/deprecation log lines

## Correctness
- Diff vs stated goal: aligned
- Edge cases: Covered for a live fullscreen close modal with an initialized ETH position and a positive PnL value. Not specifically re-verified for a cent-boundary rounding fixture or for a negative/zero receive clamp scenario.
- Race conditions: None apparent in the changed logic.
- Backward compatibility: Preserved. This is a local display-calculation change with no API or controller contract changes.

## Static Analysis
- lint:tsc: FAIL — 2 unrelated repo-wide errors (`app-state-controller.ts` unused `@ts-expect-error`, `metametrics-controller.ts` deep type instantiation)
- Tests: 18/18 pass in `ui/components/app/perps/close-position/close-position-modal.test.tsx`

## Mobile Comparison
- Status: ALIGNED
- Details: Mobile's `PerpsClosePositionView.tsx` computes receive as rounded margin minus rounded fees and explicitly treats `marginUsed` as already PnL-inclusive. The extension diff now matches that behavior and adds equivalent verification for the rendered breakdown.

## Architecture & Domain
This PR stays entirely in the UI layer. There is no MV3 service-worker behavior change, no controller/state-shape change, no new dependency, and no LavaMoat impact. The added `data-testid`s improve agentic/browser testability for future close-modal checks.

## Risk Assessment
- MEDIUM — the scope is small and validated, but the output is user-facing financial data in a trading flow.

## Recommended Action
APPROVE

Optional follow-up: strengthen the new test with a fixture that lands on a cent-rounding boundary so the per-component rounding behavior is independently locked, not only the PnL exclusion.
