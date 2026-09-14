# MetaMask Recipe Run

Status: pass
Duration: 16s
Nodes: 26/26 passed

## Side findings
- REVIEW 2 distinct application warning/error event(s) (non-blocking; expanded below and stored in diagnostics.json)

## Steps
- PASS gate-cdp-reachable (cdp.target, 10ms): platform=extension
- PASS setup-unlock-wallet (metamask.wallet.ensure_unlocked, 101ms): proof=extension-unlocked-state
- PASS setup-open-perps-tab (ui.navigate, 101ms): proof=ui-navigation
- PASS setup-wait-perps-tab (ui.wait_for, 354ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/?tab=perps, cdpTargetId=3C5E4DFDAE664EA34FACDF28B9388772, runtimeSessionId=106db704-200a-476c-8185-9dc4a0efdcd1
- PASS setup-scroll-rail-into-view (ui.scroll, 699ms): scrolled=true, selector=[data-testid="perps-products-categories"], [data-test-id="perps-products-categories"], [data-test="perps-products-categories"], intoView=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/?tab=perps
- PASS ac1-wait-category-rail (ui.wait_for, 366ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/?tab=perps, cdpTargetId=3C5E4DFDAE664EA34FACDF28B9388772, runtimeSessionId=106db704-200a-476c-8185-9dc4a0efdcd1
- PASS ac1-assert-horizontal-scroller (ui.wait_for, 527ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/?tab=perps, cdpTargetId=3C5E4DFDAE664EA34FACDF28B9388772, runtimeSessionId=106db704-200a-476c-8185-9dc4a0efdcd1
- PASS ac1-assert-no-horizontal-scroller (ui.wait_for, 357ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/?tab=perps, cdpTargetId=3C5E4DFDAE664EA34FACDF28B9388772, runtimeSessionId=106db704-200a-476c-8185-9dc4a0efdcd1
- PASS ac1-wait-crypto-pill (ui.wait_for, 657ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/?tab=perps, cdpTargetId=3C5E4DFDAE664EA34FACDF28B9388772, runtimeSessionId=106db704-200a-476c-8185-9dc4a0efdcd1
- PASS ac1-clear-capture-orphans (command, 68ms): exitCode=0
- PASS ac1-screenshot-category-rail (ui.screenshot, 418ms): path=screenshots/evidence-ac1-products-chips-visible.png
- PASS ac4-assert-pill-is-focusable-button (ui.wait_for, 513ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/?tab=perps, cdpTargetId=3C5E4DFDAE664EA34FACDF28B9388772, runtimeSessionId=106db704-200a-476c-8185-9dc4a0efdcd1
- PASS ac4-assert-rail-is-labelled-group (ui.wait_for, 378ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/?tab=perps, cdpTargetId=3C5E4DFDAE664EA34FACDF28B9388772, runtimeSessionId=106db704-200a-476c-8185-9dc4a0efdcd1
- PASS ac2-press-crypto-pill (ui.press, 739ms): clicked=true, selector=[data-testid="perps-products-categories-pill-crypto"], [data-test-id="perps-products-categories-pill-crypto"], [data-test="perps-products-categories-pill-crypto"], tagName=BUTTON, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/?tab=perps
- PASS ac2-wait-market-list (ui.wait_for, 883ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market-list?filter=crypto, cdpTargetId=3C5E4DFDAE664EA34FACDF28B9388772, runtimeSessionId=106db704-200a-476c-8185-9dc4a0efdcd1
- PASS ac2-assert-filter-preselected (ui.wait_for, 373ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market-list?filter=crypto, cdpTargetId=3C5E4DFDAE664EA34FACDF28B9388772, runtimeSessionId=106db704-200a-476c-8185-9dc4a0efdcd1
- PASS ac2-clear-capture-orphans (command, 70ms): exitCode=0
- PASS ac2-screenshot-market-list-filtered (ui.screenshot, 380ms): path=screenshots/evidence-ac2-market-list-filtered-crypto.png
- PASS ac3-run-skeleton-gating-test (command, 4.6s): exitCode=0, stdout=watchman warning:  Recrawled this watch 1 time, most recently because:
MustScanSubDirs UserDroppedTo resolve, please review the information on
https://facebook.github.io/watchman/docs/troubleshooting.html#recrawl
To clear this warning, run:
`watchman watch-del '/Users/deeeed/dev/metamask/metamask-extension-3' ; watchman watch-project '/Users/deeeed/dev/metamask/metamask-extension-3'`

PASS ui/components/app/perps/perps-products/perps-products.test.tsx

Test Suites: 1 passed, 1 total
Tests:       12 skipped, 2 passed, 14 total
Snapshots:   0 total
Time:        3.474 s, estimated 10 s
Ran all test suites matching /ui\/components\/app\/perps\/perps-products\/perps-products.test.tsx/i with tests matching "loading state".

✅ No console baseline violations.


- PASS ac3-assert-skeleton-test-ran (assert_output, 5ms): source=ac3-run-skeleton-gating-test, stream=stdout, contains=2 passed
- PASS ac3-assert-skeleton-test-passed (assert_exit_code, 4ms): source=ac3-run-skeleton-gating-test, expected=0, actual=0
- PASS ac4-run-keyboard-test (command, 3.9s): exitCode=0, stdout=watchman warning:  Recrawled this watch 1 time, most recently because:
MustScanSubDirs UserDroppedTo resolve, please review the information on
https://facebook.github.io/watchman/docs/troubleshooting.html#recrawl
To clear this warning, run:
`watchman watch-del '/Users/deeeed/dev/metamask/metamask-extension-3' ; watchman watch-project '/Users/deeeed/dev/metamask/metamask-extension-3'`

PASS ui/components/app/perps/perps-products/perps-products.test.tsx

Test Suites: 1 passed, 1 total
Tests:       13 skipped, 1 passed, 14 total
Snapshots:   0 total
Time:        3.032 s, estimated 4 s
Ran all test suites matching /ui\/components\/app\/perps\/perps-products\/perps-products.test.tsx/i with tests matching "navigates from the keyboard as it does from a click".

✅ No console baseline violations.


- PASS ac4-assert-keyboard-test-ran (assert_output, 8ms): source=ac4-run-keyboard-test, stream=stdout, contains=1 passed
- PASS ac4-assert-keyboard-test-passed (assert_exit_code, 3ms): source=ac4-run-keyboard-test, expected=0, actual=0
- PASS teardown-return-to-perps-tab (ui.navigate, 170ms): proof=ui-navigation
- PASS done (end, 0ms)
