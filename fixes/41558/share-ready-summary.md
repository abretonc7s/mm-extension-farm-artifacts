# Share-Ready PR Summary

## Current state

- Extension composed parity recipe is passing again: `15/15`
- Current same-window `BTC` / `ETH` market + order comparisons are very close between extension and mobile
- The original decimal / percent parity problem is largely under control

## Strongest evidence

### BTC

- Extension market: `price $75,083`, `change +0.65%`, `oracle $74,711`
- Mobile market: `price $75,112`, `change +0.71%`, `oracle $74,642`
- Extension order: `margin $3.74`, `liq $50,690`, `fees $0.02`
- Mobile order: `margin $3.73`, `liq $50,718`, `fees $0.02`

### ETH

- Extension market: `price $2,347.7`, `change +0.82%`, `oracle $2,342.4`
- Mobile market: `price $2,343.8`, `change +0.68%`, `oracle $2,339`
- Extension order: `margin $3.67`, `liq $1,597`, `fees $0.02`
- Mobile order: `margin $3.67`, `liq $1,597.6`, `fees $0.02`

Interpretation:
- `BTC` market/order is effectively aligned
- `ETH` market/order is effectively aligned
- Remaining deltas are now small live-value / estimate drift, not obvious formatter-path divergence

## Important nuance

- Some hydration / network issues still exist, but those are increasingly separate from the decimal-parity logic itself
- The parity conclusion is strongest in refresh-isolated and same-window validation

## Supporting artifacts

- [decimal-parity-matrix-expanded.md](/Users/deeeed/dev/metamask/metamask-extension-3/temp/.task/fix/41558-0415-1045/artifacts/decimal-parity-matrix-expanded.md)
- [drift-sources-report.md](/Users/deeeed/dev/metamask/metamask-extension-3/temp/.task/fix/41558-0415-1045/artifacts/drift-sources-report.md)
- [verification-evidence-latest.md](/Users/deeeed/dev/metamask/metamask-extension-3/temp/.task/fix/41558-0415-1045/artifacts/verification-evidence-latest.md)
- [code-path-parity-evidence.md](/Users/deeeed/dev/metamask/metamask-extension-3/temp/.task/fix/41558-0415-1045/artifacts/code-path-parity-evidence.md)

## Code-path parity note

- Extension and mobile now share the controller-backed liquidation path.
- Extension order-entry fee display now goes through the same controller/provider fee path, with a bounded fallback only when that RPC stalls.
- Extension remove-margin and close summary display shapes were aligned to mobile on the UI side.
- So the parity conclusion is not based only on screenshots/live values; there is also code-path evidence that the key BTC / ETH surfaces now use aligned logic.
