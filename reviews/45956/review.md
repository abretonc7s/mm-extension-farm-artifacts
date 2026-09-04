# PR Review: #45956 — feat(perps): add market category pills to the Perps tab

**Tier:** standard
**Frozen scope:** `b1e7ba39..73d7e956`
**Current branch head checked:** `03a60229`

## Summary

The PR adds live-data category pills to the Perps tab, shares category matching with the destination list, and navigates through `?filter=`. It also expands into a market-list redesign with a measured More menu, header search/watchlist controls, and a market count.

The core data flow is sound, but the custom overflow implementation has deterministic layout and focus failures. There are also RTL, accessible-name, loading-copy, analytics, and E2E page-object regressions. The PR body and inherited recipe still describe the superseded horizontal-scroll and FilterSelect UI.

The linked Jira exists, but the normalized Acceptance Criteria section is `_Not specified_`. This review uses the four verbatim manual-testing claims from the PR body and does not expand scope from ticket-only text.

## Recipe Coverage

Recipe decision: `skip-static-code-contract`. The execution contract prohibited CDP, recipe execution, and screenshots. The inherited recipe is not valid for `73d7e956`: it asserts `.overflow-x-auto` and `filter-select-button`, both removed by the frozen diff.

| # | Review claim (verbatim) | Target env | Recipe nodes | Screenshot | Verdict | Justification |
|---|---|---|---|---|---|---|
| 1 | "Confirm a row of category pills renders under the Withdraw / Add funds buttons — `All` plus each category present in live market data (currently Crypto, Stocks, Commodities)." | fullscreen | none | none | UNTESTABLE | Static-only contract. Source wiring and unit tests support the claim, but no current runtime evidence was permitted. |
| 2 | "Narrow the window until the pills overflow and confirm the row scrolls horizontally instead of wrapping or clipping." | fullscreen | none | none | UNTESTABLE | Static-only contract. The claim is stale: source explicitly clips the row and moves overflow to More. |
| 3 | "Click `Crypto`. The market list opens at `#/perps/market-list?filter=crypto` with the filter dropdown already reading `Crypto`." | fullscreen | none | none | UNTESTABLE | Static-only contract. The route remains, but FilterSelect was removed and replaced by an active category pill. |
| 4 | "Go back, then Tab to a pill and press Enter — it navigates the same way a click does." | fullscreen | none | none | UNTESTABLE | Static-only contract. A focused-pill unit test passes, but there was no current browser keyboard run. |

Overall recipe coverage: 0/4 review claims PROVEN
Untestable: 1-4, because this review was restricted to static code analysis

## Prior Reviews

| Reviewer | State | Date | Addressed? | Notes |
|---|---|---|---|---|
| geositta | CHANGES_REQUESTED | 2026-09-03T00:24:51Z | addressed | Three later commits. `40ec3706` replaced horizontal scrolling with measured More overflow; `73d7e956` and `03a60229` added follow-up fixes. |
| cursor[bot] | COMMENTED | 2026-09-03T15:23:54Z | addressed | Two later commits. `03a60229` now focuses the first More option when `selectedId` is null and adds tests, so that finding is not repeated. |

Previous static-review items:
- Fixed: the keyboard test now focuses the pill directly instead of assuming two preceding Tab stops.
- Open: the PR description/manual steps still specify horizontal scroll and FilterSelect.

## Review Claims Validation

| # | Criterion | Status | Evidence |
|---|---|---|---|
| 1 | Live category pills appear under the balance actions | PASS (code), UNTESTABLE live | `PerpsView` places `PerpsMarketCategories` after balance actions; the hook derives `all` plus categories present in live markets. |
| 2 | Narrow overflow scrolls horizontally | FAIL against source | `PerpsCategoryRail` uses `overflow-x-clip` and a More menu by design. Update the PR claim. |
| 3 | Crypto route opens with a Crypto dropdown | FAIL as written | Navigation and URL parsing remain; the destination now shows an active Crypto pill, not a dropdown. Update the PR claim. |
| 4 | Keyboard activation navigates | PASS (unit), UNTESTABLE live | Native button markup and the focused-pill Enter test pass. The separate More-menu focus defects below remain. |

