# MetaMask Recipe Run

Status: pass
Duration: 20s
Nodes: 25/25 passed

## Side findings
- REVIEW 1 distinct application warning/error event(s) (non-blocking; expanded below and stored in diagnostics.json)

## Steps
- PASS gate-cdp-reachable (cdp.target, 12ms): platform=extension
- PASS setup-open-perps-tab (ui.navigate, 928ms): page=perps, proof=ui-navigation
- PASS setup-wait-perps-tab (ui.wait_for, 375ms): matched=true, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=31997E0A76DF74A4802961BA0A1CE6EB, runtimeSessionId=78765571-2b67-4b3c-b595-a0784506a633
- PASS setup-scroll-rail-into-view (ui.scroll, 360ms): scrolled=true, selector=[data-testid="perps-market-categories"], [data-test-id="perps-market-categories"], [data-test="perps-market-categories"], intoView=true, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home
- PASS ac1-wait-category-rail (ui.wait_for, 648ms): matched=true, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=31997E0A76DF74A4802961BA0A1CE6EB, runtimeSessionId=78765571-2b67-4b3c-b595-a0784506a633
- PASS ac1-assert-horizontal-scroller (ui.wait_for, 424ms): matched=true, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=31997E0A76DF74A4802961BA0A1CE6EB, runtimeSessionId=78765571-2b67-4b3c-b595-a0784506a633
- PASS ac1-wait-all-pill (ui.wait_for, 502ms): matched=true, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=31997E0A76DF74A4802961BA0A1CE6EB, runtimeSessionId=78765571-2b67-4b3c-b595-a0784506a633
- PASS ac1-wait-crypto-pill (ui.wait_for, 361ms): matched=true, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=31997E0A76DF74A4802961BA0A1CE6EB, runtimeSessionId=78765571-2b67-4b3c-b595-a0784506a633
- PASS ac1-clear-capture-orphans (command, 46ms): exitCode=0
- PASS ac1-screenshot-category-rail (ui.screenshot, 220ms): path=screenshots/evidence-ac1-category-pills-visible.png
- PASS ac4-assert-pill-is-focusable-button (ui.wait_for, 497ms): matched=true, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=31997E0A76DF74A4802961BA0A1CE6EB, runtimeSessionId=78765571-2b67-4b3c-b595-a0784506a633
- PASS ac4-assert-rail-is-labelled-group (ui.wait_for, 371ms): matched=true, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=31997E0A76DF74A4802961BA0A1CE6EB, runtimeSessionId=78765571-2b67-4b3c-b595-a0784506a633
- PASS ac2-press-crypto-pill (ui.press, 1.8s): clicked=true, selector=[data-testid="perps-market-categories-pill-crypto"], [data-test-id="perps-market-categories-pill-crypto"], [data-test="perps-market-categories-pill-crypto"], tagName=BUTTON, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home
- PASS ac2-wait-market-list (ui.wait_for, 407ms): matched=true, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market-list?filter=crypto, cdpTargetId=31997E0A76DF74A4802961BA0A1CE6EB, runtimeSessionId=78765571-2b67-4b3c-b595-a0784506a633
- PASS ac2-assert-filter-preselected (ui.wait_for, 393ms): matched=true, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market-list?filter=crypto, cdpTargetId=31997E0A76DF74A4802961BA0A1CE6EB, runtimeSessionId=78765571-2b67-4b3c-b595-a0784506a633
- PASS ac2-clear-capture-orphans (command, 38ms): exitCode=0
- PASS ac2-screenshot-market-list-filtered (ui.screenshot, 231ms): path=screenshots/evidence-ac2-market-list-filtered-crypto.png
- PASS ac3-run-skeleton-gating-test (command, 7.4s): exitCode=0, stdout=PASS ui/components/app/perps/perps-market-categories/perps-market-categories.test.tsx

Test Suites: 1 passed, 1 total
Tests:       10 skipped, 2 passed, 12 total
Snapshots:   0 total
Time:        5.819 s
Ran all test suites matching /ui\/components\/app\/perps\/perps-market-categories\/perps-market-categories.test.tsx/i with tests matching "loading state".

✅ No console baseline violations.


- PASS ac3-assert-skeleton-test-ran (assert_output, 9ms): source=ac3-run-skeleton-gating-test, stream=stdout, contains=2 passed
- PASS ac3-assert-skeleton-test-passed (assert_exit_code, 7ms): source=ac3-run-skeleton-gating-test, expected=0, actual=0
- PASS ac4-run-keyboard-test (command, 3.3s): exitCode=0, stdout=PASS ui/components/app/perps/perps-market-categories/perps-market-categories.test.tsx

Test Suites: 1 passed, 1 total
Tests:       11 skipped, 1 passed, 12 total
Snapshots:   0 total
Time:        2.526 s, estimated 5 s
Ran all test suites matching /ui\/components\/app\/perps\/perps-market-categories\/perps-market-categories.test.tsx/i with tests matching "navigates to the filtered market list when a pill is activated from the keyboard".

✅ No console baseline violations.


- PASS ac4-assert-keyboard-test-ran (assert_output, 6ms): source=ac4-run-keyboard-test, stream=stdout, contains=1 passed
- PASS ac4-assert-keyboard-test-passed (assert_exit_code, 5ms): source=ac4-run-keyboard-test, expected=0, actual=0
- PASS teardown-return-to-perps-tab (ui.navigate, 1.2s): page=perps, proof=ui-navigation
- PASS done (end, 0ms)
