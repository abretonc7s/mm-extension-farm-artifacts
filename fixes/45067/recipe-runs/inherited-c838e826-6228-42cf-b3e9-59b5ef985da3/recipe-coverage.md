# Recipe coverage — TAT-3490

The ticket specifies no acceptance criteria, so the rows below are the task claims.

| # | Claim | Proof mode | Primary evidence | Recipe nodes | Verdict | Rationale |
|---|---|---|---|---|---|---|
| AC1 | Cancelling a live open order from the market-detail modal removes it on HyperLiquid | state | `recipe-run/trace.json` (28/28 ok) | `ac1-ensure-order-open`, `ac1-wait-order-card`, `ac1-open-cancel-modal`, `ac1-wait-modal`, `ac1-press-cancel`, `ac1-wait-modal-closed`, `ac1-assert-orders-absent` | PROVEN | A real testnet limit order is created, cancelled through the UI, and `assert_orders state=none` confirms it is gone provider-side. |
| AC2 | A cancel for an order the provider no longer holds open closes the dialog with a neutral "no longer open" notice instead of an error banner | mixed | `evidence-ac2-cancel-order-already-closed.png`, `before-ac2-cancel-order-error.png` | `ac2-ensure-order-open`, `ac2-navigate-market`, `ac2-wait-order-card`, `ac2-open-cancel-modal`, `ac2-wait-modal`, `ac2-cancel-out-of-band`, `ac2-press-cancel`, `ac2-wait-toast`, `ac2-screenshot`, `ac2-wait-modal-closed`, `ac2-assert-orders-absent` | PROVEN | The race is staged for real (the order is cancelled out of band while the dialog is open), so HyperLiquid returns the ticket's rejection. The baseline run of `baseline-cancel-stale.recipe.json` on unmodified sources passes its opposite assertion — the dialog stays open on the raw error — so reverting this change flips AC2 to FAIL. |
| AC3 | A stale streamed balance is caught by a fresh account-state read before a doomed withdrawal is submitted | state | test — `ui/pages/perps/perps-withdraw-page.test.tsx` ("blocks the withdrawal when the fresh balance is below the entered amount", "blocks the withdrawal when the fresh read sees a sub-account the stream has not cached", "shows the fresh balance in the available balance and Max after a block", "reports the prevented withdrawal when the fresh balance blocks it", "submits the withdrawal when the fresh balance read fails") | none | UNTESTABLE by recipe | The failure requires the account WebSocket cache to be *stale relative to* the provider's fresh state. No manifest action can desynchronise the stream from HyperLiquid, and the submit button is disabled for amounts above the cached balance, so the guard cannot be reached from the live UI. Covered by unit tests on the blocking, fail-open, balance-adoption and telemetry branches. |
| AC4 | `ORDER_UNKNOWN_COIN` on cancel is retried once after `init()` rehydrates the symbol → asset map | state | test — `app/scripts/messenger-client-init/perps-controller-init.test.ts` ("retries once after init when the provider reports ORDER_UNKNOWN_COIN", "surfaces other cancel failures without retrying") | none | UNTESTABLE by recipe | Requires the provider's in-memory asset map to be empty while a cancel is issued — reachable only via a service-worker restart mid-flow, which no manifest action can stage deterministically. Covered by background-API unit tests. |
| AC5 | The UI no longer emits duplicate `Perp Withdrawal Transaction` / `Perp Order Cancel Transaction` events | state | test — `perps-withdraw-page.test.tsx` and `cancel-order-modal.test.tsx` (`not.toHaveBeenCalledWith(<event>)`) | none | UNTESTABLE by recipe | Analytics payloads are delivered from the background to Segment; the recipe runner exposes no event sink to assert on. Covered by unit tests asserting the UI emits neither event while still emitting `Perp Error`. |

Re-run after the rev4 fix (constant rename in `perps-withdraw-page.tsx`, no behaviour change): PASS —
28/28 nodes, 0 failed (`recipe-run/summary.json`, `2026-07-30T23:35:19.491Z` → `23:35:40.005Z`). The
promoted run's `ac2-screenshot` was captured by `capture-helper` (`artifact-manifest.json`,
`provider: capture-helper`, 134 KB) and shows the dismissed dialog with the "This order is no longer
open" toast, so the earlier `cdp` fallback that omitted the toast is gone. The bundle under test was
built at `22:44Z`; the rev4 delta only renames a numeric literal in `perps-withdraw-page.tsx`, which
the AC1/AC2 nodes do not exercise; see the build-provenance note in `report.md`.

Previous re-run after the rev3 fixes (`839abee225`): PASS — 28/28 nodes, 0 failed
(`2026-07-30T22:53:33.655Z` → `22:54:26.469Z`). That run's screenshot fell back to the `cdp`
provider and omitted the toast, which is what the rev4 re-run above replaces.

Earlier re-run against the rev2 fix commit `00df3a36d5`: PASS — 28/28 nodes, 0 failed
(`recipe-run/summary.json`, `2026-07-30T22:04:54.581Z` → `22:05:16.205Z`), on a runtime rebuilt from
that commit (`dist-freshness: fresh — dist id matches HEAD`). The AC2 screenshot was refreshed from
that run; the AC2 baseline capture is unchanged because it proves pre-fix behaviour.

Overall recipe coverage: 2/2 recipe-bound ACs PROVEN (untestable: AC3, AC4, AC5 — proven by unit tests with rationale above, weak: 0, missing: 0).
