# Learnings — TAT-2901

- **Split state storage**: MetaMask recently migrated from `chrome.storage.local.get('data').data.ControllerName` to `chrome.storage.local.get('ControllerName')` (top-level keys). The old `data` nested path still exists for legacy keys but PerpsController uses the new split format. Always check `chrome.storage.local.get(null)` to see all keys before writing recipe assertions.

- **react-toggle Playwright click failure**: `[data-testid]` on a `react-toggle-button` input is intercepted by the visual overlay div. Playwright's `locator.click()` fails with "element intercepts pointer events." Use `eval_sync` with `element.parentElement.click()` to bypass the hit-testing.

- **Browser recovery cost**: Using `reopen-browser.sh` wipes the wallet fixture. Only use it when the extension itself is crashed (ERR_BLOCKED_BY_CLIENT). If the browser is just on the wrong page, use `page.goto()` or `ext_navigate_hash`.

- **`chrome.runtime.reload()` from service worker kills the extension**: Caused ERR_BLOCKED_BY_CLIENT. Never call it via CDP eval. Only use it in extension code that handles reload gracefully.

- **`eval_sync` / `eval_async` run in home.html page context** (not the actual service worker). `chrome.*` APIs work, `document.*` works. `window.stateHooks.getCleanAppState()` may return `{}` if called before store hydration.
