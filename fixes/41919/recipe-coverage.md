# Recipe Coverage — TAT-2947

## AC Table

| # | AC (verbatim) | Target env | Recipe nodes | Screenshot | Visual verdict | Justification |
|---|---------------|------------|--------------|------------|----------------|---------------|
| 1 | User can type `+15` in TP percent field and it is accepted (not rejected), populating a price above entry | fullscreen (home.html perps) | `ac1-type-plus-in-tp`, `ac1-assert-tp-value-accepted`, `ac1-assert-tp-price-set`, `ac1-screenshot-tp` | `after-ac1-tp-plus-sign-accepted.png` | PROVEN | Screenshot shows `+15` in TP percent field with price $2541.84 populated. Recipe asserted `accepted:true` and price set. |
| 2 | User can type `-5` in SL percent field; the resulting SL price is **below** the entry price (not above) | fullscreen (home.html perps) | `ac2-type-minus-in-sl`, `ac2-assert-sl-price-below-entry`, `ac2-screenshot-sl` | `after-ac2-sl-minus-sign-below-entry.png` | PROVEN | Screenshot shows `-5` in SL percent field, SL price $2380.45 which is below entry ~$2384.50. Est. P&L at stop loss shows -$0.18 (loss). |
| 3 | After fix, TP and SL inputs reflect signed RoE convention consistently | fullscreen (home.html perps) | `ac3-screenshot-final` | `after-ac3-tpsl-modal-signed-inputs.png` | PROVEN | Final state screenshot shows both TP and SL sections with correct signed percent fields. |

Overall recipe coverage: 3/3 ACs PROVEN (untestable: none, weak: 0, missing: 0)
