# Expanded Decimal Parity Matrix

Live captures from successful parity runs on testnet. Extension rows now reflect the latest passing composed extension parity recipe, with targeted sequential reruns used during debugging to confirm the same settled values on BTC / ETH market + order entry.

## Market Detail

| Field | Extension | Mobile |
|---|---|---|
| BTC price | $75,083 | $75,112 |
| BTC change | +0.65% | +0.71% |
| BTC oracle | $74,711 | $74,642 |
| ETH price | $2,347.7 | $2,343.8 |
| ETH change | +0.82% | +0.68% |
| ETH oracle | $2,342.4 | $2,339 |
| SOL price | $85.554 | $85.242 |
| SOL change | +2.71% | +2.74% |
| SOL oracle | — | $85.375 |
| FARTCOIN price | $0.21485 | $0.21606 |
| FARTCOIN change | +11.00% | +10.90% |
| FARTCOIN oracle | — | $0.21465 |
| PUMP price | $0.001966 | $0.001963 |
| PUMP change | +7.84% | +8.06% |
| PUMP oracle | — | $0.001971 |
## Order Entry

| Field | Extension | Mobile |
|---|---|---|
| BTC price | $75,084 | $75,126 |
| BTC change | +0.65% | +0.71% |
| BTC margin | $3.74 | $3.73 |
| BTC liq. price | $50,690 | $50,718 |
| BTC fees | $0.02 | $0.02 |
| ETH price | $2,347.5 | $2,348.5 |
| ETH change | +0.82% | +0.86% |
| ETH margin | $3.67 | $3.67 |
| ETH liq. price | $1,597 | $1,597.6 |
| ETH fees | $0.02 | $0.02 |
| SOL price | $85.561 | — |
| SOL change | +2.71% | — |
| SOL margin | $3.67 | — |
| SOL liq. price | $60.018 | — |
| SOL fees | $0.02 | — |
| FARTCOIN price | $0.21502 | — |
| FARTCOIN change | +11.00% | — |
| FARTCOIN margin | $3.67 | — |
| FARTCOIN liq. price | $0.15085 | — |
| FARTCOIN fees | $0.02 | — |
| PUMP price | $0.001966 | — |
| PUMP change | +7.84% | — |
| PUMP margin | $3.67 | — |
| PUMP liq. price | $0.00138 | — |
| PUMP fees | $0.02 | — |
## Position Detail

| Field | Extension | Mobile |
|---|---|---|
| ETH size | 0.0047 ETH | 0.0047 ETH |
| ETH margin | $3.67 | $3.69 |
| ETH entry | $2,362.2 | $2,365.5 |
| ETH liq. price | $1,610.3 | $1,612 |
| ETH funding | $0.00 | $0.00 |
## Reverse

| Field | Extension | Mobile |
|---|---|---|
| ETH reverse est. size | 0.0047 ETH | 0.0047 ETH |
| ETH reverse fees | -- | -- |
## Remove Margin

| Field | Extension | Mobile |
|---|---|---|
| ETH remove available | $0 | $0 |
| ETH remove liq. price | $1,610.3 | $1,612 |
| ETH remove liq. distance | 32% | 32% |
## Close Position

| Field | Extension | Mobile |
|---|---|---|
| ETH close amount | $11.07 | $11.11 |
| ETH close margin | $3.66 | $3.69 |
| ETH close fees | -$0.02 | -$0.02 |
| ETH close receive | $3.64 | $3.67 |
## Withdraw

| Field | Extension | Mobile |
|---|---|---|
| 10% preset | 10% | 10% |
| 25% preset | 25% | 25% |
| 50% preset | 50% | 50% |
| Max preset | Max | — |
| Withdraw fee | $1.00 | $1.00 |
| Withdraw ETA | 5 minutes | 5 minutes |
| Withdraw receive | $214.71 | $214.72 |

## Current Read

- BTC / ETH rows now reflect current same-window extension vs mobile captures.
- Oracle price is visibly present on both sides in the current BTC / ETH market-detail comparison.
- Non-BTC/ETH oracle rows are still a remaining extension-side market-detail gap in the current session.
- The remaining visible BTC / ETH deltas are now small enough to look like live-value drift rather than formatter-path divergence.
