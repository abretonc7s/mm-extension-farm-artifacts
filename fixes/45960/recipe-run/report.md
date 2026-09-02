# MetaMask Recipe Run

Status: pass
Duration: 22s
Nodes: 27/27 passed

## Side findings
- REVIEW 1 distinct application warning/error event(s) (non-blocking; expanded below and stored in diagnostics.json)

## Steps
- PASS gate-doctor (app.status, 10ms): platform=extension
- PASS ac1-read-manifest-range (assert_file, 8ms): path=package.json
- PASS ac1-assert-resolved-version (assert_json, 4ms): path=node_modules/@metamask/perps-controller/package.json
- PASS ac1-assert-lockfile-resolution (assert_file, 4ms): path=yarn.lock
- PASS ac1-grep-bundled-symbol (command, 573ms): exitCode=0, stdout=dist/chrome/3960.js

- PASS ac1-assert-bundled-symbol-exit (assert_exit_code, 5ms): source=ac1-grep-bundled-symbol, expected=0, actual=0
- PASS ac1-assert-bundled-symbol-file (assert_output, 5ms): source=ac1-grep-bundled-symbol, stream=stdout, contains=dist/chrome/
- PASS ac2-run-error-code-tests (command, 2.1s): exitCode=0, stdout=PASS ui/components/app/perps/utils/translate-perps-error.test.ts

Test Suites: 1 passed, 1 total
Tests:       45 passed, 45 total
Snapshots:   0 total
Time:        1.257 s, estimated 2 s
Ran all test suites matching /ui\/components\/app\/perps\/utils\/translate-perps-error.test.ts/i.

✅ No console baseline violations.


- PASS ac2-assert-tests-exit (assert_exit_code, 7ms): source=ac2-run-error-code-tests, expected=0, actual=0
- PASS ac2-assert-tests-count (assert_output, 5ms): source=ac2-run-error-code-tests, stream=stdout, contains=45 passed, 45 total
- PASS ac2-assert-new-codes-mapped (command, 1.4s): exitCode=0, stdout=PASS ui/components/app/perps/utils/translate-perps-error.test.ts

Test Suites: 1 passed, 1 total
Tests:       44 skipped, 1 passed, 45 total
Snapshots:   0 total
Time:        0.745 s, estimated 1 s
Ran all test suites matching /ui\/components\/app\/perps\/utils\/translate-perps-error.test.ts/i with tests matching "translates every error code introduced after v12".

✅ No console baseline violations.


- PASS ac2-assert-new-codes-exit (assert_exit_code, 5ms): source=ac2-assert-new-codes-mapped, expected=0, actual=0
- PASS ac2-assert-new-codes-selected (assert_output, 6ms): source=ac2-assert-new-codes-mapped, stream=stdout, contains=44 skipped, 1 passed, 45 total
- PASS ac2-run-typecheck (command, 11s): exitCode=0
- PASS ac2-assert-typecheck-exit (assert_exit_code, 5ms): source=ac2-run-typecheck, expected=0, actual=0
- PASS ac3-open-perps (ui.navigate, 1.2s): page=perps, proof=ui-navigation
- PASS ac3-assert-perps-home (metamask.perps.read_visible_state, 68ms): platform=extension, route=#/perps-home, proof=visible-dom-accessibility
- PASS ac3-open-market-list (ui.navigate, 83ms): proof=ui-navigation
- PASS ac3-wait-market-list (ui.wait_for, 3.0s): matched=true, cdpPort=7667, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market-list, cdpTargetId=BAB78682C33C2CE81816EED8164B48E4, runtimeSessionId=52d7396b-8ee1-463c-b13a-c0d5d96c0e97
- PASS ac3-assert-market-list (metamask.perps.read_visible_state, 196ms): platform=extension, route=#/perps/market-list, proof=visible-dom-accessibility
- PASS ac3-open-market (ui.navigate, 243ms): proof=ui-navigation
- PASS ac3-wait-market-detail (ui.wait_for, 623ms): matched=true, cdpPort=7667, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market/ETH, cdpTargetId=BAB78682C33C2CE81816EED8164B48E4, runtimeSessionId=52d7396b-8ee1-463c-b13a-c0d5d96c0e97
- PASS ac3-assert-market-details (metamask.perps.read_visible_state, 84ms): platform=extension, route=#/perps/market/ETH, proof=visible-dom-accessibility
- PASS ac3-clear-capture-orphans (command, 29ms): exitCode=0
- PASS ac3-wait-market-price (ui.wait_for, 522ms): matched=true, cdpPort=7667, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market/ETH, cdpTargetId=BAB78682C33C2CE81816EED8164B48E4, runtimeSessionId=52d7396b-8ee1-463c-b13a-c0d5d96c0e97
- PASS ac3-capture-market (ui.screenshot, 250ms): path=screenshots/evidence-ac3-perps-market-live.png
- PASS done (end, 0ms)
