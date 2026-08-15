# MetaMask Recipe Run

Status: pass
Duration: 22s
Nodes: 22/22 passed

## Side findings
- REVIEW 8 distinct application warning/error event(s) (non-blocking; expanded below and stored in diagnostics.json)

## Steps
- PASS setup-status (app.status, 10ms): platform=extension
- PASS setup-cdp (cdp.target, 22ms): platform=extension
- PASS setup-unlock (metamask.wallet.ensure_unlocked, 122ms): proof=extension-unlocked-state
- PASS setup-warm-streamed-cache (ui.navigate, 359ms): page=perps, proof=ui-navigation
- PASS setup-leave-perps (ui.navigate, 346ms): page=home, proof=ui-navigation
- PASS ac3-probe-live-balance-divergence (command, 2.4s): exitCode=0, stdout={"href":"chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/","streamedAccountPresent":false,"streamedBalance":"0","freshBalance":"756.36175","diverges":true,"validWithdrawal":"378","decisionFromStreamed":"blocked","decisionFromFresh":"allowed","decisionsDisagree":true}

- PASS ac3-assert-streamed-cache-empty (assert_json, 8ms): path=temp/tasks/fix/tat-3632-0803-221700/artifacts/live-perps-balance-divergence.json
- PASS ac3-assert-balances-diverge (assert_json, 5ms): path=temp/tasks/fix/tat-3632-0803-221700/artifacts/live-perps-balance-divergence.json
- PASS ac3-assert-decisions-disagree (assert_json, 8ms): path=temp/tasks/fix/tat-3632-0803-221700/artifacts/live-perps-balance-divergence.json
- PASS ac3-verify-blocking-under-divergence (command, 5.9s): exitCode=0, stdout=
✅ No console baseline violations.

, stderr=PASS ui/pages/confirmations/hooks/alerts/transactions/usePerpsWithdrawInsufficientBalanceAlert.test.ts

Test Suites: 1 passed, 1 total
Tests:       19 skipped, 1 passed, 20 total
Snapshots:   0 total
Time:        4.433 s, estimated 6 s
Ran all test suites matching /ui\/pages\/confirmations\/hooks\/alerts\/transactions\/usePerpsWithdrawInsufficientBalanceAlert.test.ts/i with tests matching "fresh balance source blocks a withdrawal the stale streamed cache would have allowed".
Test results written to: temp/tasks/fix/tat-3632-0803-221700/artifacts/ac3-jest.json

- PASS ac3-assert-blocking-no-failures (assert_json, 6ms): path=temp/tasks/fix/tat-3632-0803-221700/artifacts/ac3-jest.json
- PASS ac3-assert-blocking-test-ran (assert_json, 7ms): path=temp/tasks/fix/tat-3632-0803-221700/artifacts/ac3-jest.json
- PASS ac3-open-perps-balance (ui.navigate, 311ms): page=perps, proof=ui-navigation
- PASS ac3-wait-for-fresh-balance (ui.wait_for, 3.8s): matched=true, cdpPort=7667, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home
- PASS ac3-screenshot-live-fresh-balance (ui.screenshot, 322ms): path=screenshots/evidence-ac3-live-fresh-perps-balance.png
- PASS ac1-run-fresh-balance-tests (command, 4.6s): exitCode=0, stdout=
✅ No console baseline violations.

, stderr=PASS ui/pages/confirmations/hooks/alerts/transactions/usePerpsWithdrawInsufficientBalanceAlert.test.ts

Test Suites: 1 passed, 1 total
Tests:       16 skipped, 4 passed, 20 total
Snapshots:   0 total
Time:        3.685 s, estimated 4 s
Ran all test suites matching /ui\/pages\/confirmations\/hooks\/alerts\/transactions\/usePerpsWithdrawInsufficientBalanceAlert.test.ts/i with tests matching "fresh balance source".
Test results written to: temp/tasks/fix/tat-3632-0803-221700/artifacts/ac1-jest.json

- PASS ac1-assert-no-failures (assert_json, 9ms): path=temp/tasks/fix/tat-3632-0803-221700/artifacts/ac1-jest.json
- PASS ac1-assert-cases-ran (assert_json, 8ms): path=temp/tasks/fix/tat-3632-0803-221700/artifacts/ac1-jest.json
- PASS ac2-run-perps-scope-tests (command, 4.0s): exitCode=0, stdout=
✅ No console baseline violations.

, stderr=PASS ui/pages/confirmations/hooks/alerts/transactions/usePerpsWithdrawInsufficientBalanceAlert.test.ts

Test Suites: 1 passed, 1 total
Tests:       15 skipped, 5 passed, 20 total
Snapshots:   0 total
Time:        3.096 s, estimated 4 s
Ran all test suites matching /ui\/pages\/confirmations\/hooks\/alerts\/transactions\/usePerpsWithdrawInsufficientBalanceAlert.test.ts/i with tests matching "perps scope|degraded read".
Test results written to: temp/tasks/fix/tat-3632-0803-221700/artifacts/ac2-jest.json

- PASS ac2-assert-no-failures (assert_json, 6ms): path=temp/tasks/fix/tat-3632-0803-221700/artifacts/ac2-jest.json
- PASS ac2-assert-cases-ran (assert_json, 4ms): path=temp/tasks/fix/tat-3632-0803-221700/artifacts/ac2-jest.json
- PASS teardown-done (end, 0ms)
