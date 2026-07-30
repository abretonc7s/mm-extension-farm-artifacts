# MetaMask Recipe Run

Status: pass
Duration: 24s
Nodes: 49/49 passed

## Side findings
- REVIEW 2 distinct application warning/error event(s) (non-blocking; expanded below and stored in diagnostics.json)

## Steps
- PASS setup-status (app.status, 10ms): platform=extension
- PASS setup-cdp (cdp.target, 10ms): platform=extension
- PASS setup-unlock (metamask.wallet.ensure_unlocked, 93ms): proof=extension-unlocked-state
- PASS setup-open-perps (ui.navigate, 307ms): page=perps, proof=ui-navigation
- PASS ac1-navigate-order-entry (ui.navigate, 132ms): proof=ui-navigation
- PASS ac1-wait-order-entry-page (ui.wait_for, 448ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac1-wait-toggle-affordance (ui.wait_for, 349ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac1-assert-book-collapsed (ui.wait_for, 344ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac1-assert-divider-collapsed (ui.wait_for, 351ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac1-screenshot-collapsed-by-default (ui.screenshot, 219ms): path=evidence/evidence-ac1-collapsed-by-default.png
- PASS ac2-press-toggle (ui.press, 851ms): clicked=true, selector=[data-testid="perps-order-book-toggle"], [data-test-id="perps-order-book-toggle"], [data-test="perps-order-book-toggle"], tagName=BUTTON, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac2-wait-panel-visible (ui.wait_for, 685ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac2-wait-divider-visible (ui.wait_for, 388ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac2-wait-ladder-rows (ui.wait_for, 350ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac2-wait-depth-ratio (ui.wait_for, 342ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac2-screenshot-expanded-order-book (ui.screenshot, 197ms): path=evidence/evidence-ac2-expanded-order-book.png
- PASS ac4-wait-ask-price (ui.wait_for, 337ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac4-wait-ask-value (ui.wait_for, 420ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac4-wait-bid-price (ui.wait_for, 615ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac4-wait-bid-value (ui.wait_for, 342ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac4-assert-usd-total-header (ui.wait_for, 557ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac4-screenshot-price-levels-usd-totals (ui.screenshot, 169ms): path=evidence/evidence-ac4-price-levels-usd-totals.png
- PASS ac3-run-flag-off-hides-toggle-test (command, 4.3s): exitCode=0, stdout=PASS ui/pages/perps/perps-order-entry-page.test.tsx

 ●  Suppressed console messages:

WARN 1     React: componentWill* lifecycle deprecations

Test Suites: 1 passed, 1 total
Tests:       89 skipped, 1 passed, 90 total
Snapshots:   0 total
Time:        3.412 s, estimated 4 s
Ran all test suites matching /ui\/pages\/perps\/perps-order-entry-page.test.tsx/i with tests matching "does not render the order book toggle when the feature flag is off".

✅ No console baseline violations.


- PASS ac3-assert-flag-off-exit (assert_exit_code, 5ms): source=ac3-run-flag-off-hides-toggle-test, expected=0, actual=0
- PASS ac3-assert-flag-off-test-passed (assert_output, 6ms): source=ac3-run-flag-off-hides-toggle-test, stream=stdout, contains=1 passed
- PASS ac3-run-flag-selector-test (command, 2.1s): exitCode=0, stdout=PASS ui/selectors/perps/feature-flags.test.ts

Test Suites: 1 passed, 1 total
Tests:       34 skipped, 1 passed, 35 total
Snapshots:   0 total
Time:        1.314 s, estimated 2 s
Ran all test suites matching /ui\/selectors\/perps\/feature-flags.test.ts/i with tests matching "returns false when the perpsOrderBookEnabled flag is absent".

✅ No console baseline violations.


- PASS ac3-assert-flag-selector-exit (assert_exit_code, 4ms): source=ac3-run-flag-selector-test, expected=0, actual=0
- PASS ac3-assert-flag-selector-passed (assert_output, 4ms): source=ac3-run-flag-selector-test, stream=stdout, contains=1 passed
- PASS ac5-run-narrow-body-clamp-test (command, 1.5s): exitCode=0, stdout=PASS ui/components/app/perps/order-book/order-book.utils.test.ts

Test Suites: 1 passed, 1 total
Tests:       34 skipped, 1 passed, 35 total
Snapshots:   0 total
Time:        0.846 s
Ran all test suites matching /ui\/components\/app\/perps\/order-book\/order-book.utils.test.ts/i with tests matching "caps the width so the form keeps its pixel floor on a narrow body".

✅ No console baseline violations.


- PASS ac5-assert-narrow-body-exit (assert_exit_code, 6ms): source=ac5-run-narrow-body-clamp-test, expected=0, actual=0
- PASS ac5-assert-narrow-body-passed (assert_output, 8ms): source=ac5-run-narrow-body-clamp-test, stream=stdout, contains=1 passed
- PASS ac5-run-popup-ceiling-test (command, 1.6s): exitCode=0, stdout=PASS ui/components/app/perps/order-book/order-book.utils.test.ts

Test Suites: 1 passed, 1 total
Tests:       34 skipped, 1 passed, 35 total
Snapshots:   0 total
Time:        0.767 s, estimated 1 s
Ran all test suites matching /ui\/components\/app\/perps\/order-book\/order-book.utils.test.ts/i with tests matching "returns the pixel-aware ceiling on a narrow popup body".

✅ No console baseline violations.


- PASS ac5-assert-popup-ceiling-exit (assert_exit_code, 7ms): source=ac5-run-popup-ceiling-test, expected=0, actual=0
- PASS ac5-assert-popup-ceiling-passed (assert_output, 5ms): source=ac5-run-popup-ceiling-test, stream=stdout, contains=1 passed
- PASS ac5-screenshot-fullscreen-split-layout (ui.screenshot, 160ms): path=evidence/evidence-ac5-fullscreen-split-layout.png
- PASS ac6-press-bid-price-row (ui.press, 820ms): clicked=true, selector=[data-testid="perps-order-book-bid-row-0"], [data-test-id="perps-order-book-bid-row-0"], [data-test="perps-order-book-bid-row-0"], tagName=DIV, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac6-wait-limit-price-field (ui.wait_for, 351ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac6-wait-order-type-toggle (ui.wait_for, 345ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac6-wait-amount-field (ui.wait_for, 355ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac6-wait-leverage-control (ui.wait_for, 345ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac6-wait-auto-close-tpsl (ui.wait_for, 345ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac6-wait-submit-button (ui.wait_for, 351ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac6-screenshot-form-fields-intact (ui.screenshot, 198ms): path=evidence/evidence-ac6-form-fields-intact.png
- PASS ac6-run-order-form-regression-tests (command, 3.1s): exitCode=0, stdout=PASS ui/hooks/perps/usePerpsEstimatedSlippage.test.ts
  console.error
    Warning: `ReactDOMTestUtils.act` is deprecated in favor of `React.act`. Import `act` from `react` instead of `react-dom/test-utils`. See https://react.dev/warnings/react-dom-test-utils for more info.

      32 |
      33 |   it('subscribes to the shared order book without managing the stream', () => {
    > 34 |     renderHook(() =>
         |               ^
      35 |       usePerpsEstimatedSlippage({
      36 |         symbol: 'BTC',
      37 |         sizeUsd: 100,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:71:30)
      at error (node_modules/react-dom/cjs/react-dom-test-utils.development.js:45:7)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1736:7)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at Object.<anonymous> (ui/hooks/perps/usePerpsEstimatedSlippage.test.ts:34:15)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      32 |
      33 |   it('subscribes to the shared order book without managing the stream', () => {
    > 34 |     renderHook(() =>
         |               ^
      35 |       usePerpsEstimatedSlippage({
      36 |         symbol: 'BTC',
      37 |         sizeUsd: 100,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at Object.<anonymous> (ui/hooks/perps/usePerpsEstimatedSlippage.test.ts:34:15)

  console.error
    Warning: unmountComponentAtNode is deprecated and will be removed in the next major release. Switch to the createRoot API. Learn more: https://reactjs.org/link/switch-to-createroot

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.unmountComponentAtNode (node_modules/react-dom/cjs/react-dom.development.js:29754:7)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:92:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at unmount (node_modules/@testing-library/react-hooks/lib/dom/pure.js:91:26)
      at unmountHook (node_modules/@testing-library/react-hooks/lib/core/index.js:123:7)
      at cleanup (node_modules/@testing-library/react-hooks/lib/core/cleanup.js:14:11)
      at Object.<anonymous> (node_modules/@testing-library/react-hooks/lib/core/cleanup.js:42:13)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      49 |
      50 |   it('returns null when estimation is disabled', () => {
    > 51 |     const { result } = renderHook(() =>
         |                                  ^
      52 |       usePerpsEstimatedSlippage({
      53 |         symbol: 'BTC',
      54 |         sizeUsd: 100,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at Object.<anonymous> (ui/hooks/perps/usePerpsEstimatedSlippage.test.ts:51:34)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      63 |
      64 |   it('clears readiness immediately when the symbol changes', () => {
    > 65 |     const { result, rerender } = renderHook(
         |                                            ^
      66 |       ({ symbol }: { symbol: string }) =>
      67 |         usePerpsEstimatedSlippage({
      68 |           symbol,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at Object.<anonymous> (ui/hooks/perps/usePerpsEstimatedSlippage.test.ts:65:44)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      81 |       reconnect: jest.fn(),
      82 |     });
    > 83 |     rerender({ symbol: 'ETH' });
         |     ^
      84 |
      85 |     expect(result.current.isReady).toBe(false);
      86 |     expect(result.current.estimatedSlippageBps).toBeNull();

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:86:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at rerender (node_modules/@testing-library/react-hooks/lib/dom/pure.js:85:26)
      at rerenderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:118:7)
      at Object.rerender (ui/hooks/perps/usePerpsEstimatedSlippage.test.ts:83:5)

  console.error
    Warning: `ReactDOMTestUtils.act` is deprecated in favor of `React.act`. Import `act` from `react` instead of `react-dom/test-utils`. See https://react.dev/warnings/react-dom-test-utils for more info.

      193 |     : ProviderWrapper;
      194 |
    > 195 |   const hookResult = renderHook(hook, { wrapper });
          |                                ^
      196 |
      197 |   return {
      198 |     ...hookResult,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:71:30)
      at error (node_modules/react-dom/cjs/react-dom-test-utils.development.js:45:7)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1736:7)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at renderHookWithProvider (test/lib/render-helpers-navigate.js:195:32)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:54:48)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      193 |     : ProviderWrapper;
      194 |
    > 195 |   const hookResult = renderHook(hook, { wrapper });
          |                                ^
      196 |
      197 |   return {
      198 |     ...hookResult,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at renderHookWithProvider (test/lib/render-helpers-navigate.js:195:32)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:54:48)

  console.error
    Warning: unmountComponentAtNode is deprecated and will be removed in the next major release. Switch to the createRoot API. Learn more: https://reactjs.org/link/switch-to-createroot

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.unmountComponentAtNode (node_modules/react-dom/cjs/react-dom.development.js:29754:7)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:92:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at unmount (node_modules/@testing-library/react-hooks/lib/dom/pure.js:91:26)
      at unmountHook (node_modules/@testing-library/react-hooks/lib/core/index.js:123:7)
      at cleanup (node_modules/@testing-library/react-hooks/lib/core/cleanup.js:14:11)
      at Object.<anonymous> (node_modules/@testing-library/react-hooks/lib/core/cleanup.js:42:13)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      193 |     : ProviderWrapper;
      194 |
    > 195 |   const hookResult = renderHook(hook, { wrapper });
          |                                ^
      196 |
      197 |   return {
      198 |     ...hookResult,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at renderHookWithProvider (test/lib/render-helpers-navigate.js:195:32)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:72:48)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      193 |     : ProviderWrapper;
      194 |
    > 195 |   const hookResult = renderHook(hook, { wrapper });
          |                                ^
      196 |
      197 |   return {
      198 |     ...hookResult,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at renderHookWithProvider (test/lib/render-helpers-navigate.js:195:32)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:81:48)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      193 |     : ProviderWrapper;
      194 |
    > 195 |   const hookResult = renderHook(hook, { wrapper });
          |                                ^
      196 |
      197 |   return {
      198 |     ...hookResult,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at renderHookWithProvider (test/lib/render-helpers-navigate.js:195:32)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:101:58)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      108 |       props.currentPrice = 45000;
      109 |       act(() => {
    > 110 |         rerender();
          |         ^
      111 |       });
      112 |
      113 |       expect(result.current.formState.amount).not.toBe('10');

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:86:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at rerender (node_modules/@testing-library/react-hooks/lib/dom/pure.js:85:26)
      at rerenderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:118:7)
      at rerender (ui/hooks/perps/usePerpsOrderForm.test.ts:110:9)
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:109:10)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      193 |     : ProviderWrapper;
      194 |
    > 195 |   const hookResult = renderHook(hook, { wrapper });
          |                                ^
      196 |
      197 |   return {
      198 |     ...hookResult,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at renderHookWithProvider (test/lib/render-helpers-navigate.js:195:32)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:127:58)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      136 |       props.availableBalance = 1000;
      137 |       act(() => {
    > 138 |         rerender();
          |         ^
      139 |       });
      140 |
      141 |       expect(result.current.formState.amount).toBe('10');

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:86:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at rerender (node_modules/@testing-library/react-hooks/lib/dom/pure.js:85:26)
      at rerenderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:118:7)
      at rerender (ui/hooks/perps/usePerpsOrderForm.test.ts:138:9)
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:137:10)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      193 |     : ProviderWrapper;
      194 |
    > 195 |   const hookResult = renderHook(hook, { wrapper });
          |                                ^
      196 |
      197 |   return {
      198 |     ...hookResult,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at renderHookWithProvider (test/lib/render-helpers-navigate.js:195:32)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:163:58)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      171 |       props.availableBalance = 1000;
      172 |       act(() => {
    > 173 |         rerender();
          |         ^
      174 |       });
      175 |
      176 |       expect(result.current.formState.amount).toBe('10');

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:86:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at rerender (node_modules/@testing-library/react-hooks/lib/dom/pure.js:85:26)
      at rerenderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:118:7)
      at rerender (ui/hooks/perps/usePerpsOrderForm.test.ts:173:9)
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:172:10)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      193 |     : ProviderWrapper;
      194 |
    > 195 |   const hookResult = renderHook(hook, { wrapper });
          |                                ^
      196 |
      197 |   return {
      198 |     ...hookResult,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at renderHookWithProvider (test/lib/render-helpers-navigate.js:195:32)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:186:58)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      196 |       props.currentPrice = 45000;
      197 |       act(() => {
    > 198 |         rerender();
          |         ^
      199 |       });
      200 |
      201 |       expect(result.current.formState.amount).toBe('5');

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:86:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at rerender (node_modules/@testing-library/react-hooks/lib/dom/pure.js:85:26)
      at rerenderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:118:7)
      at rerender (ui/hooks/perps/usePerpsOrderForm.test.ts:198:9)
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:197:10)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      193 |     : ProviderWrapper;
      194 |
    > 195 |   const hookResult = renderHook(hook, { wrapper });
          |                                ^
      196 |
      197 |   return {
      198 |     ...hookResult,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at renderHookWithProvider (test/lib/render-helpers-navigate.js:195:32)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:205:48)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      193 |     : ProviderWrapper;
      194 |
    > 195 |   const hookResult = renderHook(hook, { wrapper });
          |                                ^
      196 |
      197 |   return {
      198 |     ...hookResult,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at renderHookWithProvider (test/lib/render-helpers-navigate.js:195:32)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:222:58)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      229 |       props.initialLeverage = 8;
      230 |       act(() => {
    > 231 |         rerender();
          |         ^
      232 |       });
      233 |
      234 |       expect(result.current.formState.leverage).toBe(8);

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:86:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at rerender (node_modules/@testing-library/react-hooks/lib/dom/pure.js:85:26)
      at rerenderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:118:7)
      at rerender (ui/hooks/perps/usePerpsOrderForm.test.ts:231:9)
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:230:10)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      193 |     : ProviderWrapper;
      194 |
    > 195 |   const hookResult = renderHook(hook, { wrapper });
          |                                ^
      196 |
      197 |   return {
      198 |     ...hookResult,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at renderHookWithProvider (test/lib/render-helpers-navigate.js:195:32)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:243:48)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      193 |     : ProviderWrapper;
      194 |
    > 195 |   const hookResult = renderHook(hook, { wrapper });
          |                                ^
      196 |
      197 |   return {
      198 |     ...hookResult,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at renderHookWithProvider (test/lib/render-helpers-navigate.js:195:32)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:258:48)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      193 |     : ProviderWrapper;
      194 |
    > 195 |   const hookResult = renderHook(hook, { wrapper });
          |                                ^
      196 |
      197 |   return {
      198 |     ...hookResult,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at renderHookWithProvider (test/lib/render-helpers-navigate.js:195:32)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:281:48)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      193 |     : ProviderWrapper;
      194 |
    > 195 |   const hookResult = renderHook(hook, { wrapper });
          |                                ^
      196 |
      197 |   return {
      198 |     ...hookResult,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at renderHookWithProvider (test/lib/render-helpers-navigate.js:195:32)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:295:48)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      193 |     : ProviderWrapper;
      194 |
    > 195 |   const hookResult = renderHook(hook, { wrapper });
          |                                ^
      196 |
      197 |   return {
      198 |     ...hookResult,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at renderHookWithProvider (test/lib/render-helpers-navigate.js:195:32)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:310:48)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      193 |     : ProviderWrapper;
      194 |
    > 195 |   const hookResult = renderHook(hook, { wrapper });
          |                                ^
      196 |
      197 |   return {
      198 |     ...hookResult,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at renderHookWithProvider (test/lib/render-helpers-navigate.js:195:32)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:324:48)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      193 |     : ProviderWrapper;
      194 |
    > 195 |   const hookResult = renderHook(hook, { wrapper });
          |                                ^
      196 |
      197 |   return {
      198 |     ...hookResult,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at renderHookWithProvider (test/lib/render-helpers-navigate.js:195:32)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:341:48)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      193 |     : ProviderWrapper;
      194 |
    > 195 |   const hookResult = renderHook(hook, { wrapper });
          |                                ^
      196 |
      197 |   return {
      198 |     ...hookResult,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at renderHookWithProvider (test/lib/render-helpers-navigate.js:195:32)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:354:48)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      193 |     : ProviderWrapper;
      194 |
    > 195 |   const hookResult = renderHook(hook, { wrapper });
          |                                ^
      196 |
      197 |   return {
      198 |     ...hookResult,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at renderHookWithProvider (test/lib/render-helpers-navigate.js:195:32)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:367:48)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      193 |     : ProviderWrapper;
      194 |
    > 195 |   const hookResult = renderHook(hook, { wrapper });
          |                                ^
      196 |
      197 |   return {
      198 |     ...hookResult,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at renderHookWithProvider (test/lib/render-helpers-navigate.js:195:32)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:380:48)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      193 |     : ProviderWrapper;
      194 |
    > 195 |   const hookResult = renderHook(hook, { wrapper });
          |                                ^
      196 |
      197 |   return {
      198 |     ...hookResult,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at renderHookWithProvider (test/lib/render-helpers-navigate.js:195:32)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:393:48)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      193 |     : ProviderWrapper;
      194 |
    > 195 |   const hookResult = renderHook(hook, { wrapper });
          |                                ^
      196 |
      197 |   return {
      198 |     ...hookResult,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at renderHookWithProvider (test/lib/render-helpers-navigate.js:195:32)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:406:48)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      193 |     : ProviderWrapper;
      194 |
    > 195 |   const hookResult = renderHook(hook, { wrapper });
          |                                ^
      196 |
      197 |   return {
      198 |     ...hookResult,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at renderHookWithProvider (test/lib/render-helpers-navigate.js:195:32)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:419:48)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      193 |     : ProviderWrapper;
      194 |
    > 195 |   const hookResult = renderHook(hook, { wrapper });
          |                                ^
      196 |
      197 |   return {
      198 |     ...hookResult,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at renderHookWithProvider (test/lib/render-helpers-navigate.js:195:32)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:433:48)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      193 |     : ProviderWrapper;
      194 |
    > 195 |   const hookResult = renderHook(hook, { wrapper });
          |                                ^
      196 |
      197 |   return {
      198 |     ...hookResult,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at renderHookWithProvider (test/lib/render-helpers-navigate.js:195:32)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:462:48)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      193 |     : ProviderWrapper;
      194 |
    > 195 |   const hookResult = renderHook(hook, { wrapper });
          |                                ^
      196 |
      197 |   return {
      198 |     ...hookResult,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at renderHookWithProvider (test/lib/render-helpers-navigate.js:195:32)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:475:48)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      193 |     : ProviderWrapper;
      194 |
    > 195 |   const hookResult = renderHook(hook, { wrapper });
          |                                ^
      196 |
      197 |   return {
      198 |     ...hookResult,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at renderHookWithProvider (test/lib/render-helpers-navigate.js:195:32)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:498:48)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      193 |     : ProviderWrapper;
      194 |
    > 195 |   const hookResult = renderHook(hook, { wrapper });
          |                                ^
      196 |
      197 |   return {
      198 |     ...hookResult,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at renderHookWithProvider (test/lib/render-helpers-navigate.js:195:32)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:520:48)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      193 |     : ProviderWrapper;
      194 |
    > 195 |   const hookResult = renderHook(hook, { wrapper });
          |                                ^
      196 |
      197 |   return {
      198 |     ...hookResult,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at renderHookWithProvider (test/lib/render-helpers-navigate.js:195:32)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:541:48)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      193 |     : ProviderWrapper;
      194 |
    > 195 |   const hookResult = renderHook(hook, { wrapper });
          |                                ^
      196 |
      197 |   return {
      198 |     ...hookResult,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at renderHookWithProvider (test/lib/render-helpers-navigate.js:195:32)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:561:48)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      193 |     : ProviderWrapper;
      194 |
    > 195 |   const hookResult = renderHook(hook, { wrapper });
          |                                ^
      196 |
      197 |   return {
      198 |     ...hookResult,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at renderHookWithProvider (test/lib/render-helpers-navigate.js:195:32)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:583:48)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      193 |     : ProviderWrapper;
      194 |
    > 195 |   const hookResult = renderHook(hook, { wrapper });
          |                                ^
      196 |
      197 |   return {
      198 |     ...hookResult,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at renderHookWithProvider (test/lib/render-helpers-navigate.js:195:32)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:603:48)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      193 |     : ProviderWrapper;
      194 |
    > 195 |   const hookResult = renderHook(hook, { wrapper });
          |                                ^
      196 |
      197 |   return {
      198 |     ...hookResult,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at renderHookWithProvider (test/lib/render-helpers-navigate.js:195:32)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:619:48)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      193 |     : ProviderWrapper;
      194 |
    > 195 |   const hookResult = renderHook(hook, { wrapper });
          |                                ^
      196 |
      197 |   return {
      198 |     ...hookResult,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at renderHookWithProvider (test/lib/render-helpers-navigate.js:195:32)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:651:48)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      193 |     : ProviderWrapper;
      194 |
    > 195 |   const hookResult = renderHook(hook, { wrapper });
          |                                ^
      196 |
      197 |   return {
      198 |     ...hookResult,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at renderHookWithProvider (test/lib/render-helpers-navigate.js:195:32)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:674:48)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      193 |     : ProviderWrapper;
      194 |
    > 195 |   const hookResult = renderHook(hook, { wrapper });
          |                                ^
      196 |
      197 |   return {
      198 |     ...hookResult,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at renderHookWithProvider (test/lib/render-helpers-navigate.js:195:32)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:701:58)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      711 |       orderType = 'limit';
      712 |       act(() => {
    > 713 |         rerender();
          |         ^
      714 |       });
      715 |
      716 |       expect(result.current.formState.amount).toBe('1000');

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:86:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at rerender (node_modules/@testing-library/react-hooks/lib/dom/pure.js:85:26)
      at rerenderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:118:7)
      at rerender (ui/hooks/perps/usePerpsOrderForm.test.ts:713:9)
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:712:10)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      193 |     : ProviderWrapper;
      194 |
    > 195 |   const hookResult = renderHook(hook, { wrapper });
          |                                ^
      196 |
      197 |   return {
      198 |     ...hookResult,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at renderHookWithProvider (test/lib/render-helpers-navigate.js:195:32)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:729:48)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      193 |     : ProviderWrapper;
      194 |
    > 195 |   const hookResult = renderHook(hook, { wrapper });
          |                                ^
      196 |
      197 |   return {
      198 |     ...hookResult,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at renderHookWithProvider (test/lib/render-helpers-navigate.js:195:32)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:743:58)

PASS ui/hooks/perps/usePerpsOrderForm.test.ts
Test Suites: 2 passed, 2 total
Tests:       42 passed, 42 total
Snapshots:   0 total
Time:        2.408 s
Ran all test suites matching /ui\/hooks\/perps\/usePerpsOrderForm.test.ts|ui\/hooks\/perps\/usePerpsEstimatedSlippage.test.ts/i.
  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      755 |       props.limitPricePrefill = { price: '73790' };
      756 |       act(() => {
    > 757 |         rerender();
          |         ^
      758 |       });
      759 |
      760 |       expect(result.current.formState.limitPrice).toBe('73790');

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:86:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at rerender (node_modules/@testing-library/react-hooks/lib/dom/pure.js:85:26)
      at rerenderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:118:7)
      at rerender (ui/hooks/perps/usePerpsOrderForm.test.ts:757:9)
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:756:10)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      193 |     : ProviderWrapper;
      194 |
    > 195 |   const hookResult = renderHook(hook, { wrapper });
          |                                ^
      196 |
      197 |   return {
      198 |     ...hookResult,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at renderHookWithProvider (test/lib/render-helpers-navigate.js:195:32)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:769:58)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      778 |       // Re-render without changing the prefill reference must not clobber edits.
      779 |       act(() => {
    > 780 |         rerender();
          |         ^
      781 |       });
      782 |
      783 |       expect(result.current.formState.limitPrice).toBe('70000');

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:86:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at rerender (node_modules/@testing-library/react-hooks/lib/dom/pure.js:85:26)
      at rerenderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:118:7)
      at rerender (ui/hooks/perps/usePerpsOrderForm.test.ts:780:9)
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:779:10)

  console.error
    Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

      193 |     : ProviderWrapper;
      194 |
    > 195 |   const hookResult = renderHook(hook, { wrapper });
          |                                ^
      196 |
      197 |   return {
      198 |     ...hookResult,

      at console.error (node_modules/@testing-library/react-hooks/lib/core/console.js:19:7)
      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at Object.render (node_modules/react-dom/cjs/react-dom.development.js:29716:5)
      at node_modules/@testing-library/react-hooks/lib/dom/pure.js:80:18
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1740:10)
      at render (node_modules/@testing-library/react-hooks/lib/dom/pure.js:79:26)
      at renderHook (node_modules/@testing-library/react-hooks/lib/core/index.js:114:5)
      at renderHookWithProvider (test/lib/render-helpers-navigate.js:195:32)
      at Object.<anonymous> (ui/hooks/perps/usePerpsOrderForm.test.ts:790:48)


✅ No console baseline violations.


- PASS ac6-assert-order-form-exit (assert_exit_code, 5ms): source=ac6-run-order-form-regression-tests, expected=0, actual=0
- PASS ac6-assert-order-form-suites-passed (assert_output, 5ms): source=ac6-run-order-form-regression-tests, stream=stdout, contains=Test Suites: 2 passed
- PASS teardown-collapse-order-book (ui.press, 353ms): clicked=true, selector=[data-testid="perps-order-book-toggle"], [data-test-id="perps-order-book-toggle"], [data-test="perps-order-book-toggle"], tagName=BUTTON, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS teardown-return-perps-home (ui.navigate, 325ms): page=perps, proof=ui-navigation
- PASS teardown-done (end, 0ms)
