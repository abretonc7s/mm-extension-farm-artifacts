# MetaMask Recipe Run

Status: pass
Duration: 38s
Nodes: 25/25 passed

## Side findings
- REVIEW 1 distinct application warning/error event(s) (non-blocking; expanded below and stored in diagnostics.json)

## Steps
- PASS gate-cdp-reachable (cdp.target, 14ms): platform=extension
- PASS setup-open-perps-tab (ui.navigate, 1.3s): page=perps, proof=ui-navigation
- PASS setup-wait-perps-tab (ui.wait_for, 3.4s): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=1A878FDAD9C16A5AD17EDB6B4B52A1F2, runtimeSessionId=611ac562-c2f9-4541-b4e7-26391caa0615
- PASS setup-scroll-rail-into-view (ui.scroll, 365ms): scrolled=true, selector=[data-testid="perps-market-categories"], [data-test-id="perps-market-categories"], [data-test="perps-market-categories"], intoView=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home
- PASS ac1-wait-category-rail (ui.wait_for, 376ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=1A878FDAD9C16A5AD17EDB6B4B52A1F2, runtimeSessionId=611ac562-c2f9-4541-b4e7-26391caa0615
- PASS ac1-assert-horizontal-scroller (ui.wait_for, 554ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=1A878FDAD9C16A5AD17EDB6B4B52A1F2, runtimeSessionId=611ac562-c2f9-4541-b4e7-26391caa0615
- PASS ac1-wait-all-pill (ui.wait_for, 389ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=1A878FDAD9C16A5AD17EDB6B4B52A1F2, runtimeSessionId=611ac562-c2f9-4541-b4e7-26391caa0615
- PASS ac1-wait-crypto-pill (ui.wait_for, 367ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=1A878FDAD9C16A5AD17EDB6B4B52A1F2, runtimeSessionId=611ac562-c2f9-4541-b4e7-26391caa0615
- PASS ac1-clear-capture-orphans (command, 144ms): exitCode=0
- PASS ac1-screenshot-category-rail (ui.screenshot, 1.9s): path=screenshots/evidence-ac1-category-pills-visible.png
- PASS ac4-assert-pill-is-focusable-button (ui.wait_for, 553ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=1A878FDAD9C16A5AD17EDB6B4B52A1F2, runtimeSessionId=611ac562-c2f9-4541-b4e7-26391caa0615
- PASS ac4-assert-rail-is-labelled-group (ui.wait_for, 468ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=1A878FDAD9C16A5AD17EDB6B4B52A1F2, runtimeSessionId=611ac562-c2f9-4541-b4e7-26391caa0615
- PASS ac2-press-crypto-pill (ui.press, 1.5s): clicked=true, selector=[data-testid="perps-market-categories-pill-crypto"], [data-test-id="perps-market-categories-pill-crypto"], [data-test="perps-market-categories-pill-crypto"], tagName=BUTTON, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home
- PASS ac2-wait-market-list (ui.wait_for, 397ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market-list?filter=crypto, cdpTargetId=1A878FDAD9C16A5AD17EDB6B4B52A1F2, runtimeSessionId=611ac562-c2f9-4541-b4e7-26391caa0615
- PASS ac2-assert-filter-preselected (ui.wait_for, 379ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market-list?filter=crypto, cdpTargetId=1A878FDAD9C16A5AD17EDB6B4B52A1F2, runtimeSessionId=611ac562-c2f9-4541-b4e7-26391caa0615
- PASS ac2-clear-capture-orphans (command, 116ms): exitCode=0
- PASS ac2-screenshot-market-list-filtered (ui.screenshot, 564ms): path=screenshots/evidence-ac2-market-list-filtered-crypto.png
- PASS ac3-run-skeleton-gating-test (command, 8.9s): exitCode=0, stdout=PASS ui/components/app/perps/perps-market-categories/perps-market-categories.test.tsx (5.91 s)

Test Suites: 1 passed, 1 total
Tests:       10 skipped, 2 passed, 12 total
Snapshots:   0 total
Time:        6.597 s, estimated 25 s
Ran all test suites matching /ui\/components\/app\/perps\/perps-market-categories\/perps-market-categories.test.tsx/i with tests matching "loading state".

✅ No console baseline violations.


- PASS ac3-assert-skeleton-test-ran (assert_output, 10ms): source=ac3-run-skeleton-gating-test, stream=stdout, contains=2 passed
- PASS ac3-assert-skeleton-test-passed (assert_exit_code, 20ms): source=ac3-run-skeleton-gating-test, expected=0, actual=0
- PASS ac4-run-keyboard-test (command, 15s): exitCode=0, stdout=PASS ui/components/app/perps/perps-market-categories/perps-market-categories.test.tsx (11.058 s)

Test Suites: 1 passed, 1 total
Tests:       11 skipped, 1 passed, 12 total
Snapshots:   0 total
Time:        12.337 s
Ran all test suites matching /ui\/components\/app\/perps\/perps-market-categories\/perps-market-categories.test.tsx/i with tests matching "navigates to the filtered market list when a pill is activated from the keyboard".

✅ No console baseline violations.


- PASS ac4-assert-keyboard-test-ran (assert_output, 10ms): source=ac4-run-keyboard-test, stream=stdout, contains=1 passed
- PASS ac4-assert-keyboard-test-passed (assert_exit_code, 21ms): source=ac4-run-keyboard-test, expected=0, actual=0
- PASS teardown-return-to-perps-tab (ui.navigate, 1.8s): page=perps, proof=ui-navigation
- PASS done (end, 0ms)
