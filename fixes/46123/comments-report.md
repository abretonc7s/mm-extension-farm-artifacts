# PR #46123 — comment triage report

Run: pr-complete, branch `TAT-3857-feat-preload-perps-on-unlock`, rebased onto `origin/main` (ee244dffbf).

## Scope of this round

Live re-fetch (step 5) found **2 unresolved review threads**, both authored by `MajorLift`.
All other inline threads (cursor[bot] x8, aganglada x5, github-advanced-security[bot] x11)
were already resolved in earlier rounds and are not re-triaged here.

`aganglada`'s CHANGES_REQUESTED review (5167685909) is **DISMISSED** — superseded.
`MajorLift`'s CHANGES_REQUESTED review (5198657410) is the live blocker.

Issue comments: 20 total, all routine status-only automation (metamask-ci builds-ready x17,
sonarqubecloud quality-gate PASSED x1) plus 2 prior self-triage comments by the author.
**18 status-only automation comments skipped without reply.**

## Triage

| # | Author | File | Triage | Action |
|---|--------|------|--------|--------|
| 1 | MajorLift | shared/lib/trace.ts:42 | REAL | Sentry span-volume projection requested before instrumentation lands — see analysis below |
| 2 | MajorLift | shared/lib/trace.ts:42 (nit) | REAL | Enum ordering — Perps block moved out of the top of `TraceName` |
| 3 | MajorLift | lavamoat/webpack/mv3/main/policy-override.json:179 | ANSWERED | Author already replied 2026-09-14T14:30:34Z with the receiver-binding justification; awaiting reviewer ack, no code change |


## Findings behind the triage

### 1. `shared/lib/trace.ts:42` — span volume (REAL, blocking)

MajorLift's concern is correct and was **not** a false positive. Verified against
`@metamask/perps-controller@16.2.0`'s shipped `dist`:

- `startMarketDataPreload()` installs a **5-minute `setInterval`**
  (`PerpsController.cjs:2091-2098`, `#preloadRefreshMs = 5 * 60 * 1000` at `:5152`) that
  calls both `#performMarketDataPreload` and `#performUserDataPreload`, each of which
  emits a span (`:4589`, `:4802`).
- `#performMarketDataPreload` internally calls `getMarketDataWithPrices`
  (`:4601` → `MarketDataService.cjs:721`), and `perps-stream-bridge.ts:850` calls it
  again directly — so the hottest path emits **3 spans per 5-minute tick**.
- Because this PR moves the preload to wallet-root/unlock, that interval now runs for
  **every unlocked user in the Perps rollout cohort, including those who never open
  Perps**, for as long as a UI document keeps the preload alive.
- Net effect: span volume scales with **session wall-clock time**, not user actions.
  A 60-minute idle unlocked session emits ~41 raw spans vs 5 at unlock.

Spans do reach `tracesSampler`: `trace()` sets `forceTransaction = true`
(`shared/lib/trace.ts:584-589`), making them root transactions. Production default is
`0.005` (`setupSentry.js:220`). No per-name override existed for any Perps name.

