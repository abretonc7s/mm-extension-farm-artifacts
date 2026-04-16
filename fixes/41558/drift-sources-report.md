# Drift Sources Report

This report summarizes the sources of extension/mobile parity drift discovered while building the composed parity recipes and matrix artifacts for Perps.

## Scope

- Extension repo: `/Users/deeeed/dev/metamask/metamask-extension-3`
- Mobile repo: `/Users/deeeed/dev/metamask/metamask-mobile-1`
- Primary evidence artifacts:
  - [decimal-parity-matrix-expanded.md](/Users/deeeed/dev/metamask/metamask-extension-3/temp/.task/fix/41558-0415-1045/artifacts/decimal-parity-matrix-expanded.md)
  - [decimal-parity-shape-analysis.md](/Users/deeeed/dev/metamask/metamask-extension-3/temp/.task/fix/41558-0415-1045/artifacts/decimal-parity-shape-analysis.md)

## Resolved Drift Sources

### 1. Environment mismatch: extension on mainnet vs mobile on testnet

- Impact:
  - made live-value comparisons noisy and misleading
  - created false impressions of large parity failures
- Resolution:
  - extension composed parity recipe now forces testnet via `perps/ensure-perps-network`

### 2. Wrong formatter path on extension perps surfaces

- Impact:
  - several rows still used non-controller UI formatting or the wrong range config
- Examples fixed:
  - reverse modal fees
  - auto-close estimated PnL
  - update TP/SL estimated PnL
  - perps balance dropdown totals / PnL
- Resolution:
  - switched those surfaces to controller exports such as:
    - `formatPerpsFiat`
    - `PRICE_RANGES_MINIMAL_VIEW`
    - `PRICE_RANGES_UNIVERSAL`
    - `formatPositionSize`

### 3. Unsigned positive percent display on extension

- Impact:
  - extension showed positive change without `+`
  - mobile shows explicit sign
- Resolution:
  - switched extension market/detail and order-entry header change formatting to signed percent display

### 4. Low-price market header fed from rounded / wrong source on extension

- Impact:
  - assets like `FARTCOIN` and `PUMP` showed over-rounded headers or `"$---"`
- Root cause:
  - formatted currency strings were being re-fed into controller formatters
  - header source priority preferred stream/candle values that could already be rounded
- Resolution:
  - normalize string prices before formatting
  - prefer market-data price source first for header display when it is available

### 5. Monolithic recipe structure

- Impact:
  - duplicated brittle navigation logic
  - hard to reuse, hard to isolate failures
- Resolution:
  - split into composable flows on both extension and mobile:
    - market detail snapshot
    - order entry snapshot
    - ETH position detail
    - ETH reverse
    - ETH remove margin
    - ETH close position
    - withdraw snapshot

### 6. Mobile bridge lacked stable read primitives

- Impact:
  - recipes had to embed large fiber-tree walkers
  - Hermes/CDP timeouts and extraction brittleness
- Resolution:
  - hardened mobile `AgenticService` bridge with:
    - `pressText`
    - `getTextByTestId`
    - `getAncestorTextsByTestId`
    - `getRowValue`

### 7. Missing stable value selectors on mobile

- Impact:
  - many rows could only be inferred heuristically from surrounding text
- Resolution:
  - added testIDs for key rendered values in mobile perps UI:
    - order summary values
    - position detail values
    - reverse modal values
    - adjust-margin values
    - close summary values
    - withdraw values
    - oracle price

### 8. Extension extraction relying on label scraping only

- Impact:
  - ETH detail / reverse / remove-margin rows could drift to `null`
  - extractor quality degraded independently of product behavior
- Resolution:
  - added / used direct extension testIDs where practical
  - reduced reliance on generic row heuristics for key ETH flows

### 9. Extension order-entry liquidation used a local formula instead of controller logic

- Impact:
  - ETH order-entry liquidation price drifted materially from mobile
  - extension was not using the same controller path mobile uses
- Root cause:
  - `usePerpsOrderForm` calculated liquidation synchronously with a local helper
  - mobile uses `calculateLiquidationPrice` through the controller
- Resolution:
  - exposed `perpsCalculateLiquidationPrice` through the extension perps messenger API
  - added extension `usePerpsLiquidationPrice`
  - switched `usePerpsOrderForm` to consume controller liquidation output instead of the local formula

## Partially Resolved / Still Active Drift Sources

### 10. Extension order-entry estimate drift vs mobile

- Symptoms still visible:
  - margin required can differ slightly
  - liquidation price can differ slightly
- Likely source:
  - extension/mobile still do not fully share the same calculation path or rounding sequence for pre-trade estimates
  - extension moved closer by switching more of the path to controller helpers, but this is not fully closed yet
- Current status:
  - active product parity gap

### 21. Extension non-BTC/ETH market-detail oracle can still stay blank

- Symptoms:
  - direct current-session probes for `SOL`, `FARTCOIN`, and `PUMP` can show market price + change but `oracle = —`
  - `SOL` debug logs showed repeated cache sync with:
    - `cachedPrice: undefined`
    - `cachedMarkPrice: undefined`
    - and no stream-update entries for that symbol
- Interpretation:
  - this appears to be a separate network / hydration issue rather than the core decimal-parity problem this PR is targeting
  - BTC / ETH value-shape parity is a better signal for this PR's current scope
- Current status:
  - tracked separately
  - should not be treated as the main remaining decimal-parity blocker for this PR

### 11. Extension close amount precision

