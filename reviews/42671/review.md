# PR Review: #42671 — fix(perps): use Perps-owned toast path for token funded deposits

**Tier:** standard

## Summary
Drops the native-payment-token gating from `selectPerpsShouldShowDepositToast` and `selectPerpsDepositPending`, so the Perps-owned deposit toast flow now covers both native and token-funded (e.g. USDC on Arbitrum) Perps deposits. Also splits `PerpsDepositToast`'s completion vs. pending logic into two separate `useEffect`s (completion no longer requires an active deposit tx; cleanup runs only on duration timeout, not on unmount/rerender) and updates the success toast copy to match Mobile. Tests added for token-funded pending/completion and for the new clearing semantics. The PR achieves its stated goal; behavior is now aligned with mobile's broader-than-payment-token gating.

## Recipe Coverage

Standard tier with `Recipe decision: skip-funds-risk`. The full AC trigger path requires a real on-chain Perps deposit on mainnet (the live slot has $31.24 mainnet Perps balance and no testnet faucet); driving a real deposit would commit funds. Baseline live validation via `domains/perps/recipes/full-trade-lifecycle.json` smoke (11/11 PASS) confirms no regression in Perps surfaces touched by the toast component. AC1/2/3/4 are proven by jest behavior tests; AC5 is proven by the test files themselves. No silent skips.

| # | AC | Status | Proof |
|---|----|--------|-------|
| 1 | Native Perps deposits show the Perps deposit pending and success toasts. | UNTESTABLE live (funds risk) — PROVEN by tests | `perps-deposit-toast.test.tsx` "renders pending toast when mounting with deposit already in progress" + "renders success toast when lastDepositResult is successful" + "shows completion toast when deposit result arrives". Selector tests cover all pending statuses (`approved`, `signed`, `submitted`). |
| 2 | Token-funded Perps deposits show the Perps deposit pending and success toasts. | UNTESTABLE live (funds risk) — PROVEN by tests | `perps-deposit-toast.test.tsx` "renders pending toast for token-funded deposits" + "shows completion toast for token-funded deposits". Selector tests `selectPerpsDepositPending` "returns true for token-funded deposits with a non-native pay token". |
| 3 | Success toast copy matches Mobile: "Your Perps account was funded" / "Funds are ready to trade". | PROVEN by code | `app/_locales/en/messages.json:5981-5986` + `app/_locales/en_GB/messages.json:5981-5986` updated to those exact strings. |
| 4 | Generic transaction toasts do not replace or duplicate Perps deposit toasts. | PROVEN by code+tests | Toast `id = 'perps-deposit-toast'` is unique; `selectPerpsShouldShowDepositToast` gates ownership to `perpsDeposit` / `perpsDepositAndOrder` types. Test "dismisses and does not show a toast when there is no deposit state" guards against stray ownership. |
| 5 | Unit tests cover native and token-funded deposit toast behavior. | PROVEN | `perps-deposit-toast.test.tsx` adds explicit token-funded cases (lines 102-134, 552-593) and clearing-semantics cases (lines 262-384). `perps-controller.test.ts` flips the negative case to positive (line 289-305) and adds the native counterpart (307-323). `yarn jest` → 97/97 pass. |

Overall recipe coverage: 5/5 ACs PROVEN (untestable live, fully covered by tests + code review)
Untestable live: AC1, AC2 — real-deposit trigger requires committing on-chain funds; covered by jest unit tests instead.

## Prior Reviews

| Reviewer | State | Date | Addressed? | Notes |
|----------|-------|------|------------|-------|
| cursor   | COMMENTED | 2026-05-14 | n/a | Cursor Bugbot summarized risk only; no CHANGES_REQUESTED items to address. |

No prior human reviews.

## Acceptance Criteria Validation

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Native Perps deposits show the Perps deposit pending and success toasts. | PASS (tests) | jest tests cover all three pending statuses + success path. |
| 2 | Token-funded Perps deposits show the Perps deposit pending and success toasts. | PASS (tests) | dedicated token-funded pending + completion tests. |
| 3 | Success toast copy matches Mobile. | PASS | locale changes verified. |
| 4 | Generic transaction toasts do not replace or duplicate Perps deposit toasts. | PASS | unique toast id, type-gated selector, "no deposit state" test. |
| 5 | Unit tests cover native and token-funded deposit toast behavior. | PASS | 97 tests pass; both branches exercised. |

## Code Quality

- Pattern adherence: follows existing selector/component patterns. Removes unused `getNativeTokenAddress`, `Hex`, `EMPTY_TRANSACTION_DATA`, `isNativePayToken`, `selectPerpsLastDepositTransactionId` import.
- Complexity: simpler than before — selectors drop the `transactionData` lookup; toast component splits into two narrowly-scoped effects.
- Type safety: clean. `PerpsDepositPendingState` retained; no `any` introduced. `yarn lint:tsc` exit 0.
- Error handling: unchanged. `clearDepositResult` still swallows rejection.
- Anti-pattern findings: none. No new `data-testid` needed (existing `dataTestId={id}` retained). No LavaMoat changes (no `yarn.lock` diff). No service-worker or controller boundary touches.

## Fix Quality

