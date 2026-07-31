# Learnings — update-branch, PR #45067 (TAT-3490)

- `Refreshing the runtime breaks the lint gate`: step 7 writes a webpack bundle snapshot into
  `temp/recipe/runtime/runtime-dist/`, and step 8's bare `yarn lint` then walks those 739 generated
  files and reports 4633 `Definition for rule '…' was not found` errors from `eslint-disable`
  comments inlined by the bundler. Real repo files had **0 errors**. The two steps are in direct
  conflict as written — either step 8 should call the changed-file gate, or the runtime snapshot
  needs an ignore that ships with the framework rather than with the repo.
- `Split lint output by path before believing a red gate`: "4633 errors" looked catastrophic until
  the log was bucketed by file prefix, which showed every one of them outside the repo's own source.
  Counting errors per path is a 10-second check that changes the verdict from "blocked" to "pass".
- `A conflict-free rebase is the payoff from the previous run, not luck`: this rebase replayed 7
  commits with zero conflicts because the two new main commits (#45059 trust/security TDP flag,
  #45081 Tron e2e skip) touch `ui/pages/asset/**` and `test/e2e/**`, disjoint from this perps-only
  branch. The expensive reconciliation against main's #44324 was already absorbed into the commits
  being replayed.
- `Run the branch's own tests even when nothing conflicted`: the checklist scopes tests to conflicted
  files, which would have meant running none here. The base still moved, so the four suites covering
  the diff were run anyway — 271/271 passed, converting "probably fine" into evidence at trivial cost.
- `--force-with-lease is mandatory for rebase pushes`: the remote was at the pre-rebase
  `8059e8a82f`, so the lease check confirmed nothing had landed on the branch between runs before
  rewriting history to `83b1e4340c`.
