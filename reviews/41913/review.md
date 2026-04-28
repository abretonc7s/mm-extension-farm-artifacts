# PR Review: #41913 — fix(perps): derive native token deposit pending toast from transaction state

**Tier:** full

## Summary
This PR achieves its stated goal: native Perps deposit toasts are now driven by the active deposit transaction lifecycle instead of the short-lived `depositInProgress` flag, while non-native pay-token deposits are not owned by the Perps toast component. I found no blocking correctness issues.

## Recipe Coverage
See `temp/tasks/review/41913-0428-231004/artifacts/recipe-coverage.md`.

Overall recipe coverage: 5/7 ACs PROVEN
Untestable: AC5 real order submission with an active pending deposit would place or attempt a live Perps order in this slot; AC7 is a static mobile-code comparison rather than a browser-executable behavior.

## Prior Reviews
No prior `CHANGES_REQUESTED` reviews.

| Reviewer | State | Date | Addressed? | Notes |
|----------|-------|------|------------|-------|
| cursor | COMMENTED | 2026-04-22 through 2026-04-24 | N/A | Automated comments only. |
| michalconsensys | APPROVED | 2026-04-27 | N/A | Current approval present; older reviews were dismissed. |
| gambinish | APPROVED | 2026-04-28 | N/A | Current approval present. |

## Acceptance Criteria Validation
| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Pending Perps deposit toast is derived from the active `perpsDeposit` / `perpsDepositAndOrder` transaction lifecycle after user confirmation. | PASS | `ac1-*` recipe nodes; `evidence-ac1-native-approved-pending-toast.png`. |
| 2 | Pending Perps deposit toast appears only while the active deposit transaction is in `approved`, `signed`, or `submitted`; it does not appear for non-pending, unrelated, stale, or missing active transactions. | PASS | `ac2-*` recipe nodes plus selector tests. |
| 3 | Native-token-funded Perps deposits remain owned by the Perps toast flow, including pending and completion/error deposit toasts. | PASS | `ac3-*` recipe nodes; `evidence-ac3-native-success-toast.png`; component tests. |
| 4 | Non-native pay-token-funded Perps deposits defer to Transaction/Confirmations-owned toast behavior and do not show Perps deposit toasts. | PASS | `ac4-*` recipe nodes; component and selector tests. |
| 5 | Perps order submission toasts are suppressed while an active Perps deposit is pending to avoid overlapping Perps toast flows. | PASS | Unit coverage for `shouldShowPerpsOrderSubmissionToasts` and order-entry submission behavior; browser path untestable without live order submission. |
| 6 | Generic transaction toast eligibility excludes Perps deposit-related transaction types, including `perpsDeposit`, `perpsDepositAndOrder`, and `perpsRelayDeposit`. | PASS | `ui/selectors/toast.test.ts` and `ac6-*` live state assertion. |
| 7 | The change remains aligned with mobile Perps deposit toast behavior where extension has equivalent support. | PASS | Mobile comparison artifact; aligned on post-confirm deposit tracking with documented extension-specific pay-token ownership divergence. |

## Code Quality
- Pattern adherence: follows existing selector/component patterns and reuses the existing `Toast` and design-system icons.
- Complexity: appropriate; the new selectors centralize transaction ownership logic instead of spreading conditions through the component.
- Type safety: `yarn lint:tsc` passed.
- Error handling: completion toast dismissal still clears deposit result and remains non-blocking on background errors.
- Anti-pattern findings: none. No dependency/LavaMoat impact, no import-boundary violations, no MV3-problematic APIs, and no new untestable controls.

## Fix Quality
- **Best approach:** This is the pragmatic minimal fix for the current architecture. A shared global toast owner for all Perps funding flows is cleaner long-term, but the PR correctly scopes that as follow-up work.
- **Would not ship:** none.
- **Test quality:** strong. Tests cover native vs token-funded ownership, active transaction scoping, pending/non-pending statuses, stale transactions, completion priority, and generic toast exclusions.
- **Brittleness:** low. Token ownership is derived per selector call from transaction data and native token address, not from import-time state.

## Live Validation
- Recipe: generated
- Result: PASS, 19/19 runner-reported steps passed; all drafted `ac<N>-` nodes in `trace.json` passed.
- Evidence: 4 screenshots; video skipped: browser.pid missing -- see browser.log.
- Webpack errors: none observed.
- Log monitoring: recipe issue review reported no unexpected warnings, errors, or runtime exceptions; `live-recipe.log` had no `[hud]` warnings.

## Correctness
- Diff vs stated goal: aligned.
- Edge cases: active transaction ID scoping, stale submitted deposits, unapproved deposits, token-funded deposits, native-funded completion, and `perpsRelayDeposit` exclusion are covered.
- Race conditions: no new race found. The pending state now follows transaction status and completion prefers `lastDepositResult`.
- Backward compatibility: preserved; no migrations or dependency changes.

## Static Analysis
- lint:tsc: PASS
- Tests: 4/4 suites pass, 183/183 tests pass:
  - `ui/components/app/perps/perps-deposit-toast.test.tsx`
  - `ui/pages/perps/perps-order-entry-page.test.tsx`
  - `ui/selectors/perps-controller.test.ts`
  - `ui/selectors/toast.test.ts`

## Mobile Comparison
- Status: ALIGNED
- Details: Mobile shows deposit progress after post-confirm Perps deposit transaction updates and uses Perps-specific deposit toasts. Extension now matches that for native-supported flows. The non-native pay-token suppression is an intentional extension divergence because those flows defer to Confirmations/Transaction ownership.

## Architecture & Domain
No architecture concerns found. The change stays in UI selectors/components and constants, avoids background/controller state-shape changes, and requires no LavaMoat or migration work.

## Risk Assessment
- MEDIUM — deposit/order toast ownership is user-visible and transaction-state-sensitive, but the implementation is narrowly scoped and well-covered by targeted tests plus live DOM validation.

## Recommended Action
APPROVE

No blocking follow-up items.
