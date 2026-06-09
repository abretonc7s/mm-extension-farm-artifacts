# TAT-3131 — Navigation issue when tapping "Add Funds" on the Perps order screen

## Summary

Visiting **Add Funds** from the Perps order-entry screen and pressing back left a phantom
`confirm-transaction` entry on the history stack, so back navigation needed two taps (Bug A)
and post-trade navigation left the user stuck on the order screen (Bug B). The fix makes the
wallet-initiated confirmation's back action **replace** (instead of push) the history entry, so
the transient deposit/withdraw confirmation no longer lingers in history.

## Root cause

`ui/pages/confirmations/hooks/useConfirmActions.ts:68` — the `navigateBackToPreviousPage` branch
returned with `navigate(goBackTo)` (a **push**), while the Perps "Add Funds" entry navigates into
the confirmation with `{ replace: true }` (`usePerpsDepositConfirmation.ts:76`) and the
confirm-context auto-exit already returns with `{ replace: true }`
(`ui/pages/confirmations/context/confirm/index.tsx:78`).

Data flow (BTC): `market/BTC → trade/BTC` → tap Add Funds (`amount-input-add-funds` →
`triggerDeposit`) replaces order entry with `confirm/:id` → tap deposit back
(`wallet-initiated-header.tsx` perpsDeposit branch → `onCancel({navigateBackToPreviousPage:true})`)
**pushes** `trade/BTC` on top, leaving `[market/BTC, confirm/:id(phantom), trade/BTC]`. From order
entry, `navigateBack()` → `navigate(-1)` (`perps-order-entry-page.tsx:712-725`) then lands on the
phantom `confirm/:id` instead of market detail → Bug A (double-tap). Post-trade success also calls
`navigateBack()` → `navigate(-1)` (`perps-order-entry-page.tsx:1231`), hitting the same phantom →
Bug B.

The push/replace asymmetry is the only defect; making the manual-back path replace removes the
transient confirmation from history regardless of whether entry pushed (perpsWithdraw) or replaced
(perpsDeposit/musdClaim).

## Changes

- `ui/pages/confirmations/hooks/useConfirmActions.ts` — `navigateBackToPreviousPage` now returns
  with `navigate(goBackTo ?? DEFAULT_ROUTE, { replace: true })` (one-line behavior change + WHY
  comment). Blast radius: three callers set `navigateBackToPreviousPage` — `wallet-initiated-header.tsx:58`
  (perpsDeposit / perpsWithdraw / musdClaim back button), `simple-confirmation-header.tsx:42`
  (simple confirmation header back, e.g. musd conversion), and `footer.tsx:398`
  (footer cancel, `Boolean(goBackTo)`). In every case the confirmation is being rejected/cancelled
  and the user is returned to `goBackTo`, so `replace` correctly removes the transient confirmation
  from history for all three — symmetric with the confirm-context auto-exit
  (`context/confirm/index.tsx:78`). No regression for any caller.
- `ui/pages/confirmations/hooks/useConfirmActions.test.ts` — the two `navigateBackToPreviousPage`
  tests now assert `{ replace: true }` (revert-sensitive).

## Test plan

Automated:
- `yarn jest ui/pages/confirmations/hooks/useConfirmActions.test.ts ui/pages/confirmations/components/confirm/header/wallet-initiated-header.test.tsx --no-coverage` → **17/17 pass**.
- Revert-sensitivity: with the source fix reverted (push) the two updated tests **FAIL**
  (`Expected "/asset/0x1/0xabc", {"replace": true}` / `Received "/asset/0x1/0xabc"`); with the fix
  they pass. Logs: `artifacts/before-evidence-ac1-3-useConfirmActions-test.log` (fail),
  `artifacts/after-evidence-ac1-3-useConfirmActions-test.log` (pass).
- CI-parity gate: `yarn lint:changed && yarn verify-locales --quiet && yarn circular-deps:check` → all green.
- Coverage: `useConfirmActions.ts` 100% (10/10 lines) — VERDICT PASS.
- Recipe (`artifacts/recipe.json`): trace **13/13 nodes passed** — AC4 regression guard
  (order entry → one tap back → market detail).

Manual (Gherkin):
```
Given I am on the Perps order entry screen for a market (e.g. ETH)
When I tap the "Available to trade" Add Funds (+) icon and the deposit screen opens
And I tap the deposit screen back arrow to return to the order entry screen
And I tap the order-entry back arrow once
Then I land on the Perps market detail screen (one tap, no phantom)

Given I visited Add Funds during the session and returned to the order screen
When I execute a trade
Then I am navigated to the market detail screen (not left on the order screen)
```

Environment note: the end-to-end Add Funds deposit confirmation could not be opened in this slot
(`perpsDepositWithConfirmation` rejects with `Invalid chain ID "0xa4b1"` — Arbitrum absent; only
`0x1` configured; no manifest action provisions it). The recipe therefore proves the reachable AC4
regression guard, and the fix's revert-sensitive proof is the unit test. See
`artifacts/reproduction.md` and `artifacts/recipe-coverage.md`.

## Evidence (artifacts/)

