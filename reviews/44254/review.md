# PR Review: #44254 — feat(perps): add order book to order entry page

**Tier:** standard (RECIPE_STRATEGY: full-qa)

## Summary

The PR adds a feature-flagged live order book beside the perps order entry form: a header toggle, a resizable split (mouse + keyboard), a full bid/ask ladder with spread, cumulative depth bars and a buy/sell depth ratio, a grouping/denomination config modal, and tap-a-price-to-prefill-a-limit-order. It reads from a second, dedicated server-aggregated stream channel (`orderBookAggregated` + a status channel) so the raw full-precision book that feeds top-of-book and slippage is never coarsened by the panel's grouping.

It achieves its stated goal. Every ticket acceptance criterion and every Gherkin claim in the PR body was reproduced live against the running extension — 102/102 recipe nodes passed, including behavioural assertions (not just presence checks) for USD totals, resize bounds, the prefill value and cross-market freshness. Static analysis is clean (`lint:tsc` 0 errors, 333/333 tests across the 9 affected suites).

Two defects were found and reproduced deterministically, both in `perps-order-entry-page.tsx` and both narrow in scope. Neither is a crash or a data-correctness bug; the feature is dark-launched behind `perpsOrderBookEnabled` (production default OFF), which lowers the risk of shipping.

## Recipe Coverage

