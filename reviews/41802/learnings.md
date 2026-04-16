# Learnings — PR #41802 Review

## CDP / Recipe

- `ext_navigate_hash` silently fails for `chrome-extension://` URLs — always use the `navigate` action with a named target from `lib/route-map.ts` (e.g. `PerpsMarketList`) instead.
- Market list rows use `data-testid="market-row-{SYMBOL}"`, not `explore-crypto-{SYMBOL}`. The `explore-crypto-*` / `explore-markets-*` testids belong to the Perps tab preview, not the full market list page.
- The Perps tab Explore preview uses `explore-markets-{SYMBOL}` (not `explore-crypto-{SYMBOL}`); confirmed by live DOM eval — 8 items present including `explore-markets-xyz-CL`, `explore-markets-xyz-SP500`.
- Recipe screenshots land in `temp/agentic/recipes/test-artifacts/screenshots/` by default (timestamped), not in `--artifacts-dir`. Copy them manually after the run if you need them in the task artifacts dir.
- The slot fixture has an empty watchlist (`watchlistMarkets: {mainnet: [], testnet: []}`). Any AC that depends on watchlist items will time out waiting for `perps-watchlist-*` testids — declare UNTESTABLE upfront rather than letting `wait_for` burn the timeout.

## Codebase Patterns

- `PerpsDataChannel.connectFn` for `markets` returns `() => {}` (no-op cleanup). `refresh()` calling `disconnect()` does not cancel the in-flight `perpsGetMarketDataWithPrices` RPC — the async promise keeps running and pushes to subscribers when it resolves. Benign for idempotent data but worth noting when reviewing channels with side-effectful connectFns.
- `perpsDeactivatePriceStream` takes no arguments and deactivates the background stream globally. A single unmount cancels the stream for all concurrent consumers. Current usage is safe (at most one consumer active at a time), but this is a latent risk if the hook is used in parallel routes.
- Mobile (`usePerpsHomeData`) uses `allMarkets.filter()` for the watchlist, giving volume-sorted order. Extension now uses `watchlistSymbols.map()`, which preserves insertion order — an intentional UX improvement over mobile, not a regression.
- `console.debug` is the accepted pattern for best-effort background method failures in perps stream hooks (matches `usePerpsViewActive.ts`). The no-`console.log` rule targets `log`, not `debug`.
- Cursor Bugbot raised a false positive about `symbolsKey useMemo` instability. The `useMemo` recomputes on new array references but produces a stable string, so downstream `useEffect` deps don't re-fire. When a bot flags a memoization concern in perps hooks, check whether the *output* (string/key) is stable even if the *input* reference is not.
