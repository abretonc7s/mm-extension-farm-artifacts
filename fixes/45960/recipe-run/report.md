# MetaMask Recipe Run

Status: pass
Duration: 72s
Nodes: 27/27 passed

## Side findings
- REVIEW 2 distinct application warning/error event(s) (non-blocking; expanded below and stored in diagnostics.json)

## Steps
- PASS gate-doctor (app.status, 11ms): platform=extension
- PASS ac1-read-manifest-range (assert_file, 15ms): path=package.json
- PASS ac1-assert-resolved-version (assert_json, 5ms): path=node_modules/@metamask/perps-controller/package.json
- PASS ac1-assert-lockfile-resolution (assert_file, 7ms): path=yarn.lock
- PASS ac1-grep-bundled-symbol (command, 631ms): exitCode=0, stdout=dist/chrome/3960.js

- PASS ac1-assert-bundled-symbol-exit (assert_exit_code, 7ms): source=ac1-grep-bundled-symbol, expected=0, actual=0
- PASS ac1-assert-bundled-symbol-file (assert_output, 8ms): source=ac1-grep-bundled-symbol, stream=stdout, contains=dist/chrome/
- PASS ac2-run-error-code-tests (command, 2.6s): exitCode=0, stdout=PASS ui/components/app/perps/utils/translate-perps-error.test.ts

Test Suites: 1 passed, 1 total
Tests:       45 passed, 45 total
Snapshots:   0 total
Time:        1.439 s
Ran all test suites matching /ui\/components\/app\/perps\/utils\/translate-perps-error.test.ts/i.

✅ No console baseline violations.


- PASS ac2-assert-tests-exit (assert_exit_code, 7ms): source=ac2-run-error-code-tests, expected=0, actual=0
- PASS ac2-assert-tests-count (assert_output, 7ms): source=ac2-run-error-code-tests, stream=stdout, contains=45 passed, 45 total
- PASS ac2-assert-new-codes-mapped (command, 1.6s): exitCode=0, stdout=PASS ui/components/app/perps/utils/translate-perps-error.test.ts

Test Suites: 1 passed, 1 total
Tests:       44 skipped, 1 passed, 45 total
Snapshots:   0 total
Time:        0.82 s, estimated 1 s
Ran all test suites matching /ui\/components\/app\/perps\/utils\/translate-perps-error.test.ts/i with tests matching "translates every error code introduced after v12".

✅ No console baseline violations.


- PASS ac2-assert-new-codes-exit (assert_exit_code, 6ms): source=ac2-assert-new-codes-mapped, expected=0, actual=0
- PASS ac2-assert-new-codes-selected (assert_output, 5ms): source=ac2-assert-new-codes-mapped, stream=stdout, contains=44 skipped, 1 passed, 45 total
- PASS ac2-run-typecheck (command, 58s): exitCode=0
- PASS ac2-assert-typecheck-exit (assert_exit_code, 7ms): source=ac2-run-typecheck, expected=0, actual=0
- PASS ac3-open-perps (ui.navigate, 1.1s): page=perps, proof=ui-navigation
- PASS ac3-assert-perps-home (metamask.perps.read_visible_state, 68ms): platform=extension, route=#/perps-home, proof=visible-dom-accessibility
- PASS ac3-open-market-list (ui.navigate, 91ms): proof=ui-navigation
- PASS ac3-wait-market-list (ui.wait_for, 6.1s): matched=true, cdpPort=7667, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market-list, cdpTargetId=6B8B1DCBAD29774CB8A070494E481678, runtimeSessionId=9b459bb1-7563-45c6-b11e-64d35c69fc65
- PASS ac3-assert-market-list (metamask.perps.read_visible_state, 127ms): platform=extension, route=#/perps/market-list, proof=visible-dom-accessibility
- PASS ac3-open-market (ui.navigate, 125ms): proof=ui-navigation
- PASS ac3-wait-market-detail (ui.wait_for, 546ms): matched=true, cdpPort=7667, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market/ETH, cdpTargetId=6B8B1DCBAD29774CB8A070494E481678, runtimeSessionId=9b459bb1-7563-45c6-b11e-64d35c69fc65
- PASS ac3-assert-market-details (metamask.perps.read_visible_state, 71ms): platform=extension, route=#/perps/market/ETH, proof=visible-dom-accessibility
- PASS ac3-clear-capture-orphans (command, 36ms): exitCode=0
- PASS ac3-wait-market-price (ui.wait_for, 636ms): matched=true, cdpPort=7667, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market/ETH, cdpTargetId=6B8B1DCBAD29774CB8A070494E481678, runtimeSessionId=9b459bb1-7563-45c6-b11e-64d35c69fc65
- PASS ac3-capture-market (ui.screenshot, 234ms): path=screenshots/evidence-ac3-perps-market-live.png
- PASS done (end, 0ms)
