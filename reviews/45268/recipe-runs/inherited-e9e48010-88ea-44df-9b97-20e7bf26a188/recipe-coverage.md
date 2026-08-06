# TAT-3686 — Recipe coverage

The ticket specifies no acceptance criteria ("Fix all breaking changes minimally
and run full product verification on device"), so the matrix below covers the
task's claims instead.

This is a dependency bump whose product-visible behaviour is unchanged by design.
The recipe therefore proves **no regression** on the perps surfaces; the fix
itself (an exhaustive error-code map and one widened type) is compile-time and is
proven by `yarn lint:tsc` and the unit suite. That split is stated explicitly per
row rather than being implied by a passing recipe.

| Claim | Proof mode | Primary evidence | Recipe nodes | Verdict | Rationale |
| --- | --- | --- | --- | --- | --- |
| C1 — perps home renders controller-backed content on v11 | mixed | `evidence-ac1-perps-home.png`, `trace.json` | `ac1-wait-perps-view`, `ac1-read-state`, `ac1-screenshot-perps-home` | PROVEN | Screenshot shows a $762.37 total balance, eight live markets with prices and 24h volume, and recent activity — not a skeleton or empty state. A controller that failed to load under v11 would leave `perps-view-loading`. |
| C2 — market detail streams live market data on v11 | mixed | `evidence-ac2-market-detail.png`, `trace.json` | `ac2-navigate-market`, `ac2-wait-market-detail`, `ac2-screenshot-market-detail` | PROVEN | Screenshot shows ETH at $1,899.2 (+1.65%), a populated candle chart, 24h volume $1.19M, open interest $2.49M, oracle price $1,898.7, and a funding rate with a live countdown — all sourced from the v11 controller's stream. |
| C3 — the order-type toggle still switches after `handleOrderTypeClick` was widened to the v11 `OrderType` union | mixed | `evidence-ac3-limit-order-type.png`, `trace.json` | `ac3-open-order-entry`, `ac3-wait-order-type-toggle`, `ac3-press-limit`, `ac3-wait-limit-price-input`, `ac3-screenshot-limit-selected`, `ac3-press-market`, `ac3-wait-limit-price-hidden` | PROVEN | The toggle is pressed in both directions and each direction is asserted by its observable effect: `limit-price-input` visible after Limit, hidden after Market. The screenshot shows the Limit pill selected with the limit price field on-screen and live liquidation/margin/fee figures recomputed. |
| C4 — every v11 `PerpsErrorCode` has a translation | state | `yarn lint:tsc` (clean), `translate-perps-error.test.ts` (41 passed) | none — not reachable from the recipe | PROVEN (non-recipe) | `ERROR_CODE_TO_I18N_KEY` is declared `as const satisfies Record<PerpsErrorCode, string>`, so a missing code is a compile error; before the fix `tsc` reported exactly that for 15 codes. The suite additionally asserts at runtime that every `PERPS_ERROR_CODES` value maps to a key. No UI path in the extension can emit the new codes today, so a recipe assertion would have to fake the error — weaker proof than the compile gate. |

The figures quoted above are the values visible in the committed PNGs. They are
live market data, so a future re-run of the recipe captures different numbers —
re-read the images and update this table when re-running, rather than assuming it
still matches.

Honest limit on C3: because the change is a type widening, deleting it does not
change runtime behaviour — it stops the project compiling. The recipe proves the
toggle was not regressed; `yarn lint:tsc` proves the fix was needed and applied.
Neither is claimed to do the other's job.

Overall recipe coverage: 3/3 recipe-bound claims PROVEN, plus C4 proven by
compile + unit gates (untestable by recipe: C4 — no UI path emits the new codes;
weak: 0, missing: 0).
