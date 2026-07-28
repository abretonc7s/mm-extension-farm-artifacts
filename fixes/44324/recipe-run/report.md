# MetaMask Recipe Run

Status: pass
Duration: 63s
Nodes: 19/19 passed

## Side findings
- REVIEW 6 distinct application warning/error event(s) (non-blocking; expanded below and stored in diagnostics.json)

## Steps
- PASS gate-repo-root (assert_file, 10ms): path=package.json
- PASS ac1-assert-package-version (command, 72ms): exitCode=0, stdout=perps-controller 9.2.1

- PASS ac2-assert-controller-reexports (assert_file, 7ms): path=shared/constants/perps-events.ts
- PASS ac2-assert-no-local-timestamp-mirror (command, 64ms): exitCode=0, stdout=re-export ok

- PASS ac3-attribution-behaviour (command, 8.4s): exitCode=0, stdout=
✅ No console baseline violations.

, stderr=watchman warning:  Recrawled this watch 1 time, most recently because:
MustScanSubDirs UserDroppedTo resolve, please review the information on
https://facebook.github.io/watchman/docs/troubleshooting.html#recrawl
To clear this warning, run:
`watchman watch-del '/Users/deeeed/dev/metamask/metamask-extension-2' ; watchman watch-project '/Users/deeeed/dev/metamask/metamask-extension-2'`

PASS app/scripts/messenger-client-init/perps-controller-init.test.ts
PASS app/scripts/controllers/perps/infrastructure.test.ts
PASS ui/hooks/perps/usePerpsAttribution.test.ts
PASS ui/providers/perps/PerpsAttributionContext.test.tsx

 ●  Suppressed console messages:

ERROR 1     Test errors: Uncaught Errors
 SKIP   18    messages were filtered

Test Suites: 4 passed, 4 total
Tests:       221 passed, 221 total
Snapshots:   0 total
Time:        5.345 s, estimated 11 s
Ran all test suites matching /ui\/providers\/perps\/PerpsAttributionContext.test.tsx|ui\/hooks\/perps\/usePerpsAttribution.test.ts|app\/scripts\/messenger-client-init\/perps-controller-init.test.ts|app\/scripts\/controllers\/perps\/infrastructure.test.ts/i.

- PASS ac4-order-lifecycle-behaviour (command, 30s): exitCode=0, stdout=
✅ No console baseline violations.

, stderr=watchman warning:  Recrawled this watch 1 time, most recently because:
MustScanSubDirs UserDroppedTo resolve, please review the information on
https://facebook.github.io/watchman/docs/troubleshooting.html#recrawl
To clear this warning, run:
`watchman watch-del '/Users/deeeed/dev/metamask/metamask-extension-2' ; watchman watch-project '/Users/deeeed/dev/metamask/metamask-extension-2'`

PASS ui/components/app/perps/close-position/close-position-modal.test.tsx (12.409 s)
PASS ui/pages/perps/perps-order-entry-page.test.tsx (6.75 s)
PASS ui/components/app/perps/reverse-position/reverse-position-modal.test.tsx
PASS ui/components/app/perps/cancel-order/cancel-order-modal.test.tsx

 ●  Suppressed console messages:

ERROR 20    React: Act warnings (component updates not wrapped)
WARN 1     React: componentWill* lifecycle deprecations
 SKIP   229   messages were filtered

Test Suites: 4 passed, 4 total
Tests:       216 passed, 216 total
Snapshots:   0 total
Time:        27.552 s, estimated 115 s
Ran all test suites matching /ui\/pages\/perps\/perps-order-entry-page.test.tsx|ui\/components\/app\/perps\/cancel-order\/cancel-order-modal.test.tsx|ui\/components\/app\/perps\/close-position\/close-position-modal.test.tsx|ui\/components\/app\/perps\/reverse-position\/reverse-position-modal.test.tsx/i.

- PASS ac5-assert-no-duplicate-order-entry-close (command, 110ms): exitCode=0, stdout=order-entry deduped

- PASS ac5-assert-no-duplicate-cancel (command, 68ms): exitCode=0, stdout=cancel deduped

- PASS ac5-assert-no-duplicate-close-modal (command, 62ms): exitCode=0, stdout=close modal deduped

- PASS ac6-search-funnel-behaviour (command, 10s): exitCode=0, stdout=
✅ No console baseline violations.

, stderr=watchman warning:  Recrawled this watch 1 time, most recently because:
MustScanSubDirs UserDroppedTo resolve, please review the information on
https://facebook.github.io/watchman/docs/troubleshooting.html#recrawl
To clear this warning, run:
`watchman watch-del '/Users/deeeed/dev/metamask/metamask-extension-2' ; watchman watch-project '/Users/deeeed/dev/metamask/metamask-extension-2'`

PASS ui/pages/perps/market-list/index.test.tsx (6.716 s)

 ●  Suppressed console messages:

 SKIP   29    messages were filtered

Test Suites: 1 passed, 1 total
Tests:       27 passed, 27 total
Snapshots:   0 total
Time:        7.962 s
Ran all test suites matching /ui\/pages\/perps\/market-list\/index.test.tsx/i.

- PASS ac7-abandonment-behaviour (command, 3.4s): exitCode=0, stdout=
✅ No console baseline violations.

, stderr=watchman warning:  Recrawled this watch 1 time, most recently because:
MustScanSubDirs UserDroppedTo resolve, please review the information on
https://facebook.github.io/watchman/docs/troubleshooting.html#recrawl
To clear this warning, run:
`watchman watch-del '/Users/deeeed/dev/metamask/metamask-extension-2' ; watchman watch-project '/Users/deeeed/dev/metamask/metamask-extension-2'`

PASS ui/hooks/perps/usePerpsAbandonOrderTracking.test.ts

 ●  Suppressed console messages:

 SKIP   8     messages were filtered

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        2.044 s
Ran all test suites matching /ui\/hooks\/perps\/usePerpsAbandonOrderTracking.test.ts/i.

- PASS ac8-geo-block-screen-view (command, 7.3s): exitCode=0, stdout=
✅ No console baseline violations.

, stderr=watchman warning:  Recrawled this watch 1 time, most recently because:
MustScanSubDirs UserDroppedTo resolve, please review the information on
https://facebook.github.io/watchman/docs/troubleshooting.html#recrawl
To clear this warning, run:
`watchman watch-del '/Users/deeeed/dev/metamask/metamask-extension-2' ; watchman watch-project '/Users/deeeed/dev/metamask/metamask-extension-2'`

PASS ui/components/app/perps/perps-geo-block-modal/perps-geo-block-modal.test.tsx (5.282 s)

 ●  Suppressed console messages:

 SKIP   11    messages were filtered

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        5.905 s
Ran all test suites matching /ui\/components\/app\/perps\/perps-geo-block-modal\/perps-geo-block-modal.test.tsx/i.

- PASS live-cdp (cdp.target, 23ms): platform=extension
- PASS live-ensure-unlocked (metamask.wallet.ensure_unlocked, 136ms): proof=extension-unlocked-state
- PASS live-open-perps (ui.navigate, 353ms): page=perps, proof=ui-navigation
- PASS live-open-unknown-market (ui.navigate, 229ms): proof=ui-navigation
- PASS live-assert-error-screen (ui.wait_for, 2.5s): matched=true, cdpPort=6662, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market/DOESNOTEXIST
- PASS live-capture-error-screen (ui.screenshot, 532ms): path=live-capture-error-screen.png
- PASS teardown-end (end, 0ms)
