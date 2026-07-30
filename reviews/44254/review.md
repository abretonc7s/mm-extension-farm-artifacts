# PR Review: #44254 — feat(perps): add order book to order entry page

**Tier:** standard (RECIPE_STRATEGY: full-qa)

## Summary

Adds a live, feature-flag-gated order-book panel to the perps order entry page: a header toggle slides
a bid/ask ladder in from the right, the split is resizable by mouse and keyboard, a modal configures
grouping / value metric / denomination, and tapping a price row switches the form to a Limit order
prefilled with that price.

It achieves its stated goal. I validated the whole flow against the live extension on Hyperliquid
testnet: **49/49 recipe nodes passed**, the panel streams real depth, and tapping a bid genuinely
prefills the limit price (`1924.0` observed). The stream architecture is the strongest part of the
change — the aggregated ladder gets its own dedicated Hyperliquid socket precisely because the SDK
dispatches `l2Book` by `coin` alone, so grouping can never coarsen the raw book that feeds top-of-book
and slippage. The `subscriptionId` tagging, per-channel deferred-init generation guards, and cache
clearing on close/market-switch are all deliberate and well-commented.

**One blocker:** `yarn lint:tsc` **fails on this branch** with a PR-introduced duplicate object key.
It is a one-line fix, but it is a red CI gate today.

## Recipe Coverage

Source: linked ticket description (TAT-3309). The structured `## Acceptance Criteria` block renders as
`_Not specified_` because the Jira import flattened the rich-text list into a single paragraph; a Jira
ticket **is** linked and does contain the list, so the "no Jira / linked issue" fallback does not apply.

- Recipe: `artifacts/recipe.json` (49 nodes), `Recipe decision: generate-ui`
- Run: **49/49 nodes executed, 49 passed, 0 failed** (counts read from `trace.json`, not from the draft)
- HUD on for every node; **zero `[hud]` warnings**
- All screenshots via `capture-helper` — no `extension-dom-raster` / `macos-screencapture` /
  `Page.captureScreenshot` fallback in `artifact-manifest.json`

