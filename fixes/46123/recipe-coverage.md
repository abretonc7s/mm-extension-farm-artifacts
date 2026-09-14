# Acceptance evidence — PR-complete round (rebased head)

The inherited 27-node recipe could **not** be executed this round: all 13 of its
`command` nodes invoke `temp/tasks/feat/tat-3857-0908-110457/artifacts/proof.ts`,
and that parent task directory was never synced into this slot. TASK.md lists
"Task recipe library" under **Missing inherited artifacts**, and the module is
confirmed absent. `--plan` passes on that recipe because plan validation does not
resolve command-node script paths.

A substitute smoke recipe (`artifacts/smoke-recipe.json`, 13 nodes) was authored
from the live action manifest and run against a clean rebuild of the rebased
head. Its coverage is **narrower than the inherited recipe's** and is stated as
such below — it re-proves the user-visible outcome, not the trace-level ACs.

| AC | Claim | Mode | Nodes | Primary evidence | Result |
| --- | --- | --- | --- | --- | --- |
| AC1 | Unlock starts market/price loading before any Perps navigation | mixed | lock, unlock, settle-on-home, dwell-on-home, enter-perps, perps-home-state | recipe-run/summary.json, recipe-run/artifacts/perps-home-after-preload.png | PROVEN (behaviourally) |
| AC5 | Perps entry completes with live, positively-priced market rows | mixed | perps-home-state, screenshot-perps-home | recipe-run/artifacts/perps-home-after-preload.png | PROVEN |
| AC5b | The full market browser renders a populated live market list | mixed | open-market-list, market-list-state, screenshot-market-list | recipe-run/artifacts/perps-market-list.png | PROVEN |
| AC2 | PerpsLayout remains lazy | — | — | — | NOT RE-PROVEN this round (no `proof.ts` driver) |
| AC3 | Mobile trace names route through shared `trace`/`endTrace` | — | — | — | NOT RE-PROVEN this round (no `proof.ts` driver) |
| AC4 | Cold / warm / background-resume contexts stay distinct | — | — | — | NOT RE-PROVEN this round (no `proof.ts` driver) |
| AC6 | `AccountOverviewPerpsTab` unchanged | — | — | — | NOT RE-PROVEN this round (no `proof.ts` driver) |

13/13 nodes pass in `recipe-run/summary.json` (exit 0). Both screenshots carry
`metadata.provider: capture-helper` in `recipe-run/artifact-manifest.json`, so
they are genuine captures, not the silent `Page.captureScreenshot` fallback.

**What AC1 does and does not establish here.** The recipe locks the wallet,
unlocks it, waits on the wallet-home UI, dwells 4 s **without visiting any Perps
route**, and only then navigates to Perps, where live priced rows are already
rendered. That reproduces the user-visible outcome of the delayed-cold-entry flow
the PR measures. It is *not* a latency benchmark and does not re-measure the
medians in the PR description, and it does not inspect trace spans — the
trace-level ACs above stay on the inherited evidence from the recorded run.

Unchanged from the inherited assessment: remote Sentry ingestion and unbiased
latency remain unproven.
