# TAT-3686 — Learnings

- **The CHANGELOG named the breaks better than `tsc` did.** v11's entry says
  outright that a `Record<PerpsErrorCode, …>` stops compiling and names the exact
  extension file. Reading it first turned a 110-file blast radius into three
  files before running a single build, and it flagged the runtime refusals
  (`grouping: 'positionTpsl'`, `timeInForce`, optional `editOrder.orderId`) that
  no typecheck would ever surface.
- **A type-only fix cannot be proven by a recipe, and pretending otherwise is the
  trap.** Deleting the `OrderType` widening breaks the build; it does not flip an
  assertion. The recipe is a no-regression sweep and the compile gate is the
  actual proof, so `recipe-coverage.md` and `recipe-quality.json` say that
  explicitly rather than letting a green run imply more than it shows.
- **The runtime's recipe sample is stale.** `temp/recipe/runtime/open-perps.recipe.json`
  uses `schema_version` + `validate`, which Recipe Protocol v1 rejects outright.
  The real shape is `$schema` + top-level `workflow` from
  `@farmslot/protocol/schemas/recipe-v1.schema.json`; the library recipes under
  `@deeeed/metamask-harness/library/recipes/` are the copyable examples. Also:
  `mm-harness` has no `manifest` subcommand (use `actions`) and no
  `--project-root` flag (use `--target`), both of which the task template still
  tells you to run.
- **Screenshot `intent` is validated, not decorative.** Starting one with
  "Capture visible proof of…" fails with `workflow.invalid_intent` — it must
  describe what a human would see on screen.
- **`attributions:generate` reverts your uncommitted bump.** The script ends with
  `git checkout -- .yarnrc.yml .yarn package.json` and a reinstall, so running it
  before committing silently regenerated `attribution.txt` against v10 and put
  `package.json` back to `^10.0.0`. Commit the dependency change first, then
  regenerate. Related: `attribution.txt` is already stale on main
  (`ip-address 10.2.0` vs a lockfile resolving `10.4.0`), so any regeneration
  carries other people's drift with it.
- **"No fetch logged" was almost a wrong conclusion.** Monkeypatching
  `globalThis.fetch` in the service worker showed zero RPC traffic, which looked
  like a stalled provider. The real story only came out of the built bundle:
  `build:test` bakes a zeroed placeholder Infura id and the real one arrives via
  manifest `_flags`. Reading the artifact beat instrumenting the runtime.
