# PR Review: #41728 — refactor: Fix perps connectivity issues after idle

**Tier:** full

## Summary

This PR centralizes perps WebSocket recovery in the background `PerpsStreamBridge`, replacing scattered UI-level refetches with a single reconnect→hydrate pipeline. It adds three recovery triggers: (1) WS disconnect→reconnect transition hydrates REST snapshots, (2) visibility-based health check after 30s hidden, (3) offline→online triggers reconnect. It also sets `fallbackHip3AllowlistMarkets: ['xyz:*']` so HIP-3 markets are included from first paint without waiting for LaunchDarkly.

The approach is sound — moving recovery to the background is the right architectural call. The hydration sequence token (`#hydrationSeq`) properly guards against stale finally blocks. The PR achieves its stated goals for connectivity recovery and HIP-3 market availability.

Note: The balance double-count fix (AC2) was reverted in commit 266d9768 and is not present in the final diff.

## Recipe Coverage

| # | AC (verbatim) | Target env | Recipe nodes (IDs) | Screenshot filename | Visual verdict | Justification |
|---|---------------|------------|---------------------|---------------------|----------------|---------------|
| 1 | "After long idle, sleep, or connectivity loss, users could see an empty Perps state — perps state recovers automatically via background REST hydration after WS reconnect" | fullscreen | ac1-eval-connection-state, ac1-screenshot-connection | evidence-ac1-connection-state.png | UNTESTABLE | Cannot simulate idle/sleep/WS disconnect via CDP. Verified API availability: `perpsGetConnectionState` returns "connected". Unit tests (6 connection-state + 4 hydration tests) cover logic. |
| 2 | "Total balance no longer double-counts PnL" | fullscreen | (none) | (none) | UNTESTABLE | Balance fix reverted in commit 266d9768. AC out of scope for current diff. |
| 3 | "HIP-3 markets show correct prices on first paint via fallback allowlist ['xyz:*']" | fullscreen | ac3-screenshot-perps-tab, ac3-navigate-eth-market, ac3-wait-eth-price, ac3-assert-eth-price, ac3-screenshot-eth-price, ac3-eval-hip3-markets, ac3-screenshot-hip3-eval | evidence-ac3-perps-tab-hip3.png, evidence-ac3-eth-price.png, evidence-ac3-hip3-markets-eval.png | PROVEN | Perps tab shows prices (BTC $74,594, ETH $2,353.4). ETH market detail shows $2,353.4 (not $---). Eval confirms 64 HIP-3 markets with xyz: prefix present in universe. |
| 4 | "Rapid navigation between markets keeps data stable" | fullscreen | ac4-navigate-btc, ac4-wait-btc, ac4-assert-btc-price, ac4-navigate-back-eth, ac4-wait-eth-again, ac4-assert-eth-stable, ac4-navigate-atom, ac4-wait-atom, ac4-assert-atom-price, ac4-screenshot-rapid-nav | evidence-ac4-rapid-navigation-atom.png | PROVEN | Rapid ETH→BTC→ETH→ATOM in ~193ms. All price assertions passed. ATOM shows stable stats. |
| 5 | "After tab hidden >=30s, on visible again, perpsCheckHealth nudges WS reconnect" | fullscreen | ac5-eval-perps-check-health, ac5-screenshot-health-check | evidence-ac5-health-check-api.png | UNTESTABLE | Cannot simulate tab visibility change via CDP. API confirmed callable (healthCheckAvailable: true). Code review + unit tests confirm logic. |
| 6 | "Offline->online transition triggers WS reconnect if disconnected" | fullscreen | ac6-eval-reconnect-api, ac6-screenshot-reconnect | evidence-ac6-reconnect-api.png | UNTESTABLE | Cannot simulate device offline→online via CDP. API confirmed callable. Code review + unit tests confirm logic. |

Overall recipe coverage: 2/6 ACs PROVEN
Untestable: AC1 (requires real WS disconnect), AC2 (reverted), AC5 (requires visibility API), AC6 (requires network state change)

> Coverage note: The 4 UNTESTABLE ACs all involve triggering external state transitions (WS disconnect, device offline, tab visibility) that CDP cannot simulate. All have unit test coverage and API availability was confirmed via service worker eval. Human reviewer should manually test idle recovery (AC1) and visibility health check (AC5) by leaving the extension idle for >30s.

## Prior Reviews

No prior reviews with CHANGES_REQUESTED found.

## Acceptance Criteria Validation

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Idle/connectivity recovery via background hydration | PASS (code review + API check) | `perpsGetConnectionState` returns "connected"; 150/150 unit tests pass including 6 connection-state + 4 hydration tests |
| 2 | Balance double-count fix | N/A | Reverted in commit 266d9768, not in final diff |
| 3 | HIP-3 markets show prices | PASS | 64 HIP-3 markets in universe; ETH $2,353.4 displayed (not $---) |
| 4 | Rapid navigation stability | PASS | ETH→BTC→ETH→ATOM in 193ms, all prices stable |
| 5 | Visibility health check | PASS (code review + API check) | `perpsCheckHealth` callable; visibility listener in perps-layout.tsx with 30s threshold |
| 6 | Offline→online reconnect | PASS (code review + API check) | `perpsReconnect` callable; ConnectivityController wired in metamask-controller.js |

