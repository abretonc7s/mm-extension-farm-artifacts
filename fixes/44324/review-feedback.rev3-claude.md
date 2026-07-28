# Self-Review: MetaMask/metamask-extension#44324

## Verdict: ISSUES

## Summary

Third review pass, run against `cb6aa610f7` ("address self-review feedback"). The 21
findings from the rev-claude pass were genuinely addressed — the dep-array lint error, the
dead eslint-disable, the churn reverts, the ticket IDs, the i18n assertions, the fake
`PERPS_VERIFY_LOCALE_FALSE_POSITIVES` export and the mobile search-funnel gaps are all
fixed in the tree. The underlying design (consume the controller analytics contract, delete
the duplicated client emissions, keep client `PerpsError` only for the transport-throw gap)
remains sound and I would ship it. **But the fix pass introduced four new ESLint errors that
fail the CI `yarn lint` gate, and its market-list search rework introduced a real analytics
defect I reproduced live: backspacing the search box to empty never reports
`PERPS_SEARCH_ABANDONED`, and worse, the next market tapped from the *unfiltered* browse
list is misreported as a search result tap for the stale query.**

Diff reviewed against `origin/main` (`9c8c6bcb8b`), **not** the stale local `main`
(`7ec2719d8b`): **90 files, +4544 / −990**, 42 commits.

## Type Check
- Result: PASS
- New errors: none in changed files.
- `yarn lint:tsc` was **not** run this pass. The dependency/type surfaces it would have
  covered (`package.json` controller pin, `shared/constants/perps-events.ts` re-exports,
  the `TrackingData`/`InputMethod` consumers) were unchanged by `cb6aa610f7` and were
  already verified green by the previous pass; instead I ran ESLint (which loads the
  TypeScript parser) directly over all 57 changed TS/TSX/JS files, which is where the four
  errors below come from.

## Tests
- Result: PASS
- Details: all 29 affected suites — every changed test file plus the untouched sibling
  suites of changed source files — **954 tests, 0 failures**, no console-baseline
  violations. Run in three batches (heavy perps page suites under `--runInBand`).
- **`yarn lint:changed` is vacuous here and proves nothing.** On a clean working tree it
  prints "No changed JS/TS/TSX/MTS/SNAP files to lint" and exits 0; it diffs the working
  tree, not `origin/main...HEAD`. `yarn verify-locales --quiet` → `No invalid entries!` and
  `yarn circular-deps:check` → pass, both genuine.

## Test Quality
- Findings:
  - `ui/pages/perps/perps-market-detail-page.test.tsx:481` — `expect(typeof
    assetDetailView?.properties?.watchlisted).toBe('boolean')` asserts the *type*, not the
    value. It passes whether `watchlisted` is `true` or `false`, so it cannot catch an
    inverted or hardcoded selector result.
  - `ui/pages/perps/market-list/index.test.tsx` — the only abandonment test
    ("emits search_abandoned when the query is cleared without a tap", line 474) drives the
    Escape/clear-button path. The backspace-to-empty path — where the defect below lives —
    has no coverage at all.
  - No `should`-prefixed test names (`describe('shouldShowPerpsOrderSubmissionToasts')` is a
    function name, not a violation). No hardcoded user-facing copy remains in added
    assertions — every one now goes through `messages.*.message` / `tEn`. `toBeDefined()`
    appears four times but always as a guard immediately followed by a specific
    `toMatchObject` / `objectContaining` payload assertion, which is fine.

