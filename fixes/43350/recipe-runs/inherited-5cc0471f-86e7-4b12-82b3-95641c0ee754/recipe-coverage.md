# TAT-3264 — Recipe Coverage Matrix

Source of truth: `recipe.json` (verify) + `recipe-baseline.json` (buggy baseline), run against the live extension on Hyperliquid **testnet**. Trace: `recipe-run/trace.json` (18/18 `ac*` nodes passed on the fixed build).

Before/after measurement (`getComputedStyle` of the section header boxes):

| Build | ordersPaddingTopPx | statsPaddingTopPx | match |
|-------|--------------------|-------------------|-------|
| Buggy (baseline) | 0 | 16 | false |
| Fixed (verify) | 16 | 16 | true |

| # | AC (verbatim) | Proof mode | Primary evidence | Recipe nodes (IDs) | Visual file | Evidence verdict | Justification |
|---|---------------|------------|------------------|---------------------|-------------|------------------|---------------|
| 1 | When the extension market detail page is rendered and the orders section is visible, then the vertical spacing above the orders section equals the spacing token used between other adjacent sections on the same page. | mixed | state (`getComputedStyle` paddingTop equality) + screenshot | `ac1-place-order`, `ac1-assert-order`, `ac1-measure`, `ac1-assert-padding` (==16), `ac1-assert-match` (==true), `ac1-scroll-orders`, `ac1-focus`, `ac1-screenshot-orders` | `before-capture-helper-ac1-orders-spacing.png` → `after-capture-helper-ac1-orders-spacing.png` | PROVEN | Orders header `paddingTop` goes 0px → 16px and equals the stats header (`match` false → true). Reverting the fix flips `ac1-assert-padding`/`ac1-assert-match` to FAIL. Before/after real-window screenshots show the orders heading flush vs. spaced. |
| 2 | When the user has no open orders, then the orders section either does not render or renders with the same correct spacing as when it does have content (no regression to the empty state). | state | state (`ordersExists === false` while `statsExists === true`) | `setup-close`, `setup-wait-absent`, `ac2-measure-empty`, `ac2-assert-rendered` (statsExists true), `ac2-assert-absent` (ordersExists false), `ac2-screenshot-empty` | `after-capture-helper-ac2-empty-state.png` | PROVEN | With zero open orders confirmed in the live cache, the `perps-orders-section-header` is absent from the DOM while the rest of the page (stats header) renders. Screenshot shows the market detail with no orders section. |

Overall recipe coverage: 2/2 ACs PROVEN (untestable: none, weak: 0, missing: 0)

Notes:
- Order state is built through the **real order-entry UI** (`place-limit-order.mjs`: limit price + size entered into the real React inputs via the native value setter, then the real `submit-order-button` is clicked). The order genuinely rests on testnet and the orders section renders authentic controller data — no UI value injection.
- **Visual evidence is captured with `capture-helper snapshot`** (real macOS window via ScreenCaptureKit) at the recipe screenshot checkpoints — see `recipe-capture-helper.json` (after) and `recipe-baseline-capture-helper.json` (before). The market-detail tab is foregrounded first (`focus-market.mjs`). These replace the earlier `ui.screenshot` images, which were produced by the runner's `extension-dom-raster` fallback (CDP `Page.captureScreenshot` timed out) and rendered with overlapping/doubled text.
- Video could not be produced: capture-helper/ffmpeg cannot record in this SSH environment (Screen Recording TCC for the launcher). The still-image captures are real-window and are the primary visual evidence.