- `reproduction.md` — live CDP reproduction + the Arbitrum/deposit infra limitation.
- `recipe.json`, `recipe-baseline.json`, `recipe-run/` (summary.json, trace.json, screenshots).
- `after-ac4-order-entry.png`, `after-ac4-back-to-market-detail.png` — AC4 fixed-build evidence.
- `before-evidence-ac4-*.png` — buggy-build AC4 (identical; regression guard).
- `before-/after-evidence-ac1-3-useConfirmActions-test.log` — revert-sensitive unit-test proof.
- `recipe-coverage.md`, `recipe-quality.json`, `evidence-manifest.json`.

## Ticket

[TAT-3131](https://consensyssoftware.atlassian.net/browse/TAT-3131) — Navigation issue when you tap "add funds" in order screen.

## Commit status

The two fix files were selectively staged by the worker; the gateway then committed them as
`58604d1291 fix(perps): replace transient confirmation history entry (TAT-3131)`. Branch
`TAT-3131-fix-fix-add-funds-nav` is local (no push) — the gateway publishes after human approval.

## Self-Review Fixes

- `temp/tasks/fix/tat-3131-0609-004829/artifacts/report.md:36` (Changes → blast radius) — corrected the understatement. `navigateBackToPreviousPage` is set by three callers, not one: `wallet-initiated-header.tsx:58` (perpsDeposit/perpsWithdraw/musdClaim back), `simple-confirmation-header.tsx:42` (simple confirmation header back, e.g. musd conversion), and `footer.tsx:398` (footer cancel, `Boolean(goBackTo)`). `replace: true` is correct for all three (each rejects/cancels a transient confirmation and returns to `goBackTo`); no regression. Doc-only — the shipped source change is unaffected and the PR description never repeated the understatement.
- `temp/tasks/fix/tat-3131-0609-004829/artifacts/recipe.json:67` (`ac4-screenshot-order-entry`) — no source change. The canonical recipe re-run halted at the screenshot node with `could not create image from window` (intermittent macOS window-capture; orchestrator owns the window lifecycle). The captured image was valid on inspection. Logic re-verified against the committed fix via `recipe-noshot.json` → 11/11 nodes pass, including the AC4 back-nav chain. Revert-sensitive proof remains the `useConfirmActions` unit test (7/7).

No product code changed in this self-review pass; the fix is already committed (`58604d1291 fix(perps): replace transient confirmation history entry (TAT-3131)`). Both findings were non-code (internal-doc inaccuracy + screenshot-capture infra).

## TAT-3272 — "Add Funds" did nothing (missing Arbitrum deposit network)

Bundled into this branch (separate ticket, same Add Funds flow).

**Symptom:** tapping the "Available to trade" + icon on the order-entry screen did nothing.

**Root cause:** Hyperliquid deposits settle USDC on Arbitrum. `PerpsController.depositWithConfirmation` (perps-controller 6.3.0, `PerpsController.mjs:1051-1054`) resolves the deposit tx against the Arbitrum network client via `NetworkController:findNetworkClientIdByChainId` and throws `Invalid chain ID "0xa4b1"` ("Please add the network first") when Arbitrum is absent. The order-entry deposit hook (`usePerpsDepositConfirmation.trigger`) swallowed that error in its `catch` (`console.error` only), so the tap produced no visible result.

**Blame:** the extension never ported mobile's `usePerpsNetworkManagement.ensureArbitrumNetworkExists` (mobile `app/components/UI/Perps/hooks/usePerpsNetworkManagement.ts`), which adds the Arbitrum network before deposit. The extension perps deposit shipped assuming Arbitrum was already configured; it is not on a wallet that hasn't added it. (The prior nav fix #43002 and the perps-controller 6.1.0→6.3.0 bump #42915 did not introduce or address this.)

**Fix:**
- `ui/components/app/perps/hooks/usePerpsNetworkManagement.ts` (new) — extension equivalent of mobile's hook. `ensureArbitrumNetworkExists` adds Arbitrum One (mainnet) / Arbitrum Sepolia (testnet) from the curated `FEATURED_RPCS` list via the `addNetwork` action when not already in `networkConfigurationsByChainId`. Uses `CHAIN_IDS.ARBITRUM` / `CHAIN_IDS.ARBITRUM_SEPOLIA` (same source as `FEATURED_RPCS`).
- `ui/components/app/perps/hooks/usePerpsDepositConfirmation.ts` — calls `await ensureArbitrumNetworkExists()` before `createPerpsDepositTransaction`.

**Verification:**
- Unit: `usePerpsNetworkManagement.test.ts` (adds when missing / no-op when present / no-op for non-featured testnet) + `usePerpsDepositConfirmation.test.ts` (revert-sensitive ordering assertion: network ensured before deposit). 10/10 pass.
- Lint: eslint clean (new + changed), `circular-deps:check` pass, `verify-locales` pass.
- **Live e2e (slot, clean `["0x1"]` wallet):** tapped the + icon → networks became `["0x1","0xa4b1"]` (Arbitrum auto-added) → route became `#/confirm-transaction/...?loader=customAmount&goBackTo=...` (deposit confirmation opened) → `wallet-initiated-header-back-button` present, pending approval queued, no console errors. Before the fix the same tap left networks `["0x1"]` and logged `Invalid chain ID "0xa4b1"`. (Live wallet restored to `["0x1"]` afterward.)

Note (out of scope, optional follow-up): the deposit-create `catch` is still silent for other failure modes; surfacing a user-facing error on deposit-create failure remains a separate UX improvement. Now that the deposit opens on a clean wallet, the full Add Funds deposit→back e2e is recipe-testable.
