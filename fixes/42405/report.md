# TAT-3094 Fix Report

## Summary

Open order cards (limit, TP, SL) displayed prices with a fixed 2-decimal format via `formatPerpsFiatMinimal`. Fix changes all order cards to display the limit/trigger price using `formatPerpsFiatUniversal`, which adapts decimals to the price magnitude (0 for BTC >$10k, up to 6 for sub-cent assets), matching mobile behavior.

## Root Cause

`ui/components/app/perps/order-card/order-card.tsx:76-79` — Non-trigger limit orders computed `size * price` (notional) and formatted with `formatPerpsFiatMinimal` (always 2 decimals). Should display the limit price itself with `formatPerpsFiatUniversal` (adaptive decimals matching market price).

## Changes

- `ui/components/app/perps/order-card/order-card.tsx` — Unified price display for all order types: show limit/trigger price with `formatPerpsFiatUniversal` instead of notional with `formatPerpsFiatMinimal`
- `ui/components/app/perps/order-card/order-card.test.tsx` — Updated tests to verify universal decimal formatting (BTC 0 decimals, mid-range 1 decimal)

## Test Plan

- **Unit tests**: 21/21 passing (`yarn jest order-card.test.tsx`)
- **Lint**: `yarn lint:changed` clean
- **Locales**: `yarn verify-locales --quiet` clean
- **Circular deps**: `yarn circular-deps:check` clean
- **Coverage**: 100% (17/17 lines)
- **Recipe**: `validate-recipe.js` exits 0

## Evidence

- Unit test results: 21/21 pass with new tests for BTC ($95,173 → 0 decimals) and mid-range ($3,500.10 → 1 decimal)
- No visual evidence available (fixture has no open orders)

## Ticket

[TAT-3094](https://consensyssoftware.atlassian.net/browse/TAT-3094)
