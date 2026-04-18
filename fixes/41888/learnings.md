# Learnings — TAT-2831

- **Account switching is unreliable with 140+ accounts.** `select_account` action uses UI text search (fails with large account lists). `submitRequestToBackground('setSelectedAccount', ...)` via `eval_sync` fires but the switch never propagates — the background handler takes 12+ minutes or never returns. Use `pushData()` on the stream manager channel instead of depending on live Hyperliquid data for accounts that never used perps.

- **`pushData()` is the right tool for perps stream state mocking.** `sm.account.pushData({availableBalance:'0', ...})` directly sets the cache, notifies subscribers, and sets `isInitialLoading = false`. This is the canonical way to simulate zero-balance state without a real Hyperliquid account. Worth documenting in `agentic-toolkit.md` for future perps recipes.

- **Before/after screenshots require a rebuilt webpack bundle + extension reload.** Stashing/popping changes the source but the browser keeps the old bundle until the extension reloads. Wait for webpack to finish (check bundle grep for known pattern) before reloading.

- **The fix itself was trivial (1 line, 5 minutes).** Setup, investigation, and recipe validation took >90% of the time — largely because of the account switching issue and webpack rebuild cycle. Better fixture accounts with known perps history would significantly speed up future perps fix validation.
