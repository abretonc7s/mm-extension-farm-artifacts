# Learnings — PR #45960 make-merge-ready

**No reviewer-driven learnings exist for this run.** Step 14's condition (at least one
`triage == "REAL"` entry with a non-null `fixed_in_commit`) was not met: all 7 PR comments were
status-only automation and there were zero inline review comments and zero
`CHANGES_REQUESTED` reviews. This file is written because the completion contract requires it;
the bullets below are the operational learnings from the CI work that actually blocked merge.

- **A "fix" that leaves the symptom identical is not the fix.** The previous round diagnosed
  `maxBuilderFee` moving from the WebSocket info client to the HTTP one — a real, verified gap —
  and shipped a mock for it. `perps-tpsl.spec.ts` then failed with a byte-identical error. The
  transport diff was true but incomplete; the actual blocker was a second 15.1.0 change in the
  same method (`updatePositionTPSL` now resolving positions from one provenance-safe source).
  When a changelog entry says a method was hardened in several ways, enumerate *all* of them
  before concluding, and treat "same error after the fix" as evidence the diagnosis was partial
  rather than as flake.

- **Read the captured DOM, not just the state dump.** `lastError: null` led to "the call hangs".
  The failure DOM showed the modal open with no error text *and* the position card still reading
  `Auto close TP - , SL -` — i.e. the write completed as a no-op because the controller believed
  there was no position. That reframed the whole diagnosis and pointed straight at the position
  lookup.

- **Mock fixtures encode assumptions that a dependency bump can silently invalidate.** The WS
  mock said "this account holds an ETH long"; the shared REST mock said "this account holds
  nothing". Under 12.0.0 nothing read REST on that path, so the contradiction was invisible.
  15.1.0 reads one source or the other and never merges them, so the lie became load-bearing.
  After a controller bump, audit fixtures for *disagreement between transports*, not just for
  missing endpoints.

- **Scope a fixture fix to the spec that needs it.** Making the shared REST `clearinghouseState`
  return a position would have fixed TP/SL and quietly broken every perps spec that depends on a
  funded-but-empty account. A dedicated `getPerpsConfigEligibleWithEthLongPosition()` layered on
  the existing config keeps the blast radius at one spec, and exporting the single
  `ETH_LONG_CLEARING_HOUSE_STATE` constant means the two transports cannot drift apart again.

- **Rebase before diagnosing, not after.** `origin/main` had moved three commits (including perps
  and MM Pay work). Rebasing first meant the recipe run, coverage report and typecheck all
  described `branch + main` rather than a state that no longer existed — and the coverage
  warnings that appeared were immediately attributable to main rather than to this PR.
