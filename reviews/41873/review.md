# PR Review: #41873 — fix(perps): display skeleton for recent activity only when WS & REST is loading

**Tier:** standard

## Summary
This PR extracts the market-detail Recent Activity block into its own component, moves the fill fetching/rendering responsibility into that component, and changes `usePerpsMarketFills` so the initial loading state only remains true while both WS and REST are still loading.

Based on the code review plus live browser validation, the PR achieves its stated user-facing goal: the recent-activity section shows a cold-load skeleton, resolves to populated activity on ETH, routes correctly to `/perps/activity`, and renders the empty state on a no-fill market (`DOGE`).

## Recipe Coverage
| # | AC (verbatim) | Target env | Recipe nodes (IDs) | Screenshot filename | Visual verdict | Justification |
|---|---------------|------------|---------------------|---------------------|----------------|---------------|
| 1 | "Verify the \"Recent Activity\" section renders with skeleton loaders, then populates with fills" | fullscreen | external-cdp-cold-load; ac2-wait-recent-activity-populated; ac2-scroll-recent-activity; ac2-screenshot-loading-cleared | evidence-ac1-recent-activity-skeleton.png; evidence-ac2-loading-cleared.png | PROVEN | The cold ETH capture shows a full loading skeleton state with no recent-activity cards or CTA, and the subsequent ETH recipe trace plus screenshot show the same section populated with three transactions and `See All`. |
| 2 | "\"isInitialLoading\" in `usePerpsMarketFills` ... resolves to `false` as soon as either the WebSocket or REST source delivers fills, rather than waiting for both" | fullscreen | ac2-wait-recent-activity-populated; ac2-scroll-recent-activity; ac2-screenshot-loading-cleared | evidence-ac2-loading-cleared.png | PROVEN | `trace.json` records `txCount:3`, `hasSeeAll:true`, and `skeletonCount:0` on `#/perps/market/ETH`, and the screenshot shows the Recent Activity section populated and no longer in skeleton state. |
| 3 | "Verify the \"See All\" button navigates to the activity route" | fullscreen | ac3-open-activity-page; ac3-assert-activity-route; ac3-screenshot-activity-page | evidence-ac3-activity-route.png | PROVEN | The trace records `hash:"#/perps/activity"` and `hasActivityPage:true` immediately after pressing `perps-market-detail-view-all-activity`, and the screenshot shows the Activity page header and filter control. |
| 4 | "Verify the empty state (\"No transactions\") renders when there are no fills" | fullscreen | ac4-assert-empty-state; ac4-scroll-empty-state; ac4-screenshot-empty-state | evidence-ac4-empty-state.png | PROVEN | The DOGE trace records `txCount:0`, `hasSeeAll:false`, `noTransactions:true`, and `skeletonCount:0`, and the screenshot shows the Recent Activity section with the empty-state copy in frame. |

Overall recipe coverage: 4/4 ACs PROVEN
Untestable: none

## Prior Reviews
| Reviewer | State | Date | Addressed? | Notes |
|----------|-------|------|------------|-------|
| aganglada | CHANGES_REQUESTED | 2026-04-17T09:37:46Z | addressed | 3 commits landed after the review (`faf82f0e`, `f6dcd619`, `7f6a0d74`). The current diff is a colocated component extraction with colocated tests, and the later follow-up also fixes the slice-before-transform regression that was raised separately by bot review. |

## Acceptance Criteria Validation
| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Verify the "Recent Activity" section renders with skeleton loaders, then populates with fills | PASS | `evidence-ac1-recent-activity-skeleton.png` + `ac2-wait-recent-activity-populated` trace + `evidence-ac2-loading-cleared.png` |
| 2 | `"isInitialLoading"` resolves to `false` as soon as either the WebSocket or REST source delivers fills, rather than waiting for both | PASS | `ac2-wait-recent-activity-populated` trace (`txCount:3`, `hasSeeAll:true`, `skeletonCount:0`) + `evidence-ac2-loading-cleared.png` |
| 3 | Verify the "See All" button navigates to the activity route | PASS | `ac3-open-activity-page`, `ac3-assert-activity-route`, `evidence-ac3-activity-route.png` |
| 4 | Verify the empty state ("No transactions") renders when there are no fills | PASS | `ac4-assert-empty-state` trace + `evidence-ac4-empty-state.png` |

