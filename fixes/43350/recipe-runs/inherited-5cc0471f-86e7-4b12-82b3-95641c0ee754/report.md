# TAT-3264 — Fix padding above orders section on extension market detail page

## Summary
On the perps market detail page (`/perps/market/:symbol`), the "Orders" section heading was missing the 16px top spacing that every other adjacent section heading on the page uses, so it sat flush against the preceding block. Added `paddingTop={4}` to the orders heading wrapper so it matches the page's section-spacing convention.

## Root cause
`ui/pages/perps/perps-market-detail-page.tsx:1558`. The page stacks section blocks (Position, Orders, Stats, Recent Activity); each heading wrapper `Box` carries `paddingTop={4}` (16px) to separate it from the preceding block — Stats (line 1584), Recent Activity (line 1755), and Details (line 1432) all do. The Orders heading wrapper alone was `<Box paddingBottom={2}>` with no `paddingTop`. Confirmed live via `getComputedStyle`: orders header `paddingTop = 0px` vs stats header `16px`.

## Changes
- `ui/pages/perps/perps-market-detail-page.tsx` — add `paddingTop={4}` to the orders section heading wrapper; add `data-testid` to the orders and stats section headers (locator-only, committed separately) to make the spacing measurable.
- `ui/pages/perps/perps-market-detail-page.test.tsx` — add `orders section spacing (TAT-3264)` tests: (1) the orders header has the same `pt-4` top-spacing class as the stats header; (2) with no open orders the orders section does not render while the rest of the page does (empty-state, no regression).

## Test plan
Automated:
- `yarn jest ui/pages/perps/perps-market-detail-page.test.tsx --no-coverage` → 86 passed.
- CI-parity gate: `yarn lint:changed` = 0, `yarn verify-locales --quiet` = 0, `yarn circular-deps:check` = 0.
- Coverage: `coverage-analyze.js` → VERDICT PASS (file 87%, >= 80%).
- Validation recipe (live extension, Hyperliquid testnet) — `recipe.json`, 18/18 `ac*` nodes passed. Measured orders header `paddingTop`: buggy 0px (`recipe-baseline.json`) → fixed 16px, and equals the stats header (`match` false → true). Reverting the fix flips `ac1-assert-padding`/`ac1-assert-match` to FAIL.

Manual (Gherkin):
- Given the wallet is unlocked on the perps tab with an open limit order on a market,
  When the market detail page renders the orders section,
  Then the vertical gap above the "Orders" heading equals the gap above the "Stats" heading (16px).
- Given the market has no open orders,
  When the market detail page renders,
  Then the orders section does not render and the remaining sections keep their spacing.

## Evidence
Primary visual evidence is real macOS window captures via `capture-helper snapshot` (the earlier `ui.screenshot` images were the runner's `extension-dom-raster` fallback and rendered with overlapping text — superseded):
- `before-capture-helper-ac1-orders-spacing.png` / `after-capture-helper-ac1-orders-spacing.png` — orders section top spacing, 0px → 16px (Orders flush vs. matching the Stats gap).
- `after-capture-helper-ac2-empty-state.png` (+ `before-capture-helper-ac2-empty-state.png`) — empty state, no orders section.
- Capture-helper recipes: `recipe-capture-helper.json` (after), `recipe-baseline-capture-helper.json` (before); runs under `capture-helper-run/`, `baseline-capture-helper-run/`.
- Measurement/coverage: `recipe.json`, `recipe-baseline.json`, `recipe-run/trace.json`, `recipe-run/measure-orders.json`, `recipe-run/measure-empty.json`, `recipe-coverage.md`, `recipe-quality.json`, `evidence-manifest.json`.
- Video could not be recorded: capture-helper/ffmpeg cannot record in this SSH environment (Screen Recording TCC for the launcher). Still-image real-window captures are the primary visual evidence.

## Ticket
- TAT-3264 — https://consensyssoftware.atlassian.net/browse/TAT-3264
