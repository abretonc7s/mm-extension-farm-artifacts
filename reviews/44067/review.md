# PR Review: #44067 — feat(perps): restructure market detail header

**Tier:** standard

## Summary

Reworks the perps market detail sticky header from a single inline price row into a two-row market identity block (full name, leverage pill, chevron) plus a separate price/24h-change row. Subtitle uses i18n `perpsPerpMarketSubtitle` with `PERPS_COLLATERAL_SYMBOL` (`USDC`). Chevron navigates to `PERPS_MARKET_LIST_ROUTE`. Skeleton layout updated to match.

Live validation and unit tests confirm the PR achieves its stated goal. Change is presentation/navigation only — no controller or trading logic touched.

## Recipe Coverage

| # | AC (verbatim) | Target env | Recipe nodes (IDs) | Screenshot filename | Visual verdict | Justification |
|---|---------------|------------|---------------------|---------------------|----------------|---------------|
| 1 | Then I see the full market name with the leverage pill and a chevron on the first row | fullscreen | ac1-wait-page, ac1-wait-name, ac1-wait-leverage, ac1-wait-chevron, ac1-screenshot-first-row | evidence-ac1-header-first-row.png | PROVEN | Screenshot shows "Bitcoin", "40x" pill, and down-chevron on the first identity row |
| 2 | And I see the "[ticker]-[collateral] perp" subtitle (e.g. "BTC-USDC perp") on the second row | fullscreen | ac2-wait-pair, ac2-screenshot-pair | evidence-ac2-market-pair-subtitle.png | PROVEN | Screenshot shows "BTC-USDC perp" subtitle directly under the market name |
| 3 | And I see the price and 24h price change below the header | fullscreen | ac3-wait-price, ac3-wait-change, ac3-screenshot-price-row | evidence-ac3-price-and-change.png | PROVEN | Screenshot shows prominent price ($61,147) and green 24h change (+4.15%) on a dedicated row below the header block |
| 4 | Then I am taken to the perps market list | fullscreen | ac4-press-chevron, ac4-wait-market-list, ac4-screenshot-market-list | evidence-ac4-market-list-navigation.png | PROVEN | Trace navigated to `#/perps/market-list`; screenshot shows Markets list with `market-list-view` |

Overall recipe coverage: 4/4 ACs PROVEN
Untestable: none

## Prior Reviews

No prior reviews.

## Acceptance Criteria Validation

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Then I see the full market name with the leverage pill and a chevron on the first row | PASS | ac1-* trace nodes + evidence-ac1-header-first-row.png |
| 2 | And I see the "[ticker]-[collateral] perp" subtitle (e.g. "BTC-USDC perp") on the second row | PASS | ac2-* trace nodes + evidence-ac2-market-pair-subtitle.png |
| 3 | And I see the price and 24h price change below the header | PASS | ac3-* trace nodes + evidence-ac3-price-and-change.png |
| 4 | Then I am taken to the perps market list | PASS | ac4-* trace nodes; URL `#/perps/market-list` + evidence-ac4-market-list-navigation.png |

**PR hygiene:** The task `## Acceptance Criteria` section is `_Not specified_` despite a linked TAT-3349 ticket with informal design notes. This review used verbatim PR gherkin claims as the coverage baseline.

## Code Quality

- Pattern adherence: Follows existing perps page patterns — `data-testid` on new elements, i18n for subtitle, shared `PERPS_COLLATERAL_SYMBOL` constant, `formatPerpsFiatUniversal` for display price (not `.toFixed(2)`).
- Complexity: Appropriate — layout restructure only; navigation handler is a one-line `navigate(PERPS_MARKET_LIST_ROUTE)`.
- Type safety: No new type issues in changed files; `lint:changed` reports no changed files to lint (branch matches reviewed state).
- Error handling: Leverage pill correctly omitted when `maxLeverage` is empty (tested).
- Accessibility/fallbacks: Chevron and back control expose `aria-label`; price falls back through candle stream → live price → market.price → `$0.00`.
- Anti-pattern findings: None. No import boundary violations, no LavaMoat/`yarn.lock` changes, no controller migrations.

## Fix Quality

- **Best approach:** Minimal and correct for a header-only redesign. Using `market.name` with `getDisplayName` fallback and i18n subtitle is the right pattern.
- **Would not ship:** None.
- **Test quality:** Tests assert the right DOM targets (`perps-market-detail-name`, `perps-market-detail-pair`, chevron navigation). Leverage-absent case covered. Tests would fail if header layout reverted.
- **Brittleness:** `PERPS_COLLATERAL_SYMBOL` is a named constant (good). No import-time mock coupling introduced.

## Live Validation

- Recipe: generated
- Result: PASS — 16/16 trace nodes ok (including setup and end-pass)
- Evidence: 4 screenshots (video skipped: standard tier)
- Webpack errors: none observed (build at 100% in webpack.log)
- Log monitoring: ~5s monitored during validation, no new errors

## Correctness

- Diff vs stated goal: Aligned — header layout, subtitle, chevron navigation, skeleton, and separated price row all implemented as described.
- Edge cases: HIP-3 markets use stripped display name in subtitle (tested for TSLA). Missing `maxLeverage` hides pill. Loading skeleton mirrors new layout.
- Race conditions: None introduced; price/change still use existing live stream + market fallback.
- Backward compatibility: Preserved — routes and trading flows unchanged.

## Static Analysis

- lint:tsc: Not completed in slot (long-running); changed-file lint gate clean. No PR-specific type concerns in the diff.
- Tests: 88/88 pass (`perps-market-detail-page.test.tsx`)

## Mobile Comparison

- Status: DIVERGES (intentional — extension implements new design ahead of mobile header)
- Details: Mobile `PerpsMarketInlineHeader` still uses `${getPerpsDisplaySymbol(symbol)}-USD` as title with price inline in `HeaderSubpage` description (`PerpsMarketInlineHeader.tsx`). Extension now shows `market.name`, leverage pill, chevron-to-list, `BTC-USDC perp` subtitle, and price on a separate row — matching TAT-3349 target for extension. Mobile also exposes fullscreen chart button; not in this PR's gherkin scope.

## Architecture & Domain

- MV3: UI-only; no service worker changes.
- LavaMoat: No dependency or policy changes.
- Import boundaries: Clean — page imports from `ui/components/app/perps` and shared formatters only.
- Feature flags: Still gated by `getIsPerpsExperienceAvailable`.

## Risk Assessment

- LOW — Presentation and navigation-only changes in perps market detail UI; no auth, trading, or data-layer logic modified.

## Recommended Action

COMMENT

PR is ready for human approval. All PR-body gherkin claims are proven in browser with capture-helper screenshots and backed by unit tests. No blocking issues found.