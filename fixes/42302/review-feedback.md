# Self-Review: TAT-3015

## Verdict: PASS

## Summary
The worker fixed the single-position Perps home RoE mismatch by passing the only open position into the balance dropdown and using that position's ratio-form RoE for the summary row. The implementation is small, covered by targeted unit tests, and the recipe re-run proves the summary/card RoE stay synced when account RoE is stale.

## Type Check
- Result: PASS
- New errors: none

## Tests
- Result: PASS
- Details: `yarn jest ./ui/components/app/perps/perps-balance-dropdown/perps-balance-dropdown.test.tsx ./ui/components/app/perps/perps-view.test.tsx --no-coverage` passed: 2 suites, 43 passed, 4 skipped. The mandated TypeScript gate also passed with only the existing `NO_COLOR`/`FORCE_COLOR` warning.

## Test Quality
- Findings: none found

## Domain Anti-Patterns
- Findings: none found

## Mobile Comparison
- Status: DIVERGES
- Details: Mobile `PerpsHomeView.tsx` still calculates the home positions subtitle RoE from `perpsAccount?.returnOnEquity`, while mobile position cards calculate display RoE from `position.returnOnEquity`. The extension change intentionally follows the position-card source for exactly one open position to satisfy TAT-3015; no new `.toFixed(2)`, inline constants, or weaker mobile pattern drift was introduced.

## LavaMoat Policy
- Status: N/A
- Details: No dependency, `yarn.lock`, attribution, or LavaMoat policy files changed.

## Fix Quality
- Best approach: yes - The fix is minimal for this PR: preserve aggregate account RoE for zero/multiple positions and use the single position's existing ratio-form RoE only when it can be unambiguously matched to the sole card.
- Would not ship: none
- Test quality: good - Tests cover the dropdown source preference and the integrated Perps view rendering the same `42.00%` value in summary and card while account RoE is stale.
- Brittleness: none

## Diff Quality
- Minimal: yes - Four focused files changed, with no unrelated reformatting.
- Debug code: none

## Recipe
- Present: yes
- Quality: good - `recipe-quality.json` is present and passing. Re-ran `validate-recipe.js` with CDP `6661`; result was 8/8 passed. Trace shows `ac1-inject-desynced-roe` returned `summaryRoe:"42.00%"`, `cardRoe:"42.00%"`, `matches:true`, and `ac2-assert-summary-uses-position-source` returned `usesPositionSource:true` against stale account RoE `1.00%`. The recipe seeds state through `perps/open-long-position` and uses existing flow calls before AC-specific assertions.

## Issues
