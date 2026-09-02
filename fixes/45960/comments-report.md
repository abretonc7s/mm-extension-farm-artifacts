# PR #45960 — comment triage and merge-readiness

## Comments fetched (live, step 5)

| Endpoint | Count |
| --- | --- |
| Inline review comments (`pulls/45960/comments`) | **0** |
| `CHANGES_REQUESTED` reviews | **0** |
| PR-conversation comments (`issues/45960/comments`) | 7 |

| # | Author | File | Triage | Action |
|---|--------|------|--------|--------|
| 1 | github-actions[bot] | — | STATUS-ONLY | CLA signed; no reply |
| 2 | metamask-ci[bot] | — | STATUS-ONLY | CODEOWNERS routing notice; no reply |
| 3 | socket-security[bot] | — | STATUS-ONLY | Dependency scan: every score held or improved (supply chain 99 +1, vulnerability 100, quality 91 +8, maintenance 99 +1, license 100); no reply |
| 4 | metamask-ci[bot] | — | STATUS-ONLY | "Builds ready [4465fce]"; no reply |
| 5 | metamask-ci[bot] | — | STATUS-ONLY | "Builds ready [4465fce]" (duplicate); no reply |
| 6 | sonarqubecloud[bot] | — | STATUS-ONLY | Quality Gate **passed**, 0 new issues, 0 accepted issues; no reply |
| 7 | metamask-ci[bot] | — | STATUS-ONLY | "Builds ready [0905ed7]"; no reply |

**0 actionable comments. 7 routine status-only automation comments skipped without reply**, per the
checklist's instruction to ignore CLA, build-status and coverage-summary automation.

The CODEOWNERS notice (#2) flags `test/e2e/tests/settings/state-logs.json` for
`@MetaMask/extension-privacy-reviewers`. That is expected — the PR adds three keys to the
state-log definition — and needs a human reviewer's sign-off, not a code change.

## The actual blocker: CI was still red

With no review comments outstanding, merge-readiness came down to CI. `perps-tpsl.spec.ts`
was still failing both tests on chrome and firefox after the previous round's
`maxBuilderFee` fix, with the same `TimeoutError: Waiting element to become stale` from
`submitTpslUpdate()`. The captured DOM shows the TP/SL modal still open with no error text
and the position card still reading `Auto close TP - , SL -`, so the update silently never
applied.

### Root cause (second layer)

perps-controller 15.1.0 rewrote `updatePositionTPSL` to stop trusting the caller's position
snapshot:

```js
// HyperLiquidProvider #getPositionsForOperation(targetDex)
const targetPositions = subscriptionService.getCachedPositionsForDex(targetDex);
if (targetPositions !== null) return [...targetPositions];
// otherwise REST:
const { answered, positions } = await queryDexPositions(targetDex || null);
```

`getCachedPositionsForDex` returns the stream slice **only while its stamped connection epoch
equals the current one** (`#isPositionDexFresh`). The e2e WebSocket mock delivers
`clearinghouseState` once per subscribe via `followUpResponse`, so once the socket epoch moves
the slice is no longer current and the controller falls through to REST. The shared REST mock
answers `assetPositions: []` for the perps user, so the controller concludes there is no ETH
position and the TP/SL write never happens — silently, which is why `lastError` is `null` and
no error is rendered.

In 12.0.0 this path did not exist: the method used the caller-supplied snapshot, so the WS
mock alone was sufficient.

### Fix

Make both transports tell the same story, from one source:

- `test/e2e/tests/perps/mocks/websocketPositionMocks.ts` — export
  `ETH_LONG_CLEARING_HOUSE_STATE` (previously module-private) so there is a single definition
  of "the account with an ETH long".
- `test/e2e/tests/perps/perps-fixture-config.ts` — add
  `getPerpsConfigEligibleWithEthLongPosition()`, which layers an HTTP `clearinghouseState`
  override returning that same state on top of `getPerpsConfigEligible()`.
- `test/e2e/tests/perps/perps-tpsl.spec.ts` — use the new config.

Scoped deliberately: the shared REST mock in `test/e2e/mock-e2e.js` still returns an empty
account, so every other perps spec that depends on "funded, no positions" is untouched.

## Outcome

- **Total comments: 7** — 0 REAL, 2 FALSE POSITIVE (socket-security scan, SonarQube gate — both
  reporting *passing* results with nothing to act on), 5 OUT OF SCOPE (status-only automation).
  0 inline review comments and 0 `CHANGES_REQUESTED` reviews, so no replies were posted and no
  review threads needed resolving.
- **Commit for the CI fix:** `20bc12bc01`
- **Files changed in this round:**
  - `test/e2e/tests/perps/mocks/websocketPositionMocks.ts` (export the shared state)
  - `test/e2e/tests/perps/perps-fixture-config.ts` (new `getPerpsConfigEligibleWithEthLongPosition`)
  - `test/e2e/tests/perps/perps-tpsl.spec.ts` (use it)
- **Recipe re-validation:** **PASS** — 27/27 nodes, screenshot provenance `capture-helper`,
  run against the post-rebase tree so it covers `branch + origin/main`.
- **Integration status:** `rebased` — three commits replayed cleanly onto
  `origin/main` (`246cf98938`), `yarn install --immutable` re-run, linear history, no merge commit.
  Published with `--force-with-lease`.

## Validation

| Gate | Result |
| --- | --- |
| `mm-harness check diff --profile fast` | pass — 12 changed files (eslint, oxfmt, jest, policy-suppressions) |
| `tsc --noEmit` | exit 0 |
| `coverage-analyze.js` | **VERDICT: PASS** — new code meets the 80% threshold |
| `yarn lint:changed` | exit 0 |
| `yarn verify-locales --quiet` | exit 0 |
| `yarn circular-deps:check` | pass |
| Recipe (`mm-harness run`) | pass 27/27 |

The coverage run also lists four files with no tests and four below 80% — all of them
(`shared/lib/money/*`, `ui/pages/details/templates/*`, `ui/selectors/activity.ts`) arrived from
`origin/main` in this rebase and are flagged as pre-existing warnings, not new code from this PR.

## Note on the previous round's fix

The earlier `maxBuilderFee` / `perpDexs` HTTP mocks (`8b923c0856`) were a real gap — both calls
did move to HTTP in 15.1.0 and neither was mocked there — but they were not the whole cause;
`perps-tpsl.spec.ts` still failed identically afterwards. The position-source change above is the
part that actually breaks the flow. Both changes are kept: the earlier one closes a genuine
transport gap that would surface on other paths.
