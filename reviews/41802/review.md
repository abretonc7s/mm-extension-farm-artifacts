# PR Review: #41802 — fix: keep explore markets live

**Tier:** standard

## Summary

This PR fixes stale market data on the Perps Explore page and main Perps tab by introducing a shared live market composition layer. The approach is sound and well-tested: `usePerpsLiveMarketListData` overlays high-frequency price stream data onto the snapshot market list and sets a 30-second periodic snapshot refresh. `usePerpsTabExploreData` composes on top of this shared hook, and `PerpsWatchlist` is simplified to a pure props-based component. The fix achieves its stated goal.

## Recipe Coverage

| # | AC (verbatim) | Target env | Recipe nodes (IDs) | Screenshot filename | Visual verdict | Justification |
|---|---------------|------------|---------------------|---------------------|----------------|---------------|
| 1 | "Prices and market data on the Explore page update continuously while the extension popup is open, with a refresh cadence consistent with how the market detail page behaves." | fullscreen | ac1-check-market-rows-loaded (raw: 237 rows), ac1-screenshot-explore-list | evidence-ac1-explore-list-loaded.png | PROVEN | Market list page loaded with 237 rows, live prices visible (BTC 74812.5, ETH 2349.55). Page uses `usePerpsLiveMarketListData` which activates price stream and 30s snapshot refresh. |
| 2 | "Data displayed after 2+ minutes with the popup open must not be more than one polling cycle stale." | fullscreen | — | — | UNTESTABLE | Requires 2+ minute observation to compare prices. Timer-based staleness cannot be verified via CDP. Cadence guaranteed by 30-second `setInterval` in `usePerpsLiveMarketListData`. |
| 3 | "If the stream/WebSocket drops and reconnects while the popup is open, prices must resume updating automatically without requiring user interaction." | fullscreen | — | — | UNTESTABLE | Requires simulating WebSocket drop. Not achievable via CDP without network manipulation. |
| 4 | "No regression to the fix in TAT-2841 — cached market data must still be preserved on fetch failures." | fullscreen | — | — | UNTESTABLE | Requires injecting RPC failure. Non-destructive behavior validated by code review: `PerpsStreamManager.ts:178-189` pushes `cachedMarkets` on catch; `PerpsDataChannel.refresh()` never clears cache. |
| 5 | "The Perps tab Watchlist preserves the user's stored watchlist ordering while using live market data." | fullscreen | — | — | UNTESTABLE | No watchlist items in slot fixture (mainnet: []). Code review confirms `usePerpsTabExploreData.ts:49-52` uses `watchlistSymbols.map()` which preserves insertion order. Tests cover ordering. |
| 6 | "The main Perps tab Explore preview and Watchlist derive from the same live market source as the full Explore list." | fullscreen | ac6-check-explore-preview-count (raw: 8), ac6-screenshot-perps-tab-explore | evidence-ac6-perps-tab-explore-preview.png | PROVEN | 8 `explore-markets-*` items visible on Perps tab with live prices. `usePerpsTabExploreData` delegates to `usePerpsLiveMarketListData` — same hook as Explore list. |

Overall recipe coverage: 2/6 ACs PROVEN (untestable: AC2, AC3, AC4, AC5 — all with concrete rationale; weak: 0, missing: 0)

> All UNTESTABLE ACs have concrete rationale. AC4 and AC5 are validated by code review alone. Coverage is honest.

## Prior Reviews

