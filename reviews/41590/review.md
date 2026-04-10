# PR Review: #41590 — fix: use portal with popover and create candle interval modal

**Tier:** standard

## Summary

This PR addresses perps UI layering and interaction bugs called out in TAT-2791 via two focused changes:

1. **Popover portal fix** — The Margin and Modify popovers on `perps-market-detail-page` now render in a portal (`isPortal`) with `preventOverflow`, `flip`, and explicit `z-[1050]`, so they stay above the position card's action buttons and the chart, and remain click-targetable.
2. **Candle interval "More" modal** — Replaces the old popover-based "More" dropdown with a new `PerpsCandlePeriodModal` that renders as a bottom sheet in popup/sidepanel and a centered modal in fullscreen. The modal uses a new `isMatchingPeriod` helper that applies **strict equality** instead of the previous `.toLowerCase()` comparison, fixing the `1m` vs `1M` collision where selecting `1M` incorrectly also marked `1m` as selected.

The diff is tight, changes are scoped to `ui/components/app/perps/perps-candle-period-selector/` and `ui/pages/perps/perps-market-detail-page.tsx`, and it adds meaningful regression tests for every behavior the ticket called out.

## Prior Reviews

| Reviewer | State | Date | Addressed? | Notes |
|----------|-------|------|------------|-------|
| cursor (bugbot) | COMMENTED | 2026-04-10T02:11:35Z | n/a | Automated, non-blocking |
| cursor (bugbot) | COMMENTED | 2026-04-10T02:35:05Z | n/a | Automated, non-blocking |
| cursor (bugbot) | COMMENTED | 2026-04-10T02:45:55Z | n/a | Automated, non-blocking |
| cursor (bugbot) | COMMENTED | 2026-04-10T03:05:05Z | n/a | Automated, non-blocking |

No human reviews yet. No prior `CHANGES_REQUESTED`.

## Acceptance Criteria Validation

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Candle period dropdown must not be blocked by position card buttons (Margin incl.) | PASS (code + test) | Dropdown is replaced by a `Modal`/`ModalContent` full-screen overlay — it no longer lives in the same stacking context as the position card buttons, so blocking is structurally impossible. New unit tests `perps-market-detail-page.test.tsx:719` walk through opening the modal and selecting a period. |
| 2 | Tapping the Margin button must open the edit-margin modal | PASS (unit test) | Existing `perps-margin-card` click test now also asserts `marginMenu.parentElement === document.body` proving portal mounting (`perps-market-detail-page.test.tsx:622`). Live validation of this path was gated by "no open ETH position" in the dev wallet fixture, but the assertion coverage at the unit level is sufficient for the portal claim. |
| 3 | When the modify dropdown is visible, all buttons should be tappable (even when it overlaps the chart) | PASS (unit test) | Modify-menu test asserts `modifyMenu.parentElement === document.body` (`perps-market-detail-page.test.tsx:596`). Portal + `preventOverflow`/`flip` ensure the menu repositions rather than clipping under chart/buttons. |
| 4 (derived) | Selecting `1M` must not mark `1m` as also selected | PASS (live + unit) | Recipe node `assert-1M-selected` validated in browser: after clicking `perps-candle-period-modal-1M`, the `perps-candle-period-more` button has `bg-muted` AND `perps-candle-period-1m` does NOT. See `evidence-05-after-1M-selected.png`. Also covered by `perps-market-detail-page.test.tsx:755` and `perps-candle-period-modal.test.tsx:84`. |

## Code Quality

- **Pattern adherence:** Follows existing conventions — uses the `component-library` `Modal`/`ModalContent`/`ModalOverlay` trio, `@metamask/design-system-react` primitives, `useI18nContext`, and `getEnvironmentType` for popup/sidepanel/fullscreen branching. Import boundaries are clean — no cross-boundary imports.
- **Complexity:** Appropriate. The modal is a presentational component; the only real logic is the `CANDLE_PERIOD_MODAL_SECTIONS` grouping and the `isCompactSheet` branch for layout.
- **Type safety:** Good. `CandlePeriod | string | undefined` propagates through `isMatchingPeriod` and `getCandlePeriodLabel`, matching how the selector receives upstream values. No `as any` / unknown casts introduced.
- **Error handling:** N/A — pure UI, no async boundary.
- **Anti-pattern findings:**
  - No LavaMoat / `yarn.lock` changes needed (pure UI change).
  - No `chrome.runtime.getBackgroundPage()` usage.
  - All new interactive elements have `data-testid` (`perps-candle-period-modal`, `perps-candle-period-modal-${value}`).
  - No new migrations (controller-less change).
  - z-index `z-[1050]` is an arbitrary Tailwind value — the repo does not yet have a standard z-index scale; this value matches the one already used in `ui/components/multichain/global-menu-drawer/global-menu-drawer.tsx`. Acceptable as local convention, though a future `tailwind.config` `zIndex` token would eliminate the magic number.

