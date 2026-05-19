# PR Review: #42613 — feat(perps): add close-all-positions confirmation modal

**Tier:** standard

## Summary

Re-enables the Perps "Close All" button and wires it to a new `CloseAllPositionsModal` that summarises margin (with PnL), estimated fees, and net receive before submitting a batch close via `perpsClosePositions`. Adds `close_all_tapped/confirmed/cancelled` interaction events and a `number_positions_closed` property on `PerpsPositionCloseTransaction`. Toast keys cover in-progress/success/partial/failure. The flow itself achieves the ticket's stated goal, and the latest commits applied fee discount + partial-success handling from the earlier review pass. **However**, the most recent CHANGES_REQUESTED review (geositta, 2026-05-19T14:14:34Z) is **not yet addressed** — see Prior Reviews / Fix Quality.

## Recipe Coverage

Recipe skipped (standard tier, CDP offline). All ACs are UNTESTABLE in this lane; jest unit tests cover the major behaviours.

| # | AC | Status | Reason |
|---|----|--------|--------|
| 1 | "Close All" button visible when ≥1 open position | UNTESTABLE (live) | CDP offline; unit test `displays close all button in positions section` covers the rendering path |
| 2 | Tap opens confirmation screen with expected outcome | UNTESTABLE (live) | CDP offline; unit test `opens confirmation modal when close all button is clicked` + modal-render tests cover |
| 3 | Confirm → submit all closures | UNTESTABLE (live) | CDP offline; unit test `calls batch close after confirmation and applies a single positions snapshot` covers |
| 4 | Cancel → no positions closed, return to tab | UNTESTABLE (live) | CDP offline; unit test `does not execute close all when confirmation is cancelled` covers |
| 5 | No positions → button hidden/disabled | UNTESTABLE (live) | CDP offline; `perps-positions-orders.tsx` `if (!hasPositions && !hasOrders) return null;` and modal-level `disabled` when positions empty cover |

Overall recipe coverage: 0/5 ACs PROVEN in browser; 5/5 UNTESTABLE (CDP offline, standard tier).
Untestable: AC1–AC5 — CDP offline in this slot.

> ⚠ Coverage escalation: AC1–AC5 not proven in browser.
>   Reason: CDP not responding on port 6666 at slot start; standard tier proceeds code-only.
>   Human reviewer must validate manually before merging.

## Prior Reviews

| Reviewer | State | Date | Addressed? | Notes |
|----------|-------|------|------------|-------|
| geositta | CHANGES_REQUESTED | 2026-05-18T18:56:40Z | addressed | Fee-discount omission + partial-batch success-toast issues — both fixed in `c1afce69` (apply discount in modal, handle partial failures) |
| geositta | CHANGES_REQUESTED | 2026-05-19T14:14:34Z | **unaddressed** | "Always-on discount lookup": `usePerpsMetamaskFeeDiscountBips` runs on every PerpsView render because `CloseAllPositionsModal` is mounted unconditionally; triggers `rewardsGetPerpsDiscountForAccount` + drives the new console-baseline act warnings. No commits since this review. |
| cursor | COMMENTED ×9 | various | n/a | Automated bot comments — not blocking |

## Acceptance Criteria Validation

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Close All button visible with ≥1 position | PASS (unit) | `perps-view.test.tsx` `displays close all button in positions section`; `perps-positions-orders.tsx:66-78` |
| 2 | Tap opens confirmation modal | PASS (unit) | `perps-view.test.tsx` `opens confirmation modal when close all button is clicked`; modal render-tests in `close-all-positions-modal.test.tsx` |
| 3 | Confirm submits batch close | PASS (unit) | `perps-view.test.tsx` `calls batch close after confirmation and applies a single positions snapshot` (calls `perpsClosePositions [{closeAll:true}]`) |
| 4 | Cancel does nothing | PASS (unit) | `perps-view.test.tsx` `does not execute close all when confirmation is cancelled` |
| 5 | No positions → button hidden/disabled | PASS (code review) | `perps-positions-orders.tsx:40-42` returns null when both arrays empty; `close-all-positions-modal.tsx:193` disables submit when `positions.length === 0` |

## Code Quality

- Pattern adherence: follows existing perps modal patterns (`ClosePositionModal`); uses `submitRequestToBackground` (MV3-safe), `data-testid` everywhere, `useI18nContext` for strings.
- Complexity: `CloseAllPositionsModal` aggregates per-symbol notionals then dispatches one fee RPC per unique symbol — appropriate. Memoization via `symbolNotionalKey` (JSON-stringified sorted pairs) correctly avoids re-fetch on identity-only array swaps from the stream.
- Type safety: clean; no `as any`, no `as unknown as`. New props use explicit types.
- Error handling: `try/catch` around batch close with failure-path toast + telemetry; refresh failure swallowed by design (positions already closed).
- Anti-pattern findings: none flagged for import boundaries / LavaMoat / chrome.runtime.

## Fix Quality

- **Best approach (mostly):** flow design (button → modal → confirm → execute) matches mobile and is the right shape. Latest fee-discount and partial-failure fixes are correct.
- **Would NOT ship:**
  - `ui/components/app/perps/close-position/close-all-positions-modal.tsx:109` — `usePerpsMetamaskFeeDiscountBips(...)` runs unconditionally inside a modal that PerpsView always mounts. Result: every Perps tab render fires `rewardsGetPerpsDiscountForAccount`, and the closed-modal test path now exceeds the act-warning baseline (+9 on modal test, +2 on perps-view test in this run). Reviewer geositta flagged this in the open CHANGES_REQUESTED review. Fix in `ui/components/app/perps/perps-view.tsx:402` by gating the JSX: `{isCloseAllModalOpen && <CloseAllPositionsModal .../>}`, OR pass `isOpen` to the hook and short-circuit there.
