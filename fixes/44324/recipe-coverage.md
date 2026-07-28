# Recipe coverage — MANUAL-000001 (PR #44324)

> **Currency:** covers code commit `0f6a89ee8e` (the rev11 review fixes — the final code
> change on this branch). Only this artifact and `report.md` change after it, so a later
> docs-only commit does not stale this header. The AC table below is current; the dated
> sections that follow are an audit trail.

Recipe: `artifacts/recipe.json` (Protocol v1) · Latest full-graph run: `artifacts/recipe-run/`
— **pass, 19/19 nodes**, started 2026-07-28T02:28:11Z (merge-time). Every node has since
been re-executed directly at each later commit; the live nodes have been re-driven at each
review round against a build made from the then-current HEAD.

## Current status (rev11 — final round)

| Node group | How re-proved | Result |
| --- | --- | --- |
| 7 deterministic asserts (`gate-repo-root`, `ac1`, `ac2` ×2, `ac5` ×3) | executed directly against the working tree | **PASS** |
| 6 behaviour nodes (`ac3`, `ac4`, `ac6`, `ac7`, `ac8`) | the owning Jest suites | **PASS** |
| 6 live nodes (`live-cdp` … `live-capture-error-screen`) | driven with `mm-harness call` against a dev build from HEAD | **PASS** — latest capture `recipe-run-rev11-live/shot/call.png` (19:26, provider `capture-helper`, `runStatus: pass`), read back and confirmed to show the "Market not found" state for `DOESNOTEXIST` |

Earlier captures are retained for the audit trail: `recipe-run-rev7-live/`,
`recipe-run-rev8-live/`, `recipe-run-rev9-live/`, `recipe-run-rev10-live/` — each against
the HEAD build of its round. `recipe-run/live-capture-error-screen.png` is the merge-time
one and should be read with its own timestamp.

All 21 changed test suites: **742/742 pass**, no console-baseline violations
(measured this session with `yarn jest <21 changed test files> --runInBand`).

This is an **update-branch** run, so the question this coverage answers is narrower than
the parent's: *did merging 330 commits of main into the PR branch preserve every AC the
parent run proved?* The full recipe was re-executed against the post-merge tree
(merge commit `3d79f566f9`) after a fresh webpack build, so the verdicts below are
current — not inherited claims.

| AC | Proof mode | Recipe nodes | Verdict |
| --- | --- | --- | --- |
| AC1: Extension depends on perps-controller with the TAT-3463 contract | state | `ac1-assert-package-version` | PROVEN |
| AC2: Analytics imports the controller event/property/value contract | state | `ac2-assert-controller-reexports`, `ac2-assert-no-local-timestamp-mirror` | PROVEN |
| AC3: Entry/discovery/UTM via attribution APIs | behaviour | `ac3-attribution-behaviour` | PROVEN |
| AC4: Submitted + terminal analytics for supported ops | behaviour | `ac4-order-lifecycle-behaviour` | PROVEN |
| AC5: No duplicate client MetaMetrics transaction events | state | `ac5-assert-no-duplicate-order-entry-close`, `ac5-assert-no-duplicate-cancel`, `ac5-assert-no-duplicate-close-modal` | PROVEN |
| AC6 (TAT-3144 / TAT-3202): market search funnel | behaviour | `ac6-search-funnel-behaviour` | PROVEN |
| AC7 (TAT-3136): order abandonment | behaviour | `ac7-abandonment-behaviour` | PROVEN |
| AC8 (TAT-3175 bullet 4): geo-block screen view | behaviour | `ac8-geo-block-screen-view` | PROVEN |
| Screen-view gating fix (market-not-found) | visual | `live-cdp`, `live-ensure-unlocked`, `live-open-perps`, `live-open-unknown-market`, `live-assert-error-screen`, `live-capture-error-screen` | PROVEN |

Overall: **8/8 ACs PROVEN post-merge**, plus live UI proof
(`recipe-run/live-capture-error-screen.png` — a single rendered "Market not found"
screen for `DOESNOTEXIST`, the state whose duplicate screen view this PR removed).

## Post self-review-fix re-validation (2026-07-28, later same session)

The self-review fix pass changed application code (close-position modal, order-entry
page, market-list search analytics, edit-margin), so the ACs were re-proved afterwards.

**The recipe could not be re-run end-to-end.** `mm-harness run` aborted before executing
any node:

```
Extension validation launcher failed with exit 1.
Slot macwork-mmedev-2 is missing resources.dev-server.metro_port required by
Metro configuration; run farmslot update to migrate the pool.
```

That is a slot/pool configuration problem in the harness launcher, unrelated to the code
under test (it fails at launch, before node execution, and concerns Metro dev-server
config). Migrating the pool is an orchestrator-level action, so it was surfaced rather
than worked around. **`recipe-run/` therefore still holds the 02:28:11Z run, which
predates the self-review fixes** — its `summary.json` is the merge-time evidence, not
post-fix evidence. Note the documented hazard: a failed run leaves the previous
`summary.json` in place, so that file's `pass 19/19` must be read against its
`startedAt`, not assumed current.

