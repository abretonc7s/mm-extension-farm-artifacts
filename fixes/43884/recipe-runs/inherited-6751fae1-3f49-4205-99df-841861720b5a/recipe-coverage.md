# Recipe coverage — TAT-3407

Recipe: `artifacts/recipe.json` · Run: `artifacts/recipe-run/` (status **pass**, 18/18 nodes) ·
Screenshot: `artifacts/evidence-ac1-ac4-price-block.png`

| AC | Proof mode | Primary evidence | Recipe nodes | Verdict | Rationale |
|---|---|---|---|---|---|
| AC1 — Entry/Current/Liquidation shown as a labeled block above "Take profit" when the Auto Close modal opens from an active position | mixed | `evidence-ac1-ac4-price-block.png` + viewport waits | `ac1-open-modal`, `ac1-wait-price-info`, `ac1-wait-entry-row`, `ac1-wait-current-row`, `ac1-wait-liq-row`, `ac1-screenshot-price-block` | PROVEN | Block + three labeled rows pass `visibility: viewport` waits inside the modal opened from a live ETH position; screenshot shows them above the Take profit section. Reverting the feature removes `perps-update-tpsl-price-info` → `ac1-wait-price-info` fails. |
| AC2 — Current price updates in real-time | mixed | `current-price-value` shows live `$` value + screenshot | `ac2-wait-current-value` | PROVEN | The Current price row renders the live `currentPrice` prop (same prop that already drives the modal's validation and the page's live price header), so it re-renders on every tick. Unit test `updates the current price when the live currentPrice prop changes` proves the row re-renders on prop change. Screenshot shows Current ($1,576.2) ≠ Entry ($1,575) = live market value. |
| AC3 — No price block on the order-entry Auto Close section (no regression) | state | `ac3-assert-no-block` (expected: absent) | `ac3-nav-order-entry`, `ac3-wait-section`, `ac3-assert-no-block` | PROVEN | On `/perps/trade/ETH` the order-entry Auto Close section renders (`auto-close-section` visible) while `perps-update-tpsl-price-info` is asserted **absent**. The absent-wait has teeth (verified: it fails on a present element). The block lives only in the modal component, not the order-entry component. |
| AC4 — Entry & Liquidation use adaptive precision (same formatter as position card), Current matches live market price | mixed | `$` values via `formatPerpsFiatUniversal` / `formatPerpsLiquidationPrice` + screenshot | `ac1-assert-eth-open`, `ac4-wait-entry-value`, `ac4-wait-liq-value`, `ac2-wait-current-value`, `ac1-screenshot-price-block` | PROVEN | Position data present (`ac1-assert-eth-open`); values render with `$` via the shared adaptive formatters. Screenshot shows non-2-decimal output (e.g. `$1,575`, `$805.6`) — not hardcoded `.00`. Unit tests assert the displayed values equal `formatPerpsFiatUniversal`/`formatPerpsLiquidationPrice` output. |

Overall recipe coverage: 4/4 ACs PROVEN (untestable: none, weak: 0, missing: 0)

Note: `after.mp4` omitted — `capture-helper record` is not viable in this slot (empty output via the shared screen-capture session; conflicts with the recipe's `ui.screenshot`). The capture-helper still snapshots screenshots correctly, which is the primary visual proof here.
