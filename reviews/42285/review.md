# PR Review: #42285 — fix(perps): persist candle period selection across navigation and sessions

**Tier:** standard

## Summary

The PR moves Perps market-detail candle period from ephemeral React state into **`PreferencesController`** via `setPreference('perpsSelectedCandlePeriod', …)`, with a **local override** for immediate UI updates and a **best-effort** background save. That matches the stated goal: the same interval should survive moving off the page, switching symbols, and a **UI reload** that rehydrates persisted prefs.

Unit tests added for the preference field and for mount/change/invalid/default/failure paths on `PerpsMarketDetailPage` are substantive. Live validation on the slot confirms Redux holds the chosen period (**15m** in the run) across navigation, ETH switch, and post-reload reopen — see coverage matrix and PNGs.

## Recipe Coverage

See full matrix: `temp/tasks/review/42285-0504-214542/artifacts/recipe-coverage.md` (copied below for the report).

| # | AC (verbatim) | Target env | Recipe nodes (IDs) | Screenshot filename | Visual verdict | Justification |
|---|---------------|------------|---------------------|---------------------|----------------|---------------|
| 1 | "When the user selects a candle period on the market detail chart, that selection persists when navigating away and returning to the market detail page" | fullscreen | `setup-nav-perps`, `setup-open-btc-detail`, `ac1-wait-selector` … `ac1-assert-pref-still`, `ac1-screenshot-after-return` | `evidence-ac1-15m-after-select.png`, `evidence-ac1-15m-after-navigate-back.png` | **PROVEN** | After selecting **15m** on BTC-USD, Redux `preferences.perpsSelectedCandlePeriod` stayed `15m`; navigating back to Perps home and reopening BTC-USD shows **15min** still selected (second screenshot). Mechanism is period-agnostic vs ticket examples (4H, 1H). |
| 2 | "The selected candle period persists when switching between markets" | fullscreen | `ac2-open-eth-detail`, `ac2-wait-eth-detail`, `ac2-assert-shared-period`, `ac2-screenshot-eth` | `evidence-ac2-eth-still-15m.png` | **PROVEN** | ETH-USD market detail shows **15min** highlighted after switching from BTC; Redux still `15m`. |
| 3 | "The selected candle period persists across extension sessions (closing and reopening the extension)" | fullscreen | `ac3-reload-ui`, `ac3-wait-main-ready`, `ac3-open-eth-after-reload`, `ac3-assert-pref-after-reload`, `ac3-screenshot-post-reload` | `evidence-ac3-15m-after-goto-home.png` | **PROVEN** | Full **extension UI document reload** rehydrated persisted prefs; after unlock-as-needed and reopening ETH detail, **15min** remains selected and Redux still `15m`. This is a pragmatic proxy for “close/reopen extension” (survives reload + storage rehydrate) but does **not** prove killing the browser process or MV3 service worker sleep. |

Overall recipe coverage: **3/3** ACs **PROVEN**

Untestable: **none**

## Prior Reviews

| Reviewer | State | Date | Addressed? | Notes |
|----------|-------|------|------------|-------|
| geositta | DISMISSED | 2026-04-30 | n/a | Only snapshot from `gh pr view`; no open **CHANGES_REQUESTED** threads tracked. |

## Acceptance Criteria Validation

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Candle period persists when leaving and returning to market detail | PASS | Playwright + Redux checks; `evidence-ac1-15m-after-select.png`, `evidence-ac1-15m-after-navigate-back.png` |
| 2 | Persists when switching markets | PASS | `evidence-ac2-eth-still-15m.png` + Redux |
| 3 | Persists across extension sessions (as validated) | PASS | Post–UI reload + reopen; `evidence-ac3-15m-after-goto-home.png` + Redux (proxy; see coverage caveat) |

## Code Quality

- **Pattern adherence:** Uses existing **`setPreference`** / `getPreferences` paths; optional field avoids migration. Aligns with controller + Redux usage elsewhere.
- **Complexity:** Appropriate — small derived `selectedPeriod` from persisted + local override; `handlePeriodChange` keeps chart zoom behavior.
- **Type safety:** Minor: `useSelector(getPreferences) as { perpsSelectedCandlePeriod?: string }` narrows at the component; preferable to extend exported preference typings so the cast is unnecessary (non-blocking).
- **Error handling:** `setPreference` **`.catch` no-ops** with comment that UI still updates — consistent with best-effort persistence; covered by unit test.
- **Anti-pattern scan (standard):** No `yarn.lock` / LavaMoat drift in this diff. No new magic network URLs. Interactive elements already use established `data-testid` patterns in tests.

## Fix Quality

- **Best approach:** Reasonable and minimal — persistence belongs in `Preferences` with UI reading from Redux; local override avoids waiting on background round-trip for chart feedback.
- **Would not ship:** None identified.
- **Test quality:** Assertions cover persisted mount states, invalid preference fallback, `setPreference` args, and save failure still updating visible period — not mock-only noise.
- **Brittleness:** Low; validation list for `CandlePeriod` guards invalid strings. `localPeriodOverride` stays until remount — if preferences update from elsewhere mid-session, UI might not reflect that without a reset; acceptable for this scope.

## Live Validation

- **Recipe:** generated (`artifacts/recipe.json`)
- **Result:** **PASS** for behavioral ACs via **Playwright CDP fallback**; **`validate-recipe.js` did not execute** (session manager error in runner stack).
- **Evidence:** **4** screenshots under `artifacts/evidence/`; **no** `review.mp4` in this task dir (standard run; video not required here).
- **Webpack errors:** none observed during this review task (no blocking compile failures reported for the exercised build).
- **Log monitoring:** not extended beyond validation window for this completion step.

## Correctness

- **Diff vs stated goal:** Aligned — preference survives navigation and cross-market; reload path exercises persisted storage.
- **Edge cases:** Invalid / missing preference falls back to **5m**; failed save still updates chart (tested).
- **Race conditions:** Possible narrow race between `localPeriodOverride` and late preference rejection — mitigated by user-only `setPreference` and best-effort semantics.
- **Backward compatibility:** Optional preference with default behavior when unset.

## Static Analysis

- **lint:tsc:** PASS
- **Tests:** 164/164 pass ( touched suites only: `preferences-controller.test.ts`, `perps-market-detail-page.test.tsx` )

## Mobile Comparison

- **Status:** **N/A** (shallow)
- **Details:** PR touches extension Perps market detail only. Local `metamask-mobile-ref` deep comparison was not executed for this task; no new perps **formatting** helpers or `.toFixed` patterns were introduced in the diff.

## Architecture & Domain

- **MV3:** Preference persists via existing controller persistence; UI reload test validates rehydrate path relevant to extension document lifecycle.
- **LavaMoat:** No dependency changes in diff.
- **Controller usage:** Exteds `Preferences` shape only; metadata/persist path already covers `preferences` blob.

## Risk Assessment

- **LOW** — Narrow feature flag surface, backward-compatible optional field, tests + live spot-check; only caveat is validation tool parity (recipe runner vs Playwright).

## Recommended Action

**COMMENT**

No blocking issues. Remaining items are **operational** (restore `validate-recipe.js` compatibility; align `recipe.json` period literals with QA) rather than merge blockers. Human reviewer should confirm **AC3** proxy (UI reload vs full browser/extension host quit) is acceptable for their release bar.
