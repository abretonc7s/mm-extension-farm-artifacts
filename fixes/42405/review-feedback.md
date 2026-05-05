# Self-Review: TAT-3094

## Verdict: PASS

## Summary
The worker unified open order card price display to use `formatPerpsFiatUniversal` for all order types (limit, TP, SL), replacing a split path that showed notional (size×price) for limit orders via `formatPerpsFiatMinimal`. The fix is correct, minimal, and aligned with mobile's adaptive decimal formatting.

## Type Check
- Result: PASS
- New errors: none

## Tests
- Result: PASS
- Details: 21/21 tests pass in `order-card.test.tsx`. New tests cover BTC-range (0 decimals) and mid-range (1 decimal) formatting.

## Test Quality
- Findings: none found

## Domain Anti-Patterns
- Findings: none found

## Mobile Comparison
- Status: ALIGNED
- Details: `formatPerpsFiatUniversal` implements the same adaptive sig-dig/range-based formatting as mobile's `formatPerpsFiat`. BTC→0 decimals, ETH→max 1, sub-cent→full precision. No new `.toFixed(2)` introduced.

## LavaMoat Policy
- Status: N/A
- Details: No dependency changes

## Fix Quality
- Best approach: yes — unified code path is simpler and matches mobile behavior
- Would not ship: none
- Test quality: good — tests assert specific formatted outputs for multiple price ranges; reverting the fix would break them
- Brittleness: none

## Diff Quality
- Minimal: yes — only the necessary logic change plus removal of unused import
- Debug code: none

## Recipe
- Present: yes
- Quality: good — recipe-quality.json shows PASS verdict. Could not re-run live (no CDP port configured for this session).

## Issues
