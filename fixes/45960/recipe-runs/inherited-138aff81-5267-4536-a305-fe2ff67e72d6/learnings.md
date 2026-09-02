# Learnings — TAT-3845

- **A three-major-version controller bump had a one-file compile surface.** The CHANGELOG
  listed five breaking changes across 13.0.0-15.0.0, but only the widened `PerpsErrorCode`
  union reached the extension — the rest guard against consumers that construct full
  controller state or implement `PerpsProvider`, and the extension does neither. Reading the
  changelog first and then confirming with `tsc` was much cheaper than auditing usage by
  hand across the ~100 files that import the package.

- **`git status` reported `.prettierignore` as modified while `git diff` showed nothing.**
  A phantom stat-only change on the shared volume. Left as-is it would have been swept into
  step 30's `git add -A`. `git checkout --` on the file cleared it. Worth checking for on
  this slot before staging.

- **The strongest dependency-bump assertion is a grep of the built bundle.** Asserting
  `package.json`, `yarn.lock` and the resolved `node_modules` version all pass against a
  stale `dist`. Grepping `dist/chrome` for `ORDER_CHASE_MAX_DISTANCE_INVALID` — a symbol
  that first exists in 13.0.0 — is what actually proves the running extension is on the new
  controller. That is the node a revert would fail first.

- **`jest -t` needed a count assertion to be worth anything, and `--verbose` did not help.**
  The project's Jest reporter suppresses per-test names even under `--verbose`, so an
  `assert_output contains "<test title>"` node can never pass. The fix was to run the case
  under a title filter and assert the exact `44 skipped, 1 passed, 45 total` line, which
  simultaneously proves the filter matched something — the documented `jest -t` zero-match
  vacuous-pass trap.

- **Four recipe failures were harness/product test-id drift, not my change.** The library's
  perps navigators wait on `market-list-view` and `perps-market-detail-page`, and the perps
  surface detector keys off the same ids; none exist in this build, so `page: perps-market*`
  and `surface: "market-list"` fail on `main` too. Raising the timeout to 120s was the wrong
  first guess and cost a run — grepping the product for the test id the harness wanted would
  have found it in seconds.
