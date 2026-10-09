# Reviewer feedback learnings

- Repeated notional derivation: lead review caught parsing and multiplication copied across fee previews. The original worker should have introduced one USD notional helper and tested partial shorts, reversals and paired triggers before wiring callers.
- Duplicated fallback discounts: close-all copied the fee hook's rewards factor. The original worker should have shared one pure fallback-discount function while keeping resolved controller quotes unchanged.
- Batch fee semantics: reviewers needed every preview to supply the same notional used by submit. The original worker should have checked combined close-all notional, largest TP/SL trigger and quote metadata together, then tested rewards lookup disagreement.
