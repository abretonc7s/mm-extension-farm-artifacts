# MetaMask Recipe Run

Status: pass
Duration: 19s
Nodes: 22/22 passed

## Side findings
- REVIEW 2 distinct application warning/error event(s) (non-blocking; expanded below and stored in diagnostics.json)

## Steps
- PASS gate-cdp-reachable (cdp.target, 9ms): platform=extension
- PASS setup-unlock-wallet (metamask.wallet.ensure_unlocked, 77ms): proof=extension-unlocked-state
- PASS setup-open-perps-tab (ui.navigate, 1.2s): page=perps, proof=ui-navigation
- PASS setup-wait-perps-tab (ui.wait_for, 349ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=EA7EF33110178EA4607668989B21E000, runtimeSessionId=545746f7-d9d5-4ab5-8f2b-fe06e382c75e
- PASS fix1-wait-products-rail (ui.wait_for, 356ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=EA7EF33110178EA4607668989B21E000, runtimeSessionId=545746f7-d9d5-4ab5-8f2b-fe06e382c75e
- PASS fix1-assert-wraps-not-scrolls (ui.wait_for, 416ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=EA7EF33110178EA4607668989B21E000, runtimeSessionId=545746f7-d9d5-4ab5-8f2b-fe06e382c75e
- PASS fix1-assert-first-chip-is-crypto (ui.wait_for, 347ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=EA7EF33110178EA4607668989B21E000, runtimeSessionId=545746f7-d9d5-4ab5-8f2b-fe06e382c75e
- PASS fix1-assert-last-chip-is-new (ui.wait_for, 359ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=EA7EF33110178EA4607668989B21E000, runtimeSessionId=545746f7-d9d5-4ab5-8f2b-fe06e382c75e
- PASS fix2-open-market-list (ui.press, 1.3s): clicked=true, selector=[data-testid="perps-products-categories-pill-crypto"], [data-test-id="perps-products-categories-pill-crypto"], [data-test="perps-products-categories-pill-crypto"], tagName=BUTTON, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home
- PASS fix2-wait-category-rail (ui.wait_for, 355ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market-list?filter=crypto, cdpTargetId=EA7EF33110178EA4607668989B21E000, runtimeSessionId=545746f7-d9d5-4ab5-8f2b-fe06e382c75e
- PASS fix2-assert-crypto-pressed (ui.wait_for, 647ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market-list?filter=crypto, cdpTargetId=EA7EF33110178EA4607668989B21E000, runtimeSessionId=545746f7-d9d5-4ab5-8f2b-fe06e382c75e
- PASS fix3-wait-market-count (ui.wait_for, 359ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market-list?filter=crypto, cdpTargetId=EA7EF33110178EA4607668989B21E000, runtimeSessionId=545746f7-d9d5-4ab5-8f2b-fe06e382c75e
- PASS fix3-assert-count-reads-plural (ui.wait_for, 672ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market-list?filter=crypto, cdpTargetId=EA7EF33110178EA4607668989B21E000, runtimeSessionId=545746f7-d9d5-4ab5-8f2b-fe06e382c75e
- PASS fix3-clear-capture-orphans (command, 59ms): exitCode=0
- PASS fix3-screenshot-market-list (ui.screenshot, 231ms): path=screenshots/market-list-filtered.png
- PASS fix4-run-watchlist-slot-tests (command, 4.0s): exitCode=0, stdout=watchman warning:  Recrawled this watch 3 times, most recently because:
MustScanSubDirs UserDroppedTo resolve, please review the information on
https://facebook.github.io/watchman/docs/troubleshooting.html#recrawl
To clear this warning, run:
`watchman watch-del '/Users/deeeed/dev/metamask/metamask-extension-6' ; watchman watch-project '/Users/deeeed/dev/metamask/metamask-extension-6'`

PASS ui/components/app/perps/perps-view.test.tsx

Test Suites: 1 passed, 1 total
Tests:       45 skipped, 2 passed, 47 total
Snapshots:   0 total
Time:        3.069 s, estimated 6 s
Ran all test suites matching /ui\/components\/app\/perps\/perps-view.test.tsx/i with tests matching "reserves".

✅ No console baseline violations.


- PASS fix4-assert-watchlist-slot-tests-passed (assert_output, 5ms): source=fix4-run-watchlist-slot-tests, stream=stdout, contains=2 passed
- PASS fix5-run-market-list-tests (command, 4.0s): exitCode=0, stdout=watchman warning:  Recrawled this watch 3 times, most recently because:
MustScanSubDirs UserDroppedTo resolve, please review the information on
https://facebook.github.io/watchman/docs/troubleshooting.html#recrawl
To clear this warning, run:
`watchman watch-del '/Users/deeeed/dev/metamask/metamask-extension-6' ; watchman watch-project '/Users/deeeed/dev/metamask/metamask-extension-6'`

PASS ui/pages/perps/market-list/index.test.tsx

Test Suites: 1 passed, 1 total
Tests:       47 skipped, 1 passed, 48 total
Snapshots:   0 total
Time:        3.184 s, estimated 27 s
Ran all test suites matching /ui\/pages\/perps\/market-list\/index.test.tsx/i with tests matching "single market".

✅ No console baseline violations.


- PASS fix5-assert-market-list-tests-passed (assert_output, 7ms): source=fix5-run-market-list-tests, stream=stdout, contains=1 passed
- PASS fix6-run-rail-contract-test (command, 3.9s): exitCode=0, stdout=watchman warning:  Recrawled this watch 3 times, most recently because:
MustScanSubDirs UserDroppedTo resolve, please review the information on
https://facebook.github.io/watchman/docs/troubleshooting.html#recrawl
To clear this warning, run:
`watchman watch-del '/Users/deeeed/dev/metamask/metamask-extension-6' ; watchman watch-project '/Users/deeeed/dev/metamask/metamask-extension-6'`

PASS ui/pages/perps/market-list/index.test.tsx

Test Suites: 1 passed, 1 total
Tests:       47 skipped, 1 passed, 48 total
Snapshots:   0 total
Time:        2.981 s, estimated 3 s
Ran all test suites matching /ui\/pages\/perps\/market-list\/index.test.tsx/i with tests matching "leaves the rail unselected while the watchlist filter is on".

✅ No console baseline violations.


- PASS fix6-assert-rail-contract-test-passed (assert_output, 6ms): source=fix6-run-rail-contract-test, stream=stdout, contains=1 passed
- PASS done (end, 0ms)
