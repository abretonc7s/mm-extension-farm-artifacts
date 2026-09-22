# Reviewer-driven learnings — PR #45986 follow-up

- **Idempotent writers for funnel state**: bugbot caught that the "start funnel" writer blindly reset
  `confirmedAt`, so a repeat click during balance-stream lag erased a real confirmation. When state
  advances through stages, the entry-stage writer must not regress a later stage for the same subject.
  Fix-bug should check each writer against "what if this fires again after the next stage?"
- **Stale UI after a state transition is a normal input, not an edge case**: the CTA stays unfunded until
  the live stream catches up, so repeat clicks are expected. Instrumentation needs to tolerate the UI
  lagging behind the event it tracks.
- **Coverage analyzer baseline**: `coverage-analyze.js` diffs against the local `main` ref. After a rebase
  onto a newer `origin/main` it reports main's own commits as "new code" and can FAIL on files outside
  the PR. Cross-check with `git diff origin/main --name-only` before adding tests.
