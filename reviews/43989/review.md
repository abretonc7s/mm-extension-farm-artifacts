# PR Review: #43989 — feat(perps): gate terminal backend behind `perpsTerminalBackendEnabled` feature flag

**Tier:** standard

## Summary
The PR correctly adds the selector, threads `useTerminalApi` through explicit UI market-info fetches, stream-manager fallback, and reconnect hydration. I would not ship it as-is because `perpsInit` still starts controller market-data preload without the flag, and that direct-provider cache can hydrate the UI and suppress the Terminal-enabled fallback.

PR hygiene finding: No Jira or linked issue is provided. This review evaluates PR-author claims, not ticket-bound acceptance criteria.

## Recipe Coverage
| # | AC (verbatim) | Target env | Recipe nodes (IDs) | Screenshot filename | Visual verdict | Justification |
|---|---------------|------------|---------------------|---------------------|----------------|---------------|
| 1 | "When the flag is absent or disabled, market data is fetched directly from the provider (HyperLiquid) without routing through the Terminal API." | fullscreen | ac1-assert-default-direct | N/A | PROVEN | Trace shows command node passed; it asserts `fetchMarketInfos` defaults `useTerminalApi` to false, `PerpsStreamManager` defaults false, and market REST fallback forwards that false value. |
| 2 | "When the flag is enabled and the app version satisfies `minimumVersion`, the Terminal API path is used." | fullscreen | ac2-assert-enabled-terminal, ac8-assert-enabled-proof-scope | N/A | PROVEN | Trace shows command nodes passed; selector, bridge, controller wiring, and enabled-path tests prove the code path uses `useTerminalApi: true` when the flag satisfies the version gate. |
| 3 | "**New selector** `getIsPerpsTerminalBackendEnabled` in `ui/selectors/perps/feature-flags.ts` using the existing `isPerpsRemoteConfigSatisfied` helper (same version-gated pattern as `perpsSlippageConfig2`)" | fullscreen | ac3-run-selector-tests | N/A | PROVEN | Trace shows selector Jest node passed: 21 tests, including enabled, disabled, absent, and version-mismatch states. |
| 4 | "**`fetchMarketInfos`** now accepts a `useTerminalApi` parameter (default `false`) instead of hardcoding `true`" | fullscreen | ac4-run-cache-tests | N/A | PROVEN | Trace shows cache Jest node passed: 7 tests, including true, false, default false, and separate cache entries when the flag changes. |
| 5 | "**`PerpsStreamManager`** reads the flag via a new `setUseTerminalApi()` method, synced from `PerpsLayout`" | fullscreen | ac5-run-stream-manager-tests | N/A | PROVEN | Trace shows stream manager Jest node passed: 82 tests, including default false and `setUseTerminalApi(true)` forwarding `useTerminalApi: true`. |
| 6 | "**`PerpsStreamBridge`** reads the flag via a new `isTerminalBackendEnabled` callback, wired from `metamask-controller.js` using `RemoteFeatureFlagController:getState`" | fullscreen | ac6-run-bridge-tests, ac2-assert-enabled-terminal | N/A | PROVEN | Trace shows bridge Jest node passed: 74 tests, including reconnect hydration with false and true callback values; command proof checks `RemoteFeatureFlagController:getState` wiring. |
| 7 | "Verify that market data loads successfully from the provider (no Terminal API calls in network tab to `terminal.*.cx.metamask.io`)." | fullscreen | ac7-navigate-perps, ac7-wait-perps, ac7-screenshot-perps | evidence-ac7-perps-page.png | UNTESTABLE | Screenshot was reviewed directly and shows the Perps tab in skeleton/loading state, not loaded market data; recipe did not capture network-tab evidence, so this live claim is not proven in the current slot. |
| 8 | "Verify that market data REST calls now include `useTerminalApi: true` and Terminal API requests appear in the network tab." | fullscreen | ac8-assert-enabled-proof-scope, ac2-assert-enabled-terminal | N/A | UNTESTABLE | Internal tests/static proof cover enabled routing, but live network proof requires rebuilding/reloading the extension with `.manifest-overrides.json` setting `perpsTerminalBackendEnabled` enabled; current slot was not rebuilt with that flag. |

