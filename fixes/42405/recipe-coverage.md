# Recipe Coverage Matrix — TAT-3094

| # | AC (verbatim) | Proof mode | Primary evidence | Recipe nodes (IDs) | Visual file if any | Evidence verdict | Justification |
|---|---------------|------------|------------------|---------------------|--------------------|------------------|---------------|
| 1 | Order card displays limit price for non-trigger limit orders using universal decimals | state | test | ac1-assert-universal-format-btc | N/A | PROVEN | Unit tests (order-card.test.tsx) assert BTC $95,173 renders with 0 decimals, $3,500.10 renders as $3,500.1. 21/21 tests pass. No live orders in fixture — unit test is the authoritative proof for formatting logic. |
| 2 | Order card displays trigger price for TP/SL orders using universal decimals | state | test | ac2-assert-format-values | N/A | PROVEN | Existing tests for TP/SL orders verify formatPerpsFiatUniversal is applied (e.g. PUMP $0.001824, TP at $3,200). Logic unchanged for trigger orders. |

Overall recipe coverage: 2/2 ACs PROVEN (untestable: none, weak: 0, missing: 0)
