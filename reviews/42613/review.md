# PR Review: #42613 — feat(perps): add close-all-positions confirmation modal

**Tier:** standard (RECIPE_STRATEGY: full-qa)

## Summary
The PR re-enables the previously hidden "Close all" button in the Perps positions tab (TAT-2852) and wires it to a new `CloseAllPositionsModal` confirmation step before firing the batch close. The modal summarises Margin (with aggregate P&L), estimated Fees (per-symbol `perpsCalculateFees` + MetaMask fee discount, with `PERPS_FALLBACK_FEE_RATES` on failure) and "You'll receive". Confirm runs the existing `perpsClosePositions [{ closeAll: true }]` path, drives in-progress/success/partial/failed toasts, fires Mixpanel events (`close_all_tapped/confirmed/cancelled` + `number_positions_closed` on `Perp Position Close`), and refreshes positions. Cancel ("Keep positions") skips the RPC. It achieves its stated goal and matches the ticket's confirmation-flow intent. The fallback-fee-rate constant was DRY-extracted to `shared/constants/perps.ts` and `usePerpsOrderFees` now exports `BASIS_POINTS_DIVISOR`/`ORIGINAL_METAMASK_FEE_BIPS`.

## Recipe Coverage

| # | AC (verbatim) | Target env | Recipe nodes | Screenshot | Verdict | Justification |
|---|---------------|------------|--------------|------------|---------|---------------|
| 1 | AC1 — at least one open position → "Close All" button visible on Perps tab | fullscreen | ac1-assert-close-all-button-visible, ac1-assert-positions-present, ac1-screenshot-close-all-button | evidence-ac1-close-all-button-visible.png | PROVEN | "Close all" control visible beside Positions header with BTC + HYPE open; DOM assert visible + positionCount>0 |
| 2 | AC2 — tap → confirmation screen shows expected outcome | fullscreen | ac2-open-confirmation-modal, ac2-wait-modal-submit, ac2-wait-fees-loaded, ac2-assert-summary-rows, ac2-screenshot-confirmation-modal | evidence-ac2-confirmation-modal.png | PROVEN | Modal shows Margin $6.43 (incl P&L −$0.3521), Fees −$0.03, You'll receive $6.41 + Keep/Close buttons |
| 3 | AC3 — confirm → all positions submitted for closure | fullscreen | — (not run live; real irreversible market close on mainnet funds) | n/a | UNTESTABLE-live → PROVEN via unit test + code | `perps-view.test.tsx` asserts `perpsClosePositions [{closeAll:true}]` fires only after modal submit |
| 4 | AC4 — cancel → no positions closed, return to Perps tab | fullscreen | ac4-cancel-keep-positions, ac4-wait-modal-gone, ac4-assert-positions-intact, ac4-screenshot-positions-intact | evidence-ac4-cancelled-positions-intact.png | PROVEN | "Keep positions" dismisses modal, positions intact, still on Perps tab |
| 5 | AC5 — no open positions → button hidden or disabled | fullscreen | — (live account has positions; cannot zero non-destructively) | n/a | UNTESTABLE-live → PROVEN via code + unit test | Button rendered only inside `{hasPositions && …}`; component returns null when no positions/orders; modal test covers empty→disabled submit |

Overall recipe coverage: 3/5 ACs PROVEN (live browser)
Untestable: AC3 (irreversible live market close — proven via unit test asserting `perpsClosePositions([{closeAll:true}])`), AC5 (cannot reach zero-position state on the live mainnet account — proven via code path + unit test). Both have concrete rationale and passing test/code evidence; no WEAK/MISSING rows. AC3/AC5 were validated by test+code rather than live execution purely to avoid an irreversible action on real funds — not due to a coverage failure.

## Prior Reviews
| Reviewer | State | Date | Addressed? | Notes |
|----------|-------|------|------------|-------|
| cursor (bot) | COMMENTED ×9 | 2026-05-13 → 05-18 | n/a | Automated bot passes during iteration |
| geositta | CHANGES_REQUESTED | 2026-05-18 | addressed | Discounted-user inflated fee + partial-failure full-success toast → fixed in c1afce69 (apply discount + handle partial) |
| geositta | CHANGES_REQUESTED | 2026-05-19 14:14 | addressed | Always-on discount lookup / console baseline → modal now mounts only when open (`{isCloseAllModalOpen && …}`), so the discount hook no longer runs on every Perps render |
| abretonc7s | CHANGES_REQUESTED | 2026-05-19 15:11 | addressed | Automated review; many commits pushed 05-19 → 05-27 |
| geositta | CHANGES_REQUESTED | 2026-05-19 16:32 | addressed | First-render fee state → isLoadingFees init + reset on reopen + effect cleanup (05ec880b, 7b5688da, 86c3fcfd) |
| georgewrmarshall | COMMENTED | 2026-05-21 | n/a | |
| geositta | **APPROVED** | 2026-05-28 03:27 | — | Approved after the final commit (de8bfb4a, 05-27). All prior change requests resolved. |

This PR is already human-approved; the items below are non-blocking and were not re-raised.

## Acceptance Criteria Validation
| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Button visible with ≥1 position | PASS | recipe ac1-* (ok), evidence-ac1 screenshot |
| 2 | Confirmation screen shows expected outcome | PASS | recipe ac2-* (ok), evidence-ac2 screenshot |
| 3 | Confirm submits all closures | PASS (test/code) | perps-view.test "calls batch close after confirmation"; not executed live (irreversible) |
| 4 | Cancel closes nothing, returns to tab | PASS | recipe ac4-* (ok), evidence-ac4; unit test "does not execute close all when cancelled" |
| 5 | No positions → button hidden/disabled | PASS (code/test) | perps-positions-orders.tsx `{hasPositions && …}`; modal test empty→disabled |

