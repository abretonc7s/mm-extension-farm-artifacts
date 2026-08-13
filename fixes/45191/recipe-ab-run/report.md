# MetaMask Recipe Run

Status: pass
Duration: 8.5s
Nodes: 24/24 passed

## Side findings
- REVIEW 5 distinct application warning/error event(s) (non-blocking; expanded below and stored in diagnostics.json)

## Steps
- PASS setup-status (app.status, 7ms): platform=extension
- PASS setup-cdp (cdp.target, 7ms): platform=extension
- PASS setup-unlock (metamask.wallet.ensure_unlocked, 72ms): proof=extension-unlocked-state
- PASS setup-assert-clean-tree (command, 25ms): exitCode=0
- PASS setup-leave-perps (ui.navigate, 74ms): page=home, proof=ui-navigation
- PASS ab-capture-live-state (command, 689ms): exitCode=0, stdout={"href":"chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/","streamedAccountPresent":false,"streamedBalance":"0","freshBalance":"756.392549","diverges":true,"validWithdrawal":"378","decisionFromStreamed":"blocked","decisionFromFresh":"allowed","decisionsDisagree":true}

- PASS ab-assert-streamed-cache-empty (assert_json, 7ms): path=temp/tasks/fix/45191-0812-105020/artifacts/ab/live-input.json
- PASS ab-assert-live-diverges (assert_json, 3ms): path=temp/tasks/fix/45191-0812-105020/artifacts/ab/live-input.json
- PASS ab-run-prefix-hook (command, 3.5s): exitCode=0, stdout=
✅ No console baseline violations.

, stderr=+ cp temp/tasks/fix/45191-0812-105020/artifacts/ab/perpsWithdrawFreshBalanceAB.driver.ts ui/pages/confirmations/hooks/alerts/transactions/perpsWithdrawFreshBalanceAB.test.ts
+ git show bc55c67781:ui/pages/confirmations/hooks/alerts/transactions/usePerpsWithdrawInsufficientBalanceAlert.ts
+ AB_LABEL=pre-fix
+ AB_COMMIT=bc55c67781
+ AB_INPUT=/Volumes/FD/dev/metamask/metamask-extension-3/temp/tasks/fix/45191-0812-105020/artifacts/ab/live-input.json
+ AB_OUTPUT=/Volumes/FD/dev/metamask/metamask-extension-3/temp/tasks/fix/45191-0812-105020/artifacts/ab/prefix-observed.json
+ yarn jest ui/pages/confirmations/hooks/alerts/transactions/perpsWithdrawFreshBalanceAB.test.ts --no-coverage --json --outputFile=temp/tasks/fix/45191-0812-105020/artifacts/ab/prefix-jest.json
FAIL ui/pages/confirmations/hooks/alerts/transactions/perpsWithdrawFreshBalanceAB.test.ts
  ● TAT-3632 A/B — pre-fix hook against live account state › does not block a withdrawal the account can actually cover

    expect(received).toStrictEqual(expected) // deep equality

    - Expected  - 2
    + Received  + 2

      Object {
    -   "blocked": false,
    -   "reason": null,
    +   "blocked": true,
    +   "reason": "Insufficient funds",
      }

      152 |       blocked: Boolean(blocking),
      153 |       reason: blocking?.reason ?? null,
    > 154 |     }).toStrictEqual({ blocked: false, reason: null });
          |        ^
      155 |   });
      156 | });
      157 |

      at Object.toStrictEqual (ui/pages/confirmations/hooks/alerts/transactions/perpsWithdrawFreshBalanceAB.test.ts:154:8)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 total
Snapshots:   0 total
Time:        2.745 s
Ran all test suites matching /ui\/pages\/confirmations\/hooks\/alerts\/transactions\/perpsWithdrawFreshBalanceAB.test.ts/i.
Test results written to: temp/tasks/fix/45191-0812-105020/artifacts/ab/prefix-jest.json
+ rm -f ui/pages/confirmations/hooks/alerts/transactions/perpsWithdrawFreshBalanceAB.test.ts
+ git checkout HEAD -- ui/pages/confirmations/hooks/alerts/transactions/usePerpsWithdrawInsufficientBalanceAlert.ts

- PASS ab-assert-tree-restored (command, 28ms): exitCode=0
- PASS ab-assert-prefix-test-failed (assert_json, 4ms): path=temp/tasks/fix/45191-0812-105020/artifacts/ab/prefix-jest.json
- PASS ab-assert-prefix-blocked (assert_json, 5ms): path=temp/tasks/fix/45191-0812-105020/artifacts/ab/prefix-observed.json
- PASS ab-assert-prefix-alert-copy (assert_json, 4ms): path=temp/tasks/fix/45191-0812-105020/artifacts/ab/prefix-observed.json
- PASS ab-assert-prefix-read-streamed (assert_json, 4ms): path=temp/tasks/fix/45191-0812-105020/artifacts/ab/prefix-observed.json
- PASS ab-run-postfix-hook (command, 2.7s): exitCode=0, stdout=
✅ No console baseline violations.

, stderr=PASS ui/pages/confirmations/hooks/alerts/transactions/perpsWithdrawFreshBalanceAB.test.ts

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        1.918 s, estimated 3 s
Ran all test suites matching /ui\/pages\/confirmations\/hooks\/alerts\/transactions\/perpsWithdrawFreshBalanceAB.test.ts/i.
Test results written to: temp/tasks/fix/45191-0812-105020/artifacts/ab/postfix-jest.json

- PASS ab-assert-postfix-test-passed (assert_json, 6ms): path=temp/tasks/fix/45191-0812-105020/artifacts/ab/postfix-jest.json
- PASS ab-assert-postfix-allowed (assert_json, 6ms): path=temp/tasks/fix/45191-0812-105020/artifacts/ab/postfix-observed.json
- PASS ab-assert-postfix-read-fresh (assert_json, 5ms): path=temp/tasks/fix/45191-0812-105020/artifacts/ab/postfix-observed.json
- PASS ab-assert-postfix-ignores-streamed (assert_json, 6ms): path=temp/tasks/fix/45191-0812-105020/artifacts/ab/postfix-observed.json
- PASS evidence-open-perps (ui.navigate, 312ms): page=perps, proof=ui-navigation
- PASS evidence-wait-for-balance (ui.wait_for, 777ms): matched=true, cdpPort=7667, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home
- PASS evidence-kill-orphan-capture-helpers (command, 28ms): exitCode=0
- PASS evidence-screenshot-live-balance (ui.screenshot, 196ms): path=screenshots/live-perps-balance.png
- PASS teardown-done (end, 0ms)
