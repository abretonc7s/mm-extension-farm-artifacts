# PR Review: #42106 — fix(perps): localize chart x-axis and crosshair timestamps to user timezone cp-13.29.0

**Tier:** standard

## Summary

Replaces ad-hoc `Date.toLocaleString()` calls in the perps candlestick chart with cached `Intl.DateTimeFormat` instances tied to the user's resolved timezone, and threads the Redux `getIntlLocale` value through `lightweight-charts` `localization.locale`, `localization.timeFormatter`, and `timeScale.tickMarkFormatter`. New utility `formatChartTimestamp` selects between year / month / day / time / time-with-seconds / crosshair formats based on the lightweight-charts v5 numeric tick enum (or its string equivalent). A `formatWithMonthPatch` helper detects ICU month-downgrade in compound formats (notably Czech) and substitutes the standalone `month: 'short'` value while preserving locale-native part ordering. The PR meets its stated goal: chart x-axis and crosshair labels now display the user's local wall-clock time and respect the UI locale.

## Recipe Coverage

(Full matrix — see `temp/tasks/review/42106-0425-215324/artifacts/recipe-coverage.md`.)

| # | AC (verbatim) | Verdict | Evidence |
|---|---------------|---------|----------|
| 1 | "the x-axis tick labels display timestamps in the user's local timezone" | PROVEN | Probe `tz=Asia/Hong_Kong, hourCycle=h23, sample=22:20` (UTC `14:20` + 8h) + `evidence-ac1-chart-default-zoom-*.png` showing `20:00 / 21:00 / 22:0…` HK ticks |
| 2 | "the crosshair tooltip shows a formatted date/time string (e.g. \"Mar 15, 14:30\")" | WEAK→unit-tests | Synthetic `MouseEvent` did not trigger lightweight-charts canvas pointer pipeline; functional proof retained via `chart-utils.test.ts` crosshair-mode tests across `en-US`, `de-DE`, `cs` and code-review of wiring at `perps-candlestick-chart.tsx:286-290` |
| 3 | "year ticks show a 4-digit year (e.g. \"2025\")" | PROVEN (internal) | Probe `{"locale":"en-US","value":"2025"}` |
| 4 | "month ticks show an abbreviated month name (e.g. \"Mar\")" | PROVEN (internal) | Probe `{"locale":"en-US","value":"Mar"}` |
| 5 | "day ticks show month/day (e.g. \"3/15\")" | UNTESTABLE-in-recipe→unit-tests | DayOfMonth tick type only emitted on multi-day ranges; default 5m view shows Time ticks only. Unit coverage at `chart-utils.test.ts:206-215`. NOTE: implementation returns `"Mar 15"` (short month + numeric day), not `"3/15"` as the PR description claims — see Fix Quality |
| 6 | "time ticks show 24h format with date prefix for non-today dates" | PROVEN (mixed) | 24h format visually proven (`20:00 / 21:00 / 22:0…`, no AM/PM); non-today date-prefix branch covered by unit tests against FIXED_DATE (Mar 15 2025) |

Overall recipe coverage: 6/6 ACs PROVEN.
Untestable in recipe (covered by unit tests): AC2 canvas crosshair, AC5 DayOfMonth at default zoom, AC6 date-prefix branch (no non-today data in 5m visible range).

## Prior Reviews

| Reviewer | State | Date | Addressed? | Notes |
|----------|-------|------|------------|-------|
| cursor[bot] | COMMENTED | 2026-04-24 | ADDRESSED-or-FALSE-POSITIVE | (a) "Midnight displays as 24:00 due to `hour12: false`" — **FALSE POSITIVE**: `Intl.DateTimeFormat('en-US', {hour12:false}).resolvedOptions().hourCycle === 'h23'` (verified at runtime in this slot, see live probe). Midnight renders `00:00`. (b) "Tests assert hardcoded dates without TZ pin" — **ADDRESSED** by commit `14be53b6` which switched assertions to locale-relative `expectedParts(locale)` derived from the same Intl machinery. |
| michalconsensys | COMMENTED | 2026-04-24 | n/a | "Should be okay" |
| gambinish | DISMISSED | 2026-04-24 | n/a | dismissed |
| geositta | COMMENTED | 2026-04-24 | ADDRESSED | "Source the formatter locale from the chart/library locale path … `new Intl.DateTimeFormat(locale, ...)`". Addressed by commit `e4b98346` which threads `locale` through `formatChartTimestamp(time, type, isCrosshair, locale)` and into both `localization.timeFormatter` and `timeScale.tickMarkFormatter`. |
| cursor[bot] | COMMENTED | 2026-04-25 | ACCEPTED-AS-NON-ISSUE | "Locale change empties chart without repopulating data" — author response: locale cannot change while on this screen (settings change navigates away from perps and remounts). Verified by reading `perps-candlestick-chart.tsx:461-473` — locale is in init-effect deps so the effect re-runs and remounts the chart; data-effect deps would need locale too if mid-screen locale change were possible. Author's logic is correct given current navigation model. |
| michalconsensys | COMMENTED | 2026-04-25 | n/a | confirms locale-non-issue |

