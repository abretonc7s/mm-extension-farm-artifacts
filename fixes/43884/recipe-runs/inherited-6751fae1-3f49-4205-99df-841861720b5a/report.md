# Report — TAT-3407: Price context on Extension Auto Close (TP/SL) modal

## Summary
The Extension Auto Close (TP/SL) modal opened from an active position now shows an
Entry price / Current price / Liquidation price block above the "Take profit"
section, matching mobile's `PerpsTPSLView`. Display-only parity change — no new data
fetch, no change to TP/SL input/save logic.

## Changes
- `ui/components/app/perps/update-tpsl/update-tpsl-modal-content.tsx` — added the
  three-row price-context block (entry/current/liquidation) at the top of the modal
  body, using the existing `position` + live `currentPrice` props and the adaptive
  `formatPerpsFiatUniversal` / `formatPerpsLiquidationPrice` formatters.
- `app/_locales/en/messages.json`, `app/_locales/en_GB/messages.json` — added
  `perpsCurrentPrice` = "Current price".
- `ui/components/app/perps/update-tpsl/update-tpsl-modal-content.test.tsx` — 6 new
  tests (`price context block` describe).

Diff: `git diff main...HEAD -- ':!*.test.ts' ':!*.test.tsx'`

## Test plan
- Recipe `artifacts/recipe.json` — **pass**, 18/18 nodes (`artifacts/recipe-run/`):
  opens an ETH testnet position, opens the Auto Close modal, asserts the three price
  rows + adaptive `$` values above the Take profit section (screenshot), then on the
  order-entry screen asserts the block is **absent**; closes the position in teardown.
- Unit tests — `update-tpsl-modal-content.test.tsx`: 65/65 pass (6 new).
- Coverage — 94% on the changed file (VERDICT PASS).
- Lint gate — `lint:changed` + `verify-locales` + `circular-deps:check` all pass.

## Evidence artifacts
- `artifacts/evidence-ac1-ac4-price-block.png` — Auto Close modal showing
  Entry / Current / Liquidation above Take profit (real capture-helper snapshot).
- `artifacts/recipe-run/summary.json` + `trace.json` — green run, 18/18.
- `artifacts/recipe-coverage.md`, `artifacts/recipe-quality.json`.

## Evidence-fit summary
| AC | Proof mode | Primary evidence |
|---|---|---|
| AC1 price block above TP | mixed | screenshot + viewport waits (`ac1-*`) |
| AC2 current price live | mixed | live `$` current value + rerender unit test (`ac2-wait-current-value`) |
| AC3 no block on order entry | state | absent-wait on order-entry surface (`ac3-assert-no-block`) |
| AC4 adaptive precision | mixed | `$` values via shared formatter + screenshot + unit tests (`ac4-*`) |

Screenshots intentionally omitted:
- Order-entry "no block" screen — proven by the `ac3-assert-no-block` state wait;
  a screenshot would add no proof beyond the absent-state assertion.
- `after.mp4` — `capture-helper record` is not viable in this slot (empty output via
  the shared screen-capture session; conflicts with the recipe `ui.screenshot`). The
  single modal screenshot is the strongest visual proof for this display-only change.

## Ticket
TAT-3407 — https://consensyssoftware.atlassian.net/browse/TAT-3407
