# Learnings — PR #42972

- **Dual export pattern**: Perps utils must be exported from both `utils.ts` (sibling file) and `utils/index.ts` (barrel) because TypeScript resolves `../utils` to the sibling `.ts` file, not the barrel. This matches `willFlipPosition` pattern. Always check both when adding new perps utils.

- **ClosePositionParams source**: The canonical `ClosePositionParams` type lives in `@metamask/perps-controller` and already includes `trackingData?: TrackingData`. Extension previously had a local duplicate — PRs that remove local type duplicates in favor of controller imports are a positive pattern.

- **useVipTier hook**: Returns `number | null`. Gated by `vipProgramEnabled` remote feature flag + `rewardsGetVipTierForAccount` background call via React Query. In tests, returns `null` unless explicitly mocked — means VIP-specific payload fields are typically absent in test assertions.

- **metamaskFeeRateDiscountPercentage**: Comes from `usePerpsOrderFees` hook, type `number | undefined`. Represents the MetaMask fee discount percentage. When undefined, `buildPerpsVipTrackingData` correctly omits it.

- **Recipe tooling gap**: `temp/recipes/` directory was not provisioned in this slot. The recipe runner (`validate-recipe.js`, `status.ts`) exists only in old task artifacts under `temp/tasks/fix/`. For future reviews needing browser validation, the slot needs recipe tooling provisioned.

- **CDP target attachment**: Direct page WebSocket connection (`ws://localhost:PORT/devtools/page/ID`) returns 500 if the target is already attached (e.g., by another CDP client). Use browser-level WebSocket + `Target.attachToTarget` with `flatten:true` instead.

- **Test coverage gap pattern**: When a PR adds `trackingData` to multiple call sites, verify ALL corresponding test files are updated. In this PR, close-position-modal.test.tsx was missed while reverse-position and order-entry tests were updated.

- **Mobile ref staleness**: The local `metamask-mobile-ref` may not have the latest mobile changes. When a PR claims to "port from mobile", the mobile feature might exist only in an unmerged mobile PR or a newer commit than what's checked out locally.

- **Conditional spread for optional analytics fields**: `...(value !== null && { field: value })` is the preferred pattern for optional analytics fields. Keeps the payload clean without sending null/undefined values to the analytics service.

- **Perps background call verification**: Claims about background call params (`perpsPlaceOrder`, `perpsClosePosition`, `perpsFlipPosition`) are best verified via code review + unit tests rather than live CDP eval, since the service worker doesn't expose these call params at runtime.
