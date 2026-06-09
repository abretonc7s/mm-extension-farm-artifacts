# Reviewer-Driven Learnings (PR #43357)

- **Async persist + modal lifecycle**: bugbot caught that closing the slippage modal synchronously after `onSave` hides failures from async `setMaxSlippage` — fix-bug should make modal close contingent on resolved persist (await/reject pattern).
- **Deferred price-dependent defaults**: reviewer flagged that `hasSetInitialAmount` locks an uncapped default before `currentPrice` is valid — prefill logic should distinguish "provisional" vs "final" defaults and recap once `getMaxAllowedAmount` inputs are ready.
- **Race between mount and market data**: order-entry hooks that depend on live price need explicit guards so early renders do not freeze stale computed defaults.