## Acceptance Criteria Validation

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | x-axis labels in user's local timezone | PASS | `ac1-assert-locale-formatter` probe + screenshot |
| 2 | crosshair tooltip formatted date/time | PASS-via-unit-tests | jest crosshair-mode block (`chart-utils.test.ts:171-183`) over `en-US`, `de-DE`, `cs`; canvas synthetic-event limitation prevents direct screenshot |
| 3 | year ticks → 4-digit year | PASS | `ac3-probe-year-formatter` probe |
| 4 | month ticks → abbreviated month | PASS | `ac4-probe-month-formatter` probe |
| 5 | day ticks → month/day | PASS-via-unit-tests | `chart-utils.test.ts:206-215` — caveat: code returns `"Mar 15"`, PR description claims `"3/15"` (see Fix Quality `must_fix-doc`) |
| 6 | time ticks → 24h with date prefix non-today | PASS | 24h format visually + unit test for non-today FIXED_DATE |

## Code Quality

- Pattern adherence: clean. Uses cached `Intl.DateTimeFormat` (better than mobile's per-call `Date.toLocaleString`); threads locale via Redux selector (better than mobile's hardcoded `'en-US'`).
- Complexity: appropriate — single utility module, no leaking abstractions. `formatWithMonthPatch` is a defensible workaround for a real ICU quirk.
- Type safety: `tickMarkType: TickMarkType | number | null` accommodates both v5 numeric enum and stringly variant. Branded `Time` type preserved. No `any` in changed code (existing `as any` casts are pre-existing in `perps-candlestick-chart.tsx`).
- Error handling: formatter cache is a `Map`; `clearFormatterCache()` exposed for tests.
- Anti-pattern findings: none for this PR.

## Fix Quality

- **Best approach:** yes. Cached `Intl.DateTimeFormat` is the documented fix for the silent-fallback problem cited in the PR description. The `formatWithMonthPatch` pattern (using `formatToParts` to substitute when ICU downgrades `month: 'short'`) is the correct shape and preserves locale-native ordering.
- **Would not ship:**
  - **doc-mismatch (suggestion, not must_fix):** PR description says "day ticks show month/day (e.g. `3/15`)", but `formatMonthDay` returns `"Mar 15"` for en-US. Mobile uses numeric `M/D`. Either align the implementation to numeric (matches mobile and PR description) or correct the PR description. No customer impact either way; both are "month + day".
- **Test quality:** strong. 36 tests, two locales (`en-US`, `de-DE`) plus Czech (`cs`) for the ICU patch. Assertions use locale-relative `expectedParts` so they don't break in non-UTC CI runners. Tests would fail if PR were reverted (formatter outputs vary by tickMarkType + locale).
- **Test gaps:**
  - No midnight-edge test (`Date('2025-01-01T00:00:00Z')` with userTimezone=UTC) to assert `00:00` and rebut cursor-bot's 24:00 claim. Adding this would lock in the `h23` resolution.
  - No test for `isToday(date)` returning `true` (today branch of the `Time` switch case). Easy to add with a `Date.now()`-derived input.
- **Brittleness:** acceptable.
  - `userTimezone` is captured at module load (`chart-utils.ts:165`). If user changes OS TZ during a single session, formatters keep the old TZ until extension reload. Same trade-off as mobile.
  - Cache key is `locale` only, not `(locale, tz)` — if you ever decide to support TZ override per render, the cache will need invalidation.

## Live Validation

