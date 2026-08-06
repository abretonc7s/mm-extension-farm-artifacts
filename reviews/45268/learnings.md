# Review learnings

- Light-tier reviews intentionally skip CDP, Webpack monitoring, recipes, and screenshots; UI claims must remain explicitly UNTESTABLE even when the PR includes author-supplied evidence.
- The perps error translation map uses `as const satisfies Record<PerpsErrorCode, string>` so TypeScript checks the real controller union without widening values needed by cancel-flow key remapping.
- `OrderTypeToggle` imports the controller's `OrderType` but renders only `market` and `limit`; its stable selectors are `order-type-toggle`, `order-type-market`, and `order-type-limit`.
- The Limit/Market regression flow can be proven with `limit-price-input`: visible after pressing `order-type-limit`, hidden after pressing `order-type-market`.
- New-position market TP/SL uses `perpsPlaceOrder` followed by `perpsUpdatePositionTPSL`; this avoids the v11-rejected position linkage on the initial placement.
- Real streamed TP/SL children now carry `parentOrderId`; deduplication still requires matching parent, symbol, side, reduce-only/trigger flags, and price tolerance, so future tests should keep both matching and unrelated-parent cases.
- The v11 dependency changes the existing `@metamask/perps-controller` lock stanza and its `@metamask/superstruct` range without creating a new package stanza, explaining why regenerated LavaMoat policies can remain byte-identical.
- Focused Jest output may include the repository's suppressed React `componentWill*` deprecation warning; the baseline reporter treated it as non-gating, so it should not be reported as PR-specific noise.
- No baseline perps balance TypeScript failure appeared in this checkout; `yarn lint:tsc` completed successfully with no output.
