# PR #45067 — Comment Triage Report

## Triage

| # | Author | File | Triage | Action |
|---|--------|------|--------|--------|
| 1 | cursor[bot] | app/scripts/messenger-client-init/perps-controller-init.ts:353 (comment 3688020898) | REAL — already fixed | Retried cancel call already sits outside the `try/catch` around `init()` (see `guardCancelOrder`), so a throwing retry propagates instead of being masked by the original `ORDER_UNKNOWN_COIN` result. Fixed in prior round, commit `c1ab9d8811`. Reply + resolve thread. |
| 2 | cursor[bot] | ui/pages/perps/perps-withdraw-page.tsx:169 (comment 3695960545) | REAL — already fixed | `freshBalance` adoption now keyed off a monotonic `streamRevision` counter (bumped on every streamed-value change) instead of raw value equality, so a stream that revisits an earlier numeric snapshot no longer re-pins the stale balance. Fixed in prior round, commit `919963bf61`. Reply + resolve thread. |
| 3 | geositta (human, reply to comment 1) | app/scripts/messenger-client-init/perps-controller-init.ts:353 (comment 3693453356) | OUT OF SCOPE — documented follow-up | Concern: the `ORDER_UNKNOWN_COIN` retry calls the controller's `cancelOrder` a second time, so a recovered cancel still logs the controller's first `failed` analytics event before the retry's `executed`. This is explicitly called out as a known, deliberate follow-up in the PR description ("cancel success-rate metric needs the re-baselining already listed as a follow-up") rather than something to fix in this PR — suppressing the controller's own analytics boundary from the extension side would require an upstream `@metamask/perps-controller` change. geositta's own later review on this PR is APPROVED (submitted after this comment), consistent with treating it as an accepted follow-up. Reply noting this, no code change. |

Total comments: 3 (2 REAL, 1 OUT OF SCOPE)

## Integration status

See `integration-status.txt`: `rebased`. Branch was 15 commits behind `origin/main`; rebase hit conflicts in:
- `shared/constants/perps-events.ts` (analytics contract moved to `@metamask/perps-controller` package on `main`; merged Extension-only additions on top)
- `ui/components/app/perps/cancel-order/cancel-order-modal.tsx` / `.test.tsx` (multiple sequential conflicts across the branch's own self-review commits, resolved by preserving each commit's intended net design — translated cancel errors, throw-into-catch consolidation, CANCELLED-outcome tracking)
- `app/scripts/messenger-client-init/perps-controller-init.test.ts` (duplicate mock-factory hunk from a stub-spread restoration commit; de-duplicated, kept the single correct mock)

All conflicts resolved with no functional regressions; verified no leftover conflict markers and that the mock/component files type-check structurally.

## Local validation (step 9)

`mm-harness check diff --profile fast`: initial run failed (1 eslint error, 4 jest failures). Root causes and fixes:
- `react-hooks/exhaustive-deps` in `cancel-order-modal.tsx`: `handleCancel`'s `useCallback` deps were missing `order.orderType`, used by the newly-merged CANCELLED-outcome tracking call. Added it.
- Jest: my own rebase-conflict resolution in `shared/constants/perps-events.ts` had dropped the branch's local `ERROR_MESSAGE_KEY.INSUFFICIENT_BALANCE` (reasoning it was redundant with the `@metamask/perps-controller` spread) — true for the real package, but `test/mocks/metamask-perps-controller.js` doesn't define `ERROR_MESSAGE_KEY`, so `PERPS_EVENT_VALUE.ERROR_MESSAGE_KEY.INSUFFICIENT_BALANCE` (`perps-withdraw-page.tsx:402`) threw in tests. Restored it as an explicit local key (still spreads the controller value where available).
- Jest: `cancel-order-modal.test.tsx`'s "does not emit duplicate PerpsOrderCancelTransaction on successful cancel" test had a leftover contradictory assertion (`toBe(false)` after already asserting the event WAS called) from an earlier pre-CANCELLED-outcome version of the test, exposed by the same rebase. Changed the trailing assertion to check exactly one call (matching the test's actual "no duplicate" intent).

Re-run after fixes: `check diff` PASS (eslint/oxfmt/jest/policy-suppressions all pass). Coverage analysis: PASS (new code 98%, overall 96%).

## Recipe validation (step 10)

`HAS_RECIPE: yes` (family-inherited). CDP health PASS, extension reloaded in place via `reattach.sh` (webpack watcher already had the rebuilt bundle). Recipe run: **PASS** (both AC1 live-cancel and AC2 already-closed-cancel nodes passed). 8 non-blocking side findings in `diagnostics.json`, all benign: dev-env chain-ID `0x89` polling noise, a 404 resource load, "Sentry not initialized" (expected in dev), an `ExtensionLazyListener` memory-leak warning, and the `cancel 0: already canceled, or filled` provider rejection that AC2 intentionally triggers to exercise the already-closed path. No regressions.

## Commit / files / validation

- Total comments: 3 (2 REAL, 1 OUT OF SCOPE — both REAL comments were already fixed in prior rounds; this round's own commit `f367a66e54` fixed a lint/test regression introduced by this rebase's own conflict resolution, see below)
- Fix commit (this round): `f367a66e54` — "fix: address review comments on PR #45067"
- Files changed in this round's commit: `shared/constants/perps-events.ts`, `ui/components/app/perps/cancel-order/cancel-order-modal.tsx`, `ui/components/app/perps/cancel-order/cancel-order-modal.test.tsx`
- Full branch diff vs `origin/main` (15 files, matches PR scope): see `git diff origin/main...HEAD --name-only`
- Recipe re-validation: **PASS** (see "Recipe validation (step 10)" above)
- Integration status: `rebased` (branch was 15 commits behind `origin/main`; rebased clean, pushed with `--force-with-lease`)
