# mm-harness check diff

Verdict: pass
Profile: fast
Fix: no
Base: origin/main (github-pr: main)
Changed files: 53

## Checks

- PASS policy-suppressions (/Users/deeeed/dev/metamask/metamask-extension-2/temp/tasks/fix/46123-0914-101642/artifacts/check-diff/policy-suppressions.log)
- PASS eslint (/Users/deeeed/dev/metamask/metamask-extension-2/temp/tasks/fix/46123-0914-101642/artifacts/check-diff/eslint.log)
- PASS oxfmt (/Users/deeeed/dev/metamask/metamask-extension-2/temp/tasks/fix/46123-0914-101642/artifacts/check-diff/oxfmt.log)
- PASS jest (/Users/deeeed/dev/metamask/metamask-extension-2/temp/tasks/fix/46123-0914-101642/artifacts/check-diff/jest.log)
- SKIP typecheck — profile=fast; run with --profile full for repo-wide typecheck

## Changed Files

- .eslintrc.js
- app/scripts/controllers/perps/infrastructure.test.ts
- app/scripts/controllers/perps/infrastructure.ts
- app/scripts/controllers/perps/perps-stream-bridge.test.ts
- app/scripts/controllers/perps/perps-stream-bridge.ts
- app/scripts/metamask-controller.js
- app/scripts/metamask-controller.test.js
- development/perps/loading/README.md
- development/perps/loading/browser-process.ts
- development/perps/loading/market-observation.test.ts
- development/perps/loading/market-observation.ts
- development/perps/loading/measure-loading.ts
- development/perps/loading/run-loading-cohort.ts
- development/perps/loading/summarize-loading.test.ts
- development/perps/loading/summarize-loading.ts
- docs/perps/loading-performance-results.json
- docs/perps/loading-performance-traces.json
- docs/perps/loading-performance.md
- lavamoat/webpack/mv2/beta/policy-override.json
- lavamoat/webpack/mv2/experimental/policy-override.json
- lavamoat/webpack/mv2/flask/policy-override.json
- lavamoat/webpack/mv2/main/policy-override.json
- lavamoat/webpack/mv3/beta/policy-override.json
- lavamoat/webpack/mv3/experimental/policy-override.json
- lavamoat/webpack/mv3/flask/policy-override.json
- lavamoat/webpack/mv3/main/policy-override.json
- shared/lib/trace.ts
- ui/components/app/perps/hooks/usePerpsTabExploreData.test.ts
- ui/components/app/perps/hooks/usePerpsTabExploreData.ts
- ui/components/app/perps/perps-view.test.tsx
- ui/components/app/perps/perps-view.tsx
- ui/helpers/perps/entry-trace.test.ts
- ui/helpers/perps/entry-trace.ts
- ui/hooks/discover-search/useDiscoverPerpsSearch.test.tsx
- ui/hooks/perps/stream/usePerpsLiveMarketListData.test.ts
- ui/hooks/perps/stream/usePerpsLiveMarketListData.ts
- ui/hooks/perps/stream/usePerpsLivePrices.test.ts
- ui/hooks/perps/stream/usePerpsLivePrices.ts
- ui/hooks/perps/stream/usePerpsStreamManager.test.tsx
- ui/hooks/perps/stream/usePerpsStreamManager.ts
- ui/hooks/perps/stream/usePerpsViewActive.ts
- ui/hooks/perps/usePerpsEntryTrace.test.ts
- ui/hooks/perps/usePerpsEntryTrace.ts
- ui/hooks/perps/usePerpsPreload.test.ts
- ui/hooks/perps/usePerpsPreload.ts
- ui/pages/perps/market-list/index.test.tsx
- ui/pages/perps/market-list/index.tsx
- ui/pages/perps/perps-layout.tsx
- ui/pages/routes/routes.component.tsx
- ui/providers/perps/CandleStreamChannel.test.ts
- ui/providers/perps/CandleStreamChannel.ts
- ui/providers/perps/PerpsStreamManager.test.ts
- ui/providers/perps/PerpsStreamManager.ts
