# Inherited recipe — quarantined as unrunnable

`recipe.json` here is the family-inherited validation recipe (byte-identical to
`inputs/inherited/recipe.json`). It was moved out of `artifacts/` because it **cannot be
executed in this checkout**, and leaving it at the contract path would oblige a
`artifacts/recipe-run/` evidence package for a run that never happened.

Reason it cannot run: all 13 of its `command` nodes invoke
`node temp/tasks/feat/tat-3857-0908-110457/artifacts/proof.ts <mode>`. That harness script
does not exist — the original family task directory was cleaned up, the script was never
committed (`git log --all --diff-filter=A -- '*artifacts/proof.ts'` returns nothing), and
it is not among the staged inherited artifacts. The documented fallback
(`recipes/perps-lifecycle.recipe.json`) is also absent; this checkout has no `recipes/`
directory.

The original run's evidence is preserved unmodified at
`../recipe-runs/inherited-ccbfa41b-3c1c-404d-9205-9a2eb5cce54c/` and is referenced by
`../latest-valid-recipe-run.json` and `../evidence-manifest.json`.

What this run proved instead is recorded in `../recipe-coverage.md` (C1-C9) and
`../comments-report.md`.
