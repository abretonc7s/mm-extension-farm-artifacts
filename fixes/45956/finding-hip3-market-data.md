# Finding — why perps categories look empty in this slot

**Conclusion: not a bug.** The slot's wallet is on **Hyperliquid testnet**, where HIP-3 equity
perps have no 24h volume, and the market list filters zero-volume markets out. Mainnet is
unaffected, which is why it does not reproduce on mobile.

> An earlier version of this note claimed a multi-dex index-misalignment bug in
> `@metamask/perps-controller`. **That was wrong.** It compared the testnet wallet's data against
> the *mainnet* Hyperliquid API. The controller's merge and transform are correct — see
> "What I got wrong" below.

## The actual cause

`isTestnet: true` in the running wallet (`store.getState().metamask.isTestnet`).

Testnet `xyz` dex data matches what the extension holds, exactly:

| Market | Testnet `dayNtlVlm` | Extension `volume` | Match |
|---|---|---|---|
| `xyz:TSLA` | 120.2422 | `$120.24` | ✓ |
| `xyz:GOLD` | 346.94446 | `$346.94` | ✓ |
| `xyz:NVDA` | 0.0 | `$0.00` | ✓ |
| `xyz:AAPL` | 0.0 | `$0.00` | ✓ |
| `xyz:META` | 0.0 | `$0.00` | ✓ |
| `xyz:MSFT` | 0.0 | `$0.00` | ✓ |
| `xyz:HOOD` | 0.0 | `$0.00` | ✓ |
| `xyz:XYZ100` | 0.0 | `$0.00` | ✓ |

- Testnet `xyz` universe: **70** markets, 70 assetCtxs — exactly the 70 `xyz` markets in the
  extension's stream cache.
- **68 of 70** carry zero 24h volume on testnet — exactly the 68 the extension shows at `$0.00`.

Mainnet, for contrast: `xyz:TSLA` $21.5M, `xyz:NVDA` $44.5M, `xyz:AAPL` $64.8M,
`xyz:XYZ100` $221.9M. All would pass the volume filter.

## Why that empties the categories

`ui/hooks/perps/stream/usePerpsLiveMarketData.ts:117-120`:

```js
// Filter out markets with no trading volume (inactive/delisted)
const activeMarkets = useMemo(() => {
  return markets.filter(hasVolume).sort(compareByVolumeDesc);
}, [markets, compareByVolumeDesc]);
```

`hasVolume` is `parseVolume(market.volume) > 0` (`ui/components/app/perps/utils.ts:640`). On
testnet that discards 68 of 70 HIP-3 markets, so Stocks shows 1 market and
Indices / ETFs / Forex / Pre-IPO show none. It also drops 71 of 212 main-DEX markets
(282 → 143 in the list).

## What I got wrong

- Compared a **testnet** wallet against the **mainnet** `metaAndAssetCtxs` endpoint, then read the
  difference as data corruption. The two data sets were never comparable.
- Inferred a merge bug in `HyperLiquidProvider` without reading the merge. It is correct:
  `#mergeDexResultsInto` (`HyperLiquidProvider.mjs:10489`) pairs each market with
  `result.assetCtxs[index]` **before** filtering, then pushes universe and assetCtxs in lockstep, so
  `transformMarketData`'s index alignment holds.
- Treated `transformMarketData`'s `assetCtxs[index]` as suspect when the caller guarantees the
  invariant it relies on.

No Core PR to bisect; nothing regressed.

## Still worth a look (unchanged by the above)

`hasVolume` as a liveness test is questionable on its own merits. A market with a live `markPx` and
non-zero `openInterest` but zero 24h volume is thin, not delisted — and dropping it silently
empties a whole category rather than showing an honest thin market. That is a pre-existing design
choice in shared market-data code, not something PR #45956 introduced.

## Reproduction

```bash
# Testnet (what this slot is on)
curl -s -X POST https://api.hyperliquid-testnet.xyz/info -H 'Content-Type: application/json' \
  -d '{"type":"metaAndAssetCtxs","dex":"xyz"}'

# Mainnet (for contrast)
curl -s -X POST https://api.hyperliquid.xyz/info -H 'Content-Type: application/json' \
  -d '{"type":"metaAndAssetCtxs","dex":"xyz"}'
```

```js
// devtools console, unlocked wallet
window.stateHooks.store.getState().metamask.isTestnet;
window.stateHooks.getPerpsStreamManager().markets.cache
  .filter((m) => m.marketSource)
  .map((m) => ({ s: m.symbol, type: m.marketType, volume: m.volume, price: m.price }));
```

Requires `perpsHip3AllowlistMarkets` non-empty; LaunchDarkly serves `"xyz:*"` on `dev`,
`""` on `rc` / `prod` / `exp`.