| # | AC (verbatim) | Target env | Recipe nodes (IDs) | Screenshot | Visual verdict | Justification |
|---|---------------|------------|--------------------|------------|----------------|---------------|
| 1 | "Order book component is hidden/collapsed by default on the order screen" | fullscreen | `ac1-navigate-order-entry`, `ac1-wait-toggle-affordance`, `ac1-assert-book-collapsed`, `ac1-assert-divider-collapsed`, `ac1-screenshot-collapsed-by-default` | `evidence-ac1-collapsed-by-default.png` | PROVEN | Form fills the full width; panel and divider both asserted NOT present. |
| 2 | "User can tap/click to expand and see the full order book" | fullscreen | `ac2-press-toggle`, `ac2-wait-panel-visible`, `ac2-wait-ask-ladder`, `ac2-wait-bid-ladder`, `ac2-wait-spread-row`, `ac2-wait-depth-ratio`, `ac2-screenshot-expanded-order-book` | `evidence-ac2-expanded-order-book.png` | PROVEN | Real click mounts the panel with 5 asks + spread + 5 bids; waiting on `ask-row-4`/`bid-row-4` means a skeleton or partial ladder fails the node. |
| 3 | "Feature is gated by a feature flag and is not visible when the flag is off" | n/a (hidden branch) | `ac3-run-flag-off-hides-toggle-test`, `ac3-assert-flag-off-test-passed`, `ac3-run-flag-selector-test`, `ac3-assert-flag-selector-passed` | none (correct proof type) | PROVEN | Flag-OFF branch is unreachable live (fixture pins the flag ON; a remote flag can't be flipped read-only). Proven by running both owning tests and asserting exit 0 **and** `1 passed` — exit 0 alone passes when a `-t` filter matches nothing. Flag-ON half is visible in every screenshot. |
| 4 | "Expanded state shows price levels and USD totals for both asks and bids" | fullscreen | `ac4-assert-usd-total-header`, `ac4-assert-usd-values`, `ac4-assert-usd-values-output` | `evidence-ac2-expanded-order-book.png` (grouped) | PROVEN | Headers read `Price / Total (USD)`; probe asserts all 10 rendered rows carry a `$` value (`AC4_OK asks=5 bids=5`). |
| 5 | "Component is responsive and works in both compact (mobile popup) and expanded (fullscreen) layouts" | fullscreen + emulated 360px | `ac5-shrink-browser-window`, `ac5-set-compact-viewport`, `ac5-wait-ladder-compact`, `ac5-wait-form-compact`, `ac5-assert-pixel-floors`, `ac5-screenshot-compact-split` | `evidence-ac5-compact-360px-split.png` + `evidence-ac2-expanded-order-book.png` | PROVEN | Both layouts observed live; at 360px the panes measure exactly on their floors (`AC5_OK {"viewport":360,"bodyWidth":338,"book":140,"form":224,"askRows":5}`). ⚠ The image also shows the value column clipped behind a horizontal scrollbar — raised as finding #2 rather than hidden here. |
| 6 | "No regressions to the existing order form fields (limit price, size, leverage, reduce-only, TP/SL)" | fullscreen | `ac6-assert-order-type-toggle`, `ac6-assert-amount-field`, `ac6-assert-leverage-control`, `ac6-assert-tpsl-control`, `ac6-assert-submit-button`, `ac6-run-order-form-regression-tests` | `evidence-ac6-form-fields-intact.png` | PROVEN | All controls render beside the open book; the two pre-existing order-form hook suites re-run green. Reduce-only has no control on this surface in `new` mode — noted, not silently dropped. |
| PR1 | "the order book panel slides in from the right / I see asks, the mid price and spread, and bids with depth bars / the panel collapses" | fullscreen | `ac2-wait-spread-row`, `ac2-wait-depth-ratio`, `teardown-collapse-order-book` | `evidence-ac2-expanded-order-book.png` (grouped) | PROVEN | Asks, `Spread $0.3 (0.016%)` and bids with depth bars visible in one frame; collapse exercised in teardown. |
| PR2 | "the split resizes and stays within its min/max bounds / the same is possible with the divider focused using Arrow/Home/End keys" | fullscreen | `pr2-focus-divider`, `pr2-key-arrow-left`, `pr2-assert-arrow-widened`, `pr2-key-end`, `pr2-assert-end-at-min`, `pr2-key-home`, `pr2-assert-home-at-max`, `pr2-drag-divider`, `pr2-assert-drag-output` | `evidence-pr2-split-resized-to-clamped-max.png` | PROVEN | ArrowLeft 33%→35%, End→22% floor, Home→announced max, and a real mouse drag past the ceiling gives `PR2_DRAG_OK 22% -> 60% (bounds 22-60)`. |
| PR3 | "the ladder and column headers update accordingly" | fullscreen | `pr3-open-config-modal`, `pr3-select-base-currency`, `pr3-select-size-metric`, `pr3-apply-config`, `pr3-assert-header-updated` | `evidence-pr3-config-modal-open.png`, `evidence-pr3-ladder-after-config-change.png` | PROVEN | Header changed `Total (USD)` → `Size (ETH)` and values switched to base-asset sizes. Two genuinely distinct states, so two frames. |
| PR4 | "the order form switches to a Limit order / the limit price input is prefilled with the selected price" | fullscreen | `pr4-tap-ask-price-row`, `pr4-wait-limit-price-field`, `pr4-assert-prefill-matches`, `pr4-assert-prefill-output` | `evidence-pr4-limit-prefilled-from-price-tap.png` | PROVEN | Tapping the `$1,890` row selected Limit and set the input to `1890.0`; the probe compares against the tapped row's own price, so any other value fails. |
| PR5 | "the order book shows the new market's data without briefly showing the previous market's ladder" | fullscreen | `pr5-capture-eth-ladder`, `pr5-navigate-btc`, `pr5-assert-fresh-ladder`, `pr5-assert-fresh-output` | `evidence-pr5-ladder-after-market-switch.png` | PROVEN | Post-switch rows asserted **disjoint** from the captured ETH rows (`PR5_OK ETH -> BTC newTop=$64,141`); the transient is additionally covered by the cache-clearing unit tests. |

Overall recipe coverage: 11/11 ACs PROVEN
Untestable: none

Full matrix, evidence-integrity notes and the forbidden-pattern scan: `artifacts/recipe-coverage.md`.

## Prior Reviews

| Reviewer | State | Date | Addressed? | Notes |
|----------|-------|------|------------|-------|
| geositta | CHANGES_REQUESTED | 2026-07-11 | addressed | Stream/cache lifecycle + radio keyboard behaviour. ~40 commits followed; superseded by three later DISMISSED reviews from the same reviewer (2026-07-13, 07-14, 07-24). The `RadioPillGroup` roving-tabindex implementation (`order-book-config-modal.tsx:125-210`) now implements the full Arrow/Home/End contract. |
| abretonc7s | CHANGES_REQUESTED | 2026-07-30 | addressed | All 6 findings resolved in `97dcb0cf`, verified on the branch: duplicate `UNSUPPORTED_COLLATERAL` key gone (1 occurrence, `lint:tsc` clean); duplicate `recentlyViewedMarkets` JSON key gone; generic `INTERACTION_TYPE.TAP` replaced with `ORDER_BOOK_OPENED`/`ORDER_BOOK_CLOSED`; render-phase generation counter moved into `useLayoutEffect`; dead `ORDER_BOOK_DISPLAY_LEVELS` removed; `aria-controls` made conditional. |

No feedback from prior reviews is repeated below — all previously-raised items are confirmed fixed.

## Acceptance Criteria Validation

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Hidden/collapsed by default | PASS | `ac1-*` nodes + `evidence-ac1-collapsed-by-default.png` |
| 2 | Click to expand, see full order book | PASS | `ac2-*` nodes + `evidence-ac2-expanded-order-book.png` |
| 3 | Feature-flag gated, not visible when off | PASS | `ac3-*` nodes; both owning jest tests asserted exit 0 + `1 passed` |
| 4 | Price levels and USD totals, both sides | PASS | `ac4-*` nodes, `AC4_OK asks=5 bids=5` |
| 5 | Responsive in compact and expanded layouts | PASS with caveat | `ac5-*` nodes, `AC5_OK` pane measurements; value column clipped at 360px — see finding #2 |
| 6 | No regressions to existing order form fields | PASS | `ac6-*` nodes + 2 pre-existing hook suites green; reduce-only N/A on this surface |

## Code Quality

- **Pattern adherence:** follows codebase conventions. The `component-library` Modal + `@metamask/design-system-react` primitives mix matches 8+ existing perps modals (`close-position`, `edit-margin`, `update-tpsl`, `slippage-config`, …) — house convention, not drift. Feature flag follows the established `{ enabled, minimumVersion }` shape and is registered in the E2E flag registry.
- **Complexity:** appropriate for the surface. The two-channel split (raw book for top-of-book/slippage, aggregated book for the ladder) is the right call — it prevents the panel's grouping from coarsening slippage inputs, and the reasoning is documented at the declaration sites.
- **Type safety:** clean. No `as any` / `as unknown as`, no `eslint-disable` beyond one justified `@typescript-eslint/naming-convention` on a generic component. `lint:tsc` reports 0 errors.
- **Error handling:** good. Connection status drives a real `connection lost` state with a manual reconnect button; `isReconnecting` hides stale rows *and* blocks price selection so outdated levels can't be acted on (`order-book.tsx:406-408`). Mid price falls back to `null` rather than a misleading `$0`.
- **Accessibility/fallbacks:** mostly strong — `aria-checked` radiogroup with roving tabindex, `aria-label`s on the view/config controls, `sr-only` loading text, `aria-busy`, keyboard-selectable price rows, `role="separator"` with `aria-valuenow/min/max`. Two real gaps found: `aria-valuemax` is wrong on the cold-load path (finding #1) and the divider never takes focus on click (finding #3).
- **Anti-pattern findings:** none from the standard-tier scan. No `yarn.lock`/LavaMoat changes (no policy update needed), no `chrome.runtime.getBackgroundPage()`, no hardcoded chain IDs or network URLs, every new interactive element carries a `data-testid`, no controller state shape change (so no migration needed).

## Fix Quality

- **Best approach:** yes for the streaming design. Giving the aggregated ladder its own channel plus a UI-owned, never-reused `subscriptionId` generation (`usePerpsLiveOrderBook.ts:74-117`) is a genuinely good solution to the late-packet problem across grouping changes, market switches and close/reopen — the monotonic generation means an A→B→A sequence can't accept a stale packet from the first A. Allocating it in `useLayoutEffect` rather than during render is correct.
- **Would not ship as-is:** finding #1 (`perps-order-entry-page.tsx:1099`). The `ResizeObserver` effect is dead on the cold-load path, so the two behaviours its own comment promises — announcing the reachable `aria-valuemax` and re-clamping on container resize — do not happen until the user interacts with the divider. One-line fix.
- **Test quality:** generally strong — assertions check specific values (`aria-valuenow` transitions, `clearCache` call counts, specific analytics event values) rather than "did not throw", and failure paths are covered (connection error, reconnecting, empty book, invalid inputs, flag off). Two gaps: (a) the `aria-valuemax` test passes while production is broken because it renders with markets already loaded, so `bodyRef` is populated on the first commit — the loading→loaded transition is never exercised; (b) no test covers the page-level tap-to-prefill wiring end-to-end (the hook and the component callback are each tested, the seam between them is not) — which is precisely the E2E coverage the 2026-07-11 reviewer asked QA for.
- **Brittleness:** the `limitPricePrefill` object-identity trigger is subtle but correctly documented, and it behaves correctly on market switch (the reset effect wins because the prefill effect's deps are unchanged) — verified by tracing with concrete values. The `ORDER_BOOK_AGGREGATED_LEVELS = 5` constant is coupled to controller v10 always subscribing with `fast: true`; the JSDoc says so, but a controller change would silently truncate depth rather than fail.

### Findings

**1. `ResizeObserver` never attaches on the cold-load path — `ui/pages/perps/perps-order-entry-page.tsx:1086-1099` (must_fix)**

`useEffect(..., [])` runs on the first commit, but the page early-returns `<PerpsDetailPageSkeleton />` while `marketsLoading` is true (line 1740), so `bodyRef.current` is `null`, the effect returns early, and the empty dependency array means it never retries once the real body mounts. Reproduced deterministically (`artifacts/resize-observer-defect-repro.json`):

```
A-cold-load  | wide 1100px, book opened             | valuenow=33 valuemax=60
A-cold-load  | viewport 1100 -> 700, no interaction | valuenow=33 valuemax=60   <- observer never fires
A-cold-load  | viewport 700 -> 360, no interaction  | valuenow=33 valuemax=60   <- no re-clamp; body overflows
A-cold-load  | after ONE ArrowRight keypress        | valuenow=31 valuemax=35   <- keydown handler fixes it
B-warm-spa-nav | narrow 360px, book opened          | valuenow=33 valuemax=35   <- observer attached (body rendered first)
```

Consequences, both of which the code comment explicitly claims to prevent: assistive tech is told the divider can reach 60% when the reachable ceiling is ~35%, and a width chosen on a wide body is not re-clamped when the container narrows. Interaction handlers read `bodyRef` at event time and are unaffected, which is why it self-corrects after one keypress and why the unit test misses it.

Suggested fix — a callback ref so setup runs whenever the node actually mounts:
```tsx
const [bodyEl, setBodyEl] = useState<HTMLDivElement | null>(null);
// <div ref={setBodyEl} …>
useEffect(() => {
  if (!bodyEl || typeof ResizeObserver === 'undefined') return undefined;
  const observer = new ResizeObserver(() => { /* unchanged */ });
  observer.observe(bodyEl);
  return () => observer.disconnect();
}, [bodyEl]);
```
Worth adding a test that renders with `marketsLoading: true` and then flips it, since the current test cannot fail on this.

**2. Order-book value column is clipped at popup width — `ui/components/app/perps/order-book/order-book.utils.ts:112-116` (suggestion)**

At a 360px viewport the two pixel floors plus the divider need 366px in a 338px body, so the split always overflows and the value column is cut off (`Size (ET…`, truncated numbers) behind a horizontal scrollbar — visible in `evidence-ac5-compact-360px-split.png`. The floors and the `overflow-x` fallback are deliberate and documented, so this is a product call rather than a bug: AC5 requires the component to "work in compact (mobile popup)", and today the ladder's values are unreadable there without horizontal scrolling. Options: lower `ORDER_BOOK_MIN_WIDTH_PX`, drop the form floor while the book is open, or stack the panel below the form under a breakpoint. Flagging for a human/product decision.

**3. Divider never receives focus when clicked — `ui/pages/perps/perps-order-entry-page.tsx:1048` (suggestion)**

`handleOrderBookResizeStart` calls `event.preventDefault()` on `mousedown`, which suppresses the browser's default focus behaviour for the `tabIndex={0}` separator. Verified with a *trusted* CDP mouse click, not just a synthetic one: focus stays on the previously focused element (`TRUSTED_CLICK_FOCUS=perps-order-book-toggle`). The divider is still reachable by Tab, so this is not a blocker, but a mouse user who drags the divider cannot then fine-tune with Arrow keys without tabbing back to it. `preventDefault()` is needed to stop text selection during the drag; the usual pairing is to focus explicitly:
```tsx
const handleOrderBookResizeStart = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
  event.preventDefault();
  event.currentTarget.focus();
  setIsResizingOrderBook(true);
}, []);
```

## Live Validation

- Recipe: generated (`artifacts/recipe.json`, 102 nodes, `Recipe decision: generate-ui`)
- Result: **PASS — 102/102 nodes passed, 0 failed** (counts read from `recipe-run/trace.json`, not from the draft). Behavioural probes in trace: `AC4_OK asks=5 bids=5`, `AC5_OK {"viewport":360,"book":140,"form":224,"askRows":5}`, `PR2_HOME_OK {now:60,min:22,max:60}`, `PR2_DRAG_OK 22% -> 60% (bounds 22-60)`, `PR4_OK tapped=$1,890 limitInput=1890.0`, `PR5_OK ETH -> BTC newTop=$64,141`.
- Evidence: 9 in-run capture-helper screenshots, zero `Page.captureScreenshot` fallbacks (video not recorded — that is a `full`-tier step; this is a standard-tier run).
- Webpack errors: none — the slot runs a static `dist` build (no watch process); `perps-order-book-toggle` is present in the served bundle, and the PR's UI was exercised live, confirming the build is PR code.
- Log monitoring: recipe-run console diagnostics captured 4 distinct warning/error fingerprints, all baseline and unrelated to the diff — `ws://localhost:8080/ws` connection refused (dev watcher socket not running in this slot), 404s for the same, `Unknown action` Sentry noise, and `Invalid chain ID "0xa4b1"` polling for chain `0x1`. None reference perps or the order book, and none appeared at order-book interaction nodes.
- Slot left clean: no position or order was opened (read-only against the live testnet stream), the book was collapsed, the viewport override cleared, the window restored, and no extra tabs were opened.

## Correctness

- **Diff vs stated goal:** aligned. Every claim in the PR body was reproduced live.
- **Edge cases:** well covered — empty book, initial-loading skeleton, connection error with manual reconnect, reconnecting-with-stale-cache (rows hidden *and* selection blocked), non-finite/zero prices in the grouping and aggregation math (the extension adds `Number.isFinite` guards mobile lacks), very low-priced assets whose grouping ladder would round to 0 (deduped and floored), and `maxTotal <= 0` in depth-bar scaling.
- **Race conditions:** the main one — late aggregated packets after a grouping change, market switch or close/reopen — is explicitly handled by the never-reused `subscriptionId` generation plus targeted `clearCache()` calls, and is unit-tested. Verified live: switching ETH→BTC with the book open never surfaced a previous-market row. The `handleMove`/`handleUp` window listeners are driven by resizing state rather than attached imperatively in `mousedown`, so they cannot leak on a missed `mouseup`.
- **Backward compatibility:** preserved. Purely additive UI behind a default-OFF flag; no controller state shape change, so no migration is needed. `OrderEntryHeader.rightAccessory` is optional and falls back to the previous spacer, so other consumers are unaffected.

## Static Analysis

- lint:tsc: **PASS** — 0 errors (the duplicate-key error a prior reviewer reported is resolved on this branch)
- Tests: **9/9 suites, 333/333 tests pass** — `order-book.test.tsx`, `order-book.utils.test.ts`, `usePerpsLiveOrderBook.test.ts`, `usePerpsChannel.test.tsx`, `usePerpsOrderForm.test.ts`, `usePerpsEstimatedSlippage.test.ts`, `perps-order-entry-page.test.tsx`, `PerpsStreamManager.test.ts`, `feature-flags.test.ts`

## Mobile Comparison

- **Status: ALIGNED**
- `calculateAggregationParams` and `calculateGroupingOptions` are faithful ports of `app/components/UI/Perps/utils/orderBookGrouping.ts`; `getDepthRatio` and `formatSpreadPercent` are byte-identical. Depth ratio correctly keys off `level.total` on both platforms so it stays consistent with the size-weighted depth bars.
- Two intentional, defensible divergences:
  - `ORDER_BOOK_AGGREGATED_LEVELS` is 5 on extension vs 20 on mobile. Both comments state the aggregated connection always runs Hyperliquid fast mode (≤5 levels/side), so the extension value matches what actually arrives; mobile is the looser side.
  - Fallback display: the extension uses the shared `PERPS_FALLBACK_DATA_DISPLAY` (`'--'`, matching the controller constant), while mobile's order-book util locally hardcodes an em dash `'—'`. The extension is the more correct side here — it consumes the shared constant instead of redefining one.
- Perps decimals rule respected: no `.toFixed(N)` or `{min:2,max:2}` on prices/values. The two `toFixed` uses are numeric rounding (grouping-increment precision clamp, and a spread-percentage round that is identical to mobile), not fiat display. All prices/values go through `formatPerpsFiat` / `formatPositionSize` / `formatLargeNumber`.

## Architecture & Domain

- **MV3:** no service-worker implications. Stream activation/deactivation goes through `submitRequestToBackground` with best-effort `.catch()` on both sides, so a not-yet-ready controller degrades rather than throwing.
- **LavaMoat:** no dependency changes (`yarn.lock` and `lavamoat/` untouched), so no policy regeneration is required.
- **Import boundaries:** respected — UI imports shared formatters from `shared/lib/perps-formatters` and takes only type-only imports from `@metamask/perps-controller`. The background bridge half (`perpsActivateOrderBookAggregatedStream`) already landed separately on main in #45035; this PR is the UI half and does not reach into background internals.
- **Controller usage:** the page owns the raw stream lifecycle and the panel reads it with `manageStream: false`, so there is a single owner per channel — a good separation that avoids duplicate activate/deactivate races.

## Risk Assessment

- **LOW-MEDIUM** — Additive, flag-gated (production default OFF), no state migration, no dependency or policy changes, and all live claims reproduced. The residual risk is the layout/a11y defects above, both confined to the new panel's chrome rather than to order submission or pricing. Nothing found affects order correctness: the raw book that feeds top-of-book and slippage is deliberately isolated from the panel's grouping, and that isolation was verified.

## Recommended Action

**COMMENT**

Strong PR with unusually good streaming-lifecycle reasoning and broad test coverage; all prior review feedback is resolved. One item is worth fixing before merge, two are judgement calls:

- `ui/pages/perps/perps-order-entry-page.tsx:1099` — **must_fix**: `ResizeObserver` never attaches on the cold-load path, so `aria-valuemax` announces an unreachable ceiling and the width is never re-clamped on container resize. One-line fix (callback ref); the existing test cannot catch it because it renders with markets already loaded.
- `ui/components/app/perps/order-book/order-book.utils.ts:112` — **suggestion**: at 360px popup width the pixel floors force a horizontal overflow that clips the value column; product decision on whether that meets the ticket's compact requirement.
- `ui/pages/perps/perps-order-entry-page.tsx:1048` — **suggestion**: `preventDefault()` on mousedown stops the divider from taking focus on click (verified with a trusted click), so arrow-key fine-tuning after a drag requires tabbing back.
- Consider a page-level test for the tap-to-prefill seam (order-book row → `orderType: 'limit'` → populated `limit-price-input`) — the hook and the callback are tested independently, but not the wiring between them.
