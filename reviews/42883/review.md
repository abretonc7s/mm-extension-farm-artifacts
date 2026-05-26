# PR Review: #42883 — fix(perps): align Recent activity hover background edge-to-edge

**Tier:** standard

## Summary
The PR applies a focused layout fix for Perps Recent activity headers on wallet home and market detail. It achieves the stated goal: the hover/tappable row spans edge-to-edge while the label and chevron remain inset by 16px.

PR hygiene note: the linked ticket has no numbered acceptance criteria, so this review validates the PR body's explicit manual-testing claims.

## Recipe Coverage
| # | AC (verbatim) | Target env | Recipe nodes (IDs) | Screenshot filename | Visual verdict | Justification |
|---|---------------|------------|---------------------|---------------------|----------------|---------------|
| 1 | "Expected: hover background fills the section edge-to-edge; text/chevron stay inset 16px from edges; vertical padding is symmetric." | fullscreen | ac1-wait-recent-activity, ac1-scroll-recent-activity, ac1-force-hover, ac1-screenshot-perps-tab, ac1-clear-hover | evidence-ac1-perps-tab-hover-1779762026465.png | PROVEN | Screenshot shows the Perps tab Recent activity hover row spanning the full 500px viewport width. Trace raw data confirms btnLeft=0, btnRight=500, parentLeft=0, parentRight=500, leftInset=16, rightInset=16, paddingTop=12px, paddingBottom=12px. |
| 2 | "Expected: hover background spans the section edge-to-edge (no inset stripe); inner button no longer carries inline `paddingLeft: 0` / `paddingRight: 0`; text/icon inset via `px-4`." | fullscreen | ac2-wait-recent-activity, ac2-scroll-recent-activity, ac2-force-hover, ac2-screenshot-market-detail | evidence-ac2-market-detail-hover-1779762026926.png | PROVEN | Screenshot shows the market-detail Recent activity hover row edge-to-edge above the padded transaction list. Trace raw data confirms btnLeft=0, btnRight=500, parentLeft=0, parentRight=500, inlinePadL=null, inlinePadR=null, leftInset=16, rightInset=16. |

Overall recipe coverage: 2/2 ACs PROVEN
Untestable: none

## Prior Reviews
No prior changes-requested reviews. One approval from `aganglada` on 2026-05-25T13:30:02Z.

## Acceptance Criteria Validation
| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Perps tab hover row is edge-to-edge with 16px text/icon inset and symmetric vertical padding | PASS | `ac1-force-hover` assertion and `evidence-ac1-perps-tab-hover-1779762026465.png` |
| 2 | Market-detail hover row is edge-to-edge with no inline zero-padding override and 16px text/icon inset | PASS | `ac2-force-hover` assertion and `evidence-ac2-market-detail-hover-1779762026926.png` |

## Code Quality
- Pattern adherence: follows existing React functional component and design-system patterns.
- Complexity: appropriate; layout-only change without new abstractions.
- Type safety: `yarn lint:tsc` passed.
- Error handling: not applicable; no data or async logic changed.
- Anti-pattern findings: none. No dependency/LavaMoat impact, no MV3-sensitive API use, no controller state migration, and changed interactive rows keep `data-testid` coverage.

## Fix Quality
- **Best approach:** pragmatic and correct for this PR. Moving horizontal inset from the section parent to the button itself is the right way to make hover/tap feedback edge-to-edge while preserving content inset.
- **Would not ship:** none.
- **Test quality:** existing colocated tests still cover rendering and row/header navigation. Visual alignment is better proven by the recipe than by brittle unit style assertions.
- **Brittleness:** low. The fix uses static classes and removes an inline padding override rather than adding runtime measurement logic.

## Live Validation
- Recipe: generated
- Result: PASS, 13/13 executed validation nodes passed
- Evidence: 2 AC screenshots; video skipped because standard tier does not require recording
- Webpack errors: none new during 30s monitoring; existing webpack cache warning for missing `.metamaskprodrc`
- Log monitoring: 30s monitored, no new webpack output
- Runtime notes: recipe issue collector observed two non-gating React unmounted-state-update warnings during Perps setup/teardown (`ClosePositionModal`, `PerpsView`); neither maps to the changed layout files.

## Correctness
- Diff vs stated goal: aligned.
- Edge cases: populated Recent activity rows on both Perps tab and market detail covered; empty/loading headers retain padded content layout and were unaffected by tap-row behavior.
- Race conditions: none introduced.
- Backward compatibility: preserved; no route, controller, or storage changes.

## Static Analysis
- lint:tsc: PASS
- Tests: 13/13 pass (`perps-market-recent-activity.test.tsx`)

## Mobile Comparison
- Status: ALIGNED
- Details: mobile Perps home uses a pressable Recent activity header with 16px horizontal inset. Mobile market detail uses a different Recent Trades section, so there is no direct conflicting pattern for this exact header.

## Architecture & Domain
No MV3, LavaMoat, controller, selector, or state-shape implications. The change is isolated to Perps UI layout and one colocated unit test adjustment.

## Risk Assessment
- LOW — CSS/layout-only change, browser-validated on both affected screens.

## Recommended Action
APPROVE
