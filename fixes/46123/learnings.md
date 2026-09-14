# Reviewer-driven learnings — PR #46123 (TAT-3857)

- **Telemetry has a budget, and adding a span is spending it**: the reviewer blocked on
  Sentry span volume, not on correctness. The original work added 43 `TraceName` entries and
  routed them into the real pipeline without projecting the resulting transaction rate.
  fix-bug should treat "new instrumentation" as requiring a volume estimate up front —
  count emitters, find the periodic ones, and multiply by the sample rate — and should
  check whether the repo already has a throttling mechanism (here,
  `DEFAULT_TRANSACTION_SAMPLE_RATES`, already seeded after a prior quota incident) before
  a reviewer has to ask.

- **Moving work to an always-on trigger changes who pays for it**: the ticket's whole point
  was relocating preload from "user opens Perps" to "user unlocks". The cost that moved with
  it was not just the fetch but Core's 5-minute refresh interval, which now bills every
  unlocked user in the rollout cohort — including those who never open Perps. When relocating
  a trigger to a broader mount point, fix-bug should enumerate every recurring side effect
  the moved code owns, not just its immediate one-shot cost.

- **Read the dependency's shipped `dist`, not just its type surface**: 22 of the 42 Core trace
  names have zero emitters, while the real volume came from one interval buried in
  `PerpsController.cjs`. The enum's size was misleading in both directions. Auditing actual
  call sites in `node_modules` answered the reviewer's question in a way that reading the
  extension's own diff never could.

- **A type constraint can make "dead code" un-deletable**: the obvious cleanup (drop the 22
  unused names) would have been a latent bug, because `PERPS_TRACE_NAMES` is
  `satisfies Record<PerpsTraceName, TraceName>` and Core may start emitting any of them.
  Before removing apparently-unused entries, check whether an exhaustiveness constraint makes
  the completeness load-bearing.

- **Where a module sits in the boot order constrains its imports**: the natural fix was to key
  the sample-rate map by `TraceName`, but that module is loaded by the Sentry bootstrap and
  `shared/lib/trace` imports `./sentry`. Using string literals with an enum assertion in the
  test kept the safety without the cycle. fix-bug should check a module's load position before
  adding an import to it, and let the test carry the coupling instead.

- **Match new entries to a file's existing grouping convention**: the 43-entry block was
  prepended to the head of `TraceName`, which rewrote the top of a widely-touched enum and
  drew a nit. The file already had `// Accounts` and `// mUSD` sections at the end; appending
  a `// Perps` section would have kept the diff append-only from the start.
