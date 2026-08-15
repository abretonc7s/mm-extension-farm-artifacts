# Learnings — PR-complete pass, PR #45561

## Reviewer-driven learnings: none

Step 14's condition did not hold — `comments-triage.json` contains **zero** entries with
`triage == "REAL"`, and no comment produced a code fix on this branch. The PR received no inline review
comments, no reviews of any state, and only two routine status-only bot notices (CLA, CODEOWNERS). There
is therefore no reviewer-caught delta to report against the original fix-bug run; this section exists
because the terminal contract requires the artifact, not because reviewer feedback was found. Inventing
reviewer lessons here would corrupt the family retrospective signal.

## Operational learnings from this pass

- `Inherited recipes carry absolute task-dir paths`: the family-inherited `recipe.json` still pointed its
  `command` and `assert_json` nodes at the parent task dir, so running it as-is would have **overwritten
  the parent run's probe evidence** — evidence the PR body and prior report both cite. Check
  `jq '.workflow.nodes[] | .cmd, .path'` on any inherited recipe and repoint it to the current task dir
  before executing.
- `Rebase invalidates the harness runtime twice, for different reasons`: pulling in a `package.json`
  version bump flipped doctor to `deps-stale` (needs `yarn install --immutable` even though `yarn.lock`
  was untouched), and then to `dist-stale` because the dist git id still pointed at the pre-rebase SHA.
  Both must be cleared before a recipe run means anything. Budget a `refresh-build.sh` + `launch` cycle
  after every integration step.
- `Verify the remote head before --force-with-lease`: comparing `git rev-parse origin/<branch>` against
  the local pre-rebase SHA, and diffing the two heads, proved the only commit being replaced was our own
  and the only content delta was main's version bump. That check is what makes republishing a rebase a
  safe mechanical step rather than a gamble.
- `A red check is not necessarily a failed check`: the three red `Unit tests` entries were one real
  failure plus two jobs **cancelled** by the fail-fast matrix (one had actually passed 414/414 suites).
  Reading per-job `.steps[].conclusion` before debugging avoided chasing two phantom failures, and the
  force-push required by the rebase re-runs the flaked shards for free — no unrelated file needed
  touching.
