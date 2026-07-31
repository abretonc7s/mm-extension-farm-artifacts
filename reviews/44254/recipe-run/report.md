# MetaMask Recipe Run

Status: pass
Duration: 56s
Nodes: 102/102 passed

## Side findings
- REVIEW 5 distinct application warning/error event(s) (non-blocking; expanded below and stored in diagnostics.json)

## Steps
- PASS setup-status (app.status, 12ms): platform=extension
- PASS setup-clear-stale-capture-helpers (command, 2.1s): exitCode=0, stdout=CAPTURE_HELPERS_CLEARED

- PASS setup-cdp (cdp.target, 7ms): platform=extension
- PASS setup-unlock (metamask.wallet.ensure_unlocked, 66ms): proof=extension-unlocked-state
- PASS setup-expanded-viewport (command, 753ms): exitCode=0, stdout=VIEWPORT_SET 1100x800

- PASS setup-expanded-viewport-exit (assert_exit_code, 7ms): source=setup-expanded-viewport, expected=0, actual=0
- PASS setup-open-perps (ui.navigate, 566ms): page=perps, proof=ui-navigation
- PASS ac1-navigate-order-entry (ui.navigate, 136ms): proof=ui-navigation
- PASS ac1-wait-order-entry-page (ui.wait_for, 552ms): matched=true, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac1-wait-toggle-affordance (ui.wait_for, 352ms): matched=true, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac1-assert-book-collapsed (ui.wait_for, 369ms): matched=true, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac1-assert-divider-collapsed (ui.wait_for, 361ms): matched=true, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac1-clear-capture-before-screenshot-collapsed-by-default (command, 1.2s): exitCode=0, stdout=CAPTURE_SLOT_FREE

- PASS ac1-screenshot-collapsed-by-default (ui.screenshot, 229ms): path=evidence/evidence-ac1-collapsed-by-default.png
- PASS ac2-press-toggle (ui.press, 477ms): clicked=true, selector=[data-testid="perps-order-book-toggle"], [data-test-id="perps-order-book-toggle"], [data-test="perps-order-book-toggle"], tagName=BUTTON, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac2-wait-panel-visible (ui.wait_for, 375ms): matched=true, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac2-wait-divider-visible (ui.wait_for, 366ms): matched=true, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac2-wait-ask-ladder (ui.wait_for, 3.3s): matched=true, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac2-wait-bid-ladder (ui.wait_for, 370ms): matched=true, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac2-wait-spread-row (ui.wait_for, 366ms): matched=true, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac2-wait-depth-ratio (ui.wait_for, 368ms): matched=true, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac2-clear-capture-before-screenshot-expanded-order-book (command, 1.1s): exitCode=0, stdout=CAPTURE_SLOT_FREE

- PASS ac2-screenshot-expanded-order-book (ui.screenshot, 182ms): path=evidence/evidence-ac2-expanded-order-book.png
- PASS ac4-wait-ask-value (ui.wait_for, 363ms): matched=true, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac4-wait-bid-value (ui.wait_for, 506ms): matched=true, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac4-assert-usd-total-header (ui.wait_for, 611ms): matched=true, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac4-assert-usd-values (command, 73ms): exitCode=0, stdout=AC4_OK asks=5 bids=5 sample={"price":"$1,892","value":"$15K"}

- PASS ac4-assert-usd-values-exit (assert_exit_code, 6ms): source=ac4-assert-usd-values, expected=0, actual=0
- PASS ac4-assert-usd-values-output (assert_output, 6ms): source=ac4-assert-usd-values, stream=stdout, contains=AC4_OK asks=5 bids=5
- PASS ac6-assert-order-type-toggle (ui.wait_for, 383ms): matched=true, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac6-assert-amount-field (ui.wait_for, 511ms): matched=true, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac6-assert-leverage-control (ui.wait_for, 525ms): matched=true, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac6-assert-tpsl-control (ui.wait_for, 359ms): matched=true, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac6-assert-submit-button (ui.wait_for, 359ms): matched=true, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac6-clear-capture-before-screenshot-form-fields-intact (command, 1.1s): exitCode=0, stdout=CAPTURE_SLOT_FREE

- PASS ac6-screenshot-form-fields-intact (ui.screenshot, 188ms): path=evidence/evidence-ac6-form-fields-intact.png
- PASS ac6-run-order-form-regression-tests (command, 4.1s): exitCode=0, stdout=PASS ui/hooks/perps/usePerpsEstimatedSlippage.test.ts
PASS ui/hooks/perps/usePerpsOrderForm.test.ts

 ●  Suppressed console messages:

 SKIP   55    messages were filtered

Test Suites: 2 passed, 2 total
Tests:       42 passed, 42 total
Snapshots:   0 total
Time:        3.099 s, estimated 4 s
Ran all test suites matching /ui\/hooks\/perps\/usePerpsOrderForm.test.ts|ui\/hooks\/perps\/usePerpsEstimatedSlippage.test.ts/i.

✅ No console baseline violations.


