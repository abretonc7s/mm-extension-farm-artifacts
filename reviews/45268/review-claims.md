## Review Claims

Source: PR body claims (linked Jira has no acceptance criteria)

1. "Upgrades `@metamask/perps-controller` from `^10.0.0` to `^11.0.0` so Extension picks up the Core v11 release, and fixes the two compile breaks it causes: v11 widens `PerpsErrorCode` with 15 new codes (11 order-validation codes for trigger placements and partial TP/SL, plus `EXCHANGE_ACCOUNT_NOT_FOUND`, `EXCHANGE_MULTI_SIG_REQUIRED` and `EXCHANGE_INVALID_NONCE`) and widens `OrderType` with the four trigger placement types."
2. "The new `ORDER_*` codes follow the convention `translate-perps-error` already documents (`ORDER_*` funnels into `perpsOrderFailed`, which `CANCEL_ORDER_I18N_KEY_OVERRIDES` remaps on cancel screens)."
3. "`EXCHANGE_ACCOUNT_NOT_FOUND` gets a dedicated `perpsExchangeAccountNotFound` key (\"Add funds to start trading.\"), the actionable \"fund the account before trading\" message the release notes ask for — kept separate from the balance-actions empty-state copy so rewording one cannot silently reword the other."
4. "`handleOrderTypeClick` in `order-entry.tsx` was the only signature that narrowed `OrderType` back to `'market' | 'limit'`; the toggle still renders only the market and limit pills."
5. "v11 also populates `Order.parentOrderId` on real TP/SL children streamed over the WebSocket, which makes the existing `isSameParentByChildLink` branch in `orderUtils` live for the first time (fewer duplicate synthetic rows)."
6. "Open the Perps tab — the balance, market list and recent activity render from the v11 controller."
7. "Open the ETH market — the live price, candle chart, funding rate and open interest stream in."
8. "Press **Long** to open order entry, switch the order type to **Limit** — the limit price field appears and liquidation/margin/fees recompute."
9. "Switch back to **Market** — the limit price field disappears."
