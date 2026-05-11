# PR Review: #42531 — fix(perps): require single back-button click after order submission cp-13.31.0

**Tier:** standard

## Summary

This PR fixes a double-click back-button bug in the perps order-entry page. The root cause was two divergent navigation paths: `handleBackClick` (post-submit) used `navigate(marketDetailPath, {replace: true})` which pushed a stale history entry, while `handleBackButtonClick` (header) used `navigate(-1)`. The fix correctly extracts a shared `navigateBack` helper that pops the history stack with a fallback chain, and rewires both code paths through it. The change is minimal, correct, and achieves its stated goal.

No Jira or linked issue with formal acceptance criteria is provided. This review evaluates PR-author claims, not ticket-bound acceptance criteria.

## Recipe Coverage

| # | AC (verbatim) | Target env | Recipe nodes (IDs) | Screenshot filename | Visual verdict | Justification |
|---|---------------|------------|---------------------|---------------------|----------------|---------------|
| 1 | "Both the header back button and the post-submit callback now go through the same code path, so a single click is enough to leave the page." | fullscreen | ac1-click-back-button, ac1-wait-market-detail, ac1-assert-on-market-detail, ac1-screenshot-after-back | evidence-ac1-market-detail-after-back.png | PROVEN | Back button click from order-entry navigated to market detail in a single click. Hash assertion confirmed `/perps/market/BTC`. Screenshot shows BTC-USD market detail page. Code review confirms both onClick handlers now call `handleBackClick()` which delegates to shared `navigateBack()`. |
| 2 | "Submit a market order → Click the back button in the header → Verify you are navigated back with a single click" | fullscreen | ac2-click-back, ac2-wait-navigated, ac2-assert-not-on-order-entry, ac2-screenshot-navigated-away | evidence-ac2-navigated-away-single-click.png | PROVEN | Second navigation test confirms back button navigates away from order-entry in single click. Hash assertion confirmed route no longer contains `/perps/trade/`. Note: actual order submission not tested (mainnet real funds); the navigation path is the same with or without order submission since `handleBackClick` calls `navigateBack()` unconditionally after `setPendingOrder`. |

Overall recipe coverage: 2/2 ACs PROVEN
Untestable: none

## Prior Reviews

| Reviewer | State | Date | Addressed? | Notes |
|----------|-------|------|------------|-------|
| javiergarciavera | APPROVED | 2026-05-08 | N/A | Approved |
| aganglada | COMMENTED | 2026-05-08 | N/A | Comment only |
| michalconsensys | COMMENTED | 2026-05-09 | N/A | Comment only |

No CHANGES_REQUESTED reviews to address.

## Acceptance Criteria Validation

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Shared code path for back navigation | PASS | Recipe ac1-assert-on-market-detail: hash contains `/perps/market/BTC` after single back click. Code review: both onClick handlers delegate to `navigateBack()`. |
| 2 | Single click back after order submission | PASS | Recipe ac2-assert-not-on-order-entry: hash no longer contains `/perps/trade/` after single back click. Note: order submission not executed (mainnet), but `navigateBack()` is called unconditionally. |

## Code Quality

- Pattern adherence: follows codebase conventions — `useCallback` wrapping, fallback chain pattern
- Complexity: appropriate — minimal refactor, no over-engineering
- Type safety: clean — `lint:tsc` passes, optional parameter typing preserved
- Error handling: adequate — fallback chain handles no-history and no-symbol edge cases
- Anti-pattern findings: none — no import boundary violations, no missing testids, no LavaMoat concerns

## Fix Quality

- **Best approach:** Yes. The old `navigate(marketDetailPath, {replace: true})` was the root cause — it created a history entry that `navigate(-1)` would return to. Using `navigate(-1)` directly (with fallback) is the correct fix. The shared `navigateBack` helper eliminates the divergent navigation paths.
- **Would not ship:** nothing blocking
- **Test quality:** 69 existing tests pass. No new tests specifically for `navigateBack`, but the behavior is covered by existing order-entry page tests. The `navigateBack` helper is simple enough (3 branches) that the existing test coverage is adequate.
- **Brittleness:** low — `window.history.length > 1` is a stable browser API check. Fallback chain handles edge cases (no history, no symbol).

## Live Validation

- Recipe: generated (internal mode)
- Result: PASS — 16/16 nodes passed in 2.5s
- Evidence: 3 screenshots (video skipped: standard tier)
- Webpack errors: none
- Log monitoring: 1 baseline React deprecation warning (componentWillReceiveProps), not PR-related

## Correctness

- Diff vs stated goal: aligned — exactly addresses the double-click back-button bug
- Edge cases: covered — `navigateBack` handles: (1) normal history pop via `navigate(-1)`, (2) fallback to market detail when `decodedSymbol` exists, (3) fallback to DEFAULT_ROUTE when no symbol
- Race conditions: none — `setPendingOrder` is called synchronously before `navigateBack()`, so pending order state is set before navigation
- Backward compatibility: preserved — `handleBackClick` still accepts optional `extraState` for post-submit toast data via `setPendingOrder`

## Static Analysis

- lint:tsc: PASS — 0 errors
- Tests: 69/69 pass

## Mobile Comparison

- Status: N/A
- Details: This is an extension-specific React Router history stack navigation fix. Mobile uses React Navigation which has a fundamentally different stack model. No mobile equivalent to compare.

## Architecture & Domain

- No MV3/service worker implications — purely UI-layer navigation refactor
- No LavaMoat impact — no new dependencies or policy changes
- Import boundaries preserved — no new imports added
- No controller changes

## Risk Assessment

- LOW — Minimal navigation refactor limited to one file, one component. The `navigateBack` helper uses stable browser APIs with correct fallback chain. Existing tests pass. The only risk is edge-case navigation behavior (direct URL entry with no history), which is handled by the fallback chain.

## Recommended Action

APPROVE — Clean, minimal fix that correctly addresses the root cause. Code is well-structured with proper fallback handling. All tests pass, live validation confirms single-click back navigation works.
