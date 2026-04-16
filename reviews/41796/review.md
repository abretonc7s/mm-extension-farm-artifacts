# PR Review: #41796 — fix: balance double counting pnl

**Tier:** standard

## Summary
The PR correctly fixes a double-counting bug where `unrealizedPnl` was being added to `totalBalance` to compute `accountValue`, but `totalBalance` (from Hyperliquid's API) already includes unrealized PnL. The fix removes the `+ unrealizedPnl` in both `PerpsBalanceDropdown` and `PerpsMarketBalanceActions`, and adds a loading skeleton guard in `PerpsBalanceDropdown` for the `isInitialLoading` state. This aligns with how mobile handles the same value.

## Recipe Coverage

| # | AC (verbatim) | Target env | Recipe nodes (IDs) | Screenshot filename | Visual verdict | Justification |
|---|---------------|------------|---------------------|---------------------|----------------|---------------|
| 1 | "PnL should not be double-counted in total balance display in PerpsBalanceDropdown" | fullscreen | ac1-wait-balance-dropdown, ac1-eval-balance-state, ac1-screenshot-balance-dropdown | evidence-ac1-perps-balance-dropdown.png | PROVEN | Screenshot shows Total balance: $11,246.78 matching totalBalance (11246.784) from eval_ref. Unrealized P&L (+$0.07) shown separately. If double-counted, total would be ~$11,246.85. |
| 2 | "PnL should not be double-counted in PerpsMarketBalanceActions" | fullscreen | (none) | (none) | UNTESTABLE | Component not imported by any page — not rendered in any live route. Code change identical to AC1. |
| 3 | "PerpsBalanceDropdown shows loading skeleton during isInitialLoading" | fullscreen | (none) | (none) | UNTESTABLE | Transient hook state, cannot be triggered via CDP. Covered by unit test. |

Overall recipe coverage: 1/3 ACs PROVEN
Untestable: AC2 (component not rendered in live routes), AC3 (transient hook state)

> Coverage escalation: AC2, AC3 not proven in browser.
>   Reason: AC2's component is not mounted in any live route (code review confirms identical fix to AC1). AC3 is a transient React state testable only via unit tests (which pass).
>   Human reviewer must validate manually before merging.

## Prior Reviews
| Reviewer | State | Date | Addressed? | Notes |
|----------|-------|------|------------|-------|
| cursor | COMMENTED | 2026-04-15 | N/A | Automated Bugbot review |
| gambinish | COMMENTED | 2026-04-15 | N/A | Comment only, no changes requested |

No CHANGES_REQUESTED reviews.

## Acceptance Criteria Validation
| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Balance not double-counted in PerpsBalanceDropdown | PASS | Recipe ac1-eval-balance-state: totalBalance=11246.78, displayed as $11,246.78 (not $11,246.85). Screenshot evidence. |
| 2 | Balance not double-counted in PerpsMarketBalanceActions | PASS (code review) | Identical fix to AC1. Component not in any live route. Unit tests pass. |
| 3 | Loading skeleton during isInitialLoading | PASS (unit test) | New test "renders loading skeleton when account data is still loading" passes. |

## Code Quality
- Pattern adherence: Follows existing codebase conventions. Uses `formatCurrencyWithMinThreshold` (per perps formatting rules).
- Complexity: Appropriate — removes unnecessary computation.
- Type safety: No type issues. Correctly destructures `isInitialLoading` from hook return.
- Error handling: Adequate — defaults to `'0'` via nullish coalescing.
- Anti-pattern findings: None. No import boundary violations, no missing LavaMoat updates, no new UI without testIDs.

## Fix Quality
- **Best approach:** Yes. This is the minimal correct fix. `totalBalance` from Hyperliquid is `accountValue` (perps equity + spot), which already includes unrealized PnL. Mobile uses `totalBalance` directly (confirmed in `PerpsHomeView.tsx:129`). The old code was simply wrong.
- **Would not ship:** Nothing blocks merge.
- **Test quality:** Good. The balance dropdown test asserts `$15,250.00` (correct) vs old `$15,625.00` (double-counted). The loading skeleton test checks both positive (skeleton visible) and negative (balance NOT visible) conditions. One gap: `perps-market-balance-actions.test.tsx` doesn't assert the displayed balance amount — but since the component isn't rendered in any live route, this is low risk.
- **Brittleness:** Low. Simple `parseFloat(totalBalance)` with no intermediate state, caching, or module-level constants.

## Live Validation
- Recipe: generated
- Result: PASS — 4/4 nodes passed in 1358ms
- Evidence: 1 screenshot (evidence-ac1-perps-balance-dropdown.png) + baseline.png
- Webpack errors: none
- Log monitoring: Webpack serving PR code, builds completed successfully

## Correctness
- Diff vs stated goal: Aligned — removes double-counting of PnL in balance display
- Edge cases: When `account` is null, defaults to `'0'` (existing behavior preserved). The `isInitialLoading` guard returns skeleton before accessing account data.
- Race conditions: None — `usePerpsLiveAccount` handles loading state internally
- Backward compatibility: Preserved — no API or prop changes

## Static Analysis
- lint:tsc: PASS (2 pre-existing warnings in unrelated files)
- Tests: 19/19 pass (15 balance-dropdown + 4 market-balance-actions)

## Mobile Comparison
- Status: ALIGNED
- Details: Mobile's `PerpsHomeView.tsx:129` uses `totalBalance` directly without adding `unrealizedPnl`, exactly matching this fix. No formatting divergence — both use their respective currency formatters on the raw `totalBalance`.

## Architecture & Domain
- No MV3 implications — pure UI component changes
- No LavaMoat impact — no new dependencies
- Import boundaries respected — `PerpsControlBarSkeleton` imported from sibling `perps-skeletons` package
- No controller state changes requiring migrations

## Risk Assessment
- LOW — Removes an incorrect computation. The fix is a strict subtraction of behavior (removing the `+ unrealizedPnl` addition). Aligns with mobile. Well-tested.

## Recommended Action
APPROVE
Clean, correct fix that aligns extension balance display with mobile and the Hyperliquid API semantics. The loading skeleton addition is a sensible defensive improvement.