Overall recipe coverage: 6/8 ACs PROVEN
Untestable: AC7 live market/network proof; AC8 enabled-flag live network proof.

> ⚠ Coverage escalation: AC7, AC8 not proven in browser.
> Reason: current slot did not show loaded Perps market data and was not rebuilt with `perpsTerminalBackendEnabled` enabled.
> Human reviewer must validate manually before merging.

## Prior Reviews
No prior `CHANGES_REQUESTED` reviews.

## Acceptance Criteria Validation
| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Default/disabled flag routes direct provider | PASS | ac1-assert-default-direct; affected tests |
| 2 | Enabled version-gated flag routes Terminal path | FAIL | Code path mostly exists, but preload path bypasses flag |
| 3 | New version-gated selector | PASS | ac3-run-selector-tests |
| 4 | `fetchMarketInfos` accepts default-false flag | PASS | ac4-run-cache-tests |
| 5 | Stream manager sync from layout | PASS | ac5-run-stream-manager-tests |
| 6 | Stream bridge callback wiring | PASS | ac6-run-bridge-tests |
| 7 | Disabled live provider load/no Terminal calls | UNTESTABLE | Screenshot shows skeleton; no network proof |
| 8 | Enabled live Terminal calls | UNTESTABLE | Requires rebuilt flag-enabled runtime |

## Code Quality
- Pattern adherence: mostly follows existing selector/cache/stream patterns.
- Complexity: appropriate for explicit fetch paths, but incomplete for controller preload cache.
- Type safety: `yarn lint:tsc` PASS.
- Error handling: unchanged fallback/catch behavior remains adequate.
- Accessibility/fallbacks: N/A for UI controls; cache fallback has a correctness issue.
- Anti-pattern findings: no dependency/LavaMoat changes, no `chrome.runtime.getBackgroundPage()`, no state migration needed.

## Fix Quality
- **Best approach:** Thread the same version-gated terminal flag into every market-data source, including controller preload, or prevent provider/direct preloaded cache from hydrating Terminal-enabled UI state.
- **Would not ship:** `app/scripts/metamask-controller.js:6708` / bridge wiring is incomplete because `startMarketDataPreload()` still calls controller `getMarketDataWithPrices({ standalone: true })` with no `useTerminalApi`; that cache is emitted/hydrated before the gated fallback can run.
- **Test quality:** Good coverage for selector, explicit fetch, stream manager, and reconnect hydration. Missing a test for the preload/cache hydration path with the flag enabled.
- **Brittleness:** The flag is read at call time for reconnect hydration, which is good. The remaining risk is stale/direct cache data winning due to module/controller cache warm checks.

## Live Validation
- Recipe: generated
- Result: PASS, 15/15 nodes passed from `trace.json`
- Evidence: 1 screenshot; video skipped (standard tier)
- Webpack errors: none observed
- Log monitoring: 30 seconds monitored, no new webpack errors

## Correctness
- Diff vs stated goal: partially aligned; explicit REST paths are gated, preload path is not.
- Edge cases: flag absent/false and enabled selector states covered; enabled preload cache path uncovered and broken.
- Race conditions: potential cache race where direct preload data hydrates `PerpsStreamManager.markets` before Terminal-enabled fallback.
- Backward compatibility: disabled/default path remains direct provider.

## Static Analysis
- lint:tsc: PASS
- Tests: 4/4 suites pass, 184/184 tests pass

## Mobile Comparison
- Status: N/A
- Details: mobile reference does not appear to have an equivalent perps Terminal backend flag path for this backend-routing change.

## Architecture & Domain
The feature flag is read through `RemoteFeatureFlagController:getState` and the selector uses the existing version-gated helper. No LavaMoat or MV3-specific policy changes are needed. The architectural gap is that controller-owned market preload cache is provider/network keyed, not Terminal/direct keyed, while the UI module cache now is Terminal/direct keyed.

## Risk Assessment
- HIGH — the PR is intended to gate backend routing, but an active preload path can still serve direct-provider market data when the Terminal backend flag is enabled.

## Recommended Action
REQUEST_CHANGES
Fix the preload/cache path so enabled `perpsTerminalBackendEnabled` cannot be bypassed by `startMarketDataPreload()` and add a regression test for that path.
