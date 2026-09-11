# MetaMask Recipe Run

Status: pass
Duration: 289s
Nodes: 78/78 passed

## Side findings
- REVIEW 2 distinct application warning/error event(s) (non-blocking; expanded below and stored in diagnostics.json)

## Steps
- PASS gate-cdp-reachable (cdp.target, 25ms): platform=extension
- PASS setup-unlock-wallet (metamask.wallet.ensure_unlocked, 263ms): proof=extension-unlocked-state
- PASS setup-open-perps-tab (ui.navigate, 1.5s): page=perps, proof=ui-navigation
- PASS setup-wait-perps-tab (ui.wait_for, 3.0s): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=364857C0B27C1B00595B0115906D6657, runtimeSessionId=ab3f2ee2-2f52-4435-9e3a-8a6ad259a487
- PASS ac-products-wait-section (ui.wait_for, 1.5s): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=364857C0B27C1B00595B0115906D6657, runtimeSessionId=ab3f2ee2-2f52-4435-9e3a-8a6ad259a487
- PASS ac-products-scroll-into-view (ui.scroll, 961ms): scrolled=true, selector=[data-testid="perps-products-categories"], [data-test-id="perps-products-categories"], [data-test="perps-products-categories"], intoView=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home
- PASS ac-products-settle (wait, 3.0s): durationMs=3000
- PASS ac-products-assert-heading (ui.wait_for, 749ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=364857C0B27C1B00595B0115906D6657, runtimeSessionId=ab3f2ee2-2f52-4435-9e3a-8a6ad259a487
- PASS ac-products-assert-wraps (ui.wait_for, 1.4s): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=364857C0B27C1B00595B0115906D6657, runtimeSessionId=ab3f2ee2-2f52-4435-9e3a-8a6ad259a487
- PASS ac-products-assert-no-scroller (ui.wait_for, 983ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=364857C0B27C1B00595B0115906D6657, runtimeSessionId=ab3f2ee2-2f52-4435-9e3a-8a6ad259a487
- PASS ac-products-assert-no-more (ui.wait_for, 661ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=364857C0B27C1B00595B0115906D6657, runtimeSessionId=ab3f2ee2-2f52-4435-9e3a-8a6ad259a487
- PASS ac-products-assert-chip-radius (ui.wait_for, 568ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=364857C0B27C1B00595B0115906D6657, runtimeSessionId=ab3f2ee2-2f52-4435-9e3a-8a6ad259a487
- PASS ac-products-assert-chip-has-glyph (ui.wait_for, 529ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=364857C0B27C1B00595B0115906D6657, runtimeSessionId=ab3f2ee2-2f52-4435-9e3a-8a6ad259a487
- PASS ac-products-wait-crypto (ui.wait_for, 813ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=364857C0B27C1B00595B0115906D6657, runtimeSessionId=ab3f2ee2-2f52-4435-9e3a-8a6ad259a487
- PASS ac-products-wait-forex (ui.wait_for, 1.5s): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=364857C0B27C1B00595B0115906D6657, runtimeSessionId=ab3f2ee2-2f52-4435-9e3a-8a6ad259a487
- PASS ac-products-assert-focusable (ui.wait_for, 370ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=364857C0B27C1B00595B0115906D6657, runtimeSessionId=ab3f2ee2-2f52-4435-9e3a-8a6ad259a487
- PASS ac-products-assert-labelled-group (ui.wait_for, 495ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=364857C0B27C1B00595B0115906D6657, runtimeSessionId=ab3f2ee2-2f52-4435-9e3a-8a6ad259a487
- PASS ac-home-clear-capture-orphans (command, 754ms): exitCode=0
- PASS ac-home-screenshot (ui.screenshot, 4.0s): path=screenshots/evidence-perps-home-products-chips.png
- PASS ac-nav-press-crypto (ui.press, 2.5s): clicked=true, selector=[data-testid="perps-products-categories-pill-crypto"], [data-test-id="perps-products-categories-pill-crypto"], [data-test="perps-products-categories-pill-crypto"], tagName=BUTTON, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home
- PASS setup-wait-market-list (ui.wait_for, 628ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market-list?filter=crypto, cdpTargetId=364857C0B27C1B00595B0115906D6657, runtimeSessionId=ab3f2ee2-2f52-4435-9e3a-8a6ad259a487
- PASS ac-pills-wait-rail (ui.wait_for, 865ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market-list?filter=crypto, cdpTargetId=364857C0B27C1B00595B0115906D6657, runtimeSessionId=ab3f2ee2-2f52-4435-9e3a-8a6ad259a487
- PASS ac-pills-assert-wraps (ui.wait_for, 601ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market-list?filter=crypto, cdpTargetId=364857C0B27C1B00595B0115906D6657, runtimeSessionId=ab3f2ee2-2f52-4435-9e3a-8a6ad259a487
- PASS ac-pills-assert-single-row (ui.wait_for, 390ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market-list?filter=crypto, cdpTargetId=364857C0B27C1B00595B0115906D6657, runtimeSessionId=ab3f2ee2-2f52-4435-9e3a-8a6ad259a487
- PASS ac-pills-assert-no-horizontal-scroller (ui.wait_for, 380ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market-list?filter=crypto, cdpTargetId=364857C0B27C1B00595B0115906D6657, runtimeSessionId=ab3f2ee2-2f52-4435-9e3a-8a6ad259a487
- PASS ac-pills-assert-filter-radius (ui.wait_for, 399ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market-list?filter=crypto, cdpTargetId=364857C0B27C1B00595B0115906D6657, runtimeSessionId=ab3f2ee2-2f52-4435-9e3a-8a6ad259a487
- PASS ac-pills-wait-crypto (ui.wait_for, 575ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market-list?filter=crypto, cdpTargetId=364857C0B27C1B00595B0115906D6657, runtimeSessionId=ab3f2ee2-2f52-4435-9e3a-8a6ad259a487
- PASS ac-pills-wait-stock (ui.wait_for, 388ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market-list?filter=crypto, cdpTargetId=364857C0B27C1B00595B0115906D6657, runtimeSessionId=ab3f2ee2-2f52-4435-9e3a-8a6ad259a487
- PASS ac-pills-wait-commodity (ui.wait_for, 705ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market-list?filter=crypto, cdpTargetId=364857C0B27C1B00595B0115906D6657, runtimeSessionId=ab3f2ee2-2f52-4435-9e3a-8a6ad259a487
- PASS ac-a11y-assert-pill-is-focusable-button (ui.wait_for, 885ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market-list?filter=crypto, cdpTargetId=364857C0B27C1B00595B0115906D6657, runtimeSessionId=ab3f2ee2-2f52-4435-9e3a-8a6ad259a487
- PASS ac-a11y-assert-rail-is-labelled-group (ui.wait_for, 719ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market-list?filter=crypto, cdpTargetId=364857C0B27C1B00595B0115906D6657, runtimeSessionId=ab3f2ee2-2f52-4435-9e3a-8a6ad259a487
- PASS ac-nav-assert-crypto-active (ui.wait_for, 451ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market-list?filter=crypto, cdpTargetId=364857C0B27C1B00595B0115906D6657, runtimeSessionId=ab3f2ee2-2f52-4435-9e3a-8a6ad259a487
- PASS ac-filter-clear-capture-orphans (command, 160ms): exitCode=0
- PASS ac-filter-screenshot (ui.screenshot, 1.2s): path=screenshots/evidence-market-list-all-pills-crypto-active.png
- PASS ac-clear-press-crypto (ui.press, 2.1s): clicked=true, selector=[data-testid="market-list-categories-pill-crypto"], [data-test-id="market-list-categories-pill-crypto"], [data-test="market-list-categories-pill-crypto"], tagName=BUTTON, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market-list?filter=crypto
- PASS ac-clear-assert-filter-released (ui.wait_for, 518ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market-list?filter=crypto, cdpTargetId=364857C0B27C1B00595B0115906D6657, runtimeSessionId=ab3f2ee2-2f52-4435-9e3a-8a6ad259a487
- PASS ac-width-narrow (command, 338ms): exitCode=0, stdout=window resized to 430x1100

- PASS ac-width-narrow-settle (wait, 2.5s): durationMs=2500
- PASS ac-narrow-assert-more (ui.wait_for, 1.0s): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market-list?filter=crypto, cdpTargetId=364857C0B27C1B00595B0115906D6657, runtimeSessionId=ab3f2ee2-2f52-4435-9e3a-8a6ad259a487
- PASS ac-narrow-clear-orphans (command, 1.1s): exitCode=0
- PASS ac-narrow-screenshot (ui.screenshot, 8.2s): path=screenshots/evidence-market-list-narrow-more.png
- PASS ac-more-open (ui.press, 949ms): clicked=true, selector=[data-testid="market-list-categories-more-button"], [data-test-id="market-list-categories-more-button"], [data-test="market-list-categories-more-button"], tagName=BUTTON, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market-list?filter=crypto
- PASS ac-more-pick-forex (ui.press, 556ms): clicked=true, selector=[data-testid="market-list-categories-more-option-forex"], [data-test-id="market-list-categories-more-option-forex"], [data-test="market-list-categories-more-option-forex"], tagName=BUTTON, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market-list?filter=crypto
- PASS ac-more-selected-settle (wait, 1.5s): durationMs=1500
- PASS ac-more-assert-trigger-marked (ui.wait_for, 828ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market-list?filter=crypto, cdpTargetId=364857C0B27C1B00595B0115906D6657, runtimeSessionId=ab3f2ee2-2f52-4435-9e3a-8a6ad259a487
- PASS ac-more-selected-clear-orphans (command, 836ms): exitCode=0
- PASS ac-more-selected-screenshot (ui.screenshot, 1.9s): path=screenshots/evidence-market-list-more-selected.png
- PASS ac-width-wide (command, 350ms): exitCode=0, stdout=window resized to 1280x1100

- PASS ac-width-wide-remount (ui.navigate, 1.4s): page=perps-market-list, proof=ui-navigation
- PASS ac-width-wide-settle (wait, 3.1s): durationMs=3000
- PASS ac-wide-assert-no-more (ui.wait_for, 1.0s): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market-list?filter=crypto, cdpTargetId=364857C0B27C1B00595B0115906D6657, runtimeSessionId=ab3f2ee2-2f52-4435-9e3a-8a6ad259a487
- PASS ac-wide-clear-orphans (command, 863ms): exitCode=0
- PASS ac-wide-screenshot (ui.screenshot, 2.6s): path=screenshots/evidence-market-list-wide-no-more.png
- PASS ac-sort-open-modal (ui.press, 864ms): clicked=true, selector=[data-testid="sort-dropdown-button"], [data-test-id="sort-dropdown-button"], [data-test="sort-dropdown-button"], tagName=BUTTON, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market-list?filter=crypto
- PASS ac-sort-wait-modal (ui.wait_for, 833ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market-list?filter=crypto, cdpTargetId=364857C0B27C1B00595B0115906D6657, runtimeSessionId=ab3f2ee2-2f52-4435-9e3a-8a6ad259a487
- PASS ac-sort-assert-direction-inline (ui.wait_for, 1.5s): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market-list?filter=crypto, cdpTargetId=364857C0B27C1B00595B0115906D6657, runtimeSessionId=ab3f2ee2-2f52-4435-9e3a-8a6ad259a487
- PASS ac-sort-assert-no-rank-section (ui.wait_for, 889ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market-list?filter=crypto, cdpTargetId=364857C0B27C1B00595B0115906D6657, runtimeSessionId=ab3f2ee2-2f52-4435-9e3a-8a6ad259a487
- PASS ac-sort-clear-capture-orphans (command, 246ms): exitCode=0
- PASS ac-sort-screenshot (ui.screenshot, 3.0s): path=screenshots/evidence-sort-modal-direction-inline.png
- PASS ac-stuck-filter-run-test (command, 34s): exitCode=0, stdout=watchman warning:  Recrawled this watch 17 times, most recently because:
MustScanSubDirs UserDroppedTo resolve, please review the information on
https://facebook.github.io/watchman/docs/troubleshooting.html#recrawl
To clear this warning, run:
`watchman watch-del '/Users/deeeed/dev/metamask/metamask-extension-3' ; watchman watch-project '/Users/deeeed/dev/metamask/metamask-extension-3'`

PASS ui/pages/perps/market-list/index.test.tsx (22.921 s)

Test Suites: 1 passed, 1 total
Tests:       45 skipped, 1 passed, 46 total
Snapshots:   0 total
Time:        26.225 s
Ran all test suites matching /ui\/pages\/perps\/market-list\/index.test.tsx/i with tests matching "keeps a pill for an active category the data no longer offers".

✅ No console baseline violations.


- PASS ac-stuck-filter-assert-test-ran (assert_output, 7ms): source=ac-stuck-filter-run-test, stream=stdout, contains=1 passed
- PASS ac-stuck-filter-assert-test-passed (assert_exit_code, 11ms): source=ac-stuck-filter-run-test, expected=0, actual=0
- PASS ac-layout-run-test (command, 39s): exitCode=0, stdout=watchman warning:  Recrawled this watch 17 times, most recently because:
MustScanSubDirs UserDroppedTo resolve, please review the information on
https://facebook.github.io/watchman/docs/troubleshooting.html#recrawl
To clear this warning, run:
`watchman watch-del '/Users/deeeed/dev/metamask/metamask-extension-3' ; watchman watch-project '/Users/deeeed/dev/metamask/metamask-extension-3'`

PASS ui/components/app/perps/perps-products/perps-products.test.tsx (30.762 s)

Test Suites: 1 passed, 1 total
Tests:       7 skipped, 6 passed, 13 total
Snapshots:   0 total
Time:        34.87 s
Ran all test suites matching /ui\/components\/app\/perps\/perps-products\/perps-products.test.tsx/i with tests matching "rendering".

✅ No console baseline violations.


- PASS ac-layout-assert-test-ran (assert_output, 9ms): source=ac-layout-run-test, stream=stdout, contains=6 passed
- PASS ac-layout-assert-test-passed (assert_exit_code, 84ms): source=ac-layout-run-test, expected=0, actual=0
- PASS ac-keyboard-run-test (command, 40s): exitCode=0, stdout=watchman warning:  Recrawled this watch 17 times, most recently because:
MustScanSubDirs UserDroppedTo resolve, please review the information on
https://facebook.github.io/watchman/docs/troubleshooting.html#recrawl
To clear this warning, run:
`watchman watch-del '/Users/deeeed/dev/metamask/metamask-extension-3' ; watchman watch-project '/Users/deeeed/dev/metamask/metamask-extension-3'`

PASS ui/components/app/perps/perps-market-categories/perps-category-rail.test.tsx (18.947 s)

Test Suites: 1 passed, 1 total
Tests:       21 skipped, 1 passed, 22 total
Snapshots:   0 total
Time:        21.1 s
Ran all test suites matching /ui\/components\/app\/perps\/perps-market-categories\/perps-category-rail.test.tsx/i with tests matching "reaches every pill from the keyboard".

✅ No console baseline violations.


- PASS ac-keyboard-assert-test-ran (assert_output, 77ms): source=ac-keyboard-run-test, stream=stdout, contains=1 passed
- PASS ac-keyboard-assert-test-passed (assert_exit_code, 14ms): source=ac-keyboard-run-test, expected=0, actual=0
- PASS ac-sort-run-test (command, 53s): exitCode=0, stdout=watchman warning:  Recrawled this watch 17 times, most recently because:
MustScanSubDirs UserDroppedTo resolve, please review the information on
https://facebook.github.io/watchman/docs/troubleshooting.html#recrawl
To clear this warning, run:
`watchman watch-del '/Users/deeeed/dev/metamask/metamask-extension-3' ; watchman watch-project '/Users/deeeed/dev/metamask/metamask-extension-3'`

PASS ui/pages/perps/market-list/components/sort-dropdown/sort-dropdown.test.tsx (32.579 s)

Test Suites: 1 passed, 1 total
Tests:       14 skipped, 3 passed, 17 total
Snapshots:   0 total
Time:        38.773 s
Ran all test suites matching /ui\/pages\/perps\/market-list\/components\/sort-dropdown/i with tests matching "direction".

✅ No console baseline violations.


- PASS ac-sort-assert-test-ran (assert_output, 13ms): source=ac-sort-run-test, stream=stdout, contains=3 passed
- PASS ac-sort-assert-test-passed (assert_exit_code, 29ms): source=ac-sort-run-test, expected=0, actual=0
- PASS ac-more-run-test (command, 38s): exitCode=0, stdout=watchman warning:  Recrawled this watch 17 times, most recently because:
MustScanSubDirs UserDroppedTo resolve, please review the information on
https://facebook.github.io/watchman/docs/troubleshooting.html#recrawl
To clear this warning, run:
`watchman watch-del '/Users/deeeed/dev/metamask/metamask-extension-3' ; watchman watch-project '/Users/deeeed/dev/metamask/metamask-extension-3'`

PASS ui/components/app/perps/perps-market-categories/perps-category-rail.test.tsx (26.826 s)

Test Suites: 1 passed, 1 total
Tests:       20 skipped, 2 passed, 22 total
Snapshots:   0 total
Time:        29.173 s
Ran all test suites matching /ui\/components\/app\/perps\/perps-market-categories\/perps-category-rail.test.tsx/i with tests matching "More trigger".

✅ No console baseline violations.


- PASS ac-more-assert-test-ran (assert_output, 10ms): source=ac-more-run-test, stream=stdout, contains=2 passed
- PASS ac-more-assert-test-passed (assert_exit_code, 85ms): source=ac-more-run-test, expected=0, actual=0
- PASS teardown-close-sort-modal (ui.press, 568ms): clicked=true, selector=[data-testid="sort-modal-cancel"], [data-test-id="sort-modal-cancel"], [data-test="sort-modal-cancel"], tagName=BUTTON, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market-list?filter=crypto
- PASS teardown-restore-width (command, 539ms): exitCode=0, stdout=window resized to 1280x1100

- PASS teardown-return-to-perps-tab (ui.navigate, 2.3s): page=perps, proof=ui-navigation
- PASS done (end, 0ms)