## Domain Anti-Patterns
- Findings:
  - **Import boundaries — one violation.**
    `ui/components/app/perps/edit-margin/edit-margin-modal-content.test.tsx:6` imports
    `app/_locales/en/messages.json` directly from `ui/`, tripping
    `import-x/no-restricted-paths`. Every other file in the repo doing this carries an
    explicit `// eslint-disable-next-line import-x/no-restricted-paths`
    (`scam-questionnaire.test.tsx:6`, `asset-list-control-bar.test.tsx:6`, …). The sibling
    `perps-order-entry-page.test.tsx:18` already uses the sanctioned helper
    (`import { enLocale as messages, tEn } from '../../../test/lib/i18n-helpers'`), which is
    the fix — not a new disable comment.
  - **Magic numbers/strings** — `ui/pages/perps/market-list/index.tsx:282` keeps the
    intent-vs-browse heuristic as an inline `/^[a-z0-9]{1,6}$/u`, in the same file that
    names its debounce `SEARCH_QUERY_DEBOUNCE_MS`. (It matches mobile's inline regex, so
    this is a nit, but it is now embedded in a nested ternary that is itself a lint error.)
  - **Error handling — clean.** Every new/changed `catch` either rethrows, surfaces UI, or
    calls `captureException` with an inline comment explaining why recovery is correct
    (`perps-view.tsx:238/244/288` close-all + cancel-all, `perps-market-detail-page.tsx:1039`
    watchlist toggle, `PerpsAttributionContext.tsx:279` fire-and-forget attribution sync).
    Two previously bare `catch {}` blocks in `perps-view.tsx` were fixed by this branch.
    No new swallows.
  - **eslint-disable** — 8 file-level `@typescript-eslint/naming-convention` disables added
    by this PR, all in test files with justification comments. I confirmed empirically that
    all 8 are load-bearing: the repo reports unused directives as errors, and the full
    ESLint run over the changed files produced no "Unused eslint-disable directive". The one
    dead directive the previous pass flagged was removed.
  - **Controller usage / MV3 / shared state** — clean. The module-level
    `sessionUtmAttribution` in `PerpsAttributionContext.tsx:173` is deliberate last-touch
    session state, written only from effects via a module-level writer, with a test-only
    reset; accepted, not flagged. `handlerSearchParams: 'original'` on the three perps
    deeplink routes follows the existing precedent in `predict.ts:11` and `batch-sell.ts`.
  - **testIDs / a11y** — no new interactive elements or displayed values; the diff is
    analytics-only.
- **Verified, not assumed:** I resolved every `PERPS_EVENT_PROPERTY.X` and
  `PERPS_EVENT_VALUE.A.B` referenced across non-test `ui/`, `shared/` and `app/` code
  against the **real** installed `@metamask/perps-controller@9.2.1` (not the Jest mock) —
  **all resolve**, so no event key silently emits `undefined` in production. I also diffed
  the hand-maintained `test/mocks/metamask-perps-controller.js` against the real package:
  **159 shared values, 0 mismatches**. The yarn patch is complete — zero
  `require("file:///home/runner/...")` statements remain anywhere in the installed package.

