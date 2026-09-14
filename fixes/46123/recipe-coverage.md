# Recipe coverage — pr-complete run 52d79fc1 (PR #46123)

This is a **review-fix run**, not a feature run. Its proof targets are the two code changes
made here, plus a non-regression check on the branch after rebasing onto `origin/main`.
The inherited feature-level recipe was **not re-executed** — see "Why the recipe did not
run" below.

## Proof targets for this run's changes

| # | Claim | Mode | Evidence | Result |
| --- | --- | --- | --- | --- |
| C1 | The three high-volume Perps preload transactions sample strictly below the default rate | state | `yarn jest app/scripts/lib/sentry-traces-sampler.test.ts` — new case "throttles the Perps preload transactions below the default rate"; 34 passed | PROVEN |
| C2 | A pinned preload rate is not bypassed by a sampled parent transaction | state | Same test, `sampler({ name, parentSampled: true })` asserted below default; exercises `getTransactionSampleRate`'s per-name branch ahead of the `parentSampled` branch (`sentry-traces-sampler.ts:95-110`) | PROVEN |
| C3 | Sentry init still constructs a working sampler with the new entries | state | `yarn jest app/scripts/lib/sentry-traces-sampler.integration.test.ts` — 4 passed | PROVEN |
| C4 | The `TraceName` enum reorder is semantically a no-op | state | Parsed the enum body at `HEAD` and in the working tree: identical 124-member set, same names and values | PROVEN |
| C5 | The sampler module does not import `shared/lib/trace` (Sentry-bootstrap cycle) | state | String literals used instead of `TraceName`; `yarn circular-deps:check` → "Circular dependencies check passed" | PROVEN |
| C6 | Changed files pass the repo's bounded quality gate | state | `mm-harness check diff --profile fast` → eslint pass, oxfmt pass, jest pass, policy-suppressions pass (`artifacts/check-diff/validation-summary.json`) | PROVEN |
| C7 | New code meets the 80% coverage threshold | state | `node temp/recipe/runtime/coverage-analyze.js` → "VERDICT: PASS" | PROVEN |
| C8 | The branch still builds and runs after the rebase + these changes | mixed | Webpack "compiled successfully in 106275 ms"; `mm-harness doctor --expect-live` → `ready: true`, decision `ready`/`healthy`; live CDP probe returned `chrome-extension://…/home.html#/`, title `macpro-mme-2 — MetaMask`; fixture validated (accounts=42, selected=Account 1) | PROVEN |
| C9 | The sampler change behaves correctly in the running extension | visual | **N/A — reasoned.** Not observable in this slot: no Sentry DSN is configured, so Sentry is inert in the dev build (`typeof globalThis.sentry === 'undefined'`) and the sampler module is not bundled into `runtime-dist`. Covered by C1-C3 instead. | N/A |

## Why the inherited recipe did not run

`artifacts/recipe.json` (`RECIPE_SOURCE: family-inherited`, byte-identical to
`inputs/inherited/recipe.json`) is unrunnable in this checkout. All 13 of its `command`
nodes invoke `node temp/tasks/feat/tat-3857-0908-110457/artifacts/proof.ts <mode>`, and
that harness script does not exist: the original family task directory was cleaned up,
`proof.ts` was never committed (`git log --all --diff-filter=A -- '*artifacts/proof.ts'`
returns nothing), and it is not among the staged inherited artifacts. The documented
smoke-test fallback (`recipes/perps-lifecycle.recipe.json`) is also absent — this checkout
has no `recipes/` directory.

The feature-level ACs (AC1-AC6) therefore retain their **inherited** PROVEN status from the
original run, preserved unmodified under
`artifacts/recipe-runs/inherited-ccbfa41b-3c1c-404d-9205-9a2eb5cce54c/` and referenced by
`artifacts/latest-valid-recipe-run.json`. This run makes **no new claim** about them; it
neither re-proved nor invalidated them. The two files changed here
(`shared/lib/trace.ts` enum ordering, `app/scripts/lib/sentry-traces-sampler.ts` sample
rates) do not touch the preload or trace-emission code paths those ACs cover.
