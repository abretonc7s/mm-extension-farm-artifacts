# Learnings — TAT-3264

- **The fix was trivial (one `paddingTop={4}`); ~90% of the time went into making the live recipe deterministic.** The perps testnet environment is flaky at every step: the market-detail page renders blank after a network switch (needs a full `Page.reload`, sometimes two), the order-entry deep link is blank unless the market detail is visited first (perps stream init), order cancel propagation lags the controller/DOM, and leftover orders accumulate across runs. Each had to be handled with explicit reload/poll helpers.

- **`ui.set_input` doesn't work on the perps React controlled inputs** — it sets `el.value` directly, which React ignores. Use the native value setter (`Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set`) + dispatch `input`/`change`, then let React commit (~1.2s) before clicking submit. Otherwise submit fires with empty state and silently no-ops.

- **The runner's `ui.screenshot` captures the *visible window*, not the CDP target.** `Page.captureScreenshot` hangs on a backgrounded tab so it falls back to macOS `screencapture`. Screenshots captured the wrong tab until I activated the market-detail target via `/json/activate/<id>` (`focus-market.mjs`) right before each shot.

- **`start_state`/`teardown_state` internal order cleanup is the flaky part** (their cancel+wait times out). Setting `orders:false, positions:false` and doing explicit `close_orders` + a stream-cache absence poll (`wait-orders-absent.mjs`) from the market page is far more reliable.

- **Time-savers for next time:** the runner `run` needs `FARMSLOT_ROOT=~/farmslot-node` set (slot pool lives there, not in the runner dir). The page's `Box` renders Tailwind classes (`pt-4`), not legacy `mm-box--padding-top-4`. Account `Trading`/`MYXTrading` from the fixture inventory aren't in this fixture — only the dev-mnemonic accounts (use `0x8dc623…9003` / Account 1, which is funded on testnet).

- **Video recording (`record-window.sh`/ffmpeg) never produced a file** in this environment — screenshots had to carry all visual evidence.
