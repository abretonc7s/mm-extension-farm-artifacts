# MetaMask Recipe Run

Status: pass
Duration: 82s
Nodes: 19/19 passed

## Side findings
- REVIEW 1 distinct application warning/error event(s) (non-blocking; expanded below and stored in diagnostics.json)

## Steps
- PASS gate-repo-root (assert_file, 83ms): path=package.json
- PASS ac1-assert-package-version (command, 264ms): exitCode=0, stdout=perps-controller 9.2.1

- PASS ac2-assert-controller-reexports (assert_file, 71ms): path=shared/constants/perps-events.ts
- PASS ac2-assert-no-local-timestamp-mirror (command, 486ms): exitCode=0, stdout=re-export ok

- PASS ac3-attribution-behaviour (command, 15s): exitCode=0, stdout=
✅ No console baseline violations.

, stderr=PASS app/scripts/messenger-client-init/perps-controller-init.test.ts (7.635 s)
PASS app/scripts/controllers/perps/infrastructure.test.ts
PASS ui/hooks/perps/usePerpsAttribution.test.ts
PASS ui/providers/perps/PerpsAttributionContext.test.tsx

 ●  Suppressed console messages:

ERROR 1     Test errors: Uncaught Errors

Test Suites: 4 passed, 4 total
Tests:       221 passed, 221 total
Snapshots:   0 total
Time:        11.549 s, estimated 20 s
Ran all test suites matching /ui\/providers\/perps\/PerpsAttributionContext.test.tsx|ui\/hooks\/perps\/usePerpsAttribution.test.ts|app\/scripts\/messenger-client-init\/perps-controller-init.test.ts|app\/scripts\/controllers\/perps\/infrastructure.test.ts/i.

- PASS ac4-order-lifecycle-behaviour (command, 43s): exitCode=0, stdout=
✅ No console baseline violations.

, stderr=PASS ui/pages/perps/perps-order-entry-page.test.tsx (24.142 s)
PASS ui/components/app/perps/reverse-position/reverse-position-modal.test.tsx
PASS ui/components/app/perps/close-position/close-position-modal.test.tsx (8.443 s)
PASS ui/components/app/perps/cancel-order/cancel-order-modal.test.tsx

 ●  Suppressed console messages:

ERROR 20    React: Act warnings (component updates not wrapped)
WARN 1     React: componentWill* lifecycle deprecations

Test Suites: 4 passed, 4 total
Tests:       185 passed, 185 total
Snapshots:   0 total
Time:        39.007 s, estimated 52 s
Ran all test suites matching /ui\/pages\/perps\/perps-order-entry-page.test.tsx|ui\/components\/app\/perps\/cancel-order\/cancel-order-modal.test.tsx|ui\/components\/app\/perps\/close-position\/close-position-modal.test.tsx|ui\/components\/app\/perps\/reverse-position\/reverse-position-modal.test.tsx/i.

- PASS ac5-assert-no-duplicate-order-entry-close (command, 63ms): exitCode=0, stdout=order-entry deduped

- PASS ac5-assert-no-duplicate-cancel (command, 65ms): exitCode=0, stdout=cancel deduped

- PASS ac5-assert-no-duplicate-close-modal (command, 56ms): exitCode=0, stdout=close modal deduped

- PASS ac6-search-funnel-behaviour (command, 8.0s): exitCode=0, stdout=
✅ No console baseline violations.

, stderr=PASS ui/pages/perps/market-list/index.test.tsx (5.579 s)

Test Suites: 1 passed, 1 total
Tests:       27 passed, 27 total
Snapshots:   0 total
Time:        6.089 s, estimated 34 s
Ran all test suites matching /ui\/pages\/perps\/market-list\/index.test.tsx/i.

- PASS ac7-abandonment-behaviour (command, 2.9s): exitCode=0, stdout=
✅ No console baseline violations.

, stderr=PASS ui/hooks/perps/usePerpsAbandonOrderTracking.test.ts

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        1.765 s, estimated 7 s
Ran all test suites matching /ui\/hooks\/perps\/usePerpsAbandonOrderTracking.test.ts/i.

- PASS ac8-geo-block-screen-view (command, 6.7s): exitCode=0, stdout=
✅ No console baseline violations.

, stderr=PASS ui/components/app/perps/perps-geo-block-modal/perps-geo-block-modal.test.tsx

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        5.202 s
Ran all test suites matching /ui\/components\/app\/perps\/perps-geo-block-modal\/perps-geo-block-modal.test.tsx/i.

- PASS live-cdp (cdp.target, 7ms): platform=extension
- PASS live-ensure-unlocked (metamask.wallet.ensure_unlocked, 128ms): proof=extension-unlocked-state
- PASS live-open-perps (ui.navigate, 3.8s): page=perps, proof=ui-navigation
- PASS live-open-unknown-market (ui.navigate, 185ms): proof=ui-navigation
- PASS live-assert-error-screen (ui.wait_for, 471ms): matched=true, cdpPort=6672, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market/DOESNOTEXIST
- PASS live-capture-error-screen (ui.screenshot, 546ms): path=live-capture-error-screen.png
- PASS teardown-end (end, 0ms)