## Mobile Comparison
- Status: DIVERGES
- Details (mobile ref: `/Users/deeeed/dev/metamask/metamask-mobile-ref`):
  - ALIGNED: `derivePerpsTradeAction` mirrors mobile's `utils/deriveTradeAction.ts`.
    `usePerpsAbandonOrderTracking` is a faithful web port of
    `hooks/usePerpsAbandonOrderTracking.ts` (same `getAbandonProperties`/`hasCommittedRef`
    contract and one-shot guard; `pagehide` + unmount replacing `beforeRemove`/`blur`).
    CONSIDERED debounce 1000 ms matches `PerpsOrderView.tsx:822`; search debounce 500 ms
    matches `PerpsMarketListView.tsx:578`. The rev3 fixes bring `query_text` /
    `query_length` / `has_results` / `active_chips`, the pre-debounce clock start and the
    mid-debounce flush into line with `PerpsMarketListView.tsx:418-460, 495-512, 549-552`.
    No new `.toFixed(2)` or `{min:2,max:2}` in production code — the only two occurrences in
    the diff are inside a Jest mock in `infrastructure.test.ts`.
  - DIVERGES: the empty-query branch (mobile emits abandonment + resets the session;
    Extension does neither) and the `discovery` mode derivation (mobile's chips actually
    narrow the searched set; Extension's do not). Both detailed in Issues.

## LavaMoat Policy
- Status: OK
- Details: `package.json:429` moves `@metamask/perps-controller` from `^9.0.0` to a yarn
  patch of `9.2.1`, and all 8 `lavamoat/webpack/{mv2,mv3}/{main,beta,flask,experimental}/policy.json`
  files carry an identical, consistent `+8/−2` delta (`@nktkas/hyperliquid` gains
  `DecompressionStream`/`Response`/`TextDecoder`/`atob`/`clearTimeout`; `@nktkas/rews` gains
  `Blob`/`DOMException`/`TextEncoder`; `WebSocket` moves off `@metamask/perps-controller`
  onto the subpackage that actually opens the socket). `lavamoat/browserify/**` was deleted
  by main (#44433) and correctly not resurrected.

## Fix Quality
- Best approach: **yes, with one exception.** Consuming the controller contract, deleting
  the client duplicates and keeping client `PerpsError` strictly for the transport-throw gap
  is right, and the `{ success: false }` vs `throw` split is applied consistently across
  order entry, close, cancel, reverse, TP/SL and margin, each with an inline rationale. The
  exception is the market-list `mode` derivation (below): the previous review asked for
  `discovery`, and the fix added it without accounting for the fact that Extension search
  deliberately bypasses the category filter, so the reported mode now describes narrowing
  that never happened.
- Would not ship: the four ESLint errors (CI `yarn lint` gate) and the
  `PERPS_SEARCH_RESULT_TAPPED` false attribution. Everything else is follow-up-able.
- Test quality: good overall — assertions target emitted event names, exact payloads and
  *absence* counts, and would fail if the fix were reverted. Weak in exactly one place: the
  search-session lifecycle is only tested through the clear-button path, which is why the
  backspace defect shipped.
- Brittleness: the hand-maintained `test/mocks/metamask-perps-controller.js` mirror remains
  the main structural risk. It is correct today (0/159 mismatches, verified programmatically)
  but nothing enforces it — a future controller value change would keep tests green while
  production emits a different string. A ~20-line CI script comparing the mock to the real
  package would close this permanently. Smaller symptom of the same gap:
  `test/mocks/metamask-perps-controller.js:63` defines `TYPE: 'type'`, which exists neither
  upstream nor in `shared/constants/perps-events.ts` — harmless today only because nothing
  references `PERPS_EVENT_PROPERTY.TYPE`.

## Diff Quality
- Minimal: yes. The churn the previous pass flagged is reverted (hook order in
  `edit-margin-modal-content.tsx`, the three `Object.assign` literals in
  `perps-controller-init.test.ts`, and the `TAT-3264` / `TAT-3053` ticket IDs are back at
  `perps-market-detail-page.test.tsx:2061` and `perps-order-entry-page.test.tsx:1820`).
  Every one of the 90 changed files is perps-, locale-, lockfile-, LavaMoat- or
  test-fixture-related; nothing unrelated slipped in.
- Debug code: none. No `console.log`, no `as any` / `as unknown as`, no untracked
  `TODO`/`FIXME` in added lines.

## Recipe
- Present: yes (19 nodes, Protocol v1).
- **Re-run against the current tree** (`artifacts/review-rev3/`): `mm-harness run` still
  aborts at `launch.app` with `Slot macwork-mmedev-2 is missing
  resources.dev-server.metro_port` — the same slot/pool config bug the worker reported, and
  a `run` attempt tears down the orchestrator's browser on its way out (twice, this
  session; recovered with `runtime-launch` both times). `--plan` validates cleanly (19
  nodes). I therefore executed every node individually: **7/7 static assert nodes PASS**
  (`gate-repo-root`, `ac1-assert-package-version` → 9.2.1, `ac2-*`, all three `ac5-*`
  duplicate-emission asserts), **all Jest behaviour nodes PASS** (they are the same suites
  reported above), and — closing the gap `recipe-coverage.md` honestly flagged as "not
  re-proved post-fix" — **all 6 live CDP nodes PASS against the current build**
  (`cdp.target` → `ensure_unlocked` → `ui.navigate page=perps` → `ui.navigate
  hash=#/perps/market/DOESNOTEXIST` → `ui.wait_for "Market not found"` → `ui.screenshot`).
- Quality: **weak — unchanged from the previous assessment.** 8 of 19 nodes re-run the same
  Jest suites the unit gate already runs (proof duplication, not app-level proof) and 4 more
  are source-text greps that assert code *shape*. The live portion seeds no positions or
  orders and asserts **no MetaMetrics payload at all**, so the PR's central claim — that the
  controller emits the transaction events exactly once with the contract properties — is
  still not proven in the running app. `recipe-quality.json` and `recipe-coverage.md` both
  state this limit explicitly rather than papering over it, which is the right call, and the
  coverage doc is scrupulous about which run its `summary.json` belongs to.

## Visual Evidence
- Status: OK. `recipe-run/live-capture-error-screen.png` read directly: the "Market not
  found" heading and `The market "DOESNOTEXIST" could not be found.` body are plainly
  visible at the top of the viewport, unclipped. My own re-capture against the current
  post-fix build (`review-rev3/live/call.png`) reproduces it, with the URL bar confirming
  `home.html#/perps/market/DOESNOTEXIST`. The protocol holds: `ui.wait_for` on the claimed
  text immediately precedes the screenshot. `check-task-artifact-contract.mjs` →
  `TASK_ARTIFACT_CONTRACT_PASS`; no `FAIL_VISUAL_CLASSIFICATION` (the coverage row is now
  labelled `visual`), no `FAIL_EMPTY`, no `MISSING:`, no invalid screenshot provider.

## Issues

- **ui/pages/perps/market-list/index.tsx:343** — backspacing the search box to empty ends the search session silently AND poisons the next tap. The empty-query branch only clears `pendingQueryRef` and `searchStartedAtRef`; it never calls `emitSearchAbandoned()` and never clears `emittedQueryRef` / `queryCountRef`. Mobile does both (`PerpsMarketListView.tsx:544-546`: `if (!trimmedQuery) { emitSearchAbandoned(); resetSearchSession(); }`). Reproduced live with a throwaway spec: type `BTC`, advance past the debounce, backspace to empty, then click the first row of the now-unfiltered list → `PERPS_SEARCH_ABANDONED` count is **0**, and `PERPS_SEARCH_RESULT_TAPPED` fires with `{search_query: "btc", results_count: 17, result_rank: 1, asset: "BTC"}` — `results_count` is the whole market list, not the one BTC match, and the tap had nothing to do with the query. `onClear` (search-input.tsx:41,51) only fires on the clear button and Escape, so every user who deletes their query by hand hits this. Fix: call `emitSearchAbandoned()` in the empty branch, matching mobile — it early-returns when `emittedQueryRef` is empty, so it will not double-emit with `handleSearchClear`.
- **ui/pages/perps/market-list/index.tsx:280** — ESLint error `no-nested-ternary` on the `MODE` derivation. CI `yarn lint` fails. Hoisting the mode into a named local (or a small `deriveSearchMode(query, chips)` helper next to `SEARCH_QUERY_DEBOUNCE_MS`) fixes the error and gives the `/^[a-z0-9]{1,6}$/u` heuristic a name at the same time.
- **ui/components/app/perps/edit-margin/edit-margin-modal-content.test.tsx:6** — ESLint error `import-x/no-restricted-paths`: "Unexpected path `../../../../../app/_locales/en/messages.json` imported in restricted zone". Added by the rev3 fix while removing a hardcoded i18n string. CI `yarn lint` fails. Use `import { enLocale as messages } from '../../../../../test/lib/i18n-helpers'` as `perps-order-entry-page.test.tsx:18` already does — do not add an `eslint-disable`.
- **ui/components/app/perps/edit-margin/edit-margin-modal-content.tsx:67** — two ESLint errors `jsdoc/require-param`: the new `getMarginAdjustmentFailedToast` helper has a JSDoc block but no `@param errorMessage` / `@param fallbackDescription`. CI `yarn lint` fails.
- **ui/pages/perps/market-list/index.tsx:244** — `mode: 'discovery'` is reported for narrowing that did not happen. `activeChips` is derived from `selectedFilter`, but `displayedMarkets` (line 200-206) deliberately **bypasses** the category filter while searching, and the filter row is hidden (line 537). So a user who selects "crypto", then searches, gets `mode: 'discovery'` on results that were never narrowed by that chip. Mobile's `discovery` means the opposite — its chips genuinely compose with search (`PerpsMarketListView.tsx:744` has a dedicated "search + active filter → no results" empty state with a Clear-filter CTA). Either report `activeChips: []` while a query is active (matches what the user sees; smallest fix), or make the chip narrow search results too — but that is a behaviour change beyond an analytics PR and should be its own ticket.
- **ui/pages/perps/market-list/index.tsx:195** — stale comment: "When searching, bypass filters and search ALL markets (like mobile)". Mobile does not do this (see above). The comment is now the justification for the divergence it misdescribes.
- **ui/pages/perps/perps-order-entry-page.tsx:642** — `usePerpsAbandonOrderTracking` is called unconditionally, above the `!market` early return at line 1729. Landing on the market-not-found error screen and leaving therefore emits `abandon_order` with `order_size: 0` and `leverage_used: 0`, polluting the order-abandonment funnel with users who never saw an order form. The hook already accepts `active` — pass `active: Boolean(market)`.
- **ui/pages/perps/perps-market-detail-page.test.tsx:481** — `expect(typeof assetDetailView?.properties?.watchlisted).toBe('boolean')` asserts the type rather than the value, so it passes for either. Assert the expected value (and ideally add the watchlisted-true case, since `selectPerpsIsWatchlistMarket` is the thing under test).
- **test/mocks/metamask-perps-controller.js:63** — `TYPE: 'type'` exists neither in `@metamask/perps-controller@9.2.1` nor in the Extension override block of `shared/constants/perps-events.ts`. Currently harmless (nothing references `PERPS_EVENT_PROPERTY.TYPE`), but it is exactly the mock-drift class this file is exposed to: a key that resolves in tests and is `undefined` in production. Delete it, and add a CI check that diffs the mock against the real package so the next drift is caught automatically rather than by hand.
- **test/mocks/metamask-perps-controller.js:23** — `PERPS_EVENT_PROPERTY.TIMESTAMP` changes from `perps_timestamp` to the controller's `timestamp`, renaming that property on **every** perps event, client- and controller-emitted. Correct per the contract, but it is a breaking analytics-schema change for any dashboard or query keyed on `perps_timestamp`. Carried forward from the previous pass and still unaddressed: it needs flagging to the data consumers before release rather than being left implicit in a mock diff.
- **package.json:429** — `@metamask/perps-controller` is pinned to a local yarn patch of exactly `9.2.1`, replacing the semver range. The patch itself is a legitimate, minimal, complete fix for an upstream packaging bug (two `require("file:///home/runner/work/hyperliquid/...")` statements the published tarball ships with; I confirmed no such statements remain in the installed package). But the pin means renovate/dependabot can no longer bump the controller. Call it out in the PR description with a tracked follow-up to drop the patch once upstream republishes.
- **temp/tasks/fix/44324-0728-033914/artifacts/recipe.json** — the recipe still cannot prove its own headline claim. 8 of 19 nodes re-run Jest suites the unit gate already runs and 4 are source-text greps; the live pass seeds no positions or orders and captures no MetaMetrics payload, so "the controller emits the transaction events exactly once with the contract properties" remains proved by absence-asserts and unit tests, not by observation in the running app. Separately, `mm-harness run` is unusable on this slot (`macwork-mmedev-2 is missing resources.dev-server.metro_port`) and tears down the orchestrator's browser on failure — an orchestrator-level fix, surfaced here rather than worked around.
