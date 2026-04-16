# Review Packet — Latest

## Primary conclusion

The extension-side decimal / percent parity work is now in a much stronger state.

- Extension composed parity recipe: `15/15 passed`
- Current same-window `BTC` / `ETH` market + order comparisons are effectively aligned
- Remaining differences are now small enough to read mostly as live-value / estimate drift, not obvious formatter-path divergence

## Best artifact set

### 1. Passing extension composed parity run

- [extension-parity-expanded-oracle-clean](/Users/deeeed/dev/metamask/metamask-extension-3/temp/.task/fix/41558-0415-1045/artifacts/extension-parity-expanded-oracle-clean)

Summary:
- `15 / 15 passed`

### 2. Refresh-isolated extension BTC / ETH captures

- [refresh-btc-market](/Users/deeeed/dev/metamask/metamask-extension-3/temp/.task/fix/41558-0415-1045/artifacts/refresh-btc-market)
- [refresh-btc-order](/Users/deeeed/dev/metamask/metamask-extension-3/temp/.task/fix/41558-0415-1045/artifacts/refresh-btc-order)
- [refresh-eth-market](/Users/deeeed/dev/metamask/metamask-extension-3/temp/.task/fix/41558-0415-1045/artifacts/refresh-eth-market)
- [refresh-eth-order](/Users/deeeed/dev/metamask/metamask-extension-3/temp/.task/fix/41558-0415-1045/artifacts/refresh-eth-order)

### 3. Current mobile comparison artifacts

- [mobile-btc-market-current](/Users/deeeed/dev/metamask/metamask-extension-3/temp/.task/fix/41558-0415-1045/artifacts/mobile-btc-market-current)
- [mobile-btc-order-now-2](/Users/deeeed/dev/metamask/metamask-extension-3/temp/.task/fix/41558-0415-1045/artifacts/mobile-btc-order-now-2)
- [mobile-eth-market-current](/Users/deeeed/dev/metamask/metamask-extension-3/temp/.task/fix/41558-0415-1045/artifacts/mobile-eth-market-current)
- [mobile-eth-order-add-exposure-current](/Users/deeeed/dev/metamask/metamask-extension-3/temp/.task/fix/41558-0415-1045/artifacts/mobile-eth-order-add-exposure-current)

## Same-window BTC / ETH summary

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

## Supporting evidence

- [share-ready-summary.md](/Users/deeeed/dev/metamask/metamask-extension-3/temp/.task/fix/41558-0415-1045/artifacts/share-ready-summary.md)
- [verification-evidence-latest.md](/Users/deeeed/dev/metamask/metamask-extension-3/temp/.task/fix/41558-0415-1045/artifacts/verification-evidence-latest.md)
- [code-path-parity-evidence.md](/Users/deeeed/dev/metamask/metamask-extension-3/temp/.task/fix/41558-0415-1045/artifacts/code-path-parity-evidence.md)
- [decimal-parity-matrix-expanded.md](/Users/deeeed/dev/metamask/metamask-extension-3/temp/.task/fix/41558-0415-1045/artifacts/decimal-parity-matrix-expanded.md)
- [drift-sources-report.md](/Users/deeeed/dev/metamask/metamask-extension-3/temp/.task/fix/41558-0415-1045/artifacts/drift-sources-report.md)

## Publishing blockers

- `gh pr edit` is still blocked by GitHub API rate limiting
- GitHub app comment posting is blocked by integration permissions in this environment
