# Current proof coverage

| Criterion | Proof | Evidence | Result |
|---|---|---|---|
| AC1 controller 20.0.0 | state | recipe-run/trace.json, ac1-version | PASS |
| AC2 Perps home and positions/orders | mixed | recipe-run/trace.json and screenshots/ac2-home.png | PASS, 14/14 nodes |
| Shared notional across previews | mixed | helper/caller tests; fee-preview-run/trace.json and BTC USD100/USD1000 HUD captures | PASS |
| Shared fallback discount | state | hook/helper/close-all tests, check-diff-final/jest.log | PASS |
| Existing-position close-all fee | visual | fee-preview-run/screenshots/close-all-fee.png | PASS, SOL fee $0.02 |

The fee recipe passed 21/21 nodes on the prepared testnet profile with HUD visible. Both live order hooks quote entered USD100/USD1000 with isFallback=false and unchanged resolved rates. Displayed fees were $0.15 and $1.45. UI sizing rounds asset units and uses oracle price, so the observer allows a two-cent bound against the fixed-USD quote. Unit tests prove the detailed discount/fallback arithmetic. No order, close, or signature was submitted. No positive account discount was observed.

The inherited 19/20 comparisons remain historical evidence under inputs/inherited and recipe-runs/inherited-*; new proof is recipe-run and fee-preview-run only. These are Chrome MV3 development builds. Firefox and production LavaMoat execution were not rerun because this follow-up changes no dependencies.

Prepared runtime was recovered after Chromium disabled the unpacked developer extension. Developer mode was enabled only in the isolated slot profile. The first fee observer failed on tsx serialization and was fixed in task tooling; the final recipe uses the corrected read-only observer and explicitly dismisses the close-all modal.
