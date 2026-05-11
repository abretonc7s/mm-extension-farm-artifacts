# Learnings — PR #42531

- **ext_navigate_hash vs eval_sync for hash navigation**: `ext_navigate_hash` failed to trigger React Router navigation to perps market detail page (15s timeout). Using `eval_sync` with `window.location.hash = '#/perps/market/BTC'` worked immediately. Prefer direct hash assignment via eval_sync for extension navigation in recipes.

- **perps-market-detail-page testid availability**: The `perps-market-detail-page` testid only appears after market data loads (guarded by `marketsLoading` skeleton). With eval_sync hash navigation it loaded within 800ms, but with ext_navigate_hash it timed out. The loading guard may interact differently with the two navigation methods.

- **Order entry page test coverage**: `perps-order-entry-page.test.tsx` has 69 tests — robust coverage for the component. The tests don't specifically test `navigateBack` behavior (history stack), but they cover the component's rendering and callbacks.

- **Back button testid**: `perps-order-entry-back-button` is used in both the market-not-found error state (line 1266) and the main header (line 1338). Recipe `press` on this testid clicks the first visible instance.

- **Recipe screenshots path**: Screenshots from `validate-recipe.js` are saved to `artifacts/screenshots/` with timestamp suffixes, not directly to `artifacts/evidence/`. Need to copy them to evidence dir for the review workflow.

- **Perps route patterns**: Market detail is `/perps/market/:symbol`, order entry is `/perps/trade/:symbol`. Both are hash routes under home.html in fullscreen mode.

- **React deprecation warning baseline**: `componentWillReceiveProps` deprecation warning appears during perps page navigation. This is a baseline warning from a library component, not PR-specific. Don't report it.

- **Arrow function wrapper on onClick is intentional**: When a callback accepts typed optional params (like `PerpsToastRouteState`), wrapping in `() => fn()` prevents React's SyntheticEvent from being passed as an unintended argument. This is a valid pattern, not a perf concern worth flagging as a suggestion.
