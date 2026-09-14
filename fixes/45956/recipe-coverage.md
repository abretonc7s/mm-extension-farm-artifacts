# PR #45956 review fix — Recipe coverage

Recipe: `artifacts/recipe-review-fix.json` · Run: `artifacts/recipe-review-fix-run/` (`status: pass`, exit 0, screenshot provider `capture-helper`)

Inherited `artifacts/recipe.json` is stale (deleted helper test path, CDP 7665, removed `All` pill and `overflow-x-auto` rail) and failed before driving the UI; it is not used as proof for this pass.

| Claim | Proof mode | Primary evidence | Recipe nodes | Verdict | Rationale |
|---|---|---|---|---|---|
| R1: Products chips follow the controller's `MARKET_CATEGORIES` order plus `new`, with no hand-kept list (aganglada 3988690168 / 3990013492) | mixed | `recipe-review-fix-run/screenshots/products-controller-order.png`; `perps-products.test.tsx` "chips every category the controller owns, in its order" | `assert-first-crypto`, `assert-index-fourth`, `assert-commodity-sixth`, `assert-new-last`, `screenshot-products` | **PROVEN** | The removed design order put `commodity` 4th and `new` 6th; the live DOM asserts `index` at `:nth-child(4)`, `commodity` at 6 and `new` at 8 and last, so the old order fails. Screenshot shows Crypto, Stocks, Pre-IPO, Indices, ETFs, Commodities, Forex, New. The unit test pins `PERPS_PRODUCT_CATEGORIES` to `[...MARKET_CATEGORIES, 'new']`. |
| R2: Products chips wrap instead of scrolling | visual | same screenshot | `assert-wraps`, `screenshot-products` | **PROVEN** | `[data-testid="perps-products-categories"].flex-wrap[role="group"]` matched live; screenshot shows `New` on a second line. |
| R3: Wrap-layout loading skeleton reserves the loaded rail's height (bugbot 3979413768) | test | `perps-category-rail.test.tsx` "wraps a skeleton pill per category in the wrap layout"; `perps-products.test.tsx` skeleton count | none (jest via `mm-harness check diff`, jest pass) | **PROVEN** | The loading window is transient, so it is not raced with a screenshot. Tests assert one skeleton per category in a `flex-wrap` row (not `overflow-hidden`); the chip skeleton class `h-10` matches `ButtonBaseSize.Md` = `h-10` in design-system `ButtonBase.constants`, and the rebuilt dist bundle contains `h-10 w-20 shrink-0 rounded-full`. |

Overall recipe coverage: 3/3 claims PROVEN (untestable: none, weak: 0, missing: 0)