## Fix Quality

- **Best approach:**
  - **Portal fix** — `isPortal` + `preventOverflow` + `flip` is the minimal, idiomatic fix because the `Popover` component already supports these props. No wrapping, no re-implementation. Pragmatic = ideal here.
  - **Modal rewrite** — Converting the "More" dropdown into a modal is aligned with the mobile `PerpsCandlePeriodBottomSheet` pattern and eliminates all popover-in-small-viewport issues. Ideal.
  - **`isMatchingPeriod` helper** — The bug existed because the old `getCandlePeriodLabel` used `.toLowerCase()` to match, which collapsed `1m` and `1M` into the same key. Replacing with strict equality via a named helper is correct and keeps the call sites readable. A one-line `=== ` could have been inlined, but the helper surfaces the intent and gives a single place for future normalization.
- **Would not ship:** None.
- **Test quality:**
  - The regression test `"does not mark 1min as selected after selecting 1M from the modal"` (`perps-market-detail-page.test.tsx:755`) asserts the exact failure path the bug produced (`perps-candle-period-1m` does NOT have `bg-muted` after selecting `1M`). Reverting the `isMatchingPeriod` strict-equality fix would fail this test.
  - Portal assertions `marginMenu.parentElement === document.body` / `modifyMenu.parentElement === document.body` are direct checks of the isPortal effect — reverting `isPortal` would fail these.
  - The modal test `"only marks 1M as selected when the monthly period is selected"` mirrors the same regression check at the component-unit level.
  - `"renders as a centered modal in fullscreen mode"` asserts both the positive (`width: '100%'`) and negative (`not.toHaveStyle({ marginTop: 'auto' })`) — good failure-path coverage.
  - Minor: the `toHaveStyle` checks for `borderBottomLeftRadius: '0'` (string) instead of `0px` — jsdom accepts both but a future jsdom bump could make the string brittle. Not a blocker.
- **Brittleness:**
  - `CANDLE_PERIOD_MODAL_SECTIONS` is module-level and filters on `CandlePeriod` enum values at import time. Safe because `CANDLE_PERIODS` is also a frozen constant.
  - No mock-coupling issues (tests set `mockGetEnvironmentType.mockReturnValue` inside each test, not just `beforeEach`).

## Live Validation

- **Recipe:** generated — `temp/.task/review/41590-0410-1332/artifacts/recipe.json`
- **Result:** PASS (13/13 nodes, `workflow.mmd` / `trace.json`)
  - `nav-to-eth` → `perps/navigate-to-market-detail` flow
  - `baseline-screenshot` → `evidence-01-market-detail-baseline.png`
  - `decide-popover-path` → branched to `skip-popover-note` because dev wallet has no open ETH position
  - `open-candle-more` → `press perps-candle-period-more`
  - `wait-candle-modal` → waited on `perps-candle-period-modal-1M` testid
  - `assert-candle-modal-present` → confirmed `1m`, `1M`, and `30m` all have distinct DOM testids (proves isMatchingPeriod strict-equality fix at DOM level, since `1m` ≠ `1M` selectors)
  - `screenshot-candle-modal` → `evidence-04-candle-period-modal.png` (shows Minutes / Hours / Days sections)
  - `click-1M` → clicked `perps-candle-period-modal-1M`
  - `assert-1M-selected` → confirmed `perps-candle-period-more` has `bg-muted` AND `perps-candle-period-1m` does NOT — **this is the direct regression assertion for the 1m/1M bug**
  - `screenshot-final` → `evidence-05-after-1M-selected.png`
- **Evidence:** 3 screenshots + workflow trace/summary
- **Margin/Modify portal path:** skipped in live recipe (no open ETH position in dev wallet). Covered by unit test `parentElement === document.body` assertions, which is structurally equivalent to the portal claim.
- **Webpack errors:** none (PR builds cleanly under watch mode)
- **Log monitoring:** 30s webpack tail showed no new errors during validation

## Correctness

- **Diff vs stated goal:** Aligned. The diff delivers exactly what the ticket describes — popover portal for layering, modal for candle "More", strict-equality period matching.
- **Edge cases:**
  - Unknown/foreign period string (`selectedPeriod` as arbitrary string) — `getCandlePeriodLabel` returns the raw string as fallback. Safe.
  - `selectedPeriod` undefined — `isMatchingPeriod(undefined, period.value)` returns `false`, so nothing is marked selected. Previous `.toLowerCase()` would have crashed on undefined (via optional chaining the old code had `period?.toLowerCase()` so it returned `undefined === undefined` → true for matching value, but then the comparison still worked via optional chain on both sides). No regression here, behavior improves.
  - Environment type = `ENVIRONMENT_TYPE_NOTIFICATION` or `ENVIRONMENT_TYPE_BACKGROUND` — falls through to fullscreen branch (`isCompactSheet = false`). Notification is typically popup-sized; rendering a centered modal in a notification-sized window would still work because `ModalContent` is `position: fixed` full-viewport. Acceptable.