| # | AC (verbatim) | Target env | Recipe nodes (IDs) | Screenshot filename | Visual verdict | Justification |
|---|---------------|------------|--------------------|---------------------|----------------|---------------|
| 1 | "Order book component is hidden/collapsed by default on the order screen" | fullscreen | `ac1-navigate-order-entry`, `ac1-wait-order-entry-page`, `ac1-wait-toggle-affordance`, `ac1-assert-book-collapsed`, `ac1-assert-divider-collapsed`, `ac1-screenshot-collapsed-by-default` | `evidence-ac1-collapsed-by-default.png` | **PROVEN** | Form at full width, no panel, no divider; two absence assertions back the image. Two earlier aborted runs left the panel **open** and this still asserted collapsed after re-navigation — the default survives a dirty prior state. |
| 2 | "User can tap/click to expand and see the full order book" | fullscreen | `ac2-press-toggle`, `ac2-wait-panel-visible`, `ac2-wait-divider-visible`, `ac2-wait-ladder-rows`, `ac2-wait-depth-ratio`, `ac2-screenshot-expanded-order-book` | `evidence-ac2-expanded-order-book.png` | **PROVEN** | One real click mounts the panel with 5 live asks, spread, 5 live bids, depth bars and the Buy/Sell ratio. Waiting on `ask-row-4` specifically means a partially-populated ladder cannot pass. |
| 3 | "Feature is gated by a feature flag and is not visible when the flag is off" | n/a (test proof) | `ac3-run-flag-off-hides-toggle-test`, `ac3-assert-flag-off-exit`, `ac3-assert-flag-off-test-passed`, `ac3-run-flag-selector-test`, `ac3-assert-flag-selector-exit`, `ac3-assert-flag-selector-passed` | — (grouped; `evidence-ac1-*` shows the flag-ON header for contrast) | **PROVEN** | Correct proof type — the flag-OFF branch renders *nothing*, so a screenshot of an empty header proves nothing. Two name-filtered jest runs assert toggle-absent and selector-default-OFF. Verified discriminating: a non-existent `-t` title exits 0 with **no** `1 passed`, so the assertion cannot pass vacuously. |
| 4 | "Expanded state shows price levels and USD totals for both asks and bids" | fullscreen | `ac4-wait-ask-price`, `ac4-wait-ask-value`, `ac4-wait-bid-price`, `ac4-wait-bid-value`, `ac4-assert-usd-total-header`, `ac4-screenshot-price-levels-usd-totals` | grouped into `evidence-ac2-expanded-order-book.png` | **PROVEN** | Four DOM assertions cover price **and** value on **both** sides, plus a text assertion on the literal `Total (USD)` header. Grouped image shows red asks $1,929→$1,925 and green bids $1,924→$1,920, each with a USD cumulative total. |
| 5 | "Component is responsive and works in both compact (mobile popup) and expanded (fullscreen) layouts" | fullscreen only | `ac5-run-narrow-body-clamp-test`, `ac5-assert-narrow-body-exit`, `ac5-assert-narrow-body-passed`, `ac5-run-popup-ceiling-test`, `ac5-assert-popup-ceiling-exit`, `ac5-assert-popup-ceiling-passed`, `ac5-screenshot-fullscreen-split-layout` | grouped into `evidence-ac2-expanded-order-book.png` | **UNTESTABLE** (compact half) | ⚠ Only the expanded/fullscreen half is observed. The compact popup half is not exercised: this CDP session exposes no popup/notification target (only `home.html`, `offscreen.html`, snaps, service-worker), and the slot browser is orchestrator-owned so window-resize emulation was not used to fake one. The compact **width math** is proven by two named unit assertions, but rendering in a real ~360px popup is unverified. |
| 6 | "No regressions to the existing order form fields (limit price, size, leverage, reduce-only, TP/SL)" | fullscreen | `ac6-press-bid-price-row`, `ac6-wait-limit-price-field`, `ac6-wait-order-type-toggle`, `ac6-wait-amount-field`, `ac6-wait-leverage-control`, `ac6-wait-auto-close-tpsl`, `ac6-wait-submit-button`, `ac6-screenshot-form-fields-intact`, `ac6-run-order-form-regression-tests`, `ac6-assert-order-form-exit`, `ac6-assert-order-form-suites-passed` | `evidence-ac6-form-fields-intact.png` | **PROVEN** | Exercises the riskiest coupling: tapping a bid switches to Limit and prefills `1924.0`, with Size, Leverage, Auto close, Liquidation price, Margin, Fees and submit all intact. Both pre-existing order-form hook suites asserted as `Test Suites: 2 passed`, so exit-0-with-zero-suites cannot pass. `reduce-only` is not on this new-order screen (it belongs to the close flow) — asserted absent-by-design rather than faked. |

Overall recipe coverage: 5/6 ACs PROVEN
Untestable: AC5 (compact popup layout — no popup target reachable from this CDP session)

> ⚠ Coverage escalation: AC5 is not fully proven in browser.
>   Reason: the compact (~360px popup) layout cannot be rendered from this slot — the CDP session
>   exposes no popup/notification target, and the browser is orchestrator-owned so it was not resized
>   to fake one. The expanded/fullscreen half is proven visually, and the pixel-floor width math is
>   proven by unit assertions, but the real popup rendering is unverified.
>   Human reviewer must validate manually before merging: open the extension **popup**, expand the
>   order book, and confirm both the ladder and the order form stay usable at ~360px.

**Evidence grouping:** `evidence-ac4-*.png` and `evidence-ac5-*.png` were pixel-near-identical to the
AC2 capture and are omitted from the curated set rather than padding the review; both remain in
`artifacts/recipe-run/evidence/`. See `artifacts/evidence-manifest.json`.

## Prior Reviews

