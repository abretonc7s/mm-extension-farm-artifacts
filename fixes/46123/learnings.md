# Learnings — PR #46123 completion round

No reviewer comment produced a code fix this round: all 6 open threads were
CodeQL false positives on developer-only tooling. The lessons below come from
the gates and the runtime, which is where this round's real work was.

- `Gate failure ≠ reviewer comment`: the only code change this round
  (`833b917e1b`) was forced by the local `policy-suppressions` and coverage
  gates in step 9, not by any review comment — a pr-complete round can require a
  commit even when every fetched comment is a false positive, so don't treat
  "all comments dismissed" as "nothing to push".
- `Suppress vs. scope`: 4 of the 5 rejected `eslint-disable` directives had a
  legitimate cause (Node native-TS execution needs `.ts` import extensions).
  The right fix was a scoped config override mirroring the existing
  `development/webpack/**/*.ts` precedent — check for an existing override with
  the same rationale before either suppressing inline or widening a glob.
- `Namespace-importing a heavy module OOMs a big suite`: importing
  `perps-stream-bridge` into `metamask-controller.test.js` to spy on it pulled
  the Hyperliquid SDK into the module graph and blew the Jest heap. A
  module-level `jest.mock` factory gets the same seam for free — reach for the
  mock, not the namespace import, in suites that are already near their budget.
- `Assert on observable output, not on a count you never proved is nonzero`:
  the first version of the emit test compared post-drop length to a `forwarded`
  count that was silently 0, making it vacuous. Writes through the multiplex are
  async and the demuxed substream was not writable in the harness, so the honest
  assertion was the guard's exact call sequence — when the output path isn't
  reachable in a test, assert the decision, not an empty effect.
- `Recipe inheritance can be structurally incomplete`: the inherited recipe
  passed schema validation and `--plan` cleanly while being unrunnable, because
  all 13 of its `command` nodes shell out to a `proof.ts` in an un-synced parent
  task dir. `--plan` does not check command-node script paths — verify the
  driver exists before trusting a green plan.
- `A stale slot profile looks exactly like a code regression`: the
  "Background connection unresponsive" UI and `EXTENSION_STARTUP_UNVERIFIED`
  were caused by a Chrome profile with no wallet vault
  (`PersistenceError: storage.local does not contain vault data`), not by the
  branch. Read the service-worker console before suspecting the diff, and
  re-apply `mm-harness fixtures set` after any clean rebuild that resets the
  profile.
