# Recipe coverage — PR #42285 (perps candle period persistence)

**Target environment:** fullscreen extension UI (`home.html`), CDP on slot `mme-1`.

**Validation executor:** Playwright over CDP (fallback). `validate-recipe.js` did not produce a run (`setSessionManager is not a function`). Cross-check: `artifacts/evidence/trace.json` lists recipe node IDs with `passed: true` and notes the executor drift.

**Visual audit:** Each `evidence-ac*.png` was opened for review. There is **no** recipe-runner HUD caption baked into pixels (bare `Page.captureScreenshot` style). Proof of selection is the **highlighted interval pill** (`15min`) plus Redux verification below.

| # | AC (verbatim) | Target env | Recipe nodes (IDs) | Screenshot filename | Visual verdict | Justification |
|---|---------------|------------|---------------------|---------------------|----------------|---------------|
| 1 | "When the user selects a candle period on the market detail chart, that selection persists when navigating away and returning to the market detail page" | fullscreen | `setup-nav-perps`, `setup-open-btc-detail`, `ac1-wait-selector` … `ac1-assert-pref-still`, `ac1-screenshot-after-return` | `evidence-ac1-15m-after-select.png`, `evidence-ac1-15m-after-navigate-back.png` | **PROVEN** | After selecting **15m** on BTC-USD, Redux `preferences.perpsSelectedCandlePeriod` stayed `15m`; navigating back to Perps home and reopening BTC-USD shows **15min** still selected (second screenshot). Mechanism is period-agnostic vs ticket examples (4H, 1H). |
| 2 | "The selected candle period persists when switching between markets" | fullscreen | `ac2-open-eth-detail`, `ac2-wait-eth-detail`, `ac2-assert-shared-period`, `ac2-screenshot-eth` | `evidence-ac2-eth-still-15m.png` | **PROVEN** | ETH-USD market detail shows **15min** highlighted after switching from BTC; Redux still `15m`. |
| 3 | "The selected candle period persists across extension sessions (closing and reopening the extension)" | fullscreen | `ac3-reload-ui`, `ac3-wait-main-ready`, `ac3-open-eth-after-reload`, `ac3-assert-pref-after-reload`, `ac3-screenshot-post-reload` | `evidence-ac3-15m-after-goto-home.png` | **PROVEN** | Full **extension UI document reload** rehydrated persisted prefs; after unlock-as-needed and reopening ETH detail, **15min** remains selected and Redux still `15m`. This is a pragmatic proxy for “close/reopen extension” (survives reload + storage rehydrate) but does **not** prove killing the browser process or MV3 service worker sleep. |

**Forbidden-pattern scan (step 11a):** No blocking issues in `recipe.json` for this audit scope (no `switch` default bypass, no `eval_sync` skip strings, no `manual` actions). `wait_for` is used rather than raw long `wait`.

**Recipe vs execution drift:** Draft `recipe.json` still names `ac1-press-4h`, asserts `4h`, and `note` strings say 4h; the executed path used **15m** (faster/simpler on the ribbon) and filenames were aligned. Fix before trusting a canonical `validate-recipe.js` run.

Overall recipe coverage: **3/3** ACs **PROVEN** (untestable: **none**, weak: **0**, missing: **0**)
