# PR Review: #41606 — fix(perps): sort Explore Markets by 24h trading volume descending

**Tier:** standard

## Summary

The PR fixes the Explore Markets section on the Perps home tab to sort markets by 24h trading volume descending. It achieves the stated goal: markets are now sorted correctly. The implementation also refactors the component props from separate `cryptoMarkets`/`hip3Markets` arrays to a single unified `markets` array (top 10 by volume), aligning the extension's approach with how mobile handles the same screen.

Live validation confirmed markets render in correct order: BTC ($2.3B) → xyz-CL ($1.4B) → ETH ($1.1B) → xyz-BRENTOIL ($708.7M) → ... → SOL ($198.5M).

## Prior Reviews

| Reviewer | State | Date | Addressed? | Notes |
|----------|-------|------|------------|-------|
| cursor[bot] | COMMENTED | 2026-04-09T12:08Z | Addressed | Flagged missing slice after removing `.slice(0,5)`. Fixed in f8ccae8f by adding `.slice(0,10)` inside the component. |
| cursor[bot] | COMMENTED | 2026-04-09T12:12Z | Intentional | Flagged that unified top-10 may exclude HIP-3 if crypto dominates. Author confirmed intentional per task. Validated live: HIP-3 equity markets (CL, BRENTOIL, SP500) do appear when volume is competitive. |

## Acceptance Criteria Validation

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Markets sorted by 24h trading volume, highest first | PASS | Live CDP eval confirmed order: BTC $2.3B → CL $1.4B → ETH $1.1B → BRENTOIL $708.7M → SP500 $341.5M → HYPE $282.8M → XYZ100 $269.2M → SILVER $247.8M → FARTCOIN $231.7M → SOL $198.5M (strictly descending) |
| 2 | Top markets displayed are highest-volume ones | PASS | Unified top-10 includes both crypto and HIP-3 markets ranked by volume. 5 HIP-3 markets visible in top 10 in live data. |

## Code Quality

- **Pattern adherence:** Follows existing codebase patterns. The `filter().sort()` approach is consistent with how `activeMarkets` was already filtered. `useCallback` with empty deps is stable.
- **Complexity:** Appropriate — minimal lines added, reuses existing `parseVolume` utility.
- **Type safety:** No issues. `yarn lint:tsc` passes with exit 0.
- **Error handling:** Not applicable — sort comparator is pure numeric arithmetic, no error states.
- **Anti-pattern findings:**
  - `ui/hooks/perps/stream/usePerpsLiveMarketData.ts:4` imports from `pages/perps/utils/sortMarkets`. This is an architectural concern (hooks importing from pages layer), but it is a **pre-existing pattern** already established in `ui/components/app/perps/utils.ts:3`. This PR did not introduce the pattern — it follows it. Flagged as a suggestion for future cleanup rather than a blocker.

## Fix Quality

- **Best approach:** The sort is applied once on `activeMarkets` before the crypto/HIP-3 split, which means both derived arrays inherit the sort. This is correct and efficient. A slightly better long-term approach would be to move `parseVolume` to a shared utility location (e.g., `ui/components/app/perps/utils.ts`) so hooks don't import from the pages layer, but this is out of scope for this PR.
- **Would not ship:** Nothing. All concerns are minor or pre-existing.
- **Test quality:** The new test (line 249) explicitly asserts that both `cryptoMarkets` and `hip3Markets` are returned in volume-descending order. It tests the right thing. Failure paths (e.g., equal volumes, undefined volumes) are covered by the existing `parseVolume` tests in `sortMarkets.test.ts`. Existing test at line 99 now implicitly also verifies sort order (BTC before ETH), which is a minor bonus.
- **Brittleness:** None. `compareByVolumeDesc` is wrapped in `useCallback([])` — stable since `parseVolume` is module-level. `filter().sort()` creates a fresh array, no state mutation.

## Live Validation

- Recipe: skipped (tier: standard)
- Result: PASS — CDP eval confirmed correct market order in live browser
- Evidence: 2 screenshots in `artifacts/evidence/` (baseline.png, perps-explore-final.png)
- Webpack errors: none
- Log monitoring: 30s monitored, no errors or warnings

## Correctness

- **Diff vs stated goal:** Aligned. Markets are now sorted by volume descending.
- **PR description accuracy:** The PR body's manual testing step says "top 5 crypto markets and top 5 HIP-3 markets" — this is **outdated**. The final implementation shows a unified top-10 list (not 5+5 per category). This is an inconsistency in the PR description, not in the code.
- **Edge cases:**
  - Zero-volume markets: already filtered by `hasVolume` before sort — no risk of zero-volume markets appearing.
  - Undefined volume: `parseVolume(undefined)` returns -1, these markets sort to the bottom (then filtered by `hasVolume` anyway).
  - Equal volumes: sort is stable in V8 — original stream order preserved for ties.
- **Race conditions:** None introduced. Sort is applied in a `useMemo` that re-runs on `markets` state change.
- **Backward compatibility:** `cryptoMarkets` and `hip3Markets` are still returned from the hook (preserving any callers). The `PerpsExploreMarkets` component prop changed from `{cryptoMarkets, hip3Markets}` to `{markets}` — this is a breaking change for any other consumers of `PerpsExploreMarkets`. Grep confirms no other callers exist.

## Static Analysis

- lint:tsc: PASS (exit 0, no errors)
- Tests: 8/8 pass (`usePerpsLiveMarketData.test.ts`)

## Mobile Comparison

- Status: ALIGNED
- Details: Mobile's `usePerpsTabExploreData` hook (mobile-ref) uses `EXPLORE_MARKETS_LIMIT = 8` and shows "all market types, top 8 by volume" from a unified sorted list. Extension uses top 10. The pattern is the same: one unified list sorted by volume, sliced to a limit. Minor limit divergence (8 vs 10) is acceptable.

## Architecture & Domain

- No MV3 service worker impact (pure UI/hook change).
- No LavaMoat policy changes needed (no new npm packages).
- No import boundary violations beyond the pre-existing `hooks → pages` pattern.
- `data-testid` values changed from `explore-crypto-${symbol}` / `explore-hip3-xyz-${symbol}` to `explore-markets-${symbol.replace(/:/g,'-')}`. Grep confirms no E2E tests reference the old testids. TASK.md and other agent docs still reference old testids — those docs should be updated separately.

## Risk Assessment

- **LOW** — Pure data-ordering change in the UI layer. No controller, background, or storage impact. Sort logic reuses a proven utility (`parseVolume`) already covered by tests. Live validation confirms correct behavior.

## Recommended Action

COMMENT

- The PR achieves its goal and is safe to merge.
- Suggested improvement before merge: Update the manual testing steps in the PR body to reflect the actual implementation (unified top-10 list, not "5 crypto + 5 HIP-3"). This prevents QA confusion.
- Optional follow-up (not blocking): Move `parseVolume` to `ui/components/app/perps/utils.ts` or a shared location to avoid hooks importing from the pages layer.
