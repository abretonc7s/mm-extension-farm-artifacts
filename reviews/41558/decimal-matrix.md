# Perps Decimal Matrix

Generated from recipe traces, not screenshots.

Extension after trace: `extension-matrix-after/trace.json`
Mobile trace: `mobile-matrix/2026-04-16_00-59-43_mobile-decimal-matrix/trace.json`

## Market Detail Header

| Symbol | Extension After | Mobile |
| --- | --- | --- |
| BTC | $73,800 | $75,037 |
| ETH | $2,353.70 | $2,368.1 |
| SOL | $84.779 | $85.06 |
| FARTCOIN | $0.2044 | $0.20519 |
| PUMP | $0.001905 | $0.001899 |

## Order Entry Header (Stable Cross-Platform Coverage)

| Symbol | Extension After | Mobile |
| --- | --- | --- |
| BTC | $73,800 | $75,043 |
| ETH | $2,353.70 | $2,367.5 |

## Notes

- Mobile market-detail extraction is stable for BTC / ETH / SOL / FARTCOIN / PUMP.
- Mobile order-entry extraction is currently stable for BTC / ETH.
- Extension extraction is stable for market-detail and order-entry across the covered symbols.
- The symbol set spans multiple decimal buckets from the mobile decimals rules doc: high-price (`BTC`), mid-price (`ETH`, `SOL`), sub-dollar (`FARTCOIN`), and micro-price (`PUMP`).
