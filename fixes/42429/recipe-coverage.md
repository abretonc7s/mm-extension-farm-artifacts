| # | AC (verbatim) | Proof mode | Primary evidence | Recipe nodes (IDs) | Visual file if any | Evidence verdict | Justification |
|---|---------------|------------|------------------|---------------------|--------------------|------------------|---------------|
| 1 | When liquidation price is <= $0, the liquidation distance field displays "--" or "N/A" on the position card | mixed | trace + screenshot | ac1-assert-position-liq-fallback, ac1-scroll-position-liq-fallback, ac1-screenshot-position-liq-fallback | after-evidence-ac1-position-liq-fallback.png | PROVEN | Trace shows the assertion returned text "--" for the market-detail position liquidation row after injecting a cross-margin BTC position with liquidationPrice "-1"; screenshot shows the row visible with "--". |
| 2 | When liquidation price is <= $0, the liquidation distance field displays "--" or "N/A" on the add margin screen | mixed | trace + screenshot | ac2-assert-add-margin-liq-fallback, ac2-screenshot-add-margin-liq-fallback | after-evidence-ac2-add-margin-liq-fallback.png | PROVEN | Trace shows both add-margin liquidation price and distance returned "--"; screenshot shows the add-margin modal with both fallback fields visible. |
| 3 | Fix applies to both isolated and cross margin positions | state | trace | ac3-assert-cross-liq-fallback, ac3-assert-isolated-liq-fallback | none | PROVEN | Trace proves the cross-margin injected position displayed "--" and the isolated injected position displayed "--" in the add-margin path. |
| 4 | Mobile behavior ("--" or "N/A") is the reference implementation | state | test + trace | ac4-assert-mobile-reference-fallback | none | PROVEN | Mobile source check showed distance is suppressed for liquidationPrice <= 0, and targeted Jest tests lock Extension fallback behavior for non-positive liquidation prices. |

Forbidden-pattern scan: PASS. No manual actions, no switch/default AC bypass, no wait > 500ms substitute, all executable node IDs start with setup-, ac<N>-, or teardown-, and visual/mixed ACs include screenshots plus direct assertions.

Trace cross-check: PASS. `trace.json` from the final run contains all AC nodes above with `ok: true`; final recipe run reported 16/16 passed.

Overall recipe coverage: 4/4 ACs PROVEN (untestable: none, weak: 0, missing: 0)
