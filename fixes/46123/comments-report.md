# PR 46123 review fixes

| Comment | Source | Author | File | Triage | Action |
| --- | --- | --- | --- | --- | --- |
| 3964654853 | review_comment | cursor[bot] | ui/hooks/perps/usePerpsPreload.ts:92; perps-stream-bridge.ts | REAL | Separate initialized wallet stream ownership from optional preload lifetime so timeout, stop and preload failure preserve existing Home/Discover subscriptions. |

Finding: a timeout before perpsStartPreload leaves canEmit false after late init. Stopping or failing preload destroys streams despite an initialized UI manager. Tests exercise the bridge public API and callback delivery before/after cancellation, including cleanup on disconnect and revoked eligibility.

Fetched all inline, conversation and review records once. One previously resolved inline finding, 3956190389, and its existing author reply were excluded from unresolved triage. Six status-only conversation comments were skipped without replies. No CHANGES_REQUESTED review bodies.

Context: full 37-file PR diff and live PR description reviewed. The staged TAT-3857 ticket comment says the intent is accelerating loading, not merely fetching data. No live Jira connector is available. Inherited report retains incomplete loading comparison, remote telemetry and interruption checks; this pass does not claim those are complete.

CI snapshot: Sonar reports S2871 string sorting in the bridge and S3776 complexity 16/15 in the stream manager. PR-size check fails and reviewer policy is pending; those require separate PR scope/review handling. CI remains in progress. Single-pass instructions prohibit a post-push review loop.

Integration: rebased cleanly onto origin/main 867848e248; yarn.lock unchanged. Runtime helper required its missing farmslot-dir argument; corrected invocation passed.

Self-review: initialized ownership is set before initial subscription callbacks and cleared by destroy. Temporary preload cleanup preserves wallet data and dynamic prices; preload-only owners still tear down. Eligibility revocation remains gated and tested. All changes stay in three existing PR files.

Local validation: four new regressions failed before the fix; 214 focused tests pass after it. Changed-file fast gate passes 515 tests in 13 suites plus ESLint/oxfmt. Coverage passes with 243/256 changed executable lines covered (94.9%), every file above 80%. Temporary analyzer base corrected to origin/main including working-tree edits; original script preserved.

CI corrections: explicit string comparator addresses S2871; optional-chain guard removes one complexity point for S3776 while preserving pending-init behavior.

Full TypeScript check: PASS.

Runtime proof preparation: doctor reported healthy CDP but no webpack watcher. A fresh harness production-like build was requested for the edited working tree. Copied the inherited recipe helper into this task and changed only helper paths in the recipe to preserve historical evidence. The frozen capability catalog is empty; runtime.capability.list is unavailable in installed harness 0.50.2, and no capability leases were acquired.

Fresh non-test LavaMoat compilation passed. Harness launch verification failed EVM_RPC_UNREACHABLE; background console at 12:50:35 reports PersistenceError: storage.local does not contain vault data, followed by Background connection unresponsive. This is a runtime/profile prerequisite failure, not evidence of a Perps regression. Relaunch recovery requested using doctor recommendation.

Runtime recovery: harness relaunch readiness and generic smoke checks passed using the development watcher, but the product recipe failed at its first ensure_unlocked node with WALLET_STATE_REQUIRED: no wallet onboarded in the profile. No product acceptance node executed. The launch had already logged a missing-vault PersistenceError. These wallet/bootstrap paths are not touched by the three review-fix files. Per step 10, continue with an unrelated prerequisite failure; do not present prior inherited evidence as current proof. No manual fixture application, profile reset or credential change was performed.

Recipe result: FAIL (wallet-state prerequisite), product behavior unverified in the browser. Non-test LavaMoat build: PASS. Fresh recovery runtime: development build, not production-runtime proof.

## Final result

- Total actionable comments: 1 (1 REAL, 0 FALSE POSITIVE, 0 OUT OF SCOPE).
- Skipped: 6 status-only conversation comments, 1 previously resolved inline finding and its existing reply. No new comments fetched after push.
- Commit: `aa9cd33f9e1a5a2b85f2e26d6a1a5bdd5d0a4db4`. One review-fix commit and one push, guarded by the recorded remote SHA.
- Files changed: `app/scripts/controllers/perps/perps-stream-bridge.test.ts`, `app/scripts/controllers/perps/perps-stream-bridge.ts`, `ui/providers/perps/PerpsStreamManager.ts`.
- Integration: `rebased` onto `867848e2481626dc47ee1bb0f2695dc45d0eef67`; lockfile unchanged.
- Reply: posted once to inline comment 3964654853 and thread resolved, confirmed by resolve-result.json.
- Validation: 214 focused tests pass; 515 tests in the fast gate pass; full TypeScript, lint fixer, strict changed-file lint, locales and circular dependencies pass. Changed-line coverage 243/256, 94.9%; every changed file meets 80%.
- Non-test LavaMoat compilation: PASS. Product recipe: FAIL at setup-unlock with WALLET_STATE_REQUIRED; no product acceptance nodes executed. Full browser behavior remains unverified for this fix.
- Working tree: clean after commit and push.
- Merge readiness is not claimed. The pre-push snapshot includes a failing PR-size check and pending reviewer policy. Sonar findings were corrected locally; fresh CI results were not polled under the single-pass contract.

Original family gaps remain: a comparable fresh-backend loading measurement, remote Sentry ingestion, populated order/position variants and complete interruption evidence. Current work closes the supplied stream-lifetime review finding with deterministic state proof.