- PASS ac6-assert-order-form-exit (assert_exit_code, 6ms): source=ac6-run-order-form-regression-tests, expected=0, actual=0
- PASS ac6-assert-order-form-suites-passed (assert_output, 5ms): source=ac6-run-order-form-regression-tests, stream=stdout, contains=Test Suites: 2 passed
- PASS pr2-focus-divider (command, 43ms): exitCode=0, stdout=PR2_FOCUS_OK valuenow=33

- PASS pr2-assert-focus-exit (assert_exit_code, 4ms): source=pr2-focus-divider, expected=0, actual=0
- PASS pr2-key-arrow-left (ui.key_press, 428ms): key=ArrowLeft, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS pr2-assert-arrow-widened (ui.wait_for, 513ms): matched=true, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS pr2-key-end (ui.key_press, 364ms): key=End, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS pr2-assert-end-at-min (ui.wait_for, 651ms): matched=true, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS pr2-key-home (ui.key_press, 366ms): key=Home, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS pr2-assert-home-at-max (command, 78ms): exitCode=0, stdout=PR2_HOME_OK {"now":"60","min":"22","max":"60"}

- PASS pr2-assert-home-exit (assert_exit_code, 6ms): source=pr2-assert-home-at-max, expected=0, actual=0
- PASS pr2-key-end-before-drag (ui.key_press, 352ms): key=End, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS pr2-assert-at-min-before-drag (ui.wait_for, 362ms): matched=true, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS pr2-drag-divider (command, 709ms): exitCode=0, stdout=PR2_DRAG_OK 22% -> 60% (bounds 22-60)

- PASS pr2-assert-drag-exit (assert_exit_code, 7ms): source=pr2-drag-divider, expected=0, actual=0
- PASS pr2-assert-drag-output (assert_output, 6ms): source=pr2-drag-divider, stream=stdout, contains=PR2_DRAG_OK
- PASS pr2-clear-capture-before-screenshot-resized-split (command, 1.1s): exitCode=0, stdout=CAPTURE_SLOT_FREE

- PASS pr2-screenshot-resized-split (ui.screenshot, 212ms): path=evidence/evidence-pr2-split-resized-to-clamped-max.png
- PASS pr3-open-config-modal (ui.press, 675ms): clicked=true, selector=[data-testid="perps-order-book-grouping-trigger"], [data-test-id="perps-order-book-grouping-trigger"], [data-test="perps-order-book-grouping-trigger"], tagName=BUTTON, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS pr3-wait-config-modal (ui.wait_for, 371ms): matched=true, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS pr3-clear-capture-before-screenshot-config-modal (command, 1.1s): exitCode=0, stdout=CAPTURE_SLOT_FREE

- PASS pr3-screenshot-config-modal (ui.screenshot, 190ms): path=evidence/evidence-pr3-config-modal-open.png
- PASS pr3-select-base-currency (ui.press, 356ms): clicked=true, selector=[data-testid="perps-order-book-config-modal-currency-base"], [data-test-id="perps-order-book-config-modal-currency-base"], [data-test="perps-order-book-config-modal-currency-base"], tagName=DIV, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS pr3-select-size-metric (ui.press, 363ms): clicked=true, selector=[data-testid="perps-order-book-config-modal-metric-size"], [data-test-id="perps-order-book-config-modal-metric-size"], [data-test="perps-order-book-config-modal-metric-size"], tagName=DIV, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS pr3-apply-config (ui.press, 488ms): clicked=true, selector=[data-testid="perps-order-book-config-modal-apply"], [data-test-id="perps-order-book-config-modal-apply"], [data-test="perps-order-book-config-modal-apply"], tagName=BUTTON, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS pr3-assert-header-updated (ui.wait_for, 396ms): matched=true, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS pr3-clear-capture-before-screenshot-config-applied (command, 1.1s): exitCode=0, stdout=CAPTURE_SLOT_FREE

- PASS pr3-screenshot-config-applied (ui.screenshot, 208ms): path=evidence/evidence-pr3-ladder-after-config-change.png
- PASS pr4-tap-ask-price-row (ui.press, 661ms): clicked=true, selector=[data-testid="perps-order-book-ask-row-2"], [data-test-id="perps-order-book-ask-row-2"], [data-test="perps-order-book-ask-row-2"], tagName=DIV, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS pr4-wait-limit-price-field (ui.wait_for, 361ms): matched=true, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS pr4-assert-prefill-matches (command, 76ms): exitCode=0, stdout=PR4_OK tapped=$1,890 limitInput=1890.0

- PASS pr4-assert-prefill-exit (assert_exit_code, 7ms): source=pr4-assert-prefill-matches, expected=0, actual=0
- PASS pr4-assert-prefill-output (assert_output, 6ms): source=pr4-assert-prefill-matches, stream=stdout, contains=PR4_OK
- PASS pr4-clear-capture-before-screenshot-limit-prefilled (command, 1.1s): exitCode=0, stdout=CAPTURE_SLOT_FREE

- PASS pr4-screenshot-limit-prefilled (ui.screenshot, 199ms): path=evidence/evidence-pr4-limit-prefilled-from-price-tap.png
- PASS ac5-shrink-browser-window (command, 1.6s): exitCode=0, stdout=WINDOW_SIZE_SET 500x860 innerWidth=500