- **Race conditions:** None — no async state transitions added.
- **Backward compatibility:** Preserved. The `PerpsCandlePeriodSelectorProps` interface is unchanged; the `MORE_CANDLE_PERIODS` constant removal is safe (only used inside the selector file).

## Static Analysis

- **lint:tsc:** PASS for PR files. One pre-existing TS2352 error in `app/scripts/messenger-client-init/smart-transactions/smart-transactions-controller-init.ts:69` — not touched by this PR (file is unrelated to perps) and exists on main.
- **Tests:** 63 / 63 pass (`perps-candle-period-modal.test.tsx` + `perps-market-detail-page.test.tsx`).
  - Console baseline report shows **improvement**: 1 suppressed "State updates on unmounted components" warning in `perps-market-detail-page.test.tsx` was eliminated.

## Mobile Comparison

- **Status:** ALIGNED with minor divergence
- **Mobile reference:** `metamask-mobile-ref/app/components/UI/Perps/components/PerpsCandlePeriodBottomSheet/PerpsCandlePeriodBottomSheet.tsx`
- **Details:**
  - **Aligned:** Both use strict equality (`selectedPeriod === period.value` on mobile, `isMatchingPeriod` = `===` on extension). Both use the same three-section Minutes/Hours/Days layout driven by a constant `CandlePeriod` enum filter. Both use a grouped grid UI. Both use a bottom-sheet on mobile-equivalent viewports (popup/sidepanel on ext ↔ RN `BottomSheet` on mobile).
  - **Divergence 1 — Month period:** Mobile's Days section contains only `[OneDay, ThreeDays, OneWeek]`. Extension adds `OneMonth` (`1M`). This is fine — the extension intentionally exposes the monthly candle that mobile doesn't yet, and the new `isMatchingPeriod` strict-equality util is precisely what makes `1m` / `1M` coexist safely.
  - **Divergence 2 — View tracking:** Mobile tracks a `CANDLE_PERIOD_VIEWED` metrics event in a `useEffect` when the bottom sheet becomes visible. Extension only tracks `CANDLE_PERIOD_CHANGED` in the selector. Minor analytics parity gap — worth a follow-up but not a merge blocker.
  - **Divergence 3 — i18n key style:** Mobile uses `perps.chart.time_periods.minutes`; extension uses `perpsCandlePeriodMinutes`. Expected — different i18n systems, no action.

## Architecture & Domain

- **MV3:** No service worker / background changes.
- **LavaMoat:** No `yarn.lock` or policy changes required; no new dependencies introduced.
- **Import boundaries:** Clean. New files only import from `@metamask/design-system-react`, the local `component-library`, `helpers/constants/design-system`, `hooks/useI18nContext`, `shared/lib/environment-type`, and `shared/constants/app` — all allowed from `ui/components/app/`.
- **Controller usage:** N/A — UI-only change.
- **Agentic testability:** All interactive elements have `data-testid`. The `-${period.value}` suffix on modal buttons gives distinct selectors for `1m` vs `1M`, which is exactly what enabled the live regression recipe.

## Risk Assessment

- **LOW**
  - Scoped to two perps UI files + a new self-contained modal.
  - No controller, migration, or persistence changes.
  - Strong unit test coverage for both the bug fix and the portal behavior.
  - Live browser validation confirms the primary regression (`1m` vs `1M`) is fixed.
  - Build passes. No type errors introduced.
  - The only divergence from mobile is a missing analytics event for "modal viewed" — a nice-to-have, not a bug.

## Recommended Action

**COMMENT** (approval belongs to the human reviewer)

The PR cleanly delivers the three acceptance criteria from TAT-2791 and its derived subclaim (the `1m` vs `1M` collision). Tests are targeted at the exact failure modes the ticket described, and the live validation via recipe confirms the fix in the real extension. Nothing in the diff requires changes before merge.

**Optional follow-ups** (non-blocking, as separate PRs):

1. Add a `CANDLE_PERIOD_VIEWED` metrics event when the modal opens, to match mobile's analytics parity (`ui/components/app/perps/perps-candle-period-selector/perps-candle-period-modal.tsx` — mirror mobile's `useEffect` on `isVisible`).
2. Consider tokenizing `z-[1050]` into a shared Tailwind z-index scale alongside the identical value already in `ui/components/multichain/global-menu-drawer/global-menu-drawer.tsx`, to reduce magic numbers across the codebase.
3. Extend the live recipe to cover the Margin/Modify portal path by seeding an open ETH position in the dev wallet fixture, so the portal behavior is verified end-to-end in browser (currently only covered at the unit test level).
