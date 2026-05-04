# Review learnings — PR #42285

- **`validate-recipe.js` fragility:** A `setSessionManager is not a function` failure blocked the canonical runner; Playwright-over-CDP on the existing slot remained the fastest honest fallback. Future reviews should treat runner breakage as an environment signal, not an AC failure.
- **Preference persistence timing:** Immediately after clicking a period, Redux can lag briefly — polling / `waitForFunction` on `perpsSelectedCandlePeriod` prevented false negatives versus a single snapshot read.
- **Post-reload UX:** A full extension UI reload may return to **unlock**; automations need an `unlock-password` / submit path before waiting for `account-menu-icon`.
- **Tutorial overlays:** Perps tutorial modals can intercept clicks on chart chrome; dismissing or escaping modals before hitting the candle row reduced flake.
- **Evidence naming:** When the exercised interval differs from the draft recipe (15m vs 4h), **rename PNGs and the coverage matrix** to match what was actually observed, and call out recipe drift in the audit.
- **HUD captions:** Bare Playwright screenshots lack recipe-runner HUD text; the audit relied on **visible pill state** plus Redux; if strict caption parity is required, only the native screenshot action path satisfies step 20e 1a.
- **AC3 proxy:** “Close/reopen extension” was approximated by **document reload + preference rehydrate** — strong signal for persistence, weaker for MV3 SW eviction or OS-level browser kill.
- **Codebase pattern:** Perps detail page correctly combines **Redux-backed preference** with **local override** for instant chart feedback and **best-effort** `setPreference` — good template for other single-choice UI prefs.
- **Tests:** Colocated `perps-market-detail-page` tests that assert **`bg-muted`** on interval test IDs plus `setPreference` call args give high confidence without E2E.