**Fix applied:** pinned the three high-volume background preload transactions in
`DEFAULT_TRANSACTION_SAMPLE_RATES` (`app/scripts/lib/sentry-traces-sampler.ts`) to
`0.0005` — a tenth of the default. This is the repo's own established mechanism; the map
was already seeded with two assets-controller transactions pinned to `0` after a prior
quota incident (#43410). The remote `sentry` flag can retune or silence them without a
release. The entry/connection traces that are this ticket's actual deliverable keep the
full default rate, so the loading path stays observable.

Checked and found clear (no fan-out): not per-market (one call for all markets), not
per-price-tick (all five `Perps WebSocket *` names have **zero** emitters), not
per-candle (the merge loop is untraced), and DataLake retries are suppressed
(`DataLakeService.cjs:76`).

### 2. `shared/lib/trace.ts:42` — enum ordering nit (REAL)

Moved the 43-entry Perps block from the top of `TraceName` to a `// Perps` section at the
end, matching the file's existing convention (`// Accounts`, `// mUSD / 1-Click Convert`).
Did the same for `TraceOperation.PerpsOperation`. Verified a **pure reorder**: the member
set is identical before and after (124 entries, same names and values), and the PR's diff
for this file is now append-only instead of rewriting the head of the enum.

Note on the 22 currently-dormant Perps names: they cannot be removed. `PERPS_TRACE_NAMES`
is `satisfies Record<PerpsTraceName, TraceName>` (`infrastructure.ts:272`) and the
`PerpsTracer` interface accepts any `PerpsTraceName` (perps-controller `types/index.d.cts:1923`),
so the map must stay exhaustive — dropping entries would make
`PERPS_TRACE_NAMES[params.name]` return `undefined` the moment Core starts emitting one.

### 3. `lavamoat/.../policy-override.json:179` (ANSWERED, no code change)

The author already replied in-thread at 2026-09-14T14:30:34Z explaining the
NetworkController/LavaMoat receiver-binding issue. Awaiting reviewer acknowledgement.

## Recipe re-validation — SKIPPED (unrunnable inherited recipe)

`HAS_RECIPE: yes` and `temp/tasks/fix/46123-0914-230957/artifacts/recipe.json` exists
(`RECIPE_SOURCE: family-inherited`, trusted), but it **cannot execute**: all 13 of its
`command` nodes invoke
`node temp/tasks/feat/tat-3857-0908-110457/artifacts/proof.ts <mode>`, and that harness
script no longer exists. The original family task dir (`temp/tasks/feat/tat-3857-0908-110457/`)
was cleaned up, `proof.ts` was never committed (`git log --all -- '*artifacts/proof.ts'`
is empty), and it is not among the staged inherited artifacts. The smoke-test fallback
(`recipes/perps-lifecycle.recipe.json`) is also absent — this checkout has no `recipes/`
directory.

What was verified instead:
- Extension runtime rebuilt with these changes and brought to `doctor → ready / healthy`
  over CDP (port 7662), wallet fixture applied and validated (accounts=42, selected=Account 1).
- Live CDP probe confirms the extension loads and routes:
  `chrome-extension://…/home.html#/`, title `macpro-mme-2 — MetaMask`.
- The sampler change is **not** runtime-observable in this slot: no Sentry DSN is
  configured, so Sentry is inert in the dev build (`typeof globalThis.sentry === 'undefined'`)
  and the sampler module is not bundled. It is covered by unit + integration tests instead
  (38 passing, including a new case asserting the Perps preload names sample strictly
  below the default rate and cannot be bypassed by a sampled parent).
- `mm-harness check diff --profile fast`: eslint **pass**, oxfmt **pass**, jest **pass**,
  policy-suppressions **pass**.
- Coverage on changed files: **VERDICT PASS** (new code meets the 80% threshold).

### Runtime note for the orchestrator (framework issue, not a repo change)

The slot's Chrome profile at `temp/recipe/runtime/chrome-profile` entered a state where
Chrome silently refused `--load-extension`: the extension page rendered
`ERR_BLOCKED_BY_CLIENT`, no `service_worker` target appeared over CDP, and the profile's
`Preferences` had **no** `extensions.settings` entry at all. `mm-harness launch --verify`
could not recover it (`WALLET_STATE_REQUIRED`) despite webpack building cleanly.
Deleting the profile and re-running `mm-harness fixtures set` fixed it both times it
occurred. No repo config was modified.

## CI status

- `check-pr-max-lines` — **fails by design**: 5104 additions / 476 deletions = 5580 lines
  against a 1000-line limit. Inherent to the PR's scope (feature + ~3000 lines of tests);
  it is correctly labelled `size-XL` and needs a maintainer override, not a code change.
- `e2e-chrome / test-e2e-chrome-webpack (15)` — **unrelated flake**. The failing case is
  `Add wallet > Add wallet using SRP` in
  `test/e2e/tests/multichain-accounts/add-wallet.spec.ts`, timing out on `.controller-loaded`.
  That spec contains **zero** Perps references and never sets `perpsEnabledVersion`, so
  `getIsPerpsExperienceAvailable` is false and the unlock preload cannot run in it. The
  file also has a documented flake history (two prior dedicated "fix flaky `Add wallet…`"
  commits: `5f842c6082`, `8d99a5f7d3`). Retries were exhausted.
- `sonarqubecloud` quality gate: **passed**.

## Summary

- **Total actionable comments: 3** (3 REAL, 0 FALSE POSITIVE, 0 OUT OF SCOPE).
  Two produced code fixes; the third was already answered in-thread by the author.
- **Skipped without reply: 18** routine status-only automation comments
  (metamask-ci builds-ready x17, sonarqubecloud quality-gate x1).
- **Not re-triaged:** all other inline threads (cursor[bot] x8, aganglada x5,
  github-advanced-security[bot] x11) were already resolved in earlier rounds.
  `aganglada`'s CHANGES_REQUESTED review is DISMISSED.
- **Commit SHA for fixes:** `87cfb6f6c8`
- **Files changed:**
  - `shared/lib/trace.ts` (Perps enum blocks moved to end; pure reorder)
  - `app/scripts/lib/sentry-traces-sampler.ts` (three Perps preload transactions pinned to 0.0005)
  - `app/scripts/lib/sentry-traces-sampler.test.ts` (new case asserting the throttle)
- **Recipe re-validation:** SKIPPED — inherited recipe is unrunnable (its `proof.ts`
  harness no longer exists) and no fallback smoke recipe is present in this checkout.
  See the section above for what was verified in its place.
- **Integration status (step 3):** `rebased` — 19 commits replayed cleanly onto
  `origin/main` (`ee244dffbf`), no conflicts, `yarn install --immutable` re-run because
  `yarn.lock` moved. Pushed as `f1546922cb...87cfb6f6c8` under `--force-with-lease`.
- **Threads:** `shared/lib/trace.ts` resolved. `lavamoat/.../policy-override.json` left
  **open** deliberately — the author's explanation is awaiting MajorLift's response, and
  resolving it would tidy away feedback that was not acted on.

### Remaining merge blockers (not addressable by a code fix in this run)

1. `MajorLift`'s CHANGES_REQUESTED review (5198657410) needs to be re-reviewed and
   dismissed/approved by them — the span-volume concern is now answered with a projection
   and a mitigation, but only the reviewer can lift the block.
2. `check-pr-max-lines` needs a maintainer override label: 5580 changed lines vs the
   1000-line limit, inherent to the PR's scope.