| Reviewer | State | Date | Addressed? | Notes |
|----------|-------|------|------------|-------|
| geositta | CHANGES_REQUESTED | 2026-07-11 | **addressed** | Asked for two stream/cache lifecycle fixes and complete radio keyboard behavior. ~35 commits followed. The deferred-activation guard (`#activateDynamicWhenReady`) and close/reopen cache clearing both landed; `RadioPillGroup` now implements full roving-tabindex with Arrow/Home/End. The same reviewer approved twice afterwards ("Thanks for addressing the lifecycle and accessibility feedback", 07-13; "Thanks for carrying the subscription identity e2e", 07-24). |
| geositta | DISMISSED (was approval) | 2026-07-13, 07-24 | n/a | Approvals auto-dismissed by subsequent pushes. |
| aganglada | DISMISSED | 2026-07-28 | n/a | Empty body; auto-dismissed by a later push. |
| cursor[bot] | COMMENTED | through 2026-07-28 | **addressed** | Last substantive bot finding — "Stale order-book status on reopen": closing cleared `orderBookAggregated` but not `orderBookAggregatedStatus`, so a prior `error` suppressed the loading skeleton. Fixed in `fb0108c7`; both `handleToggleOrderBook` and the market-switch effect now clear the status channel too. |
| michalconsensys | COMMENTED | 2026-07-30 | n/a | Three comments, each just a link to commit `c1b17646` — pointers to where feedback was handled, no open asks. |

No feedback from prior reviews appears unaddressed. I have not duplicated any of it below.

## Acceptance Criteria Validation

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Hidden/collapsed by default | PASS | `ac1-assert-book-collapsed` + `ac1-assert-divider-collapsed` + `evidence-ac1-collapsed-by-default.png` |
| 2 | Click to expand and see the full order book | PASS | `ac2-press-toggle` → `ac2-wait-ladder-rows` (ask-row-4) + `evidence-ac2-expanded-order-book.png` |
| 3 | Gated by a feature flag, not visible when off | PASS | `ac3-*` name-filtered jest runs (toggle absent when flag off; selector default-OFF), assertions verified discriminating |
| 4 | Price levels + USD totals for asks and bids | PASS | `ac4-*` four DOM assertions + `Total (USD)` text assertion, grouped image |
| 5 | Responsive in compact popup and fullscreen | **UNTESTABLE** (compact half) | Fullscreen proven visually; compact width math proven by `ac5-*` unit assertions; real popup rendering unreachable from this CDP session — see escalation above |
| 6 | No regressions to existing order form fields | PASS | `ac6-*` six DOM assertions + `evidence-ac6-form-fields-intact.png` + both order-form hook suites green |

## Code Quality

- **Pattern adherence:** follows codebase conventions closely. Selector mirrors
  `getIsPerpsSlippageConfigEnabled`; new stream channels follow the existing `PerpsDataChannel`
  shape; the barrel export, `.types.ts` split and `data-testid` coverage all match neighbouring perps
  components. Import boundaries are clean — `shared/` imports nothing from `ui/`, and
  `app/scripts/` imports nothing from `ui/`.
- **Complexity:** appropriate for the problem, and the hard parts are justified in comments rather
  than left implicit. The dedicated-socket rationale, the positional-key choice for ladder rows, and
  the "transitionable 0 instead of `auto`" width note all explain non-obvious decisions.
- **Type safety:** **one failure** — `yarn lint:tsc` errors with TS1117 on a duplicate key
  (`translate-perps-error.ts:80`). No `as any` and no `as unknown as` in production code (the
  `as unknown as PerpsController` casts are all in test setup).
- **Error handling:** good. Connection loss surfaces a distinct "connection lost" message plus a
  manual Reconnect button; transient reconnects hide the stale ladder **and** disable price selection
  so outdated levels cannot be acted on. Missing mid price renders the unavailable-price fallback
  rather than a misleading `$0`.
- **Accessibility/fallbacks:** adequate — no regressions. New interactive elements all expose correct
  role + name: the toggle is a real `<button>` with `aria-pressed`; ladder rows get
  `role="button"` / `tabIndex` / a descriptive `aria-label` ("Use $1,925 as limit price") and
  Enter/Space handling, and correctly **drop** all of it when selection is disabled; the divider is a
  focusable `role="separator"` with `aria-valuenow/min/max`; the config pills are a proper
  WAI-ARIA radiogroup with roving tabindex; the skeleton is `aria-hidden` with an `sr-only` live label
  and `aria-busy` on the container. Async fallbacks preserve precision — no briefly-wrong defaults.
  One nit below (`aria-controls` pointing at an unmounted id).
