# Self-Review: TAT-2831

## Verdict: PASS

## Summary
Worker added `hasNoAvailableBalance ||` to `isSubmitDisabled` in `perps-order-entry-page.tsx` (the core 1-line fix) and removed the "Add Funds" CTA shortcut from `perps-market-detail-page.tsx` so Long/Short buttons are always shown. Tests updated to match new disabled state. Fix is correct, minimal, and verified.

## Type Check
- Result: PASS
- New errors: none (exit 0, no output)

## Tests
- Result: PASS
- Details: 132/132 tests pass across `perps-order-entry-page.test.tsx` and `perps-market-detail-page.test.tsx`. Side-effect: 4 fewer Act warnings in market-detail tests (improvement).

## Test Quality
- Findings: none found
  - Test names: "disables submit button and shows add funds label when balance is zero", "disables submit button when user is not eligible and balance is zero", "shows Long/Short buttons even when balance is zero" — no "should" prefix
  - Assertions: `toBeDisabled()`, `toBeInTheDocument()` — semantically correct
  - i18n: `messages.addFunds.message` used (not raw string literal)
  - AAA pattern clean; `async`/`act` removed from now-synchronous tests (correct)

## Domain Anti-Patterns
- Findings: none found
  - No import boundary violations
  - No `as any`, no `eslint-disable`, no `console.log`, no commented-out code
  - No new `.toFixed(2)` or `{min:2, max:2}` introduced
  - testIDs: `perps-add-funds-cta-button` removed from production component and test simultaneously — consistent

## Mobile Comparison
- Status: DIVERGES (informational, appears intentional)
- Details: Mobile `PerpsMarketDetailsView` lines 1142-1145 has `shouldShowAddFundsCTASection` / `shouldShowLongShortButtonsOnly` split — shows "Add Funds" CTA on market detail when `availableBalance < PERPS_MIN_BALANCE_THRESHOLD && defaultPayTokenWhenNoPerpsBalance === null`. Extension fix removes this split entirely, always showing Long/Short buttons on market detail. Commit message explicitly states "restore Long/Short navigation on market detail page when balance is zero" — divergence is intentional. The deposit path for zero-balance users now routes through order entry (disabled button → "Add Funds" label) rather than a direct market-detail shortcut. Not a defect given ticket intent.

## LavaMoat Policy
- Status: OK
- Details: Policy files changed in both `browserify/*/policy.json` and `webpack/mv2/*/policy.json`. Corresponds to 3 dep bumps in `package.json`: `@metamask/assets-controllers`, `@metamask/perps-controller`, `@metamask/smart-transactions-controller`. Policy regeneration matches dep changes — correct.

## Fix Quality
- Best approach: yes — one-line addition of `hasNoAvailableBalance ||` to `isSubmitDisabled` at `perps-order-entry-page.tsx:544`. The flag was already computed at line ~455; only the wiring was missing. Could not be simpler.
- Would not ship: none
- Test quality: good — tests assert the behavioral change (`disabled=true`), use message helpers, removed stale click assertions that no longer apply
- Brittleness: none — `hasNoAvailableBalance` derives from live `availableBalance` via stream, not a frozen constant

## Diff Quality
- Minimal: yes — perps fix is 4 files, core change is 1 line. Other files in the diff (80 total) are unrelated branch commits, not part of this fix.
- Debug code: none

## Recipe
- Present: yes
- Quality: good — injects zero-balance via `sm.account.pushData()` (not UI navigation), asserts `disabled=true` on `submit-order-button`, includes before/after screenshots, recipe-quality.json verdict=pass, all 6 nodes pass

## Issues
(none)
