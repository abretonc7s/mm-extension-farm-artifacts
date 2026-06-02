# PR Review: #42613 — feat(perps): add close-all-positions confirmation modal

**Tier:** standard (RECIPE_STRATEGY: smoke)

## Summary
Re-enables the previously-hidden "Close all" button in the Perps positions section and gates the batch market-close behind a new `CloseAllPositionsModal` confirmation step. The modal aggregates margin (PnL-inclusive), per-symbol estimated taker fees (with `PERPS_FALLBACK_FEE_RATES` on RPC failure), and a "you'll receive" amount, then offers "Close all" / "Keep positions". `perps-view.tsx` orchestrates tapped → confirm/cancel → execute, emits `close_all_tapped/confirmed/cancelled` interaction events plus `Perp Position Close Transaction` with the new `number_positions_closed` property, and shows in-progress / success / partial / failure toasts. The change achieves its stated goal and brings Extension to parity with Mobile's confirmation flow.

## Recipe Coverage
Source: linked ticket TAT-2852 (AC1–AC5). Recipe decision: skip-smoke-strategy. Validation = smoke regression + opportunistic live AC proof + unit tests + code/mobile-parity review.

| # | AC (verbatim) | Status | Evidence |
|---|---------------|--------|----------|
| 1 | Given ≥1 open position, opening the Perps tab → "Close All" button visible. | PROVEN (live) | evidence-ac1-close-all-button-visible.png — "Close all" beside Positions header w/ open ETH position |
| 2 | Tapping it → confirmation screen with expected outcome. | PROVEN (live) | evidence-ac2-confirmation-modal.png — Margin $5.20 (incl P&L −$0.3718), Fees −$0.02, Receive $5.18 (reconciles) |
| 3 | Confirm → all positions submitted for closure. | UNTESTABLE (live) — PROVEN via unit test | perps-view.test.tsx asserts `perpsClosePositions([{closeAll:true}])` only after modal submit. Live confirm not run (irreversible). |
| 4 | Cancel → no positions closed, return to Perps tab. | PROVEN (live) | evidence-ac4-cancelled-positions-intact.png — "Keep positions" dismisses modal, ETH position intact |
| 5 | No open positions → "Close All" hidden or disabled. | UNTESTABLE (live) — PROVEN via code + unit test | `{hasPositions && (…)}` wrapper + component returns null when no positions; modal test covers empty→disabled submit |

Overall recipe coverage: 3/5 ACs PROVEN live (AC1, AC2, AC4); 2/5 UNTESTABLE-live with rationale + unit/code proof (AC3 irreversible market close; AC5 cannot zero positions on live account).
Untestable: AC3 (confirm executes real market close — read-only review), AC5 (live account has ≥1 position).

Smoke regression: `perps-lifecycle.recipe.json` → status=pass, 19/19 trace nodes ok:true. No gating console issues.

## Prior Reviews
| Reviewer | State | Date | Addressed? | Notes |
|----------|-------|------|------------|-------|
| geositta | CHANGES_REQUESTED ×3 | May 18–19 | addressed | discounted-fee inflation, partial→full-success toast, always-on discount RPC, first-render fee state. Author pushed multiple commits; geositta DISMISSED + approved May 28. |
| abretonc7s | CHANGES_REQUESTED | May 19 | addressed | conditional modal mount, full FeeCalculationResult in test, double-round nitpick → commits 416c4b10 / a1339471 / 0864ab46. |
| abretonc7s | CHANGES_REQUESTED | May 28 | addressed | (1) missing unit coverage for partial+failed close-all branches; (2) youWillReceive↔displayed-rows reconciliation. Commit cc776be5 (May 29) added partial+failed tests and changed `youWillReceive` to `roundedMargin − roundedFees`. Verified live: $5.20 − $0.02 = $5.18 reconciles. |
| cursor[bot] | COMMENTED ×9 | May 13–18 | addressed | per-symbol fees, separated refresh try/catch, geo-block guard at tap, successCount in analytics — all resolved in current code. |

All prior CHANGES_REQUESTED feedback is addressed by later commits; geositta's final state is an approval.

## Acceptance Criteria Validation
| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Close All button visible with open positions | PASS | evidence-ac1 (live) |
| 2 | Tap → confirmation modal w/ margin/fees/receive | PASS | evidence-ac2 (live), reconciles exactly |
| 3 | Confirm → batch close submitted | PASS (unit) | perps-view.test.tsx "calls batch close after confirmation" — `perpsClosePositions([{closeAll:true}])` |
| 4 | Cancel → no close, stays on tab | PASS | evidence-ac4 (live) + unit "does not execute close all when cancelled" |
| 5 | No positions → button hidden/disabled | PASS (code+unit) | `{hasPositions && …}` render guard + empty-array disabled test |

