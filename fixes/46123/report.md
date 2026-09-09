# PR 46123 account-transition fix

Pushed `63ddfd4fd5cc95a04ea7022b6cbdc61f5f056d66` to the existing PR after rebasing onto origin/main 717a070158. One REAL Bugbot finding, comment 3956190389, fixed, replied to and resolved. Six status-only comments skipped. Changed only `ui/providers/perps/PerpsStreamManager.ts` and its colocated test in this fix commit. Transitions cancel old REST fallbacks, retain new-session snapshots emitted during initialization, and clear early snapshots on failure.

Validation passed:

- Regression reproduction before fix: 4 failures, 101 passing; fixed manager: 105 passing. Final test-only tuple typing correction also passes all 105 tests.
- Bounded gate: 510 tests in 13 suites. Coverage: 576 tests in 15 suites; 240/253 changed executable lines, 94.9%, every changed file above 80%. Manager: 52/53, 98.1%.
- Non-test Chrome MV3 LavaMoat build and final 27-node recipe pass. Local Mobile-compatible traces asserted; remote Sentry ingestion unverified.
- Final lint fixer, JSON, format, full ESLint, TypeScript, styles, messenger action types, locales, circular dependencies and changed-file lint all pass. Initial TypeScript tuple failure retained in the evidence and corrected before commit.

Evidence in this directory: comments-report.md, validation-final.json, parity-*.log, final-manager-tests.log, coverage-report.json, recipe-run-final/summary.json, push.log and resolve-result.json. PR description updated with before/after behavior table, validation results and remaining gaps.

Full scope remains partial. Existing Sonar string-sort false positive, PR-size failure and reviewer policy remain recorded. No post-push review/CI round performed. Manual interruption proof remains incomplete for disabled-functionality lock/unlock, close/reopen grace and populated position/order variants. Unequal tabs invalidated the original loading metrics; controlled samples then exposed unequal HTTP-cache behavior. No fair fresh-backend loading gain is claimed. No new PR or harness implementation.

Runtime restored to original account, Basic Functionality enabled and one unlocked Home page. Harness findings: harness-retro.md links the parent retrospective. These completion signals close this review-fix pass; they do not assert merge readiness or completion of the original performance measurement request.