## Code Quality

- **Pattern adherence**: Follows existing bridge pattern well. Private class fields, proper unsub management, fire-and-forget with `.catch()`.
- **Complexity**: Appropriate for the problem. Hydration sequence token is a clean guard against stale state.
- **Type safety**: Good. Local `WebSocketConnectionState` enum avoids ESM import issues with Jest. Types are explicit.
- **Error handling**: Adequate — REST hydration failures are caught and logged, WS reconnect errors swallowed with `console.debug`. Fire-and-forget in UI correctly `.catch()`es.
- **Anti-pattern findings**: None significant. No import boundary violations, no `as any` casts, no `eslint-disable`.

## Fix Quality

- **Best approach**: Yes, centralizing recovery in the background bridge is the right architecture. The per-page visibility refetch in `perps-market-detail-page.tsx` was correctly removed (was duplicative and racy). The staggered hydration (markets first, then user data after 200ms) is pragmatic for rate limiting.
- **Would not ship**: No blockers. All changes are reasonable and well-guarded.
- **Test quality**: Strong. 150 tests total. Connection state handling has 6 tests including hydration verification. Connectivity change handling has 4 tests. Mock setup is thorough with proper `subscribeToConnectionState`, `reconnect`, and REST method mocks. Tests verify specific call args and state transitions.
- **Brittleness**: Low. The `#hydrationSeq` token guards against stale finally blocks. The `#lastMarketCacheKey` timestamp-based dedup prevents redundant market emissions. `destroy()` properly resets all new state fields.

## Live Validation

- Recipe: generated
- Result: PASS — 25/25 nodes passed (from trace.json)
- Evidence: 7 screenshots + review.mp4
- Webpack errors: none
- Log monitoring: webpack stable during recipe run

## Correctness

- **Diff vs stated goal**: Aligned. All claimed recovery mechanisms are implemented.
- **Edge cases**:
  - Covered: overlapping hydrations (guarded by `#isHydrating` + seq token), stale finally blocks, destroy during hydration
  - Covered: WS already connected when connectivity changes (no-op correctly)
  - Minor gap: `#handleMarketDataPreload` hardcodes `'hyperliquid'` as default provider (line 360) — documented in comment as single-provider limitation. Acceptable for now.
- **Race conditions**: Well-handled. The hydration sequence token prevents stale callbacks. `Promise.allSettled` ensures partial failures don't block other fetches.
- **Backward compatibility**: Preserved. New constructor params (`onControllerStateChange`, `onConnectivityChange`) are additive. Existing bridge API methods unchanged.

## Static Analysis

- lint:tsc: PASS (2 pre-existing errors not from this PR: app-state-controller.ts, metametrics-controller.ts)
- Tests: 150/150 pass (perps-stream-bridge.test.ts)

## Mobile Comparison

- Status: ALIGNED
- Details: Mobile handles connectivity recovery via its own stream manager with similar REST hydration after reconnect. The extension's approach (centralizing in background bridge, fire-and-forget health check from UI) is architecturally appropriate for the MV3 service worker model. No formatting divergence — this PR doesn't touch price display formatting.

## Architecture & Domain

- **MV3 implications**: Good. Health check and reconnect logic live in the background bridge (service worker), not the UI. This is correct for MV3 where the service worker can outlive UI pages.
- **LavaMoat impact**: None — no new dependencies added, no policy changes needed.
- **Import boundary**: Clean. Local `WebSocketConnectionState` enum avoids pulling ESM-only Hyperliquid SDK into Jest. The `@metamask/perps-controller` types are imported properly.
- **Controller usage**: Proper messenger wiring in `metamask-controller.js` — subscribes to `PerpsController:stateChange` and `ConnectivityController:stateChange` with correct unsubscribe returns.

## Risk Assessment

MEDIUM — The PR adds background-triggered REST hydration and WS reconnect logic that runs automatically on state transitions. While well-guarded against races, the hydration makes 4 REST calls (markets, positions, orders, account) after every reconnect. Under flaky network conditions with rapid disconnect/reconnect cycles, this could create burst pressure on the Hyperliquid API. The `#isHydrating` guard prevents overlapping runs but doesn't debounce rapid successive reconnects.

## Recommended Action

COMMENT

The PR is well-implemented and achieves its goals. Two suggestions for consideration:

1. **perps-stream-bridge.ts:383** — `#hydrateAfterReconnect` guards against concurrent runs via `#isHydrating` but doesn't debounce rapid successive reconnects (disconnect→connect→disconnect→connect in quick succession). Consider adding a minimum interval between hydrations to prevent burst REST calls under flaky networks.

2. **perps-controller-init.ts:73** — The hardcoded `fallbackHip3AllowlistMarkets: ['xyz:*']` is correct for current HIP-3 markets. Be aware this includes ALL `xyz:` prefixed markets — if new non-HIP-3 markets use `xyz:` prefix in the future, they'll be auto-included. The LaunchDarkly override provides the escape hatch.