## Code Quality
- Pattern adherence: follows existing perps patterns and reduces page-level complexity by extracting the recent-activity section from `perps-market-detail-page.tsx`.
- Complexity: improved; the page no longer owns the fill-fetching/rendering branch directly.
- Type safety: changed code is typed cleanly from inspection, but environment-gated `lint:tsc` execution was blocked by the local Node version.
- Error handling: adequate for the touched surface; the hook behavior remains bounded to existing fetch/cache semantics.
- Anti-pattern findings: no import-boundary, LavaMoat, MV3, or missing-interactive-testid issue found in the changed files.

## Fix Quality
- **Best approach:** pragmatic and aligned with mobile. The final implementation keeps transform-before-slice behavior, which preserves fill aggregation correctness while isolating the UI state machine inside a dedicated component.
- **Would not ship:** none from code inspection and browser validation.
- **Test quality:** good unit test shape for the touched logic. The hook tests explicitly cover the new AND-based loading semantics, and the component tests cover skeleton, populated, empty, and `See All` behavior. I could not execute them in this slot because Node `22.15.0` is below the repo’s required `>=24.13.0`.
- **Brittleness:** low in code, moderate in automation. The only brittle part I observed was validation of the transient cold-load skeleton, which required a direct cold-target CDP capture because the recipe runner attached after the transition in a warmed browser context.

## Live Validation
- Recipe: generated
- Result: PASS — traced recipe 11/11 executed/passed for AC2-AC4; AC1 cold-load skeleton captured separately via direct CDP on a fresh ETH detail target
- Evidence: 6 screenshots (`baseline.png`, `evidence-ac1-recent-activity-skeleton.png`, `evidence-ac2-loading-cleared.png`, `evidence-ac3-activity-route.png`, `evidence-ac4-empty-state.png`, `final.png`)
- Webpack errors: none observed in the latest rebuild/reload entries reviewed from `temp/.agent/webpack.log`
- Log monitoring: startup/build readiness checked from `webpack.log`; no new runtime failure surfaced during the browser validation path

## Correctness
- Diff vs stated goal: aligned
- Edge cases: loaded state with fills and zero-fill empty state are both covered; the transient cold-load skeleton is also captured
- Race conditions: none observed after the final `&&` loading change; the section leaves skeleton state and settles correctly in-browser
- Backward compatibility: preserved for routing and existing activity-page navigation

## Static Analysis
- lint:tsc: FAIL — blocked before execution because local Node is `22.15.0`, repo requires `>=24.13.0`
- Tests: FAIL — targeted Jest invocation blocked by the same Node version gate before test execution

## Mobile Comparison
- Status: ALIGNED
- Details: the mobile equivalent (`PerpsMarketTradesList`) also uses `usePerpsMarketFills`, transforms all fills before slicing, shows a 3-row loading skeleton, renders an empty-state message for zero trades, and navigates to the transactions screen from `See All`. The final extension implementation matches that behavior shape.

## Architecture & Domain
This change is UI/hook-local. It does not touch controller boundaries, MV3 service-worker behavior, LavaMoat policy, or migrations. The extraction also reduces coupling between page-load measurement and recent-activity fetching, which is a positive separation of concerns for the perps detail page.

## Risk Assessment
- MEDIUM — the changed behavior is user-facing and timing-sensitive, but the browser evidence matches the intended states and I did not find a code-level blocker.

## Recommended Action
COMMENT
No blocking code issue found. Remaining gaps are environment-specific verification limits in this slot: `lint:tsc` and the targeted Jest files could not be executed because the local runtime is on Node `22.15.0` while the repo requires `>=24.13.0`.