- **Anti-pattern findings:**
  - `ui/components/app/perps/utils/translate-perps-error.ts:17` — duplicate key, breaks `lint:tsc` (see Fix Quality).
  - `test/e2e/tests/settings/state-logs.json:1364` — duplicate JSON key.
  - `ui/pages/perps/perps-order-entry-page.tsx:1148` — generic analytics value for a dark-launched feature.
  - `ui/hooks/perps/stream/usePerpsLiveOrderBook.ts:176` — module counter mutated during render.
  - `ui/components/app/perps/order-book/order-book.utils.ts:21` — dead export left from the old client-side aggregation approach.
  - No `eslint-disable` concerns: the single `@typescript-eslint/naming-convention` disable on the
    generic `RadioPillGroup` has ~357 precedents under `ui/`.
  - No `yarn.lock`/`package.json` change, so no LavaMoat policy update is required in this diff.
  - No persisted controller state added (panel state is component-local), so no migration is needed.

## Fix Quality

- **Best approach:** yes, with one caveat. The central design decision — isolating the aggregated
  subscription on its own Hyperliquid socket — is the *correct* fix rather than a pragmatic one: the
  SDK routes `l2Book` by `coin` only, so raw and grouped subscriptions for the same asset genuinely do
  clobber each other on a shared socket. Working around that in the UI (e.g. re-deriving grouping
  client-side) is what the earlier commits tried and it produced the "only a couple of rows" bug the
  comments describe. The server-side `nSigFigs`/`mantissa` path is both simpler and more correct.
  The `subscriptionId` + monotonic-generation tagging is the right shape for rejecting late packets
  across the async deactivate/activate IPC gap, and the per-channel activation generation is
  correctly scoped so one channel's teardown cannot cancel another's activation.
- **Would not ship:** `translate-perps-error.ts:17`. `yarn lint:tsc` is red on this branch, and the
  duplicate silently makes the first mapping dead code. One-line deletion.
- **Test quality:** strong — this is not box-ticking. Assertions check exact post-conditions rather
  than mock plumbing: `PerpsStreamManager.test.ts` asserts that non-matching `subscriptionId` packets
  are *discarded* (not merely that `pushData` exists); `perps-stream-bridge.test.ts` holds `perpsInit`
  unresolved, deactivates mid-flight, then resolves and asserts `subscribeAggregatedOrderBook` was
  **never** called — a real test of the deferred-init guard; `usePerpsOrderForm.test.ts` covers the
  negative path (a manual edit is *not* overwritten without a new prefill object). Failure paths are
  covered throughout (connection error, reconnecting-with-stale-cache, price-selection blocked while
  reconnecting). Reverting the corresponding source would fail these tests.
- **Brittleness:** low. No import-time evaluation, no frozen module constants driving runtime
  behavior, no mock coupling that would let a stale `beforeEach` mask a regression. Two minor notes:
  the prefill contract depends on **object identity** rather than value (documented in JSDoc and
  covered by tests, but it is an implicit contract a future caller could break by memoizing the
  object), and the module-level generation counter is mutated during render (see line comment).
  I traced the unguarded `subscribe()` in `#addDynamicSubscription` — `AggregatedOrderBookConnection.subscribe`
  can throw on conflicting params for the same asset, and that throw would be swallowed by the UI's
  `.catch(() => {})`, leaving the panel silently empty with no `error` status. I could not reach it:
  `#activateOrderBookAggregatedStream` tears the channel down first, and the library's teardown
  releases the payload entry synchronously. Reporting it as a latent robustness note only, not a bug.

## Live Validation

- Recipe: generated (`artifacts/recipe.json`, 49 nodes)
- Result: **PASS** — 49/49 nodes executed and passed, 0 failed. Per group: setup 4/4, AC1 6/6,
  AC2 6/6, AC4 6/6, AC3 6/6, AC5 7/7, AC6 11/11, teardown 3/3.
- Evidence: 3 curated screenshots (`evidence-ac1`, `evidence-ac2`, `evidence-ac6`) + `trace.json`;
  2 near-identical captures omitted by the evidence contract. Video not recorded — `record-window.sh`
  is a `[full]`-tier step and this run is standard tier; the slot is headed, not headless.
- Webpack errors: none. Build was already compiled ("compiled with 13 warnings", all pre-existing
  sass deprecations); log was byte-stable across a 30s monitoring window.
