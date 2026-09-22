# Reviewer-driven learnings — PR #45986 round 3

- **A predicate that ignores the stage invites stage regressions**: bugbot caught the failure path using
  `isUnfundedDepositFunnelActive` (address-only) to decide what to clear, which erased a confirmed stage.
  When state has stages, every destructive transition should check the stage it is allowed to undo, not just
  the subject.
- **Fire-once guards must outlive the component**: a `useRef` guard resets on remount, and here unmount also
  cancelled the timeout that cleared the source state, so the same result was reprocessed. Guards for
  analytics events derived from persistent controller state need persistent storage keyed on a stable result
  identity. The tx id alone is not enough because it can be null, so the result timestamp is part of the key.
- **Check PR-level CI gates, not just file-level ones**: `check-pr-max-lines` counts tests, and 1000 lines is
  easy to cross after a few review rounds. Run `git diff origin/main --numstat` before pushing, and keep test
  additions lean. Merging duplicates into typed `forEach` cases also kept this file's `tsc` happy where
  `it.each` did not.
