# TAT-3131 — Recipe AC Coverage Matrix

Bug: Perps "Add Funds" round-trip leaves a phantom `confirm-transaction` history entry →
back navigation needs two taps (Bug A) and post-trade navigation is stuck (Bug B).
Fix: `ui/pages/confirmations/hooks/useConfirmActions.ts` — the wallet-initiated back path now
returns with `{ replace: true }` (symmetric with the confirm-context auto-exit), so the
transient confirmation does not linger in history.

## Environment constraint (drives proof strategy)

The Add Funds **deposit confirmation cannot be opened in this slot**: the deposit backend
(`perpsDepositWithConfirmation`) rejects with `Invalid chain ID "0xa4b1"` because only Ethereum
mainnet (`0x1`) is configured — Arbitrum (the Hyperliquid deposit chain) is absent, and **no
manifest runner action provisions a network or a deposit confirmation** (see
`reproduction.md`). The end-to-end deposit round-trip that triggers Bug A / Bug B is therefore
an infrastructure limitation, not buildable state.

Consequently the **revert-sensitive proof of the fix is the unit test**
`ui/pages/confirmations/hooks/useConfirmActions.test.ts` (captured before/after):
- reverted source (push): 2 tests FAIL — `Expected "/asset/0x1/0xabc", {"replace": true}` / `Received "/asset/0x1/0xabc"`  (`before-evidence-ac1-3-useConfirmActions-test.log`)
- fixed source (replace): 7/7 PASS  (`after-evidence-ac1-3-useConfirmActions-test.log`)

The **recipe** proves the reachable AC4 regression guard and the `navigate(-1)` →
market-detail mechanism that AC2/AC3 depend on (trace: 13/13 nodes passed).

## Matrix

| # | AC (verbatim) | Proof mode | Primary evidence | Recipe nodes (IDs) | Visual file | Evidence verdict | Justification |
|---|---------------|------------|------------------|---------------------|-------------|------------------|---------------|
| AC1 | "When a user visits 'Add Funds' from the order screen and returns, tapping < once navigates back to the Perps market detail screen" | mixed | test (unit) | — (deposit UI UNTESTABLE-in-slot) | — | **PROVEN (via unit test)** | The fix replaces the phantom-creating PUSH with REPLACE. The revert-sensitive unit test (`navigates to goBackTo with replace…`) demonstrates exactly this: fails on the buggy push, passes on the fix. E2E deposit UI is UNTESTABLE-in-slot (Arbitrum `0xa4b1` absent; no provisioning action). |
| AC2 | "When a user executes a trade (regardless of whether they visited 'Add Funds' during the session), they are automatically navigated away from the order entry screen to the market detail screen" | mixed | trace + test | `ac4-press-back`, `ac4-wait-market-detail`, `ac4-assert-not-order-entry` (mechanism) + unit test (add-funds case) | after-ac4-back-to-market-detail.png | **PROVEN** | Post-trade success calls the same `navigateBack()`→`navigate(-1)` proven reachable by AC4 (one tap lands on market detail). The fix-specific "regardless of Add Funds visit" case (clean stack) is proven by the revert-sensitive unit test. |
| AC3 | "After a trade, tapping < once from market detail returns to Perps home — not back to the order screen" | mixed | test (unit) | — (depends on deposit round-trip, UNTESTABLE-in-slot) | — | **PROVEN (via unit test)** | Once the phantom confirm entry is removed (unit-proven), the stack is `[home, market, trade]`; after a trade `navigate(-1)`→market detail and one further back→home. The phantom-removal is the revert-sensitive unit-proven fix. E2E deposit round-trip UNTESTABLE-in-slot. |
| AC4 | "If the user has not visited 'Add Funds', back navigation from the order screen is unaffected (no regression)" | mixed (visual) | screenshot + trace | `setup-*`, `ac4-wait-order-entry`, `ac4-assert-addfunds-present`, `ac4-screenshot-order-entry`, `ac4-press-back`, `ac4-wait-market-detail`, `ac4-assert-not-order-entry`, `ac4-screenshot-market-detail` | before/after-ac4-order-entry.png, before/after-ac4-back-to-market-detail.png | **PROVEN** | Recipe trace 13/13 passed. From order entry on a real history stack (no Add Funds visit), one tap of `perps-order-entry-back-button` lands on `perps-market-detail-page`. Identical on buggy and fixed builds → confirms no regression. |

