# Learnings — PR #41558 Review

- **Perps formatting migration pattern**: Extension is moving from local `shared/lib/perps-formatters` and `useFormatters()` hook to direct imports from `@metamask/perps-controller` (`formatPerpsFiat`, `formatPositionSize`, `formatPercentage`). Future perps PRs should use controller exports exclusively.

- **Range config semantics**: `PRICE_RANGES_UNIVERSAL` is for full-precision displays (market prices, liquidation, oracle) while `PRICE_RANGES_MINIMAL_VIEW` is for compact/fiat-style displays (margin, fees, PnL, balance). The config names map directly to mobile's equivalent configs.

- **Test mock divergence risk**: When mocking `formatPerpsFiat` in tests, the mock strips trailing zeros (`8.3` → `$8.3`) but the actual `formatPerpsFiat` with `PRICE_RANGES_MINIMAL_VIEW` likely produces `$8.30`. Components that add sign prefixes (`-$8.3`) can cause assertion failures if tests don't account for the full rendered string.

- **Background API pattern**: New controller methods are exposed via `perps-controller-init.ts` with the pattern `['perpsMethodName', 'controllerMethodName']`. The corresponding hook uses `submitRequestToBackground<ReturnType>('perpsMethodName', [...args])`.

- **Race condition pattern**: `usePerpsLiquidationPrice` and `usePerpsOrderFees` both use `requestIdRef` + `canceled` flag pattern for request deduplication. This is the standard MetaMask pattern for async hooks with rapidly changing inputs.

- **diskCache architecture**: The `createDiskCache()` in `infrastructure.ts` is a write-through cache: in-memory `Map` + `browser.storage.local`. The controller package owns key naming. No size limits at the adapter level — cleanup responsibility is on the controller.

- **Fee fallback strategy**: `usePerpsOrderFees` has a 1.5s timeout that falls back to hardcoded base rates (taker 0.00045 + builder 0.001 = 0.00145). The catch handler also falls back to the same rates. This ensures the UI always shows fee estimates even if the controller is slow or down.

- **LavaMoat policy updates**: When adding new controller dependencies or changing `yarn.lock`, all 9 LavaMoat policy files need updating (browserify × 4 variants + webpack mv2 × 4 variants + webpack mv3 main). This PR correctly updated all of them.

- **DO-NOT-MERGE label**: This PR has the `DO-NOT-MERGE` label, indicating it's still in progress despite having extensive validation evidence. The test failure at line 655 confirms it's not yet merge-ready.

- **Pre-existing type errors**: The extension codebase has pre-existing type errors in `settings-v2/`, `multichain*`, `musd/`, and `toast.ts` files. These are not related to perps changes and should not block perps PRs.
