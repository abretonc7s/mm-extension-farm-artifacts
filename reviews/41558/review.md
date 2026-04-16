# PR Review: #41558 — fix(perps): decimal logic issues

**Tier:** light

## Summary

This PR moves extension perps display formatting from hardcoded `.toFixed(2)` / `formatNumber({min:2, max:2})` / `formatCurrencyWithMinThreshold` to the shared controller formatting exports (`formatPerpsFiat`, `formatPositionSize`, `formatPercentage`) from `@metamask/perps-controller@3.1.1`. It also moves liquidation price calculation from a local formula to a controller-backed background method (`perpsCalculateLiquidationPrice`), adds a `diskCache` dependency backed by `browser.storage.local`, and wires `tracer.addBreadcrumb` to Sentry.

The change is well-structured and moves in the right direction — centralizing formatting in the controller package ensures mobile/extension parity. However, one test is currently failing.

## Recipe Coverage

Skipped (tier: light).

## Prior Reviews

| Reviewer | State | Date | Addressed? | Notes |
|----------|-------|------|------------|-------|
| cursor | COMMENTED | 2026-04-08 | N/A | Bugbot automated review |
| michalconsensys | COMMENTED | 2026-04-09 | N/A | Comment only |
| aganglada | COMMENTED | 2026-04-15 | N/A | Comment only |
| abretonc7s | COMMENTED | 2026-04-15/16 | N/A | PR author comments |

No CHANGES_REQUESTED reviews. No prior blocking feedback to track.

## Acceptance Criteria Validation

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Replace hardcoded decimal formatting with controller formatters | PASS | All `formatCurrencyWithMinThreshold` replaced with `formatPerpsFiat` + range configs across 13 UI files |
| 2 | Use PRICE_RANGES_UNIVERSAL for market/liquidation/oracle prices | PASS | Verified in order-entry, market-detail, edit-margin, close-position |
| 3 | Use PRICE_RANGES_MINIMAL_VIEW for compact displays (margin, fees, PnL) | PASS | Verified in order-summary, close-position, reverse-position, balance-dropdown |
| 4 | Use formatPositionSize for token quantities | PASS | Used in close-amount-section and order-entry |
| 5 | Move liquidation price to controller-backed calculation | PASS | New `usePerpsLiquidationPrice` hook calls `perpsCalculateLiquidationPrice` with fallback |
| 6 | Add diskCache dependency | PASS | `createDiskCache()` in infrastructure.ts with browser.storage.local + in-memory map |
| 7 | Expose perpsCalculateLiquidationPrice background API | PASS | Added in perps-controller-init.ts with test coverage |
| 8 | Upgrade to perps-controller@3.1.1 | PASS | package.json updated, yarn.lock updated |
| 9 | Extension perps display parity with mobile | PASS | Code review confirms formatting now uses shared controller exports |

## Code Quality

- **Pattern adherence:** Follows existing extension patterns for background API methods, hooks, and infrastructure wiring. Good use of `submitRequestToBackground` pattern for controller communication.
- **Complexity:** Appropriate. The `usePerpsOrderForm` hook is complex but necessarily so — it handles market/limit/modify/close modes with proper price source selection.
- **Type safety:** Clean. The only cast is `as FiatRangeConfig[]` in infrastructure.ts:236, which narrows `unknown[]` from the `MarketDataFormatters` interface — acceptable given the interface constraint comes from the controller package.
- **Error handling:** Good defensive patterns — `usePerpsLiquidationPrice` has race-condition handling with `requestIdRef` + `canceled` flag. `usePerpsOrderFees` has 1.5s fallback timeout with hardcoded base rates.
- **Anti-pattern findings:**
  - No hardcoded chain IDs or network URLs
  - No `as any` casts
  - No `eslint-disable` comments
  - No import boundary violations
  - New `data-testid` attributes added extensively (good for testability)

## Fix Quality

- **Best approach:** Yes — centralizing formatting in the controller package is the correct long-term approach. Using `PRICE_RANGES_UNIVERSAL` and `PRICE_RANGES_MINIMAL_VIEW` from the controller matches mobile's adaptive formatting system.
- **Would not ship:** Test failure at `perps-market-detail-page.test.tsx:655` — assertion expects `$8.3` but rendered text includes sign prefix (`-$8.3`). Must fix before merge.
- **Test quality:** Tests mock `formatPerpsFiat` with a simplified implementation that strips trailing zeros. Most assertions are reasonable, but the funding value test (line 655) doesn't account for the sign prefix the component adds.
- **Brittleness:** The `usePerpsOrderFees` hardcoded fallback rates (0.00145 = 0.00045 + 0.001) will silently mask fee-tier API failures. Documented in comments but worth noting.

## Live Validation

- Recipe: skipped (tier: light)
- Result: SKIPPED
- Evidence: skipped (tier: light)
- Webpack errors: N/A
- Log monitoring: skipped (tier: light)

## Correctness

- **Diff vs stated goal:** Aligned — PR successfully replaces hardcoded formatting with controller exports.
- **Edge cases:**
  - Zero amounts handled (returns null for calculations)
  - Near-zero funding handled (< 0.005 returns `$0.00`)
  - Missing oracle price falls back to currentPrice
  - Controller liquidation price failure falls back to local calculation
- **Race conditions:** Handled via `requestIdRef` pattern in both `usePerpsLiquidationPrice` and `usePerpsOrderFees`.
- **Backward compatibility:** Preserved — LavaMoat policies updated across all build variants.

## Static Analysis

- lint:tsc: PASS — 0 new type errors (pre-existing errors in unrelated files: settings-v2, multichain, musd, toast)
- Tests: 350/351 pass — 1 failure in `perps-market-detail-page.test.tsx:655` (funding value sign prefix mismatch)

## Mobile Comparison

- Status: N/A (light tier — skipped)

## Architecture & Domain

- **MV3 implications:** `diskCache` uses `browser.storage.local` which is compatible with MV3 service workers. No `chrome.runtime.getBackgroundPage()` usage.
- **LavaMoat impact:** Policies updated across all 9 policy files (browserify + webpack, all build variants). Changes grant `@metamask/perps-controller` appropriate permissions.
- **Import boundary adherence:** Formatting imports moved from local `shared/lib/perps-formatters` to `@metamask/perps-controller` — correct direction, reduces local code.
- **Controller usage:** New background API method follows existing patterns (`perpsCalculateFees` → `perpsCalculateLiquidationPrice`).

## Risk Assessment

- **MEDIUM** — Touches all perps formatting surfaces (market detail, order entry, close position, reverse, edit margin, withdraw, balance dropdown). The formatting change is systematic and uses shared controller exports, reducing risk of divergence. However, the `DO-NOT-MERGE` label and the test failure indicate this is not yet ready. The `diskCache` introduces persistent state via `browser.storage.local` which could accumulate data over time if not cleaned up.

## Recommended Action

COMMENT

Specific items:
1. **must_fix:** Test failure at `ui/pages/perps/perps-market-detail-page.test.tsx:655` — assertion `$8.3` should be `-$8.3` (component prepends sign prefix to formatted funding value)
2. **suggestion:** `diskCache` in `infrastructure.ts:254-295` has no key namespace prefix or size limits — the controller package likely handles key naming, but worth confirming there's no collision risk with other `browser.storage.local` consumers in the extension
3. **suggestion:** `usePerpsOrderFees` fallback rates (0.00145) are hardcoded in two places (timeout and catch) — consider extracting to a named constant for maintainability