## Code Quality
- Pattern adherence: follows perps conventions (design-system-react components, `useI18nContext`, `submitRequestToBackground`, `usePerpsEventTracking`). Modal-only-when-open mount pattern is correct.
- Complexity: appropriate. Fee effect uses a stable `symbolNotionalKey` + `feeRequestId` race guard + `cancelled` flag — reasonable.
- Type safety: `yarn lint:tsc` exit 0, no new type errors. `Position`/`FeeCalculationResult` typed from `@metamask/perps-controller`.
- Error handling: per-symbol fee fetch falls back to `PERPS_FALLBACK_FEE_RATES` on reject; confirm flow has try/catch with failed toast + analytics; position refresh failure is swallowed (non-critical, commented).
- Anti-pattern findings: none. No `getBackgroundPage`, no yarn.lock/LavaMoat delta, all interactive elements have `data-testid`, no `.toFixed`/`{min:2,max:2}` in display code (uses `formatPerpsFiat`).

## Fix Quality
- **Best approach:** Solid and shippable. Reuses the existing `perpsClosePositions {closeAll:true}` path; adds a confirmation gate only. The `successCount || positionCount` fallback correctly handles count-less v6 API success responses.
- **Would not ship:** nothing blocking.
- **Test quality:** Modal tests are strong — the "fetches fees per unique symbol" test asserts the exact computed value (`-$52.13`) and would fail if fee math regressed; `perps-view` tests assert the confirmation gate (open/confirm/cancel) and would fail if the gate were removed. GAP: the new partial-success (`successCount>0 && failureCount>0`) and failed branches in `handleCloseAllConfirm` have no `perps-view` unit coverage (the old cancel-all failure tests were deleted, not replaced).
- **Brittleness:** Low. `PERPS_FALLBACK_FEE_RATES` is a module const used only as a fallback. The fee-discount hook runs only while the modal is mounted. No mock-coupling issues.

## Live Validation
- Recipe: generated (full-qa) — `artifacts/recipe.json`
- Result: PASS — 12/12 nodes `ok:true` (trace-derived), setup via `perps/navigate-perps-tab`
- Evidence: 3 AC screenshots (ac1/ac2/ac4); standard tier — no video
- Webpack errors: none (compiled OK, watch mode; only the known non-gating `.metamaskprodrc` cache warning)
- Log monitoring: recipe console review status `clean` — 0 warnings/errors/exceptions

## Correctness
- Diff vs stated goal: aligned. Button re-enabled, modal gates the batch close, analytics + toasts wired.
- Edge cases: empty positions → submit disabled + early return; fee fetch failure → fallback rates; partial close → partial toast + refresh; reopen → fees reset.
- Minor display issue: the modal rounds Margin, Fees and "You'll receive" independently, so displayed `Margin − Fees` can be off by a cent vs the displayed "You'll receive" (observed $6.43 − $0.03 vs $6.41). Cosmetic only.
- Race conditions: handled via `feeRequestId` + `cancelled` flag in the fee effect; `useEffect` cleanup present.
- Backward compatibility: preserved. No controller state-shape change → no migration needed. Cancel-all-orders button remains commented out (out of scope per ticket).

## Static Analysis
- lint:tsc: PASS (exit 0, no errors)
- Tests: 43/43 pass (close-all-positions-modal 14 + perps-view 29), no console baseline violations

## Mobile Comparison
- Status: ALIGNED (minor intentional divergence)
- Details: Core math matches mobile `usePerpsCloseAllCalculations.ts` — `totalMargin = Σ marginUsed`, `receiveAmount = totalMargin − totalFees`, `marginUsed` treated as already PnL-inclusive (no double-count), per-symbol/coin fee rates, uniform discount applied (`rate × (1 − bips/10000)`). Divergences: (a) extension's simpler Figma summary omits the rewards/points estimate mobile shows — intentional per PR; (b) on fee-fetch failure extension uses hardcoded `PERPS_FALLBACK_FEE_RATES` while mobile leaves fees `undefined` (receive = margin); (c) extension passes only `{orderType,isMaker,symbol}` to `perpsCalculateFees` and applies the returned rate to its own notional, vs mobile passing `amount` — functionally equivalent for flat taker rates. None are correctness defects.

## Architecture & Domain
- MV3: no service-worker/background changes; UI-only + shared constant. No `getBackgroundPage`.
- LavaMoat: no dependency or policy changes (`yarn.lock`/`lavamoat/` untouched) → no policy regen needed.
- Import boundaries: clean — no `ui → app/scripts` imports; shared constant correctly placed in `shared/constants/perps.ts`.
- Jest: a global `moduleNameMapper` stub for `@metamask/perps-controller` was added (resolves ESM transitive import for all suites). Broad but standard; suites can still override with `jest.mock`. `PERPS_ERROR_CODES` proxy returns the key name as its value.

## Risk Assessment
- MEDIUM — touches a live batch-close trading flow, but adds an explicit confirmation gate, reuses the existing close path, and handles partial/failed outcomes. Already human-approved.

## Recommended Action
**COMMENT** (read-only review; approval is the human reviewer's decision — already APPROVED by geositta).

Non-blocking items:
- `ui/components/app/perps/perps-view.tsx:197` — add unit coverage for the partial-success and failed close-all branches (toast key + `number_positions_closed` analytics); consider whether a partial close should report `STATUS.FAILED`. (suggestion)
- `ui/components/app/perps/close-position/close-all-positions-modal.tsx:197` — `youWillReceive` is computed from unrounded margin/fees while the rows display independently-rounded values, so the summary can be off by a cent. (nitpick)
