# Perps Decimal Matrix

Generated from recipe traces, not screenshots.

Extension after trace: `extension-matrix-after/trace.json`
Mobile trace: `mobile-matrix/2026-04-16_00-59-43_mobile-decimal-matrix/trace.json`
Extension before/current main: unavailable for decimals matrix because rebuilt `origin/main` crashed before rendering perps (`Cannot read properties of undefined (reading 'getItemSync')`).

## Market Detail Header

| Symbol | Extension After | Mobile | Before / Main |
| --- | --- | --- | --- |
| BTC | $73,800 | $75,037 | startup crash on current main |
| ETH | $2,353.70 | $2,368.1 | startup crash on current main |
| SOL | $84.779 | $85.06 | startup crash on current main |
| FARTCOIN | $0.2044 | $0.20519 | startup crash on current main |
| PUMP | $0.001905 | $0.001899 | startup crash on current main |

## Order Entry Header

| Symbol | Extension After | Mobile | Before / Main |
| --- | --- | --- | --- |
| BTC | $73,800 | $75,043 | startup crash on current main |
| ETH | $2,353.70 | $2,367.5 | startup crash on current main |
| SOL | $84.779 | — | startup crash on current main |
| FARTCOIN | $0.2044 | — | startup crash on current main |
| PUMP | $0.001905 | — | startup crash on current main |

## Notes

- Mobile matrix covers market detail headers for BTC / ETH / SOL / FARTCOIN / PUMP, and order entry headers for BTC / ETH.
- Extension matrix covers market detail and order entry headers for BTC / ETH / SOL / FARTCOIN / PUMP on the `fix/tat-2699-fix-perps-decimal-logic` branch after the `3.1.1` upgrade.
- The symbol set spans multiple decimal buckets from the mobile decimals rules doc: high-price (`BTC`), mid-price (`ETH`, `SOL`), sub-dollar (`FARTCOIN`), and micro-price (`PUMP`).
