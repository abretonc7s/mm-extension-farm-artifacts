# PR #45561 — Comments report

PR: `fix(perps): [Bug]: Perps - Available to trade percentage shows truncated decimal on initial load (e.g. "22...")`
Branch: `TAT-3763-fix-fix-perps-percentage-truncatio` · Ticket: TAT-3763

## Context gathered (step 6)

- **PR purpose** — seeds the Perps order form's initial `balancePercent` with `Math.round(x)` instead of
  `Math.round(x * 100) / 100`, so the percentage pill beside the size slider renders a whole number on
  initial load rather than a decimal that overflows its `4.5rem` field and is clipped (the reported
  `22...`).
- **PR diff** — 2 files, both already part of the PR: `ui/hooks/perps/usePerpsOrderForm.ts` (+7 -1) and
  `ui/hooks/perps/usePerpsOrderForm.test.ts` (+46 -5). No other files touched.
- **PR state** — open, not draft, `mergeable: true`, `mergeable_state: blocked` (required checks not yet
  all green).

## Comment triage

| # | Author | Source | File | Triage | Action |
|---|--------|--------|------|--------|--------|
| 1 | `github-actions[bot]` | issue_comment | — | routine automation (skipped) | CLA signature status notice. Status-only automation — no reply per checklist. |
| 2 | `metamask-ci[bot]` | issue_comment | — | routine automation (skipped) | CODEOWNERS listing; correctly names the 2 changed perps files. Status-only automation — no reply. |

- Inline review comments (`pulls/45561/comments`): **0**
- `CHANGES_REQUESTED` reviews: **0** (in fact, zero reviews of any state)
- Issue comments: **2**, both routine status-only automation → **2 skipped without reply**
- **Actionable comments: 0** (0 REAL, 0 FALSE POSITIVE, 0 OUT OF SCOPE)

No code change was required to address review feedback, so no review-fix commit was created.

## CI status

`mergeable_state` is `blocked` because of run
[31856167865](https://github.com/MetaMask/metamask-extension/actions/runs/31856167865): 98 pass,
23 pending, 5 skipping, **3 fail**.

All three red checks come from a **single** failing test, already triaged in the previous CI-fix pass
(`../../tat-3763-0815-072210/artifacts/ci-fix-triage.md`):

- `Unit tests (5)` — **failure**: `ui/hooks/useEventFragment.test.js › identifying appropriate fragment ›
  should create a new fragment when a matching fragment does not exist` (1 failed / 4571 passed).
- `Unit tests (6)` — **cancelled** by the fail-fast matrix; its test step actually *succeeded*
  (414/414 suites, 3958 tests).
- `Unit tests (2)` — **cancelled** mid-step by the fail-fast matrix.

**Triage: OUT OF SCOPE — pre-existing flake, unrelated to this PR.** Re-verified against the rebased
HEAD:

- `origin/main` moved during the step-3 rebase but did **not** touch `useEventFragment.js` or its test,
  so the flake is still live on main.
- The test passes at the rebased HEAD (`10/10`), as it did across 5 consecutive runs in the prior pass.
- The failing module has no relationship to this PR: it imports only React, react-redux,
  `shared/lib/environment-type`, `../selectors`, and `./useSegmentContext`, and neither it nor its test
  references perps.
- Root cause is a race in that test: `waitFor` awaits only that `createEventFragment` has been *called*,
  then `result.current` is read synchronously — before the mocked promise resolves and the resulting
  `setState` commits. Introduced on `main` by `86e2a9742e` (#45063) and `0fea212d20` (#45196).

**Resolution path:** step 3 rebased this branch onto `origin/main`, so step 11 force-pushes a new SHA.
That triggers a fresh CI run which re-runs the flaked unit-test shards — no manual job re-run needed and
no unrelated file touched in this PR.

## Integration status

`rebased` — see `artifacts/integration-status.txt`. Rebased cleanly onto `origin/main`
(`9e713efc26`, "release: Bump main version to 13.46.0"). History is linear, no merge commit. Only
`package.json` changed on the main side; `yarn.lock` was untouched, though `yarn install --immutable`
was run to clear the harness's `deps-stale` state.

---

## Final summary (step 13)

- **Total comments: 2** — 0 REAL, 0 FALSE POSITIVE, 2 OUT OF SCOPE (both routine status-only
  automation, skipped without reply). 0 inline review comments, 0 review threads, 0
  `CHANGES_REQUESTED` reviews.
- **Commit SHA for fixes:** none — no review fix was required, so no commit was created.
- **Published SHA:** `edba2504fc` (was `91f094d46f`) — the rebased twin of the original fix commit,
  force-pushed with `--force-with-lease` to publish the step-3 integration. Verified beforehand that
  the remote head was exactly the prior commit, so no third-party work was discarded; the only content
  delta versus the old remote head is main's `package.json` version bump.
- **Files changed:** `ui/hooks/perps/usePerpsOrderForm.ts`, `ui/hooks/perps/usePerpsOrderForm.test.ts`
  (unchanged in content by the rebase).
- **Recipe re-validation: PASS** — 24/24 nodes `ok: true`, run against `branch + origin/main` merged
  and rebuilt (`dist` git id `edba2504fc`). Initial load probes `percentValue "0"`,
  `percentIsInteger true`, `percentIsClipped false`, `sliderIsOnStepGrid true`; post-interaction probes
  `"3"`, integer, unclipped. Both screenshots recorded `provider=capture-helper`.
  The inherited recipe's `command`/`assert_json` paths still pointed at the previous task dir
  (`tat-3763-0815-072210`); they were repointed to this task's artifacts dir (10 references) so the run
  would not overwrite the parent run's evidence. No semantic change to the graph.
- **Local validation:** `check diff --profile fast` pass (policy-suppressions, eslint, oxfmt, jest);
  `coverage-analyze` VERDICT **PASS** (98%); final parity gate (`lint:changed`, `verify-locales`,
  `circular-deps:check`) pass.
- **Integration status: `rebased`** — clean rebase onto `origin/main` (`9e713efc26`), linear history.
  `yarn install --immutable` was run to clear the harness `deps-stale` state after main's
  `package.json` bump (`yarn.lock` itself was unchanged).
- **CI:** the 3 red `Unit tests` checks belong to the pre-push run and trace to a single pre-existing
  flake in `ui/hooks/useEventFragment.test.js` (unrelated to this PR — re-verified passing at the
  rebased HEAD, and untouched by the main commits pulled in). The force-push starts a fresh run that
  re-runs those shards; no unrelated file was modified in this PR to work around it.