- Symptoms:
  - extension close amount can still show an extra decimal place vs mobile
- Likely source:
  - extension close USD display path still differs slightly from mobile’s close amount calculation/display sequence
- Current status:
  - active product parity gap

### 12. Extension remove-margin liquidation distance precision

- Symptoms:
  - extension can show `31.8%` while mobile shows `32%`
- Likely source:
  - extension uses explicit one-decimal formatting path
  - mobile display appears to present a rounded whole-percent shape in the observed case
- Current status:
  - resolved in extension by switching this row to explicit whole-percent display to match mobile

### 13. Extension market-detail oracle first-load instability

- Symptoms:
  - earlier in the session, the expanded extension recipe could fail on the first `ETH` market-detail step after `BTC` order entry
  - direct probes now show the page receiving real stream updates with `markPrice`
- Latest evidence:
  - browser console debug confirms:
    - `market-detail:stream-update { symbol: ETH, price: ..., markPrice: ... }`
  - direct ETH market-detail capture now shows a real oracle value instead of permanent `—`
- Current interpretation:
  - no longer best described as a permanent product blank-oracle bug
  - now looks more like setup / first-load orchestration noise in the full composed wrapper
- Current status:
  - effectively resolved enough for current parity validation
  - direct per-symbol probes now show real `markPrice` updates across BTC / ETH / SOL / FARTCOIN / PUMP

### 14. Extension fee-rate RPC can stall, leaving order-entry fees at `$0`

- Symptoms:
  - live order-entry occasionally showed `fees = $0` while margin/liquidation were already present
  - targeted browser-console debug logs showed:
    - `fees:start`
    - then `fees:fallback-timeout`
    - but no prompt success from the controller path
- Resolution in progress:
  - extension fee hook now uses a bounded fallback to base rates after timeout/failure
  - this restores visible fee parity shape on the live page instead of leaving `$0`
- Current status:
  - product behavior improved
  - underlying RPC stall still needs follow-up if we want the full controller path to be fully healthy

### 19. Upstream HyperLiquid rate limiting can contaminate parity evidence

- Symptoms:
  - intermittent fee-rate / market-data stalls during live validation
  - inconsistent current-value comparisons across closely spaced runs
- Interpretation:
  - this is upstream interference, not necessarily an extension/mobile formatting bug
  - especially relevant when:
    - `calculateFees` stalls
    - live oracle / market values drift unexpectedly between otherwise identical flows
- Current status:
  - treat as an environment factor when evaluating remaining tiny deltas
  - do not use it as justification to weaken extension/mobile formatting parity targets

### 20. Mobile ETH add-exposure order capture can be misleading if not retyped

- Symptoms:
  - an earlier ETH mobile order snapshot showed much lower values (`margin ~$3.35`, `fees ~$0.01`)
  - that snapshot was taken on the add-exposure path without retyping the intended `11` amount in the current order screen
- Resolution:
  - reran the mobile ETH add-exposure flow with an explicit `11` keypad entry before extraction
  - current mobile ETH order row is now:
    - `price ~$2,348.5`
    - `margin $3.67`
    - `liquidationPrice ~$1,597.6`
    - `fees $0.02`
- Current status:
  - resolved as a capture-method issue, not a real mobile-vs-extension parity gap

## Harness / Validation Drift Sources To Keep In Mind

### 15. Live-value drift between runs

- Even on the same environment, values move while recipes run.
- Consequence:
  - raw numeric equality is not a strong assertion by itself
- Mitigation:
  - use shape-analysis alongside raw-value tables
  - compare:
    - decimal count
    - explicit sign presence
    - compact vs full display

### 16. Mobile CDP / Hermes transport instability

- Symptoms seen:
  - websocket closed
  - `Runtime.evaluate` timeouts
  - bridge not ready immediately after reload
- Mitigation used:
  - sequential mobile runs only
  - higher `CDP_TIMEOUT`
  - explicit mobile restart/reconnect when needed

### 17. Bundle staleness after hot reload

- Symptoms seen:
  - source fix present on disk but not reflected in live UI
- Mitigation used:
  - explicit reload / restart
  - direct live verification after reload before treating a value as a product bug

### 18. Full composed extension parity wrapper still has setup/extraction noise

- Symptoms:
  - full `pr-41558-decimal-parity-expanded` run can hang or stall in setup even when the perps home page is visibly ready
  - targeted single-screen flows for BTC/ETH market + order now pass, but the full wrapper remains less reliable
  - order-entry extraction can still capture stale values (for example fee text) if a flow is not scoped tightly enough to the active screen
- Current status:
  - improved: after relaxing the setup hard gate and tightening settled-value waits, the composed extension parity recipe is passing again
  - no longer the main blocker, though targeted sequential flows remain useful for debugging

## Current Best Reading

- Most of the early “drift” was harness/environment/source-selection noise.
- That noise is now much lower.
- Remaining differences are narrow enough to treat as actual product parity work, especially around:
  - pre-trade order estimates
  - close amount precision
  - final rounding/shape choices on a few rows
- The targeted parity lanes are now healthy enough that the composed extension recipe is passing again, which makes the latest artifact set much more trustworthy than earlier in the session.

## Recommended PR Usage

Include this report as a support artifact alongside:

- the screenshot comparison table
- the expanded parity matrix
- the shape-analysis table

That gives reviewers:

- visual parity evidence
- structured field-by-field evidence
- a documented explanation of which drifts were harness issues vs real product issues