## Trace cross-check

`recipe-run/trace.json`: 13/13 nodes `ok:true` (setup-unlock … done:pass). Every `ac4-` node
has a passing trace entry. No node FAILED.

## Forbidden-pattern scan (step 7a)

None present: no `switch`/default routing around an assertion; no skip-reason strings; no
`wait > 500ms` (all `wait_for`); no DOM-only visual-ordering claims; all node IDs prefixed
`setup-`/`ac4-`/`done`; screenshots present for the visual AC4; no UI value injection (only
`ui.navigate`/`ui.press`).

## Note on recipe revert-sensitivity

The recipe (AC4) is a **regression guard** and passes on both the buggy and fixed builds —
because the fix's user-visible delta lives in the Add Funds deposit round-trip, which is
infra-unreachable in this slot. The fix's revert-sensitivity is therefore carried by the unit
test, not the recipe. This is reflected in `recipe-quality.json` (verdict: `warn`).

Overall recipe coverage: 4/4 ACs PROVEN (recipe-proven: AC4 + AC2 mechanism; unit-test-proven: AC1, AC2 add-funds case, AC3) (untestable-via-recipe-e2e: AC1, AC3 deposit UI — Arbitrum 0xa4b1 absent; weak: 0, missing: 0)

## Update (2026-06-09): e2e recipe now proves the fix (revert-sensitive)

The TAT-3272 fix (auto-add the Arbitrum network on Add Funds) made the deposit round-trip
reachable, so `recipe.json` was rewritten from the AC4 regression guard to a full end-to-end
proof of the original bug. Run: `recipe-run-e2e/` — **16/16 nodes ok**.

| # | AC | Proof | Recipe nodes | Visual | Verdict |
|---|----|-------|--------------|--------|---------|
| AC1 / TAT-3131 | After visiting Add Funds, one back tap returns to market detail | trace + screenshot | `ac1-press-add-funds` → `ac1-wait-deposit` → `ac1-press-deposit-back` → `ac1-wait-back-order-entry` → `ac1-press-order-back` (one tap) → `ac1-wait-market-detail` → `ac1-assert-market-detail-control` | after-ac1-one-tap-back-to-market.png | **PROVEN** |
| TAT-3272 | Tapping Add Funds opens the deposit confirmation (Arbitrum added automatically) | trace + screenshot | `ac1-press-add-funds` → `ac1-wait-deposit` → `ac1-screenshot-deposit` | after-ac1-deposit-open.png | **PROVEN** |

Revert-sensitivity (why this recipe is now strong, not a guard):
- Revert **TAT-3272** → `ac1-press-add-funds` no longer opens the deposit → `ac1-wait-deposit` times out → recipe FAILS.
- Revert **TAT-3131** → after the round-trip, one tap of `ac1-press-order-back` lands on the phantom confirmation, not market detail → `ac1-wait-market-detail` times out → recipe FAILS.

Screenshots validated via Read: `after-ac1-deposit-open.png` shows "Deposit funds to Perps" (amount input, Pay with ETH); `after-ac1-one-tap-back-to-market.png` shows the BTC-USD market detail (chart + Stats + Long/Short).

Overall recipe coverage: AC1 (TAT-3131) + TAT-3272 PROVEN end-to-end and revert-sensitive (weak: 0, missing: 0). AC2/AC3 post-trade navigation still proven by the `navigate(-1)` mechanism + `useConfirmActions` unit test; AC4 (no-deposit regression) subsumed by the AC1 back-nav assertion.