## Code Quality

- Pattern adherence: functional components, typed filter IDs, MMDS controls, colocated tests, and stable test IDs follow project conventions.
- Complexity: the measured overflow hook is more fragile than its tests reveal because it measures a budget that changes when More mounts.
- Type safety: `yarn lint:tsc` passed.
- Error handling: unknown URL filters fall back to `all`; no controller or persistence changes.
- Accessibility/fallbacks: native pills and the named rail group are good. The More listbox is unnamed, overflow selection can drop focus, RTL positioning clips the menu, and the loading count reports a false zero.
- Anti-pattern scan: no import-boundary, LavaMoat, MV3, dependency, or migration issue found.
- Runtime note: each reported runtime manifestation was traced through source with concrete state transitions; CDP validation was unavailable under the static-code contract.

## Fix Quality

- **Best approach:** keep the shared `marketMatchesCategory` data path. For overflow, measure a stable outer container and the trigger separately, key intrinsic-width invalidation to rendered labels/locale, and transfer focus explicitly after an overflow selection.
- **Would not ship:** the history-dependent fit calculation, overflow-selection focus loss, unnamed listbox, RTL-offscreen menu, or misleading loading count.
- **Test quality:** 92 tests across six affected suites pass. The rail tests use fixed equal widths and a no-op `ResizeObserver`, so they do not cover shrink-then-grow history, long translations, locale changes, or focus after choosing More. The E2E page object cannot open the new hidden search input or select a category currently under More.
- **Brittleness:** `RAIL_GAP_PX` duplicates `gap={2}`, cached widths are keyed only by category IDs, and a layout effect reads widths after every render.

## Live Validation

- Recipe: skipped (`skip-static-code-contract`)
- Result: SKIPPED
- Evidence: 0 current screenshots; inherited evidence targets the old horizontal-scroll/FilterSelect implementation
- Webpack errors: not evaluated under the static-code contract
- Log monitoring: skipped under the static-code contract

## Correctness

- Diff vs stated goal: the tab discovery and filtered navigation path are implemented, but two manual claims describe removed behavior.
- Edge cases: empty market data and unknown filters are handled. Resize history, long translated active pills, RTL overflow, and stale intrinsic widths are not.
- Race conditions: stream ownership remains centralized. Render-time overflow remeasurement can temporarily unmount the focused More trigger.
- Backward compatibility: `?filter=` links still parse. FilterSelect test IDs and existing E2E search helpers were broken by the market-list redesign.

## Static Analysis

- `yarn lint:tsc`: PASS
- Tests: PASS, 6/6 suites and 92/92 tests
- Test execution used current branch head `03a60229`; the authoritative frozen diff ends at `73d7e956`. The only later delta is the verified More-menu initial-focus fix and its two tests.

## Mobile Comparison

- Status: DIVERGES intentionally
- Details: home category discovery aligns with Mobile's Products concept. Extension uses a More menu instead of mobile-style horizontal gestures following web review feedback. No new `.toFixed()` or fixed two-decimal formatting was added. `marketMatchesCategory` deliberately preserves Extension's existing crypto bucketing rather than silently changing it to the controller/mobile rule.

## Architecture & Domain

The changes are UI-only. There is no MV3 background, controller state, LavaMoat, dependency, or migration impact. Moving Dropdown into the common Perps component area is appropriate, but the market-list redesign is broader than TAT-3848's stated home-tab scope and should be reflected in the PR/ticket narrative.

## Risk Assessment

- MEDIUM — no fund-handling logic changes, but the new category access path has reproducible layout/accessibility defects and the validation instructions target obsolete UI.

## Recommended Action

COMMENT

Address the `must_fix` line comments before merge:
1. Base fit decisions on a stable outer width and keep the active pill visible.
2. Preserve keyboard focus when selecting from More and give the listbox an accessible name.
3. Use RTL-safe logical menu positioning.
4. Do not render `0 markets` while data is loading; add correct singular/plural copy.

Also update the PR body and recipe from horizontal scroll/FilterSelect to More/active category pill, restore search-click analytics, and repair the E2E helpers for the new disclosure controls.
