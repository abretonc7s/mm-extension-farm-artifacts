# Recipe coverage

Final production run: recipe-run-final/summary.json, PASS 27/27 nodes. Non-test Chrome MV3 build with LavaMoat. Product source matches pushed fix 63ddfd4fd5; only test tuple typing changed after this run.

| Requirement | Evidence | Result |
| --- | --- | --- |
| Eligible unlock preloads before Perps entry | ac1-unlock, ac1-preload | Pass, local state and connection trace |
| Route remains lazy | ac2-lazy | Pass |
| Shared Core preload trace routing | ac3-shared | Pass, local shared trace calls |
| Mobile cold, warm and background-resume naming | ac4-cold-trace, ac4-warm-trace, ac4-resume-trace | Pass, document lifecycle contexts |
| Live rendered market rows | ac5-rows, ac5-state, ac5-screenshot | Pass, screenshot inspected |
| Separate market-browser trace and existing trace callers | ac3-browser-trace, ac6-regression | Pass |
| Late prior-account REST writes and early new-session snapshots | final-manager-tests.log, 105 tests; parent ci-account-red.log / ci-account-green.log | Unit regressions reproduce and pass |

Additional browser evidence partially covers offline entry, account switch on Home during offline preload, abandonment, offline lock/reset, reconnection and Basic Functionality disable/reset. See comments-report.md for attempt paths and causes. The full interruption recipe did not pass.

Unproven: disabled-functionality lock/unlock/no-preload sequence, close/reopen grace, populated position/order variants, remote Sentry ingestion, and comparable fresh-backend loading gains. The recipe's cold_process context is a fresh UI document; this is not a controlled browser-process restart latency measurement. Original measurements were invalidated by unequal tabs, then unequal HTTP cache behavior. No numeric gain claimed.