To avoid claiming coverage that was not re-proved, every AC node was extracted from
`recipe.json` and executed directly against the post-fix tree:

| Node | Post-fix result |
| --- | --- |
| `ac1-assert-package-version` | PASS |
| `ac2-assert-no-local-timestamp-mirror` | PASS |
| `ac3-attribution-behaviour` | PASS — 221/221 |
| `ac4-order-lifecycle-behaviour` | PASS — 216/216 |
| `ac5-assert-no-duplicate-order-entry-close` | PASS |
| `ac5-assert-no-duplicate-cancel` | PASS |
| `ac5-assert-no-duplicate-close-modal` | PASS |
| `ac6-search-funnel-behaviour` | PASS — 27/27 |
| `ac7-abandonment-behaviour` | PASS — 5/5 |
| `ac8-geo-block-screen-view` | PASS — 5/5 |

`ac4` failed 1/216 on the first attempt (`close-position-modal` →
"forces Market behavior when the flag is disabled mid-session", 5500 ms timeout) while
nine jest invocations ran back-to-back, and passed 216/216 on an idle re-run — the
load-sensitive flake already documented for this suite. It was *not* taken on trust:
the same test was bisected against a control run first (see `report.md`), which is how a
genuine regression in the ref-write fix was caught and corrected.

**Live nodes (superseded):** at the time of the first fix pass the six live UI nodes had
not been re-proved. They have been since — re-driven in the rev9 pass and again in rev10
against builds made from the then-current HEAD, with fresh captures at
`recipe-run-rev7-live/call.png` and `recipe-run-rev8-live/call.png`. The screenshot in
`recipe-run/` remains the merge-time one and should be read with its own timestamp.

## Why the merge-time run matters specifically

Three of the conflict resolutions were behavioural, not textual, and these nodes are what
keep them honest:

- **`ac5-*` (no duplicate client transaction events)** directly covers the riskiest
  resolution in this merge. Main had re-added client-side
  `PerpsPositionCloseTransaction` emission in `close-position-modal.tsx` (three hunks);
  I dropped it because the controller now owns those events. `ac5-assert-no-duplicate-close-modal`
  passing is the check that this removal is complete and correct rather than merely
  compiling.
- **`ac2-assert-controller-reexports`** covers my hand-edit of
  `shared/constants/perps-events.ts`, where main's added literals had to be triaged
  against the controller contract (four were redundant with the spread; `BOTTOM_NAV_BAR`
  was not and was carried over).
- **`ac1-assert-package-version`** confirms the patched `@metamask/perps-controller@9.2.1`
  pin survived the `yarn.lock` regeneration rather than being reverted to main's `^9.0.0`.

## Supporting evidence outside the recipe

- `yarn lint` (which includes a full `tsc` pass) — **pass** at merge time; later passes ran
  the individual gates (`lint:eslint` over the changed files, `lint:tsc`, `lint:format`,
  `lint:styles`, locales, circular deps, `dedupe --check`) rather than the full-repo
  wrapper. This is what caught the
  silent auto-merge deletions of `getDisplayName` / `deriveTpslType` /
  `buildPerpsVipTrackingData` described in `report.md`.
- `yarn verify-locales --quiet` — pass. `yarn circular-deps:check` — pass.
- `yarn jest` over the three conflicted components — **180/180** at merge time. Current
  figure for the whole PR: **742/742 across all 21 changed suites** (rev10 pass), with the
  console-baseline gate clean.

## Known coverage limits (carried forward, still true)

- Event **counts** are proved in the Jest layer only. The harness exposes no
  analytics-capture action, so the live nodes prove the screen state the events describe,
  not the emissions themselves. Concretely: this run does **not** independently observe
  that `PerpsPositionCloseTransaction` fires exactly once from the controller on a real
  close — that remains the reviewer-verifiable risk flagged in `report.md`.
- `environment_type` on background controller-emitted transaction events
  (TAT-3335 / TAT-3175 bullet 1) is not covered — deferred to perps-controller 9.2.2.
- `source` on the geo-block screen view (Mobile parity) is not covered because it is not
  implemented; 3 hosts share one open flag across multiple triggers.
- Headed live nodes require `caffeinate -disu`, used here.

## Side findings (non-blocking, `recipe-run/diagnostics.json`)

The run flagged 6 distinct application warning/error events (4 warning, 2 error). All read
as dev-environment noise unrelated to this merge and none were investigated further:
extension-SW memory-leak warning on `runtime.onInstalled`, two `Invalid chain ID "0xa4b1"`
warnings from the fixture chain set, a backend `HttpRequestError: 500`, `Sentry not
initialized`, and `Unknown action Object` from `home.html`. Recorded rather than
suppressed — if any of these are actually novel, they are visible here.
