# MetaMask Recipe Run

Status: pass
Duration: 51s
Nodes: 44/44 passed

## Side findings
- REVIEW 7 distinct application warning/error event(s) (non-blocking; expanded below and stored in diagnostics.json)

## Steps
- PASS setup-status (app.status, 8ms): platform=extension
- PASS setup-cdp (cdp.target, 5ms): platform=extension
- PASS setup-unlock (metamask.wallet.ensure_unlocked, 124ms): proof=extension-unlocked-state
- PASS setup-analytics-capture (metamask.analytics.start_capture, 76ms): action=metamask.analytics.start_capture, cursor=1790248998860, port=8664, pid=24536, eventsFile=/Users/deeeed/dev/metamask/metamask-extension-4/temp/recipe/runtime/analytics/events.jsonl
- PASS setup-open-perps-home (ui.navigate, 126ms): proof=ui-navigation
- PASS setup-open-sol-form (ui.navigate, 188ms): proof=ui-navigation
- PASS setup-wait-amount-input (ui.wait_for, 643ms): matched=true, cdpPort=7664, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html?landing=tat3833-modify#/perps/trade/SOL?direction=long&mode=new, cdpTargetId=3A4BEEA851D524E3A6E7713D8F557233, runtimeSessionId=abc027a3-18b2-4365-b70f-f43050924ed7
- PASS setup-set-amount (ui.set_input, 365ms): set=true, selector=[data-testid="amount-input-field"] input, tagName=INPUT, previousLength=2, retainedLength=2
- PASS setup-submit-order (ui.press, 436ms): clicked=true, selector=[data-testid="submit-order-button"], [data-test-id="submit-order-button"], [data-test="submit-order-button"], tagName=BUTTON, cdpPort=7664, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html?landing=tat3833-modify#/perps/trade/SOL?direction=long&mode=new
- PASS setup-wait-order-form-closed (ui.wait_for, 2.0s): matched=true, cdpPort=7664, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html?landing=tat3833-modify#/perps/trade/SOL?direction=long&mode=new, cdpTargetId=3A4BEEA851D524E3A6E7713D8F557233, runtimeSessionId=abc027a3-18b2-4365-b70f-f43050924ed7
- PASS gate-sol-position-open (metamask.perps.assert_positions, 596ms): matching=1
- PASS gate-eth-position-open (metamask.perps.assert_positions, 94ms): matching=1
- PASS ac1-open-home (ui.navigate, 81ms): proof=ui-navigation
- PASS gate-reset-analytics-close (command, 7.0s): exitCode=0
- PASS ac1-navigate-close-lowercase (ui.navigate, 708ms): proof=ui-navigation
- PASS ac1-wait-close-form (ui.wait_for, 7.6s): matched=true, cdpPort=7664, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html?landing=tat3833-close#/perps/trade/sol?mode=close, cdpTargetId=3A4BEEA851D524E3A6E7713D8F557233, runtimeSessionId=abc027a3-18b2-4365-b70f-f43050924ed7
- PASS ac3-read-close-route (metamask.wallet.read_state, 83ms): proof=extension-wallet-state
- PASS ac3-assert-close-route (assert_output, 5ms): source=ac3-read-close-route, stream=stdout
- PASS ac3-assert-close-redirect-analytics (metamask.analytics.assert_events, 8.0s): action=metamask.analytics.assert_events, since=0, exact=false, observed=2 items, capturedCount=4
- PASS gate-clear-capture-close-form (command, 56ms): exitCode=0
- PASS ac1-screenshot-close-form (ui.screenshot, 257ms): path=evidence-ac1-close-form-route.png
- PASS ac1-press-close (ui.press, 425ms): clicked=true, selector=[data-testid="submit-order-button"], [data-test-id="submit-order-button"], [data-test="submit-order-button"], tagName=BUTTON, cdpPort=7664, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html?landing=tat3833-close#/perps/trade/SOL?mode=close
- PASS ac1-wait-position-closed (ui.wait_for, 1.5s): matched=true, cdpPort=7664, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html?landing=tat3833-close#/perps/trade/SOL?mode=close, cdpTargetId=3A4BEEA851D524E3A6E7713D8F557233, runtimeSessionId=abc027a3-18b2-4365-b70f-f43050924ed7
- PASS gate-wait-return-document (command, 34ms): exitCode=0
- PASS gate-reattach-after-close (metamask.wallet.ensure_unlocked, 86ms): proof=extension-unlocked-state
- PASS ac1-wait-perps-home (ui.wait_for, 2.2s): matched=true, cdpPort=7664, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html?landing=tat3833-modify#/perps-home, cdpTargetId=3A4BEEA851D524E3A6E7713D8F557233, runtimeSessionId=abc027a3-18b2-4365-b70f-f43050924ed7
- PASS ac1-assert-sol-closed (metamask.perps.assert_positions, 98ms): matching=0
- PASS ac1-wait-sol-row-gone (ui.wait_for, 352ms): matched=true, cdpPort=7664, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html?landing=tat3833-modify#/perps-home, cdpTargetId=3A4BEEA851D524E3A6E7713D8F557233, runtimeSessionId=abc027a3-18b2-4365-b70f-f43050924ed7
- PASS gate-clear-capture-positions (command, 70ms): exitCode=0
- PASS ac1-screenshot-positions (ui.screenshot, 268ms): path=evidence-ac1-positions-without-sol.png
- PASS ac2-open-home (ui.navigate, 87ms): proof=ui-navigation
- PASS gate-reset-analytics-modify (command, 7.1s): exitCode=0
- PASS ac2-navigate-modify-lowercase (ui.navigate, 143ms): proof=ui-navigation
- PASS ac2-wait-modify-form (ui.wait_for, 345ms): matched=true, cdpPort=7664, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html?landing=tat3833-modify#/perps/trade/ETH?direction=long&mode=modify, cdpTargetId=3A4BEEA851D524E3A6E7713D8F557233, runtimeSessionId=abc027a3-18b2-4365-b70f-f43050924ed7
- PASS ac3-read-modify-route (metamask.wallet.read_state, 100ms): proof=extension-wallet-state
- PASS ac3-assert-modify-route (assert_output, 5ms): source=ac3-read-modify-route, stream=stdout
- PASS ac3-assert-modify-redirect-analytics (metamask.analytics.assert_events, 8.0s): action=metamask.analytics.assert_events, since=0, exact=false, observed=2 items, capturedCount=3
- PASS gate-clear-capture-modify-form (command, 50ms): exitCode=0
- PASS ac2-screenshot-modify-form (ui.screenshot, 203ms): path=evidence-ac2-modify-form-route.png
- PASS ac2-press-modify (ui.press, 794ms): clicked=true, selector=[data-testid="submit-order-button"], [data-test-id="submit-order-button"], [data-test="submit-order-button"], tagName=BUTTON, cdpPort=7664, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html?landing=tat3833-modify#/perps/trade/ETH?direction=long&mode=modify
- PASS ac2-wait-left-modify-form (command, 26ms): exitCode=0
- PASS gate-reattach-after-modify (metamask.wallet.ensure_unlocked, 79ms): proof=extension-unlocked-state
- PASS ac2-assert-eth-open (metamask.perps.assert_positions, 75ms): matching=1
- PASS done (end, 0ms)