## Code Quality
- Pattern adherence: follows codebase conventions (design-system components, `submitRequestToBackground`, `usePerpsEventTracking` overloads, data-testid coverage).
- Complexity: appropriate. Conditional modal mount, clean handler split (tapped/cancel/confirm), shared constant extraction (`PERPS_FALLBACK_FEE_RATES`, `BASIS_POINTS_DIVISOR`, `ORIGINAL_METAMASK_FEE_BIPS`) avoids magic-number duplication.
- Type safety: `yarn lint:tsc` clean (exit 0, no errors). No `as any`/`as unknown` in added lines.
- Error handling: adequate — partial/full-failure/exception paths all tracked with distinct toasts; refresh isolated in its own try/catch so a refresh failure can't overwrite a success toast.
- Accessibility/fallbacks: adequate — real `<button>` affordances with correct names; fees/receive render `'--'` while loading (no misleading `-$0`/full-margin flash); margin/PnL synchronous.
- Anti-pattern findings: none (no import-boundary issues, no yarn.lock/lavamoat change, no chrome.runtime, no controller state migration needed).

## Fix Quality
- **Best approach:** Yes, would ship. Pragmatic note: the modal reimplements per-symbol fee+discount logic inline rather than via a reusable hook (mobile centralizes this in `usePerpsCloseAllCalculations`); a shared `usePerpsCloseAllFees` hook would improve testability/parity but is not required for this scope.
- **Would not ship:** nothing — no correctness blockers found.
- **Test quality:** strong. Assertions are specific (exact toast keys, analytics `STATUS`/`NUMBER_POSITIONS_CLOSED`, per-symbol `perpsCalculateFees` calls) and would fail if the fix were reverted. Gap: the outer `catch` (when `perpsClosePositions` rejects/throws) is not unit-covered — only resolved `{success:false}` failure paths are tested (suggestion).
- **Brittleness:** low. Fee effect uses `feeRequestId` + `cancelled` flag + cleanup for race safety; `symbolNotionalKey` (sorted JSON) prevents re-firing on every stream array reference swap; conditional mount avoids closed-modal `rewardsGetPerpsDiscountForAccount` RPC.

## Live Validation
- Recipe: skipped per RECIPE_STRATEGY=smoke; smoke regression `perps-lifecycle.recipe.json` ran instead.
- Result: PASS — smoke 19/19 nodes ok; live AC1/AC2/AC4 modal flow recipe 12/12 nodes ok (non-destructive, confirm never pressed).
- Evidence: 3 AC screenshots (ac1, ac2, ac4). Video not recorded (smoke tier — optional).
- Webpack errors: none (compiled successfully).
- Log monitoring: smoke + modal runs produced no gating console errors/exceptions.

## Correctness
- Diff vs stated goal: aligned — button re-enabled, confirmation modal wired, analytics + toasts added.
- Edge cases: partial success (some closed) → partial toast + refresh; full failure → failed toast, no refresh; exception → failed toast; empty positions → submit disabled & handlers no-op. Covered. `number_positions_closed` reports actual closed count (`successCount`, or `successCount || positionCount` on full success) rather than the ticket's literal "submitted" wording — defensible, review-driven; data-dictionary owner should confirm the intended semantic.
- Race conditions: handled via request-id/cancelled refs in the fee effect.
- Backward compatibility: preserved — `BatchCloseResult.successCount/failureCount` read defensively with `?? 0`; success path falls back to `positionCount` when counts absent.

## Static Analysis
- lint:tsc: PASS (exit 0, no errors)
- Tests: 45/45 pass (close-all-positions-modal.test.tsx + perps-view.test.tsx), no console baseline violations

## Mobile Comparison
- Status: ALIGNED
- Details: Core math matches mobile `usePerpsCloseAllCalculations.ts` — `totalMargin = ΣmarginUsed` (PnL-inclusive, not re-added), `receive = margin − fees`, per-symbol fee fetch, MetaMask-only discount `rate × (1 − bips/10000)`, `formatPerpsFiat`/`formatPerpsFiatUniversal` (no `.toFixed(2)`). Intentional, non-blocking divergences: extension omits the rewards/points display (ticket = "simple summary"); falls back to `PERPS_FALLBACK_FEE_RATES` on fee-RPC failure where mobile leaves fees `undefined`; uses `pos.positionValue` as fee notional vs mobile's `size × livePrice` (minor estimate approximation).

## Architecture & Domain
- MV3: UI-only change; uses `submitRequestToBackground` for all background calls (no direct `chrome.*`). No service-worker implications.
- LavaMoat: no dependency/policy change in the diff — no `lavamoat:auto` needed.
- Import boundaries: clean (UI imports from design-system, shared/lib, shared/constants, hooks, component-library).
- Controller usage: read-only via background RPC; no controller state shape change → no migration required.

## Risk Assessment
- **MEDIUM** — batch market closes are financially impactful, but the PR adds the confirmation guardrail + fee estimate, isolates refresh failures, and handles partial/failure paths with distinct toasts and analytics. Residual risk lives in background `perpsClosePositions` correctness/partial-failure handling, which is outside this diff.

## Recommended Action
**COMMENT** — Implementation is solid, all ACs validated (3 PROVEN live, 2 via unit/code), all prior review feedback addressed, tsc + 45 unit tests green. No blockers. Non-blocking follow-ups for the author/human reviewer:
- `ui/components/app/perps/perps-view.tsx` — add a unit test for the outer `catch` (perpsClosePositions rejection) path; only resolved-failure branches are currently covered (suggestion).
- Confirm with the data team that `number_positions_closed` reporting actually-closed count (not attempted/submitted) matches the ticket's intended semantic (observation).

The approval decision belongs to the human reviewer.
