# Recipe Coverage Matrix — PR #44254

Source: linked ticket description (TAT-3309). The structured `## Acceptance Criteria` block in TASK.md
renders as `_Not specified_` because the Jira import flattened the rich-text list into one paragraph;
a Jira ticket **is** linked and does contain the list, so the "no Jira / linked issue" fallback does not apply.

- Recipe: `artifacts/recipe.json` (49 nodes) — `Recipe decision: generate-ui`
- Run: `artifacts/recipe-run/` — **49/49 nodes passed, 0 failed** (counts read from `trace.json`, not from the draft)
- HUD: on for every node; **zero `[hud]` warnings** in runner stdout/stderr
- Screenshot provider: `capture-helper` for all 5 captures — no `extension-dom-raster`,
  `macos-screencapture`, or `Page.captureScreenshot` fallback in `artifact-manifest.json`
- Live flag state: `remoteFeatureFlags.perpsOrderBookEnabled = { enabled: true, minimumVersion: "13.0.0" }`

| # | AC (verbatim) | Target env | Recipe nodes (IDs) | Screenshot filename | Visual verdict | Justification |
|---|---------------|------------|--------------------|---------------------|----------------|---------------|
| 1 | "Order book component is hidden/collapsed by default on the order screen" | fullscreen | `ac1-navigate-order-entry`, `ac1-wait-order-entry-page`, `ac1-wait-toggle-affordance`, `ac1-assert-book-collapsed`, `ac1-assert-divider-collapsed`, `ac1-screenshot-collapsed-by-default` | `evidence-ac1-collapsed-by-default.png` | **PROVEN** | Image shows the ETH order entry page with the form at full width and no panel; the book toggle is the only new header control. Backed by two absence assertions (`perps-order-book` and `perps-order-book-resize-handle` both `visible:false`). Extra signal: two earlier aborted runs left the panel **open**, and this node still asserted collapsed after re-navigation — the default survives a dirty prior state. |
| 2 | "User can tap/click to expand and see the full order book" | fullscreen | `ac2-press-toggle`, `ac2-wait-panel-visible`, `ac2-wait-divider-visible`, `ac2-wait-ladder-rows`, `ac2-wait-depth-ratio`, `ac2-screenshot-expanded-order-book` | `evidence-ac2-expanded-order-book.png` | **PROVEN** | One real click on `perps-order-book-toggle` mounts the panel. Image shows 5 live ask rows, the spread row, 5 live bid rows, depth bars and the Buy/Sell ratio — real streamed testnet data, not a skeleton. `ac2-wait-ladder-rows` waits on `ask-row-4` specifically, so a partially-populated ladder cannot pass. |
| 3 | "Feature is gated by a feature flag and is not visible when the flag is off" | n/a (test proof) | `ac3-run-flag-off-hides-toggle-test`, `ac3-assert-flag-off-exit`, `ac3-assert-flag-off-test-passed`, `ac3-run-flag-selector-test`, `ac3-assert-flag-selector-exit`, `ac3-assert-flag-selector-passed` | — (grouped: `evidence-ac1-*` shows the flag-ON header for contrast) | **PROVEN** | Correct proof type: the flag-OFF branch renders *nothing*, so a screenshot of an empty header proves nothing. Two name-filtered jest runs assert (a) the toggle is absent when `perpsOrderBookEnabled` is disabled and (b) `getIsPerpsOrderBookEnabled` defaults to false when the flag is absent. Both assert `contains "1 passed"` — verified discriminating: a non-existent test title exits 0 with **no** "1 passed", so the assertion cannot pass vacuously. |
| 4 | "Expanded state shows price levels and USD totals for both asks and bids" | fullscreen | `ac4-wait-ask-price`, `ac4-wait-ask-value`, `ac4-wait-bid-price`, `ac4-wait-bid-value`, `ac4-assert-usd-total-header`, `ac4-screenshot-price-levels-usd-totals` | grouped into `evidence-ac2-expanded-order-book.png` (own capture omitted — see below) | **PROVEN** | Four DOM assertions cover price **and** value on **both** sides, plus a text assertion on the literal `Total (USD)` column header. The grouped image shows `Price | Total (USD)` headers with red ask prices ($1,929→$1,925) and green bid prices ($1,924→$1,920), each with a USD cumulative total. |
| 5 | "Component is responsive and works in both compact (mobile popup) and expanded (fullscreen) layouts" | fullscreen only | `ac5-run-narrow-body-clamp-test`, `ac5-assert-narrow-body-exit`, `ac5-assert-narrow-body-passed`, `ac5-run-popup-ceiling-test`, `ac5-assert-popup-ceiling-exit`, `ac5-assert-popup-ceiling-passed`, `ac5-screenshot-fullscreen-split-layout` | grouped into `evidence-ac2-expanded-order-book.png` (own capture omitted — see below) | **UNTESTABLE** (compact half) | ⚠ Only the **expanded/fullscreen** half is observed in-browser (grouped image: form and panel share the width across the divider). The **compact popup** half is not exercised: this CDP session exposes no popup/notification target (targets are `home.html`, `offscreen.html`, snaps, service-worker), and the slot browser is orchestrator-owned so window-resize emulation was not used to fake one. The compact **width math** is proven by two name-filtered unit assertions (`caps the width so the form keeps its pixel floor on a narrow body`, `returns the pixel-aware ceiling on a narrow popup body`), but rendering in a real ~360px popup is unverified. **A human reviewer must open the panel in the popup before merge.** |
| 6 | "No regressions to the existing order form fields (limit price, size, leverage, reduce-only, TP/SL)" | fullscreen | `ac6-press-bid-price-row`, `ac6-wait-limit-price-field`, `ac6-wait-order-type-toggle`, `ac6-wait-amount-field`, `ac6-wait-leverage-control`, `ac6-wait-auto-close-tpsl`, `ac6-wait-submit-button`, `ac6-screenshot-form-fields-intact`, `ac6-run-order-form-regression-tests`, `ac6-assert-order-form-exit`, `ac6-assert-order-form-suites-passed` | `evidence-ac6-form-fields-intact.png` | **PROVEN** | Exercises the riskiest coupling (order book → form): tapping a bid row switches the form to **Limit** and prefills the limit price with `1924.0`. Image shows Limit price, Size, Leverage, Auto close (TP/SL), Liquidation price, Margin, Fees and the submit button all intact beside the open panel. Backed by 6 DOM assertions plus both pre-existing order-form hook suites (`Test Suites: 2 passed` asserted explicitly, so an exit-0 with 0 suites cannot pass). **Scope note:** `reduce-only` is not rendered on this new-order screen (it belongs to the close flow), so it is asserted as absent-by-design rather than faked. |

