# TAT-3833 — No position found for [market ticker]

**Summary**: The perps order-entry page matched the route symbol case-insensitively but sent it verbatim to the controller. A mis-cased route (`/perps/trade/sol`, from a deeplink, a typed URL, or a market-detail page opened that way) rendered a working close/modify form for the open `SOL` position, and close / TP-SL submits then failed with `POSITION_NOT_FOUND` (formerly `No position found for sol`). The page now replaces a mis-cased route with the market's exact symbol before the form mounts.

**Root cause**: `ui/pages/perps/perps-order-entry-page.tsx:401` keeps the URL symbol (`decodedSymbol`); the market (`:419`) and position (`:770`) lookups lowercase both sides, but `buildClosePositionParams` (`:288`) and the `perpsUpdatePositionTPSL` calls (`:2074`, `:2185`) send `orderFormState.asset` = the raw URL symbol. `HyperLiquidProvider.closePosition` / `updatePositionTPSL` look positions up with `pos.symbol === params.symbol` and throw `POSITION_NOT_FOUND`. Deeplinks (`shared/lib/deep-links/routes/perps-asset.ts:29`) and market detail (`perps-market-detail-page.tsx:848`) forward the symbol unchanged. Controller-side staleness causes (post-fill TP/SL cache miss, stale-snapshot close) were already fixed upstream in perps-controller 15.1/16.1 (core #10037, #10101) and shipped in v13.49.

**Changes**
- `ui/pages/perps/perps-order-entry-page.tsx` — `<Navigate replace>` to `/perps/trade/<market.symbol>` (search params kept) when the route symbol differs from the market's symbol.
- `ui/pages/perps/perps-order-entry-page.test.tsx` — 3 tests: mis-cased redirect (form not mounted), HIP-3 `XYZ:tsla` → `xyz:TSLA`, no redirect for canonical symbol. The first two fail without the fix.

**Test plan**
- `yarn jest ui/pages/perps/perps-order-entry-page.test.tsx` — 149/149 pass.
- `mm-harness check diff --profile fast` — eslint, oxfmt, jest pass. `yarn lint:changed`, `verify-locales`, `circular-deps:check` pass. Coverage analyzer: PASS.
- Recipe `recipe.json` — 39/39 on the fixed build; `recipe-baseline.json` — 35/35 on the buggy build (asserts the failures; SW log shows `POSITION_NOT_FOUND` ×3). Coverage: `recipe-coverage.md` (3/3 PROVEN).

```gherkin
Given a Hyperliquid testnet account with open SOL and ETH positions
When I open #/perps/trade/sol?mode=close and press Close position
Then the URL becomes #/perps/trade/SOL?mode=close and the position closes
When I open #/perps/trade/eth?direction=long&mode=modify and press Modify Position
Then the URL shows ETH and the TP/SL update succeeds instead of "Failed to update TP/SL"
```

**Evidence**: `before-evidence-ac1-close-failed.png`, `before-evidence-ac2-tpsl-update-failed.png`, `after-ac1-positions-without-sol.png`, `after-ac2-modify-form-route.png`, `after-ac1-close-form-route.png`, `before.mp4`, `recipe-run/`, `recipe-run-baseline/`, `recipe-coverage.md`, `recipe-quality.json`.

**Notes**
- Fix is staged, not committed (repo-local agent rules: stage only).
- Harness: `ui.navigate hash` waits for the exact requested URL, which the redirect replaces, so the recipe lands on the mis-cased routes with `ui.navigate url` (fresh document). The TP/SL success toast is not captured because the success branch immediately navigates back to the previous document; success is asserted by that navigation plus 0 `POSITION_NOT_FOUND` in the app log.
- A genuinely closed position (liquidated / TP hit elsewhere) still returns `POSITION_NOT_FOUND`, mapped to the generic "Something went wrong" copy (`translate-perps-error.ts:160`); mobile shows "Position not found". Left as-is (out of scope).

**Ticket**: [TAT-3833](https://consensyssoftware.atlassian.net/browse/TAT-3833)

## Self-Review Fixes
- ui/pages/perps/perps-order-entry-page.tsx:473 — trading `PerpsScreenViewed` now also requires `market?.symbol === decodedSymbol`, so a mis-cased route that redirects emits it once (with the canonical asset) instead of twice.
- ui/pages/perps/perps-order-entry-page.test.tsx:2611 — test renders `eth` then the redirected `ETH` and asserts one trading screen view with `ASSET: 'ETH'`; fails with the old condition.
- Recipe re-run: 39/39, 0 `POSITION_NOT_FOUND`. `after.mp4` dropped from evidence: the shared recorder captured stale frames during the re-run.