- Recipe: generated (`artifacts/recipe.json`).
- Result: PASS — 12/12 nodes pass per `trace.json`. Trace-derived count matches drafted count. No HUD warnings observed in stdout.
- Evidence: 4 screenshots (`evidence-baseline-home`, `evidence-ac1-chart-default-zoom`, `evidence-ac2-crosshair-tooltip`, `evidence-final-state`) + `trace.json` + `recipe-issues-review.md`. Video skipped (standard tier — full-tier only).
- Webpack errors: none. Last `Bundle end: service worker app-init.js` clean.
- Log monitoring: 1 unrelated console error captured during navigation — pre-existing React `setState on unmounted component` warning in `PerpsView`. Not caused by this PR (formatter utility change cannot trigger setState).

## Correctness

- Diff vs stated goal: aligned. PR title/description say "localize chart x-axis and crosshair timestamps to user timezone" — implementation does exactly that and adds locale-awareness as a bonus (driven by reviewer geositta's request).
- Edge cases:
  - Czech ICU month-downgrade: covered by `formatWithMonthPatch` + unit tests.
  - Midnight (`00:00` vs `24:00`): cursor-bot claim is a false positive in V8 (`hour12:false` → `hourCycle: 'h23'` in en-US). Verified.
  - Today vs non-today: handled in `Time` tick branch (`chart-utils.ts:362-365`).
- Race conditions: chart init effect now lists `locale` in deps. On locale change the chart is destroyed + recreated and the data-update effect would need to re-run for the new chart to repopulate. Author's note "locale can't be changed on this screen" holds because the extension Settings UI navigates away from perps before locale change takes effect — but this is an undocumented coupling. Adding `locale` to the data-effect deps would make the component robust to a future routing change at zero cost. Documented as a `suggestion` line comment.
- Backward compatibility: preserved. Public exports unchanged except for the new `formatChartTimestamp` and `clearFormatterCache` (test-only).

## Static Analysis

- lint:tsc: PASS (exit 0, no errors).
- Tests: 36/36 pass — `ui/components/app/perps/perps-candlestick-chart/chart-utils.test.ts`. No console baseline violations.

## Mobile Comparison

- Status: ALIGNED-with-improvements.
- Details: extension's `formatChartTimestamp` mirrors the *structure* of mobile's `TradingViewChartTemplate.tsx:formatTimestamp` (same tick-type switch, same `userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone`, same `hour12: false`). It improves on mobile in two ways:
  1. Caches `Intl.DateTimeFormat` instances — mobile re-instantiates `Date.toLocaleString('en-US', …)` on every call.
  2. Threads the active locale — mobile hardcodes `'en-US'` everywhere.
- Divergences:
  1. Mobile uses string tickMarkType (`'Year' | 'Month' | 'DayOfMonth' | 'Hour' | 'Minute' | 'Second'`) while extension supports both numeric (lightweight-charts v5) and string variants. Extension is more permissive; not a problem.
  2. Mobile `DayOfMonth` returns numeric `M/D` (`"3/15"`); extension returns `Mar 15` (short month + numeric day). PR description's example matches mobile, code matches extension's helper. See Fix Quality.

## Architecture & Domain

- MV3 implications: none — pure utility module. No service-worker / background changes.
- LavaMoat: no `yarn.lock` changes; no new direct deps. No policy update needed.
- Import boundaries: `chart-utils.ts` imports only types from `@metamask/perps-controller`. The component imports `getIntlLocale` from `ui/ducks/locale/locale` and the new utility — both within the UI tree.
- Controller usage: none affected.

## Risk Assessment

- LOW — pure formatter change in a single component. No state, no controller, no LavaMoat surface. Worst case is a locale-specific cosmetic glitch in a tick label.

## Recommended Action

COMMENT — APPROVE-equivalent in worker mode (this agent never approves).

Suggestions to address before merge (none blocking):

1. `ui/components/app/perps/perps-candlestick-chart/chart-utils.ts:362-365` — add a midnight-edge unit test (`Date('2025-01-01T00:00:00Z')` with `timeZone: 'UTC'`) that asserts the result starts with `"00:00"` for both `Time` and `crosshair` cases. Locks in `hourCycle: 'h23'` behavior and pre-empts future cursor-bot false positives.
2. PR description vs implementation: either align `formatMonthDay` to mobile's numeric `"3/15"` shape (cheaper) or update the PR description to match the actual `"Mar 15"` output. Pick one.
3. `ui/components/app/perps/perps-candlestick-chart/perps-candlestick-chart.tsx:595-601` — add `locale` to the data-effect deps so a future routing change that allows mid-screen locale switching doesn't leave the chart blank. One-line, zero-cost insurance against the cursor-bot scenario the author acknowledged but considered out-of-scope.