- **Best approach:** Yes — this is the minimal correct fix. The native-only gating was the actual bug; removing it from the type-eligibility check is the right scope. Splitting the effects also addresses the unmount/rerender clear bug honestly (per the new "rerenders before duration elapses" + "unmounted before duration elapses" tests). Mobile's equivalent (`usePerpsDepositStatus`) likewise gates on `transactionMeta.type === TransactionType.perpsDeposit` without a payment-token check — alignment confirmed.
- **Would not ship:** nothing blocks merge.
- **Test quality:** strong. Tests assert exact toast id + duration + content props, not just call-count. Revert check: if the selector's payment-token gate were restored, the token-funded tests would fail (selector returns `false` → no toast dispatched → `toHaveBeenCalledWith` mismatch). The new completion-vs-pending priority test ("prefers the completion toast when a result and in-progress state coexist") locks down the new effect ordering. Failure paths (unapproved status, mismatched tx id, stale deposit) are covered.
- **Brittleness:** one race window worth flagging (see line comment on `perps-deposit-toast.tsx:71`): if a new Perps deposit starts before the previous success toast's 5s timer elapses, the pending effect's `if (hasDepositResult) return;` suppresses the new pending toast until `perpsClearDepositResult` fires. `clearDepositResult()` in `node_modules/@metamask/perps-controller/dist/PerpsController.cjs:1255-1259` only clears `lastDepositResult`, not `lastDepositTransactionId`, so the race is gated by the 5s timer. Mobile's approach (balance-increase watch instead of redux result) avoids this. Suggestion-level, not blocking — the back-to-back deposit window is narrow.

## Live Validation

- Recipe: skipped (decision: `skip-funds-risk` — driving a real deposit on mainnet would commit funds).
- Result: PASS for what was run.
  - `domains/perps/recipes/full-trade-lifecycle.json` smoke: 11/11 PASS (open/close ETH, BTC nav, network toggle, perps home). Single transient HUD warning `page.evaluate: Execution context was destroyed, most likely because of a navigation` during testnet toggle — known non-gating per CLAUDE.local.md (network reload destroys eval context).
  - PR-specific validation recipe `artifacts/validation-recipe.json`: 5/5 PASS. Navigated home → Perps tab, screenshot captured (`evidence-perps-tab-no-active-deposit.png`), confirmed `[data-testid="perps-deposit-toast"]` absent (no active deposit, expected), `PerpsDepositToast` mounted without crashing.
- Evidence: 1 screenshot. `browser.pid missing -- recording skipped. Check browser.log for PID resolution errors.` (full-tier video unused; tier is standard.)
- Webpack errors: none (30s tail clean; build serving the PR branch).
- Log monitoring: 30s tail of `temp/runtime/webpack.log` — no errors/failures. Auto issue review marked baseline-noise only (selector memoization, Unknown action Sentry events, React Router v7 future flag, MaxListeners) — all baseline, none gating.

## Correctness

- Diff vs stated goal: aligned. PR body says "selector now treats active perpsDeposit and perpsDepositAndOrder transactions as Perps-owned regardless of payment token" — diff does exactly that.
- Edge cases:
  - Covered: unapproved status, mismatched tx id, stale parallel perps tx, completion arriving while a tx is still active, rerender mid-duration, unmount mid-duration.
  - Uncovered (worth knowing, not blocking): a back-to-back deposit started within 5s of the previous success suppresses the new pending toast. See line comment.
- Race conditions: documented above. Completion takes priority over pending — that's the new "prefers the completion toast when a result and in-progress state coexist" test's contract.
- Backward compatibility: preserved. Selector API surface unchanged; `transactionData` lookup removal does not break any other selector — `EMPTY_TRANSACTION_DATA` and `isNativePayToken` were defined/used only in this file (verified by grep).

## Static Analysis

- `yarn lint:tsc`: PASS (exit 0)
- Tests: 97/97 pass (`perps-deposit-toast.test.tsx` + `perps-controller.test.ts`)

## Mobile Comparison

- Status: ALIGNED (with a noted divergence)
- Details:
  - **Type gating:** Mobile's `app/components/UI/Perps/hooks/usePerpsDepositStatus.ts:78` gates on `transactionMeta.type === TransactionType.perpsDeposit` (no payment-token gate). Extension PR now matches.
  - **Success trigger:** Mobile fires success on `liveAccount.availableBalance` increase via `usePerpsLiveAccount`. Extension fires success on `lastDepositResult.success` from controller state. Different mechanism, same user-facing outcome.
  - **Clear semantics:** Mobile only clears on the error path (500ms timeout). Extension clears on any completion (5s timeout). Extension's behavior is intentionally more aggressive — fine.
  - **Race-on-back-to-back-deposits:** Mobile avoids this because it uses a ref + balance-watching, not a derived "completion-vs-pending" priority. Extension inherits a narrow 5s race window. Worth knowing; not a blocker.

## Architecture & Domain

- MV3: no service-worker work; selector + component changes only.
- LavaMoat: no policy impact (no `yarn.lock` change; removed imports only).
- Import boundaries: respected. UI selectors stay in `ui/selectors/`; component imports from `ui/` only.
- Controller usage: `submitRequestToBackground('perpsClearDepositResult', [])` is the established Perps client call; matches existing pattern.

## Risk Assessment

- **LOW** — selector simplification + effect-split refactor on a single component, behind explicit pending statuses + type allowlist. Test coverage is honest and would catch the revert. Single edge case (back-to-back deposit race) is narrow and was previously also possible. Mainnet smoke baseline passes.

## Recommended Action

**COMMENT** — ship as-is. One non-blocking suggestion noted at `ui/components/app/perps/perps-deposit-toast.tsx:71` about the back-to-back deposit race window. Worth tracking as a follow-up if support sees it; not worth blocking this fix.