- Log monitoring: 30s webpack tail (no errors) plus the runner's own console capture across the whole
  run. Two non-blocking console errors recorded in `diagnostics.json`: a repeated resource `404` (×17)
  and `Unknown action Object` (×2). Both are marked `nonBlocking` by the runner, neither matches any
  string in this diff, and all 49 nodes passed — including every order-book stream node — so I could
  not tie either to this PR. Reporting them as observed, not as findings.

## Correctness

- **Diff vs stated goal:** aligned. Two cosmetic drifts in the PR description worth correcting before
  merge: the toggle is described as a "candlestick button" but is `IconName.Book` (an open-book glyph,
  visible in the evidence), and the grouping trigger is described as "an outlined trigger" but is a
  plain `ButtonIcon` with the Setting/gear icon. The description also says spread is shown "in bps"
  while `formatSpreadPercent` renders a percentage (`$0.5 (0.026%)` in the live run).
- **Edge cases:** well covered. Non-finite/zero prices, unparseable levels, empty depth, missing mid
  price, sub-precision grouping increments for low-priced assets (clamped and de-duplicated), narrow
  bodies where the pixel ceiling falls below the percentage floor, and a coarse grouping that would
  otherwise collapse the book into one bucket. One product-level gap rather than a defect: the ladder
  is capped at 5 levels per side because the dedicated socket always runs Hyperliquid fast mode, while
  the ticket's stated motivation is to "allow users to see more depth". Worth confirming with the PM
  that 5 levels satisfies the intent. (Mobile sets its constant to 20 but is subject to the same fast-mode
  cap, so the two clients render the same depth in practice.)
- **Race conditions:** actively defended, and this is the most carefully-handled area of the PR.
  Covered: late packets from a superseded grouping (subscriptionId match), A→B→A market switches and
  close→reopen reusing an id (never-reused monotonic generation), an activation resuming after its own
  teardown during cold init (per-channel generation guard), a stale ladder surviving an auto-reconnect
  (`connecting` hides rows and blocks selection), and a stale `error` status suppressing the skeleton
  on reopen (status cache cleared on both close and market switch). The `useLayoutEffect` registration
  ordering — register the active id before paint, deregister on unmount — is the right primitive.
- **Backward compatibility:** preserved. The feature is dark-launched (`productionDefault:
  { enabled: false }`), the new header slot is an optional `rightAccessory` that falls back to the
  previous spacer, and `limitPricePrefill` is optional. With the flag off the page renders exactly as
  before. No persisted state or migration involved.

## Static Analysis

- lint:tsc: **FAIL — 1 error** (`ui/components/app/perps/utils/translate-perps-error.ts(80,3): error
  TS1117: An object literal cannot have multiple properties with the same name`). Diff-gated: this
  file is in the PR diff, the duplicate line is added by this PR, and `origin/main` has only one
  occurrence and type-checks clean. It is not a known baseline failure.
- Tests: **10/10 suites, 422/422 tests pass** — `order-book.test.tsx`, `order-book.utils.test.ts`,
  `usePerpsLiveOrderBook.test.ts`, `usePerpsChannel.test.tsx`, `usePerpsOrderForm.test.ts`,
  `usePerpsEstimatedSlippage.test.ts`, `perps-order-entry-page.test.tsx`, `PerpsStreamManager.test.ts`,
  `feature-flags.test.ts`, `perps-stream-bridge.test.ts`.

## Mobile Comparison

- Status: **ALIGNED**
- Details: compared against `metamask-mobile-ref/app/components/UI/Perps/utils/orderBookGrouping.ts`
  and `Views/PerpsOrderBookView/`. `calculateAggregationParams` is logically identical (same
  magnitude/mantissa branches); `calculateGroupingOptions` uses the same decade offset (4) and the same
  `[1,2,5,10,100,1000]` multipliers; `selectDefaultGrouping` picks the same index 3;
  `SPREAD_PERCENT_DECIMALS` (3) and the USD compact thresholds (1M / 10K) match. The extension is a
  strict superset — it adds `Number.isFinite` guards, clamps increments to `PERPS_MAX_PRICE_DECIMALS`
  and de-duplicates the ladder, none of which mobile does.
  - `.toFixed()` appears twice (`order-book.utils.ts:148` grouping-increment rounding, `:303` spread
    percent). Neither is a price/value display path — both mirror mobile exactly — so the perps
    decimals rule is not violated. Displayed prices and totals correctly go through
    `formatPerpsFiat` / `formatPositionSize` / `formatLargeNumber`.
  - Divergence (cosmetic): the shared fallback glyph is `'--'` here vs mobile's order-book-local
    `'—'` (em dash). The extension matches the canonical `PERPS_CONSTANTS.FallbackDataDisplay` in
    `@metamask/perps-controller`, so mobile is the outlier. No action needed.
  - Not a divergence (checked): neither client consumes the controller's
    `proLayoutPreferences.orderBookExpanded`; both hold panel state in component `useState`, so the
    extension is aligned in leaving the panel closed on every navigation.

