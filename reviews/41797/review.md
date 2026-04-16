# PR Review: #41797 — fix: Add caching to fills and marketInfo

**Tier:** standard

## Summary
This PR adds module-level caching to `usePerpsMarketFills` (30s TTL) and `usePerpsMarketInfo` (no TTL, cleared on scope change), keyed by `activeProvider + mainnet/testnet + selectedAddress`. It also updates `PerpsStreamManager` to: (1) delay REST fallbacks behind a 3s WebSocket grace period to reduce 429 rate-limit errors, (2) clear the new hook caches on stream reset/account switch, (3) track `lastStreamUpdateAt` for diagnostics, and (4) handle `markets` and `connectionState` channels that previously fell through to the unknown-channel warning. The PR achieves its stated goal of reducing REST churn on navigation.

## Recipe Coverage
Recipe skipped (standard tier, skip-no-ui-surface). All ACs are backend/hook-level caching behavior with no direct UI surface.

| # | AC | Status | Reason |
|---|-----|--------|--------|
| 1 | Fills caching with 30s TTL | UNTESTABLE | No UI surface — validated via unit tests (90/90 pass) |
| 2 | MarketInfo caching per scope | UNTESTABLE | No UI surface — validated via unit tests |
| 3 | PerpsStreamManager clears hook caches | UNTESTABLE | No UI surface — validated via unit tests + CDP eval confirming cache state |
| 4 | REST fallback delayed behind 3s WS grace period | UNTESTABLE | No UI surface — validated via unit tests |
| 5 | lastStreamUpdateAt tracking | UNTESTABLE | No UI surface — validated via CDP eval (value: 1776298721521) |
| 6 | markets/connectionState channels handled | UNTESTABLE | No UI surface — validated via unit tests |

Overall recipe coverage: 0/6 ACs PROVEN
Untestable: AC1-6 — all ACs are internal caching/data-layer behavior with no UI surface; validated via unit tests (90/90 pass) and CDP eval confirming live runtime state.

> Note: Full perps trade lifecycle smoke test passed (11/11 nodes) confirming no regression in the trade flow.

## Prior Reviews
| Reviewer | State | Date | Addressed? | Notes |
|----------|-------|------|------------|-------|
| cursor | COMMENTED | 2026-04-15 | N/A | Automated bugbot comments |
| gambinish | COMMENTED | 2026-04-15 | N/A | Comment only, no changes requested |

No CHANGES_REQUESTED reviews.

## Acceptance Criteria Validation
| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Fills REST caching with 30s TTL keyed by scope | PASS | Unit tests: warm cache skip, TTL expiry, per-account/env isolation, clear-on-reset |
| 2 | MarketInfo caching per scope | PASS | Unit tests: separate cache per env key, refetch on testnet/account change, clear-on-reset |
| 3 | Stream manager clears hook caches on reset/switch | PASS | Unit tests + CDP eval confirms live caching state |
| 4 | 3s WS grace period for REST fallback | PASS | Unit tests: skips REST when WS delivers first, fires REST after timeout |
| 5 | lastStreamUpdateAt tracking | PASS | Unit tests + CDP eval (timestamp confirmed non-zero at runtime) |
| 6 | markets/connectionState channel routing | PASS | Unit tests for channel routing |

## Code Quality
- Pattern adherence: Follows existing codebase patterns (module-level cache with `Map`, `cancelled` flag for unmount safety, `submitRequestToBackground` for RPC). Mirrors the existing `usePerpsMarketInfo` caching pattern that this PR also introduces.
- Complexity: Appropriate — the caching logic is straightforward Map-based with TTL check.
- Type safety: No type issues. `lint:tsc` passes clean.
- Error handling: Errors are caught silently (return empty arrays) which is consistent with the existing pattern — WebSocket fills still work as fallback.
- Anti-pattern findings: Minor — `PerpsStreamManager` (provider) imports from hooks (`usePerpsMarketFills`, `usePerpsMarketInfo`) for cache-clear functions. This creates a provider→hook dependency direction. However, the imported functions are module-level utilities (not React hooks), so this is pragmatic rather than problematic.

## Fix Quality
- **Best approach:** This is a pragmatic, well-scoped fix. Module-level caching with scope-keyed Maps is simple and effective. The 3s WS grace period is a smart optimization to reduce 429s. An alternative would be moving caching into the controller/background, but that would be over-engineering for this use case since the hooks are UI-layer consumers.
- **Would not ship:** Nothing blocking. All changes are well-reasoned.
- **Test quality:** Strong. Tests verify:
  - Cache warm/cold paths, TTL expiry, per-scope isolation
  - Cache clearing via explicit `clear*` functions
  - WS grace period (skip REST when WS delivers first)
  - `lastStreamUpdateAt` updates and resets
  - Unmount safety (cancelled flag)
  - Failure paths (REST errors return empty arrays)
  - Tests would fail if the fix were reverted (cache tests depend on the new module-level state).
- **Brittleness:** Low. Module-level `Map` caches are stable. The cache key (`${activeProvider}:${net}:${addressKey}`) is derived from Redux selectors, which is reliable. No import-time evaluation concerns.

## Live Validation
- Recipe: skipped (standard tier, no UI surface)
- Result: PASS — full perps trade lifecycle smoke test 11/11 pass; CDP eval confirms caching state at runtime
- Evidence: 2 screenshots (baseline.png, perps-tab.png) + CDP eval JSON
- Webpack errors: none
- Log monitoring: 30s monitored, no new build activity (stable)

## Correctness
- Diff vs stated goal: Aligned — reduces REST churn on navigation via caching
- Edge cases:
  - Account switch: covered — cache key includes address, `PerpsStreamManager.init()` clears caches
  - Testnet toggle: covered — cache key includes network
  - Provider switch: covered — cache key includes provider
  - TTL expiry: covered — fills re-fetch after 30s, market info cleared on scope change
  - Concurrent requests: covered — inflight deduplication prevents duplicate REST calls
  - Unmount before resolve: covered — module cache still populates via promise chain
- Race conditions: None — `cancelled` flag prevents stale state updates; inflight deduplication prevents concurrent fetches
- Backward compatibility: Preserved — no API changes, no state shape changes

## Static Analysis
- lint:tsc: PASS (0 errors)
- Tests: 90/90 pass (3 suites)

## Mobile Comparison
- Status: ALIGNED
- Details: The PR doesn't introduce formatting changes. The caching pattern (module-level cache keyed by scope with clear-on-reset) is architecturally similar to how mobile manages data lifecycle through its own caching layers. No new divergence introduced.

## Architecture & Domain
- MV3 implications: None — changes are in UI-layer hooks and providers, not background/service worker code.
- LavaMoat impact: None — no new dependencies or policy changes needed.
- Import boundary: Minor note — `PerpsStreamManager` (provider) imports cache-clear functions from hooks. These are module-level utilities, not React hooks, so the dependency is acceptable.
- Controller usage: Correctly uses `submitRequestToBackground` for all background RPC calls.

## Risk Assessment
- [LOW] — Changes are well-scoped to caching logic with comprehensive test coverage. No state shape changes, no new dependencies, no UI changes. Cache invalidation paths are well-covered (account switch, env toggle, explicit clear). The 3s WS grace period is a safe optimization with fallback.

## Recommended Action
APPROVE
Clean, well-tested caching implementation that achieves its stated goal. No blocking issues found.