## Evidence grouping / omissions

Per the evidence-fit contract ("do not pad with near-identical screenshots; group the strongest shared
proof and list redundant files under omit"):

| Omitted file | Reason |
|---|---|
| `evidence-ac4-price-levels-usd-totals.png` | Pixel-near-identical to `evidence-ac2-expanded-order-book.png` (same screen, differing only in live tick values). AC4's unique claim — `Price / Total (USD)` headers with USD totals on both sides — is fully legible in the grouped AC2 image. |
| `evidence-ac5-fullscreen-split-layout.png` | Same screen as AC2; the split-layout claim is fully legible in the grouped AC2 image. Its popup caveat is carried in the AC5 row above and in `evidence-manifest.json`. |

Both remain in the raw run output at `artifacts/recipe-run/evidence/` — only the curated
`artifacts/evidence/` set was pruned.

## Forbidden-pattern scan (step 11a)

| # | Pattern | Result |
|---|---------|--------|
| 1 | `switch` with `default` routing around an AC assertion | none — no `switch` nodes |
| 2 | read-only check returning a "skip reason" string | none |
| 3 | `wait` > 500ms substituting for `wait_for` | none — recipe contains **zero** `wait` nodes; every gate is a `ui.wait_for` |
| 4 | DOM-only assertion for visual-ordering / portal / z-index claim | n/a — no AC makes an ordering/portal/z-index claim |
| 5 | Node ID without `ac<N>-` / `setup-` / `gate-` / `teardown-` prefix | none — the terminal `end` node was renamed `teardown-done` to comply |
| 6 | Missing screenshot for a visual AC | none — AC1/AC2/AC6 have own captures; AC4/AC5-expanded are grouped into the AC2 capture; AC3 is a hidden-branch claim proven by test output (screenshot would be the wrong proof type) |

## Revert test

Reverting the PR removes `perps-order-book-toggle` from the market header, so
`ac1-wait-toggle-affordance` fails and every downstream AC node fails with it. The recipe is not
green-by-default.

Overall recipe coverage: 5/6 ACs PROVEN (untestable: AC5 — compact popup layout not reachable from this CDP session, weak: 0, missing: 0)
