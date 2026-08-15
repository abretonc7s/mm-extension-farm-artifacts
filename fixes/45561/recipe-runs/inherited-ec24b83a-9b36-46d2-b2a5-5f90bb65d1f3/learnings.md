# Learnings — TAT-3763

- **Investigation was ~10 minutes; the fix was one line.** Most of the wall-clock went to evidence
  plumbing (rebuild + relaunch + dual recipe runs + recordings), not to diagnosis. Grepping
  `balancePercent` immediately showed six writers, five of which already rounded to integers — the
  odd one out was the bug. Worth reusing: when a value is "wrong only on initial load", diff the
  initialiser against every mutation handler for the same field.

- **TASK.md references two commands that do not exist.** Steps 1, 12, and 20 call
  `$RUNNER_CMD manifest` and `$RUNNER_CMD runtime-health`; neither is a valid `mm-harness` command
  (`CLAUDE.local.md` already warns about `manifest`). The working equivalents are
  `mm-harness actions --raw --adapter extension --json`, `mm-harness doctor`, and
  `mm-harness run <recipe> --plan`. Step 20's `runtime-launch` is likewise `mm-harness launch`.
  These should be corrected in the task template.

- **`--plan` earns its keep.** It caught `pre_conditions` as an unsupported Recipe-v1 top-level field
  before any live run — the composition rules in step 10 tell you to document prerequisites in
  `pre_conditions`, which the schema then rejects. Prerequisites have to go in `description` instead.

- **The slot's build was frozen, not watched.** `doctor` reported `devServer: down` with a fresh
  build, so the source edit did not reach the browser until
  `temp/recipe/harness/extension/scripts/refresh-build.sh --repo <path>` (the `--repo` flag is
  required) followed by `mm-harness launch` to refresh the runtime snapshot. `reopen-browser.sh`
  alone left doctor reporting `runtime-dist-stale`. Budget ~1 minute for the rebuild.

- **Two gotchas worth keeping:** `ui.press` on a `<input type="range">` *does* retain DOM focus, so
  `ui.press` → `ui.key_press ArrowRight` is a clean way to drive a MUI slider through trusted input
  (no value injection). And proving "text is truncated" needs a geometry read — `scrollWidth >
  clientWidth` — because the DOM value alone looks perfectly fine.
