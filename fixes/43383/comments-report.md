# PR #43383 — Comment Triage Report

**PR:** fix: extension 'insufficient funds' error when size slider is at 100%
**Branch:** TAT-3312-fix-fix-size-slider-funds

## PR purpose (context)

At 100% size the amount is computed as `availableBalance * leverage`. The old
code used `value.toFixed(2)` which rounds; rounding **up** pushed
`marginRequired = amount / leverage` a sub-cent above the available balance,
producing a false "Insufficient funds" error. The fix floors to 2 decimals
(`Math.floor(value * 100) / 100`), mirroring mobile's `Math.floor` in
`usePerpsOrderForm`. Net behavioral change: `amount-input.tsx` (+8 −1) plus a
regression test in `amount-input.test.tsx`.

## Comments

| # | Author | Type | Where | Triage | Action |
|---|--------|------|-------|--------|--------|
| 1 | github-actions[bot] | Bot | conversation | NON-ACTIONABLE | CLA signature status notice — informational |
| 2 | mm-token-exchange-service[bot] | Bot | conversation | NON-ACTIONABLE | CODEOWNERS routing notice — informational |
| 3 | metamaskbotv2[bot] | Bot | conversation | NON-ACTIONABLE | "Builds ready" notice — informational |
| 4 | abretonc7s | User | conversation | NON-ACTIONABLE | farmslot run summary (orchestration noise), not review feedback |
| 5 | abretonc7s | User | conversation | NON-ACTIONABLE | farmslot run summary (orchestration noise), not review feedback |
| 6 | abretonc7s | User | conversation | NON-ACTIONABLE | farmslot run summary (orchestration noise), not review feedback |

## Summary

- **Inline review comments:** none
- **REQUEST_CHANGES reviews:** none
- **Human reviewer feedback:** none
- **Bot findings (cursor[bot]/bugbot):** none

No actionable comments. All conversation comments are automated bot notices
(CLA / CODEOWNERS / builds-ready) or farmslot orchestration run summaries posted
by the orchestrator account. Nothing requires a code fix.

- **REAL:** 0
- **FALSE POSITIVE:** 0
- **OUT OF SCOPE:** 0
- **NON-ACTIONABLE:** 6

## Validation

- **CI parity gate:** PASS (lint:changed / verify-locales / circular-deps all clean; working tree had no uncommitted changes).
- **Unit tests:** `amount-input.test.tsx` 39/39 PASS.
- **Coverage:** PASS — `amount-input.tsx` 97% (new code meets threshold). Note: the coverage analyzer initially compared against a stale local `main` ref and flagged merged-in files from origin/main; fast-forwarding local `main` to `origin/main` restored the correct base (PR delta = the 2 `amount-input` files only).
- **Recipe re-validation:** PASS. First run failed at the `gate-wait-balance` step because the recipe hard-waited for the literal balance "21.38" which has drifted to "20.92" on live HyperLiquid (unrelated to this branch — no review fixes applied; merge did not touch `amount-input.tsx`). Made the gate robust (wait for the stable "Available to trade" label instead of a hardcoded balance figure) and re-ran: PASS. Also confirmed live via CDP that at 100% size the submit button reads "Open long ETH" with no "Insufficient funds" error.
- **Merge-main status:** clean (no conflicts).

## Finalization

- **Total comments:** 6 (0 REAL, 0 FALSE POSITIVE, 0 OUT OF SCOPE actionable; 6 non-actionable automated/orchestration posts).
- **Review-fix commit:** none (no actionable comments → no code changes).
- **Pushed commit:** `c67d99ad6e` — merge of `origin/main` into `TAT-3312-fix-fix-size-slider-funds` (brings PR up to date for mergeability).
- **PR files changed (vs origin/main):** `ui/components/app/perps/order-entry/components/amount-input/amount-input.tsx`, `ui/components/app/perps/order-entry/components/amount-input/amount-input.test.tsx` (pre-existing fix; unchanged by this run).
- **Recipe re-validation:** PASS (after making the balance gate robust to live-data drift).
- **Merge-main status:** clean.