- **Test quality:**
  - `close-all-positions-modal.test.tsx:61` and `:166` mock `submitRequestToBackground` to return `{ feeRate: 0.00145 }`, but the modal reads `result?.protocolFeeRate` / `result?.metamaskFeeRate`. The tests therefore exercise the fallback branch on every assertion path — the per-symbol "fetches fees per unique symbol rather than using a single rate" test verifies that the RPC was called per symbol but does **not** verify that the symbol-specific rates were actually applied. Suggestion: return a full `FeeCalculationResult` with distinct `protocolFeeRate`/`metamaskFeeRate` per symbol and assert the rendered `perps-close-all-fees-value`.
  - `close-all-positions-modal.test.tsx:84` etc. only assert that `data-testid` nodes exist; they don't assert the displayed value. Reverting the corresponding math would still pass these tests.
- **Brittleness:**
  - `setIsLoadingFees(isOpen && positions.length > 0)` (modal.tsx:104-106) — initial state derived from props at mount time. Safe because the `useEffect` re-derives on open, but the redundancy reads as defensive duplication.
  - `youWillReceive = roundedMargin - roundedFees` (modal.tsx:188-191) double-rounds; the absolute drift is <$0.005 so not a correctness bug, but `Math.round((totalMargin - estimatedFees) * 100) / 100` is the simpler equivalent.

## Live Validation

- Recipe: skipped (standard tier, CDP offline).
- Result: SKIPPED.
- Evidence: skipped (CDP offline — no browser session available).
- Webpack errors: not monitored (CDP offline).
- Log monitoring: skipped (CDP offline).

## Correctness

- Diff vs stated goal: aligned. Button re-enabled, modal added, batch close + telemetry wired.
- Edge cases:
  - Positions array streaming updates during modal-open window: handled via `symbolNotionalKey` memo — re-fetches fees only when symbol/notional content changes.
  - PnL sign rendering: `Math.abs()` before `formatPerpsFiatUniversal`, sign prefixed by template — correct for both positive and negative PnL.
  - Modal dismissal via overlay click → calls `onClose` → fires `CLOSE_ALL_CANCELLED` telemetry. Intentional (overlay-click is equivalent to cancel).
  - `successCount = result?.successCount ?? positionCount` (perps-view.tsx:207) — provider may not return counts on `success:true`; falling back to attempted count is reasonable but means the analytics value can be optimistic when the provider is partial without reporting it. Low risk.
- Race conditions: `feeRequestId.current` increment + match guards stale RPC resolves. Good.
- Backward compatibility: button was previously hidden; re-enabling is the intended user-visible change.

## Static Analysis

- lint:tsc: PASS (exit 0, no errors).
- Tests: 49/49 pass. **Console baseline check FAILS** for two files: `close-all-positions-modal.test.tsx` Act warnings 16→25 (+9), `perps-view.test.tsx` 4→6 (+2). This is the direct consequence of the unconditional discount-hook call; fix the mount-gating and the regression goes away.

## Mobile Comparison

- Status: ALIGNED (with minor pattern divergence).
- Details: mobile bundles fee + rewards computation in a dedicated `usePerpsCloseAllCalculations` hook (`metamask-mobile-ref/app/components/UI/Perps/Views/PerpsCloseAllPositionsView/PerpsCloseAllPositionsView.tsx:76-83`). Extension reimplements the fee-aggregation logic inline in the modal. Both apply the MetaMask fee discount; both surface "you'll receive". Extension currently lacks the rewards-points display path — that's out of scope per the ticket. Not a divergence to fix in this PR, but a candidate for a follow-up `usePerpsCloseAllFees` hook to match mobile's structure.

## Architecture & Domain

- MV3-safe: uses `submitRequestToBackground`, no `window.background`.
- LavaMoat: no `yarn.lock` change → no policy update needed.
- Import boundaries: `shared/constants/perps.ts` `PERPS_FALLBACK_FEE_RATES` is the new SSOT, consumed by both `usePerpsOrderFees` and the modal — good consolidation.
- Controller usage: no controller code touched; only background RPC method names referenced.

## Risk Assessment

- MEDIUM — wires a destructive batch action (close all positions). The flow itself is gated by a confirmation modal and existing batch-close backend logic. The unaddressed reviewer concern is performance/test-quality, not correctness of the destructive path, but the act-warning regression breaks the unit-test baseline gate.

## Recommended Action

REQUEST_CHANGES — address the open CHANGES_REQUESTED before merging.

Specific items:
1. **must_fix** `ui/components/app/perps/perps-view.tsx:402` — gate the modal mount: `{isCloseAllModalOpen && <CloseAllPositionsModal ... />}`. This removes the unconditional `rewardsGetPerpsDiscountForAccount` call on every Perps tab render and resolves the console-baseline regression.
2. **suggestion** `ui/components/app/perps/close-position/close-all-positions-modal.test.tsx:61` — return a full `FeeCalculationResult` from the mock so tests actually exercise the symbol-specific rate application.
3. **suggestion** `ui/components/app/perps/close-position/close-all-positions-modal.tsx:188` — compute `youWillReceive` from raw values then round once.
4. **nitpick** `ui/components/app/perps/close-position/close-all-positions-modal.tsx:104` — `useState(isOpen && positions.length > 0)` is redundant given the open-effect already manages this; initialise to `false`.
