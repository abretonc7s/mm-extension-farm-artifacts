# Learnings: MANUAL-000001 static self-review

- Controller analytics migration pattern: import contract from `@metamask/perps-controller` with Jest mapped through `test/mocks/metamask-perps-controller.js`; keep Extension-only aliases (e.g. `FLIP_POSITION`) in `shared/constants/perps-events.ts`.
- Attribution split: UI `trackingData` carries entry/discovery/hlFeeRate; stored UTM must merge in `createPerpsInfrastructure` via `mergeAttributionContext` for controller-emitted lifecycle events.
- When removing client `track()` calls for trade/close/cancel/risk, verify the matching background API accepts `trackingData` (margin `UpdateMarginParams` does not — no trackingData needed there).
- LavaMoat: hyperliquid 0.33.1 adds `decimal.js`; browserify + webpack mv2 policies updated manually when auto-regen fails on broken hyperliquid file paths.
