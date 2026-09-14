- Mode-scoped loading guards: Bugbot caught that `isLoadingAccount` was restored as a global submit disable. The unfunded CTA only applies in `orderMode === 'new'`; close/modify already have their own validations. Re-adding a dropped guard must match the original predicate, not a broader one.

- Zero-balance fallback is not unfunded: `getTradeableBalance` returns `0` while `account` is null. Treat displayed-zero as unfunded only after `!isLoadingAccount`, or a funded wallet looks empty and the primary button becomes Add funds to trade.

- Row CTA and footer can diverge: the labeled Add funds row control can flip to unfunded from the same zero fallback even when the footer still waits on loading. Gate both surfaces (and `handleAddFunds`) on the same hydration flag.

- Tests for the restored path: new-order loading tests do not protect close/modify. After tightening a loading guard, add enabled-state tests for the modes that must stay usable.
