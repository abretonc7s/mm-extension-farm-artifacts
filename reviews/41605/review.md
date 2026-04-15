# PR Review: #41605 — fix(perps): use locale-independent formatting for TP/SL internal state

**Tier:** standard

## Summary

This PR fixes TP/SL editing in non-English locales by replacing locale-aware `formatNumber()` with locale-independent `toFixed(2)` for internal price state in the update-TPSL modal. This prevents `parseFloat`/regex breakage during percent↔price round-trips. Additionally, it adds estimated PnL display to the order entry's AutoCloseSection (previously only in the update modal), replaces the hardcoded `HYPERLIQUID_TAKER_FEE_RATE` with dynamic rates from `usePerpsOrderFees`, and extracts `getPnlDisplayColor` to a shared util.

The PR achieves its stated goals. The locale fix is correct and minimal. The estimated PnL feature is a reasonable addition.

## Recipe Coverage

Recipe skipped (standard tier, skip-locale-dependent). ACs 1-3 and 5 are locale-dependent bugs best verified by code review + unit tests (the fix is a `formatNumber` → `toFixed` swap — CDP can't switch app locale to German). AC4 is a new UI feature verified via CDP navigation (AutoCloseSection renders, toggle present). Full-trade-lifecycle smoke test passed 11/11.

| # | AC | Status | Rationale |
|---|-----|--------|-----------|
| 1 | Preset buttons produce correct prices in non-English locale | UNTESTABLE | Locale-dependent — verified by code review + unit tests (preset assertions check `3087.50` not `3,087.50`) |
| 2 | TP/SL price fields editable after preset click | UNTESTABLE | Locale-dependent — verified by code review + unit tests |
| 3 | Percent field is editable | UNTESTABLE | Locale-dependent — verified by code review + unit tests |
| 4 | Estimated gain/loss shown in order entry | UNTESTABLE | Requires TP/SL interaction in live browser with funded position; CDP confirmed AutoCloseSection renders with toggle |
| 5 | Estimated PnL values are correct | UNTESTABLE | Locale-dependent — verified by code review + unit tests |

Overall recipe coverage: 0/5 ACs PROVEN
Untestable: AC1-5 — locale-dependent bug fix, CDP cannot switch app locale; unit tests verify correctness

> ⚠ Coverage escalation: AC1-5 not proven in browser.
>   Reason: Locale-dependent formatting bug — reproducing requires German locale which CDP cannot configure. Code review confirms `formatNumber` → `toFixed(2)` swap is correct. Unit tests verify preset values output dot-decimal (e.g. `3087.50` not `3,087.50`). Smoke test confirms perps trade lifecycle works.
>   Human reviewer must validate manually before merging.

## Prior Reviews

| Reviewer | State | Date | Addressed? | Notes |
|----------|-------|------|------------|-------|
| cursor (bugbot) | COMMENTED | 2026-04-15 09:06, 09:24, 11:17 | N/A (automated) | Bugbot comments |
| geositta | COMMENTED | 2026-04-15 15:30 | **unaddressed** | Flagged `closingFeeRate ?? 0` showing fee-free PnL while loading — 0 commits after review |

geositta's feedback is valid and unaddressed: the `closingFeeRate ?? 0` fallback in all 4 PnL memos shows inflated (fee-free) estimated PnL while `usePerpsOrderFees` is loading or on error. See Fix Quality section for details.

## Acceptance Criteria Validation

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Presets produce correct prices in non-English locale | PASS | Code review: `formatEditPrice` now uses `toFixed(2)` (locale-independent). Tests assert `3087.50` not `3,087.50`. |
| 2 | TP/SL fields editable after preset | PASS | Code review: `toFixed(2)` produces dot-decimal strings accepted by `isUnsignedDecimalInput` regex. |
| 3 | Percent field editable | PASS | Code review: percent→price→percent round-trip uses `toFixed(2)` internally, no locale formatting in path. |
| 4 | Estimated gain/loss in order entry | PASS | Code review: new `estimatedPnlAtTp`/`estimatedPnlAtSl` memos added to AutoCloseSection with display rows. CDP confirms toggle renders. |
| 5 | Correct estimated PnL | PASS | Code review: PnL calculations use `Number.parseFloat` on dot-decimal strings. Dynamic fee rate replaces hardcoded constant. |

## Code Quality

- **Pattern adherence**: Follows codebase conventions — `useMemo` for derived values, proper `useCallback` for handlers, `data-testid` on new elements.
- **Complexity**: Appropriate. PnL calculation duplicated across 2 components (4 memos), but each has different input sources — acceptable pragmatic choice.
- **Type safety**: New `estimatedSize` and `asset` props properly typed in `AutoCloseSectionProps`. No `as any` casts.
- **Error handling**: PnL memos guard against NaN/zero/undefined inputs correctly.
- **Anti-pattern findings**: None. Import boundaries respected. No `chrome.runtime.getBackgroundPage()`. No missing `data-testid`. No LavaMoat policy update needed.

## Fix Quality

- **Best approach**: Yes. The `formatNumber` → `toFixed(2)` swap for internal state is the minimal correct fix. `toFixed()` is locale-independent by ECMAScript spec. Display-only contexts still use locale-aware `formatCurrencyWithMinThreshold`. This matches mobile's approach.
- **Would not ship** (suggestion, not blocker): `closingFeeRate ?? 0` at 4 locations (`auto-close-section.tsx:302,316`, `update-tpsl-modal-content.tsx:216,230`) shows inflated PnL while fee rate loads. Should add `closingFeeRate === undefined` to the null guard so the PnL row stays hidden until the rate resolves. This echoes geositta's unaddressed review comment.
- **Test quality**: Good. Tests assert specific dot-decimal values (verifying the locale fix would fail if reverted). New `usePerpsOrderFees` mock added to all test files. `getPnlDisplayColor` has dedicated unit tests. Locale-specific test added for German locale.
- **Brittleness**: Low. `toFixed(2)` is stable across all JS engines. `usePerpsOrderFees` has proper request-id staleness protection.

## Live Validation

- Recipe: skipped (standard tier, locale-dependent)
- Result: PASS — smoke test 11/11, CDP navigation to affected screens successful
- Evidence: 5 screenshots (baseline, perps-home, eth-market-detail, order-entry, final-state)
- Webpack errors: none
- Log monitoring: 30s monitored, no errors

## Correctness

- **Diff vs stated goal**: Aligned. Locale fix + estimated PnL addition + dynamic fee rates — all as described.
- **Edge cases**:
  - `closingFeeRate` undefined during loading → PnL shows without fees (inflated). Should hide row. See suggestion above.
  - `estimatedSize` with zero amount → correctly returns `undefined` (row hidden).
  - Limit order mode → correctly uses limit price as fill price for `estimatedSize` and `pnlEntryPrice`.
- **Race conditions**: None. `usePerpsOrderFees` has request-id staleness protection.
- **Backward compatibility**: Preserved. No controller state changes, no new migrations needed.

## Static Analysis

- lint:tsc: PASS — 2 pre-existing errors (not in PR files: app-state-controller.ts, metametrics-controller.ts)
- Tests: 222/222 pass (4 test suites: auto-close-section, update-tpsl-modal-content, utils, perps-market-detail-page)

## Mobile Comparison

- Status: ALIGNED
- Details: `toFixed(2)` for internal state matches mobile's locale-independent approach. `formatCurrencyWithMinThreshold` for display PnL is the correct interim per the mobile-extension map. Dynamic fee rates via `usePerpsOrderFees` aligns with mobile's `usePerpsOrderFees`. `getPnlDisplayColor` logic (green/red/neutral) matches mobile's pattern.

## Architecture & Domain

- **MV3**: No impact — all changes are in UI components/hooks, no service worker changes.
- **LavaMoat**: No impact — no new dependencies, yarn.lock unchanged.
- **Import boundaries**: Clean — all imports within `ui/components/app/perps/` and `ui/hooks/perps/`.
- **Controller usage**: Correctly uses `usePerpsOrderFees` hook (which calls `submitRequestToBackground('perpsCalculateFees')`) instead of hardcoded constants.

## Risk Assessment

- **MEDIUM** — Touches perps TP/SL inputs and PnL calculations. The locale fix is correct and well-tested. The `closingFeeRate ?? 0` loading state concern is minor (briefly inflated PnL, not a data loss risk) but should be addressed before merge.

## Recommended Action

COMMENT

Specific items:
1. **(suggestion)** `closingFeeRate ?? 0` at `auto-close-section.tsx:302,316` and `update-tpsl-modal-content.tsx:216,230`: Add `closingFeeRate === undefined` to the null guard so estimated PnL rows stay hidden while the fee rate loads. This was flagged by geositta and is still unaddressed. Simple fix — change the guard in all 4 memos from:
   ```ts
   if (!estimatedSize || !takeProfitPrice || !pnlEntryPrice) {
   ```
   to:
   ```ts
   if (!estimatedSize || !takeProfitPrice || !pnlEntryPrice || closingFeeRate === undefined) {
   ```
2. All other changes look correct and well-tested.