- PASS ac5-set-compact-viewport (command, 789ms): exitCode=0, stdout=VIEWPORT_SET 360x700

- PASS ac5-assert-compact-viewport-exit (assert_exit_code, 9ms): source=ac5-set-compact-viewport, expected=0, actual=0
- PASS ac5-wait-ladder-compact (ui.wait_for, 362ms): matched=true, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac5-wait-form-compact (ui.wait_for, 356ms): matched=true, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac5-assert-pixel-floors (command, 70ms): exitCode=0, stdout=AC5_OK {"viewport":360,"bodyWidth":338,"book":140,"form":224,"askRows":5}

- PASS ac5-assert-pixel-floors-exit (assert_exit_code, 5ms): source=ac5-assert-pixel-floors, expected=0, actual=0
- PASS ac5-assert-pixel-floors-output (assert_output, 7ms): source=ac5-assert-pixel-floors, stream=stdout, contains=AC5_OK
- PASS ac5-clear-capture-before-screenshot-compact-split (command, 1.2s): exitCode=0, stdout=CAPTURE_SLOT_FREE

- PASS ac5-screenshot-compact-split (ui.screenshot, 218ms): path=evidence/evidence-ac5-compact-360px-split.png
- PASS ac5-restore-browser-window (command, 1.6s): exitCode=0, stdout=WINDOW_SIZE_SET 1200x916 innerWidth=1200

- PASS ac5-restore-expanded-viewport (command, 780ms): exitCode=0, stdout=VIEWPORT_SET 1100x800

- PASS pr5-capture-eth-ladder (command, 43ms): exitCode=0, stdout=CAPTURED ETH 5 asks

- PASS pr5-assert-capture-exit (assert_exit_code, 5ms): source=pr5-capture-eth-ladder, expected=0, actual=0
- PASS pr5-navigate-btc (ui.navigate, 95ms): proof=ui-navigation
- PASS pr5-assert-fresh-ladder (command, 5.1s): exitCode=0, stdout=PR5_OK ETH -> BTC newTop=$64,196

- PASS pr5-assert-fresh-exit (assert_exit_code, 8ms): source=pr5-assert-fresh-ladder, expected=0, actual=0
- PASS pr5-assert-fresh-output (assert_output, 8ms): source=pr5-assert-fresh-ladder, stream=stdout, contains=PR5_OK
- PASS pr5-clear-capture-before-screenshot-btc-ladder (command, 1.1s): exitCode=0, stdout=CAPTURE_SLOT_FREE

- PASS pr5-screenshot-btc-ladder (ui.screenshot, 206ms): path=evidence/evidence-pr5-ladder-after-market-switch.png
- PASS ac3-run-flag-off-hides-toggle-test (command, 2.9s): exitCode=0, stdout=PASS ui/pages/perps/perps-order-entry-page.test.tsx

 ●  Suppressed console messages:

WARN 1     React: componentWill* lifecycle deprecations

Test Suites: 1 passed, 1 total
Tests:       90 skipped, 1 passed, 91 total
Snapshots:   0 total
Time:        2.181 s, estimated 5 s
Ran all test suites matching /ui\/pages\/perps\/perps-order-entry-page.test.tsx/i with tests matching "does not render the order book toggle when the feature flag is off".

✅ No console baseline violations.


- PASS ac3-assert-flag-off-exit (assert_exit_code, 7ms): source=ac3-run-flag-off-hides-toggle-test, expected=0, actual=0
- PASS ac3-assert-flag-off-test-passed (assert_output, 5ms): source=ac3-run-flag-off-hides-toggle-test, stream=stdout, contains=1 passed
- PASS ac3-run-flag-selector-test (command, 2.0s): exitCode=0, stdout=PASS ui/selectors/perps/feature-flags.test.ts

Test Suites: 1 passed, 1 total
Tests:       34 skipped, 1 passed, 35 total
Snapshots:   0 total
Time:        1.266 s, estimated 3 s
Ran all test suites matching /ui\/selectors\/perps\/feature-flags.test.ts/i with tests matching "returns false when the perpsOrderBookEnabled flag is absent".

✅ No console baseline violations.


- PASS ac3-assert-flag-selector-exit (assert_exit_code, 6ms): source=ac3-run-flag-selector-test, expected=0, actual=0
- PASS ac3-assert-flag-selector-passed (assert_output, 5ms): source=ac3-run-flag-selector-test, stream=stdout, contains=1 passed
- PASS teardown-collapse-order-book (ui.press, 369ms): clicked=true, selector=[data-testid="perps-order-book-toggle"], [data-test-id="perps-order-book-toggle"], [data-test="perps-order-book-toggle"], tagName=BUTTON, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/BTC
- PASS teardown-clear-viewport (command, 574ms): exitCode=0, stdout=VIEWPORT_CLEARED

- PASS teardown-return-perps-home (ui.navigate, 588ms): page=perps, proof=ui-navigation
- PASS teardown-done (end, 0ms)
