# MetaMask Recipe Run

Status: pass
Duration: 18s
Nodes: 19/19 passed

## Side findings
- REVIEW 2 distinct application warning/error event(s) (non-blocking; expanded below and stored in diagnostics.json)

## Steps
- PASS setup-unlock (metamask.wallet.ensure_unlocked, 168ms): proof=extension-unlocked-state
- PASS setup-open-tokens-tab (ui.press, 687ms): clicked=true, selector=[data-testid="account-overview__asset-tab"], [data-test-id="account-overview__asset-tab"], [data-test="account-overview__asset-tab"], tagName=BUTTON, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/?tab=perps
- PASS setup-wait-tokens-tab (ui.wait_for, 486ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/?tab=tokens, cdpTargetId=959DF611BDDEA8BF4CA2C09006128AE5, runtimeSessionId=bf74a8eb-0912-4834-899e-5f082012a21e
- PASS setup-capture (metamask.analytics.start_capture, 568ms): action=metamask.analytics.start_capture, cursor=1790234270576, port=8667, pid=37906, eventsFile=/Users/deeeed/dev/metamask/metamask-extension-6/temp/recipe/runtime/analytics/events.jsonl
- PASS ac1-open-perps-tab (ui.press, 709ms): clicked=true, selector=[data-testid="account-overview__perps-tab"], [data-testid="bottom-nav-perps"], tagName=BUTTON, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/?tab=tokens
- PASS ac1-wait-perps-view (ui.wait_for, 353ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/?tab=perps, cdpTargetId=959DF611BDDEA8BF4CA2C09006128AE5, runtimeSessionId=bf74a8eb-0912-4834-899e-5f082012a21e
- PASS ac1-assert-screen-viewed-env (metamask.analytics.assert_events, 1.5s): action=metamask.analytics.assert_events, since=1790234270576, exact=false, observed=1 item, capturedCount=1
- PASS ac3-scroll-learn-basics (ui.scroll, 349ms): scrolled=true, selector=[data-testid="perps-learn-basics"], [data-test-id="perps-learn-basics"], [data-test="perps-learn-basics"], intoView=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/?tab=perps
- PASS ac3-wait-learn-basics (ui.wait_for, 357ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/?tab=perps, cdpTargetId=959DF611BDDEA8BF4CA2C09006128AE5, runtimeSessionId=bf74a8eb-0912-4834-899e-5f082012a21e
- PASS gate-kill-capture-helper (command, 84ms): exitCode=0
- PASS ac3-screenshot-perps-home (ui.screenshot, 319ms): path=evidence-ac3-perps-home.png
- PASS ac3-press-learn-basics (ui.press, 746ms): clicked=true, selector=[data-testid="perps-learn-basics"], [data-test-id="perps-learn-basics"], [data-test="perps-learn-basics"], tagName=DIV, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/?tab=perps
- PASS ac3-assert-ui-interaction (metamask.analytics.assert_events, 1.5s): action=metamask.analytics.assert_events, since=1790234270576, exact=false, observed=1 item, capturedCount=4
- PASS ac3-read-events (metamask.analytics.read_events, 67ms): count=2
- PASS ac2-run-geo-block-test (command, 9.4s): exitCode=0, stdout=PASS ui/components/app/perps/perps-geo-block-modal/perps-geo-block-modal.test.tsx (6.805 s)

Test Suites: 1 passed, 1 total
Tests:       5 skipped, 1 passed, 6 total
Snapshots:   0 total
Time:        7.397 s
Ran all test suites matching /ui\/components\/app\/perps\/perps-geo-block-modal\/perps-geo-block-modal.test.tsx/i with tests matching "geo_block_notif".

✅ No console baseline violations.


- PASS ac2-assert-geo-block-test (assert_output, 8ms): source=ac2-run-geo-block-test, stream=stdout, contains=1 passed
- PASS teardown-wait-tutorial (ui.wait_for, 354ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/?tab=perps, cdpTargetId=959DF611BDDEA8BF4CA2C09006128AE5, runtimeSessionId=bf74a8eb-0912-4834-899e-5f082012a21e
- PASS teardown-close-tutorial (ui.press, 425ms): clicked=true, selector=[data-testid="perps-tutorial-skip-button"], [data-test-id="perps-tutorial-skip-button"], [data-test="perps-tutorial-skip-button"], tagName=BUTTON, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/?tab=perps
- PASS done (end, 0ms)
