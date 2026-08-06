# Code review notes

- The v11 changelog lists 11 new `ORDER_*` validation codes and 3 new `EXCHANGE_*` codes; all are present in the exhaustive `ERROR_CODE_TO_I18N_KEY` map. `yarn lint:tsc` confirms the real controller union is covered.
- `EXCHANGE_ACCOUNT_NOT_FOUND` resolves to a distinct locale key in both English locale files; cancel-flow remapping still converts generic order failures to cancel-specific copy.
- `OrderTypeToggle` renders and emits only `market` and `limit`, with `ButtonBase`, visible labels, `aria-pressed`, and stable `data-testid` values. The widened handler therefore has no new runtime input path today.
- Production `placeOrder` paths do not supply `grouping`, `tpslLinkage`, or `timeInForce`. New-position market TP/SL remains a two-step place-then-update flow.
- No production UI caller consumes the optional `orderId` returned by `editOrder`.
- The existing child-parent deduplication checks parent link, symbol, side, reduce-only/trigger flags, and price tolerance. The added positive and negative tests exercise the newly live `parentOrderId` branch.
- No import-boundary violation, hardcoded chain ID/network URL, or newly added interactive element missing a test ID was found.
- LavaMoat files are unchanged; the lockfile changes the existing perps-controller stanza and its existing `@metamask/superstruct` range without adding a new package stanza.
- Accessibility/fallback pass: no pressable or text affordance markup changed. The existing Market/Limit buttons retain visible accessible names and `aria-pressed`; the new controller error is translated before entering the existing failure-toast path, with the established generic fallback retained for unknown errors. No async numeric precision or loading placeholder changed.