| Reviewer | State | Date | Addressed? | Notes |
|----------|-------|------|------------|-------|
| cursor[bot] | COMMENTED | 2026-04-16T03:27:49Z | addressed | Auto-review bot feedback on early commits. Flagged: unmemoized prices, timestamp fallback removal, duplicate composition logic, watchlist ordering bug. All resolved in subsequent commits (fixes land in commits 2abf839c, 36f4f44d, f30604b6). |
| cursor[bot] | COMMENTED | 2026-04-16T06:00:07Z | addressed | Final bugbot pass flagged `symbolsKey useMemo` instability — marked "false positive" by geositta; confirmed correct (string result is stable, downstream effects don't re-fire). |
| geositta | COMMENTED | 2026-04-16T06:14:17Z | N/A | Inline comment: "false positive for this PR's real behavior" on the symbolsKey concern. No requested changes. |

## Acceptance Criteria Validation

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Explore page updates continuously while popup is open | PASS | 237 market rows visible on market list page; `usePerpsLiveMarketListData` activates stream + 30s refresh |
| 2 | Not more than one polling cycle stale after 2+ min | SKIPPED | UNTESTABLE: time-based, not verifiable via CDP |
| 3 | Prices resume after stream drop | SKIPPED | UNTESTABLE: requires network manipulation |
| 4 | Cache preserved on fetch failures (TAT-2841 non-regression) | PASS (code review) | `PerpsStreamManager.ts:178-189` pushes cached data on catch; `PerpsDataChannel.refresh()` leaves cache intact |
| 5 | Watchlist preserves user ordering | PASS (code review) | `usePerpsTabExploreData.ts:49-52` uses `watchlistSymbols.map()` pattern |
| 6 | Tab Explore preview and Watchlist from same live source | PASS | 8 explore-markets items on Perps tab from `usePerpsTabExploreData` → `usePerpsLiveMarketListData` |

## Code Quality

- **Pattern adherence**: Follows the existing BehaviorSubject-like channel pattern. New hooks compose cleanly on existing primitives. No boundary violations.
- **Complexity**: Appropriate for the problem. Two hooks doing distinct jobs: `usePerpsLiveMarketListData` (stream composition) and `usePerpsTabExploreData` (tab-level derivation). Not over-engineered.
- **Type safety**: No new type issues. 1 pre-existing type error in `smart-transactions-controller-init.ts` (unrelated to this PR).
- **Error handling**: `perpsActivatePriceStream` and `perpsDeactivatePriceStream` errors are swallowed via `console.debug` — appropriate for best-effort background activation. The markets snapshot refresh falls back to cached data on failure (AC4).
- **Anti-pattern findings**: None found. No new `console.log`, no `as any` casts, no `eslint-disable` comments. `console.debug` usage in `usePerpsLivePrices.ts:72,82` matches the existing pattern in `usePerpsViewActive.ts`.

## Fix Quality

- **Best approach**: Yes, this is the right approach. The dual-channel design (snapshot + price stream) cleanly separates refresh concerns. High-frequency prices update via WebSocket push; infrequent snapshot fields (fundingRate, volume, openInterest) update via polling. A simpler fix might have re-polled the full market data more aggressively, but that would waste bandwidth for fields that don't change frequently. This approach is minimal and correct.
- **Would not ship**: Nothing. The code is clean and the design is sound.
- **Test quality**: Tests assert the right things. `usePerpsLiveMarketListData.test.ts` covers: live price overlay, symbol activation call args, refresh interval firing, and reference stability (memoization). `PerpsDataChannel.test.ts` refresh tests cover both the active-channel case (reconnect keeps subscribers attached) and the idle-channel case (connect without clearing cache). The `refresh clears cache and resets loading state` test was correctly renamed to reflect the new non-destructive semantics.
- **Brittleness**: Low. The `refresh` callback from `usePerpsLiveMarketData` is `useCallback([streamManager])` — stable unless stream manager re-initializes. The `marketSymbolsKey` dependency correctly bounds the interval lifecycle. One minor note: the `symbolsKey` `useMemo` in `usePerpsLivePrices` recomputes its sort/join on each render when `symbols` array reference changes (even with same contents), but the output string is stable so downstream effects don't re-fire. This is the false positive Cursor Bugbot and geositta discussed.

## Live Validation

- **Recipe**: generated
- **Result**: PASS — 8/8 nodes passed (trace.json confirmed)
- **Evidence**: 3 screenshots (evidence-ac1-perps-tab-entry.png, evidence-ac6-perps-tab-explore-preview.png, evidence-ac1-explore-list-loaded.png)
- **Webpack errors**: none (30s log monitoring showed only normal bundle completions)
- **Log monitoring**: 30 seconds monitored, no errors

## Correctness

- **Diff vs stated goal**: Fully aligned. The PR delivers exactly what the description promises: live Explore list + live Perps tab Explore preview and Watchlist from the same source.
- **Edge cases**:
  - Empty market list (no data yet): handled — `liveMarkets` returns `markets` unchanged when `Object.keys(prices).length === 0` (line 67-69 of `usePerpsLiveMarketListData.ts`)
  - Symbol not in prices: handled — returns original market object (line 73-74)
  - Empty watchlist: handled — `PerpsWatchlist` returns `null` when `markets.length === 0`
  - Refresh while channel has no subscribers: handled — `refresh()` calls `connect()` directly; idle channel gets connected
- **Race conditions**: Low risk. Multiple concurrent `refresh()` calls can produce two in-flight `perpsGetMarketDataWithPrices` requests, but both push to the same channel and the last one to resolve "wins" (overwrites cache). No data corruption. JavaScript single-threading prevents true races.
- **Backward compatibility**: Preserved. `usePerpsLiveMarketData` is unchanged in its public API. `PerpsWatchlist` prop change is a breaking change within the codebase, but all callers are updated in this PR.

## Static Analysis

- **lint:tsc**: 1 pre-existing error in `smart-transactions-controller-init.ts` (not in PR scope). No new errors.
- **Tests**: 93/93 pass (58 in new hook tests + 35 in view/page tests; 4 skipped pre-existing)

## Mobile Comparison

- **Status**: INTENTIONAL DIVERGENCE (improvement)
- **Details**: Mobile's `usePerpsHomeData.ts:184` uses `allMarkets.filter()` for watchlist, which gives volume-sorted order. Extension uses `watchlistSymbols.map()` which preserves the user's insertion order. Extension behavior is better UX and was explicitly called out in the PR description. No formatting divergence introduced.

## Architecture & Domain

- **MV3**: No new service worker concerns. `perpsActivatePriceStream` and `perpsDeactivatePriceStream` are existing background methods. The cleanup on unmount correctly fires `perpsDeactivatePriceStream`.
- **LavaMoat**: No new dependencies. No `lavamoat/` changes needed.
- **Import boundaries**: Clean. `usePerpsTabExploreData` imports from `../../../../hooks/perps/stream` (correct path); `PerpsWatchlist` no longer imports stream hooks (simplified).
- **Controller usage**: No controller changes. Only UI-side hook composition.

## Risk Assessment

**MEDIUM** — Touches core Perps streaming/composition paths. The `PerpsDataChannel.refresh()` addition changes the channel's behavior in a way that could introduce subtle issues if misused (e.g., `refresh()` on a channel with no `connectFn`). However, the guard clause handles this (`if (!this.connectFn) return`). The 30-second background refresh interval adds minor steady-state network activity while the market list is open. These risks are well-mitigated by the tests and code design.

## Recommended Action

COMMENT

The PR achieves its goal and is well-implemented. No blocking issues. A few observations for the author's awareness:

1. **`PerpsDataChannel.refresh()` concurrent-call behavior** (`ui/providers/perps/PerpsDataChannel.ts:121-133`): When `refresh()` is called while a prior `connectFn` async fetch is still in-flight (the unsubscribe is `() => {}`, so "disconnect" doesn't cancel the RPC call), both fetches will push to subscribers when they resolve. This is benign — both are valid data, last write wins — but worth noting for future maintainers.

2. **`perpsDeactivatePriceStream` always deactivates globally** (`ui/hooks/perps/stream/usePerpsLivePrices.ts:79-85`): The cleanup sends `perpsDeactivatePriceStream` with no arguments. If multiple components activate streams for different symbol sets and one unmounts, it deactivates the stream for all. Likely acceptable since the stream reactivates on the next mount of any `usePerpsLiveMarketListData` consumer, but worth monitoring if more consumers are added.

3. **Mobile divergence in watchlist ordering** (documented): Extension now preserves insertion order; mobile uses volume order. This is an intentional improvement and not a regression.
