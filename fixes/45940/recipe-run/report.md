# MetaMask Recipe Run

Status: pass
Duration: 24s
Nodes: 30/30 passed

## Side findings
- REVIEW 1 distinct application warning/error event(s) (non-blocking; expanded below and stored in diagnostics.json)

## Steps
- PASS gate-unlock-wallet (metamask.wallet.ensure_unlocked, 71ms): proof=extension-unlocked-state
- PASS gate-open-perps (ui.navigate, 1.1s): page=perps, proof=ui-navigation
- PASS gate-perps-loaded (ui.wait_for, 3.6s): matched=true, cdpPort=7663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=91DAB8CD80FCA1FABF0CB9AE63D5B637, runtimeSessionId=6d2ee6de-ef63-4df9-9be7-0cc99cacfc5a
- PASS gate-scroll-to-section (ui.scroll, 358ms): scrolled=true, selector=[data-testid="perps-top-movers"], [data-test-id="perps-top-movers"], [data-test="perps-top-movers"], intoView=true, cdpPort=7663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home
- PASS ac1-wait-section (ui.wait_for, 381ms): matched=true, cdpPort=7663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=91DAB8CD80FCA1FABF0CB9AE63D5B637, runtimeSessionId=6d2ee6de-ef63-4df9-9be7-0cc99cacfc5a
- PASS ac1-wait-gainers-active (ui.wait_for, 351ms): matched=true, cdpPort=7663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=91DAB8CD80FCA1FABF0CB9AE63D5B637, runtimeSessionId=6d2ee6de-ef63-4df9-9be7-0cc99cacfc5a
- PASS ac1-wait-losers-inactive (ui.wait_for, 353ms): matched=true, cdpPort=7663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=91DAB8CD80FCA1FABF0CB9AE63D5B637, runtimeSessionId=6d2ee6de-ef63-4df9-9be7-0cc99cacfc5a
- PASS ac1-wait-pill-grid (ui.wait_for, 368ms): matched=true, cdpPort=7663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=91DAB8CD80FCA1FABF0CB9AE63D5B637, runtimeSessionId=6d2ee6de-ef63-4df9-9be7-0cc99cacfc5a
- PASS ac1-read-gainers-order (metamask.perps.read_visible_state, 94ms): platform=extension, route=#/perps-home, proof=visible-dom-accessibility
- PASS ac1-clear-capture-orphans (command, 50ms): exitCode=0
- PASS ac1-screenshot-section (ui.screenshot, 286ms): path=screenshots/evidence-ac1-top-movers-section.png
- PASS ac2-press-losers (ui.press, 781ms): clicked=true, selector=[data-testid="perps-top-movers-losers"], [data-test-id="perps-top-movers-losers"], [data-test="perps-top-movers-losers"], tagName=BUTTON, cdpPort=7663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home
- PASS ac2-scroll-to-section (ui.scroll, 359ms): scrolled=true, selector=[data-testid="perps-top-movers"], [data-test-id="perps-top-movers"], [data-test="perps-top-movers"], intoView=true, cdpPort=7663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home
- PASS ac2-wait-losers-active (ui.wait_for, 517ms): matched=true, cdpPort=7663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=91DAB8CD80FCA1FABF0CB9AE63D5B637, runtimeSessionId=6d2ee6de-ef63-4df9-9be7-0cc99cacfc5a
- PASS ac2-wait-gainers-inactive (ui.wait_for, 393ms): matched=true, cdpPort=7663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=91DAB8CD80FCA1FABF0CB9AE63D5B637, runtimeSessionId=6d2ee6de-ef63-4df9-9be7-0cc99cacfc5a
- PASS ac2-wait-no-skeleton (ui.wait_for, 538ms): matched=true, cdpPort=7663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=91DAB8CD80FCA1FABF0CB9AE63D5B637, runtimeSessionId=6d2ee6de-ef63-4df9-9be7-0cc99cacfc5a
- PASS ac2-wait-section-still-mounted (ui.wait_for, 363ms): matched=true, cdpPort=7663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=91DAB8CD80FCA1FABF0CB9AE63D5B637, runtimeSessionId=6d2ee6de-ef63-4df9-9be7-0cc99cacfc5a
- PASS ac2-read-losers-order (metamask.perps.read_visible_state, 147ms): platform=extension, route=#/perps-home, proof=visible-dom-accessibility
- PASS ac2-clear-capture-orphans (command, 68ms): exitCode=0
- PASS ac2-screenshot-losers (ui.screenshot, 373ms): path=screenshots/evidence-ac2-losers-selected.png
- PASS ac3-scroll-to-header (ui.scroll, 375ms): scrolled=true, selector=[data-testid="perps-top-movers-header"], [data-test-id="perps-top-movers-header"], [data-test="perps-top-movers-header"], intoView=true, cdpPort=7663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home
- PASS ac3-press-header (ui.press, 2.5s): clicked=true, selector=[data-testid="perps-top-movers-header"], [data-test-id="perps-top-movers-header"], [data-test="perps-top-movers-header"], tagName=BUTTON, cdpPort=7663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home
- PASS ac3-wait-market-list (ui.wait_for, 400ms): matched=true, cdpPort=7663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market-list?sort=priceChange&direction=asc, cdpTargetId=91DAB8CD80FCA1FABF0CB9AE63D5B637, runtimeSessionId=6d2ee6de-ef63-4df9-9be7-0cc99cacfc5a
- PASS ac3-wait-sort-preset (ui.wait_for, 369ms): matched=true, cdpPort=7663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market-list?sort=priceChange&direction=asc, cdpTargetId=91DAB8CD80FCA1FABF0CB9AE63D5B637, runtimeSessionId=6d2ee6de-ef63-4df9-9be7-0cc99cacfc5a
- PASS ac3-clear-capture-orphans (command, 95ms): exitCode=0
- PASS ac3-screenshot-market-list (ui.screenshot, 631ms): path=screenshots/evidence-ac3-market-list-presorted.png
- PASS ac4-skeleton-unit-test (command, 7.7s): exitCode=0, stdout=
✅ No console baseline violations.

, stderr=PASS ui/components/app/perps/perps-top-movers/perps-top-movers.test.tsx (5.073 s)

Test Suites: 1 passed, 1 total
Tests:       17 skipped, 1 passed, 18 total
Snapshots:   0 total
Time:        5.76 s
Ran all test suites matching /ui\/components\/app\/perps\/perps-top-movers\/perps-top-movers.test.tsx/i with tests matching "renders the loading skeleton while market data is loading".

- PASS ac4-assert-test-ran (assert_output, 8ms): source=ac4-skeleton-unit-test, stream=stderr, contains=1 passed
- PASS teardown-return-to-perps (ui.navigate, 1.4s): page=perps, proof=ui-navigation
- PASS done (end, 0ms)
