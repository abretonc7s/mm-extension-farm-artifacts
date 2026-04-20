# Learnings — PR #41881

- The recipe validator's assert system does not support composite operators (`and`, `or`, `not`). Flatten composite assertions into a single boolean field returned from `eval_sync`.
- `pre_conditions` only supports `wallet.unlocked` — custom conditions like `perps.active` are not recognized. Check state via `status.ts` or `eval_sync` instead.
- The `BoxJustifyContent.Start` enum maps to `normal` (not `flex-start` or `start`) in computed styles. Use `neq "center"` rather than `contains "start"` for alignment assertions.
- The `perps-candle-period-selector` testid is on the outer Box element directly — no need to query child elements for alignment checks.
- Order entry page route is `/perps/trade/:symbol` and the submit button testid is `submit-order-button` (on the page) vs `order-entry-submit-button` (on the component). Use the page-level testid.
- Using `navigate` action with `target: "PerpsOrderEntry"` works for order entry navigation; `ext_navigate_hash` may not trigger React Router properly.
- Stats labels in the market detail page have no individual data-testids — use page-level `textContent` search for sentence case validation.
- The `perpsSeeAll` i18n key removal spans 16 locale files — when reviewing locale changes, verify the key is removed from ALL locales, not just `en`.
- `formatSignedChangePercent` in `utils.ts` builds on `formatChangePercent` by adding explicit `+` prefix for positive values — a clean separation of concerns.
- Recipe screenshots land in `test-artifacts/screenshots/` with timestamps appended — copy to evidence folder with cleaned filenames for review.