## Architecture & Domain

- **MV3:** `AggregatedOrderBookConnection` is constructed per controller connection in
  `setupControllerConnection` and `close()`d when that connection tears down — matching the existing
  `PerpsStreamBridge` lifetime. I verified in `@metamask/perps-controller` that the socket is created
  **lazily on first subscribe** and torn down when the last subscription is removed, so idle UI
  surfaces do not each hold an open WebSocket; only actually-open panels do.
- **LavaMoat:** no `package.json`/`yarn.lock` change in this diff (the `@metamask/perps-controller` v10
  bump referenced in the PR body already landed on `main` in `48ad866df4`), so no policy regeneration
  is required here.
- **Import boundaries:** clean. The bridge deliberately takes `subscribeAggregatedOrderBook` as an
  injected function so it never value-imports the ESM-only Hyperliquid SDK, keeping it Jest-friendly —
  with a matching stub registered in `test/mocks/metamask-perps-controller.js`. Good discipline.
- **Controller usage:** the UI never reaches into the controller directly; it goes through
  `submitRequestToBackground` actions and reads from `PerpsStreamManager` channels, consistent with the
  existing perps data flow.

## Risk Assessment

- **LOW–MEDIUM** — The feature is dark-launched behind `perpsOrderBookEnabled` (production default
  OFF, min version 13.30.0) and is inert when the flag is off, which caps blast radius. Within the
  flag, correctness is well covered by 422 passing tests and a green 49-node live run. The residual
  risk sits in two places: the change touches shared perps stream plumbing that the always-on raw
  `orderBook` and `prices` channels also use (`perpsActivatePriceStream` was rerouted through the new
  `#activateDynamicWhenReady` path, so the price stream's activation semantics changed for **all**
  users, not just flagged ones), and the compact popup layout is unvalidated. The failing `lint:tsc`
  is a CI blocker rather than a runtime risk.

## Recommended Action

**REQUEST_CHANGES** — one blocking item, everything else optional.

1. **Blocking** — `ui/components/app/perps/utils/translate-perps-error.ts:17`: delete the duplicate
   `UNSUPPORTED_COLLATERAL` entry. `yarn lint:tsc` fails on this branch today (TS1117); the entry at
   line 17 is dead code shadowed by line 80. A merge-resolution artifact — `origin/main` has only one.
2. Suggestion — `test/e2e/tests/settings/state-logs.json:1364`: duplicate `recentlyViewedMarkets` key
   (same merge artifact; `origin/main` has one).
3. Suggestion — `ui/pages/perps/perps-order-entry-page.tsx:1148`: use a specific
   `INTERACTION_TYPE` value instead of the generic `TAP`, so a dark-launched feature's adoption is
   actually measurable.
4. Suggestion — `ui/hooks/perps/stream/usePerpsLiveOrderBook.ts:176`: module-level counter mutated
   during render.
5. Nitpick — `ui/components/app/perps/order-book/order-book.utils.ts:21`: `ORDER_BOOK_DISPLAY_LEVELS`
   is effectively dead.
6. Nitpick — `ui/components/app/perps/order-book/order-book.tsx:470`: `aria-controls` references an id
   that does not exist while the modal is closed.
7. Non-code — update the PR description: the toggle is a book icon (not candlestick), the grouping
   trigger is a gear `ButtonIcon` (not an outlined trigger), and the spread renders as a percentage
   (not bps).
8. Manual check before merge — expand the order book in the **extension popup** (~360px) and confirm
   both panes stay usable (AC5, unverifiable in this slot).
