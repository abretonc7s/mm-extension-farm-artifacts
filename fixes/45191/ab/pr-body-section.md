## **Screenshots/Recordings**

Same screen, same $378 withdrawal, same $756.39 available balance. Captured live in the running
extension after a UI restart (the MV3-restart condition from the ticket, which leaves the streamed
account cache empty).

| Before — `main` | After — this PR |
|---|---|
| <img src="https://raw.githubusercontent.com/abretonc7s/mm-extension-farm-artifacts/main/fixes/45191/before-insufficient-funds.png" width="420" alt="Withdraw $378, available balance $756.39, button reads Insufficient funds and is disabled" /> | <img src="https://raw.githubusercontent.com/abretonc7s/mm-extension-farm-artifacts/main/fixes/45191/after-withdraw-allowed.png" width="420" alt="Withdraw $378, available balance $756.39, Withdraw button enabled with fee and receive amount shown" /> |
| Button: **"Insufficient funds"**, disabled | Button: **"Withdraw"**, enabled |
| Fee / You'll receive hidden | $0.72 / $377.28 |

Before the fix the confirmation blocks a withdrawal the account can plainly cover — the screen shows
"Available balance: $756.39" and "Insufficient funds" **at the same time**, because the alert read
the streamed cache that the restart had emptied to $0 while the display read the live subscription.

Observed timeline (`artifacts/repro/*-timeline.json`), amount entered at ~1s in both runs:

```
before   970ms  avail=$0.00     insufficient=TRUE     <- blocks
        4266ms  avail=$756.39   insufficient=TRUE     <- still blocking
        9180ms  avail=$756.39   insufficient=false    <- clears after ~8s

after    962ms  avail=$0.00     insufficient=false    <- never blocks
        4988ms  avail=$756.39   insufficient=false    Withdraw enabled
```

Reproduced with `artifacts/repro/repro-withdraw-confirmation.mjs`: open the Perps withdraw
confirmation, reload the UI, enter $378, and sample the DOM every 400 ms. The only difference
between the two runs is the hook under test.
