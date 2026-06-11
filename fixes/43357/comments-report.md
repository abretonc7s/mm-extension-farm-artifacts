# PR #43357 Comment Triage Report

PR: feat(perps): add configurable slippage controls
Branch: TAT-1043-feat-add-perps-slippage-config

## Triage table

| # | Author | File | Triage | Action |
|---|--------|------|--------|--------|
| 1 | cursor[bot] | test/e2e/tests/perps/perps-fixture-config.ts:101 | REAL | Add `perpsSlippageConfig2` override to `mockEligibleFeatureFlags` HTTP mock so the background `/v1/flags` fetch returns `enabled:false`, matching the seeded controller state. |

## Notes

- **16 other cursor[bot] inline review threads are already RESOLVED** by prior family runs (GraphQL `isResolved: true`). No new action needed this pass. Per SINGLE-PASS rule, not re-triaged.
- **Conversation comments**: all non-actionable — CI bots (CLA signature, codeowners, `metamaskbotv2` build-ready) and `abretonc7s` farmslot run-summary reports (automated, not human review feedback). No code changes required.
- **No CHANGES_REQUESTED reviews.**

## Detail — Comment #1 (REAL)

> ### E2E slippage flag HTTP mismatch (Medium Severity)
> Disabling `perpsSlippageConfig2` only in `PERPS_ELIGIBLE_REMOTE_FEATURE_FLAGS` seeds the fixture with slippage off, but `mockEligibleFeatureFlags` still returns the production default (`enabled: true`) for that flag. Background `updateRemoteFeatureFlags` on load/UI open can overwrite seeded state, re-enabling slippage gating and leaving submit disabled without order-book estimates.

Root cause: `mockEligibleFeatureFlags` (line 260) builds the `/v1/flags` response from `getProductionRemoteFlagApiResponseWithOverrides()` without including `perpsSlippageConfig2`, so production default (`enabled:true`) leaks through and the background controller overwrites the seeded `enabled:false`.

Fix: add `perpsSlippageConfig2: PERPS_ELIGIBLE_REMOTE_FEATURE_FLAGS.perpsSlippageConfig2` to the overrides map in `mockEligibleFeatureFlags`, mirroring the seed exactly.

## Validation

- **Merge main (step 3):** clean — no conflicts (`origin/main` 1ab4918c86 merged).
- **CI parity gate:** lint:changed ✓, verify-locales ✓, circular-deps ✓.
- **Unit tests (first 5 changed test files):** all pass (73/137/24/3/11, 0 failures).
- **Coverage:** VERDICT PASS — new code 95% (210/220). Warnings pre-existing only.
- **Recipe re-validation:** PASS (CDP health PASS, `recipe-run/summary.json` status `pass`). Re-validated post-merge branch state. Note: the only code change this pass is in `test/e2e/` (not bundled into `dist/chrome`), so the live extension behaviour is identical — recipe confirms the merge from main did not regress.

## Summary

- **Total comments triaged: 1 actionable** (1 REAL, 0 FALSE POSITIVE, 0 OUT OF SCOPE).
- 16 other cursor[bot] inline threads already RESOLVED by prior runs; conversation comments all non-actionable (CI bots + farmslot run summaries).
- **Commit SHA:** `7720371fa8`
- **Files changed:** `test/e2e/tests/perps/perps-fixture-config.ts` (+6)
- **Recipe re-validation:** PASS
- **Merge-main status (step 3):** clean (no conflicts)
- Replied to comment 3393346780 and resolved its thread.
