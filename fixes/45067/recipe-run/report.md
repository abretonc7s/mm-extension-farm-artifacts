# MetaMask Recipe Run

Status: pass
Duration: 28s
Nodes: 28/28 passed

## Side findings
- REVIEW 8 distinct application warning/error event(s) (non-blocking; expanded below and stored in diagnostics.json)

## Steps
- PASS gate-status (app.status, 9ms): platform=extension
- PASS gate-fixture (metamask.wallet.fixture_status, 23ms): path=temp/recipe/runtime/wallet-fixture.json
- PASS setup-unlock (metamask.wallet.ensure_unlocked, 75ms): proof=extension-unlocked-state
- PASS setup-open-home (ui.navigate, 94ms): proof=ui-navigation
- PASS setup-wait-app-ready (ui.wait_for, 346ms): matched=true, cdpPort=6664, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/
- PASS setup-select-account (metamask.wallet.select_account, 412ms): proof=extension-account-selection
- PASS setup-start-state (metamask.perps.start_state, 1.0s): proof=metamask-perps-start-state
- PASS ac1-ensure-order-open (metamask.perps.ensure_orders, 10s): matching=1
- PASS ac1-navigate-market (ui.navigate, 474ms): proof=ui-navigation
- PASS ac1-wait-order-card (ui.wait_for, 440ms): matched=true, cdpPort=6664, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market/ETH
- PASS ac1-open-cancel-modal (ui.press, 740ms): clicked=true, selector=[data-testid^='order-card-'], tagName=BUTTON, cdpPort=6664, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market/ETH
- PASS ac1-wait-modal (ui.wait_for, 368ms): matched=true, cdpPort=6664, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market/ETH
- PASS ac1-press-cancel (ui.press, 586ms): clicked=true, selector=[data-testid="perps-cancel-order-button"], [data-test-id="perps-cancel-order-button"], [data-test="perps-cancel-order-button"], tagName=BUTTON, cdpPort=6664, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market/ETH
- PASS ac1-wait-modal-closed (ui.wait_for, 1.4s): matched=true, cdpPort=6664, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market/ETH
- PASS ac1-assert-orders-absent (metamask.perps.assert_orders, 120ms): matching=0
- PASS ac2-ensure-order-open (metamask.perps.ensure_orders, 3.8s): matching=1
- PASS ac2-navigate-market (ui.navigate, 115ms): proof=ui-navigation
- PASS ac2-wait-order-card (ui.wait_for, 347ms): matched=true, cdpPort=6664, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market/ETH
- PASS ac2-open-cancel-modal (ui.press, 943ms): clicked=true, selector=[data-testid^='order-card-'], tagName=BUTTON, cdpPort=6664, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market/ETH
- PASS ac2-wait-modal (ui.wait_for, 344ms): matched=true, cdpPort=6664, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market/ETH
- PASS ac2-cancel-out-of-band (metamask.perps.close_orders, 1.8s): matching=0
- PASS ac2-press-cancel (ui.press, 378ms): clicked=true, selector=[data-testid="perps-cancel-order-button"], [data-test-id="perps-cancel-order-button"], [data-test="perps-cancel-order-button"], tagName=BUTTON, cdpPort=6664, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market/ETH
- PASS ac2-wait-toast (ui.wait_for, 1.7s): matched=true, cdpPort=6664, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market/ETH
- PASS ac2-screenshot (ui.screenshot, 1.1s): path=screenshots/evidence-ac2-cancel-order-already-closed.png
- PASS ac2-wait-modal-closed (ui.wait_for, 712ms): matched=true, cdpPort=6664, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market/ETH
- PASS ac2-assert-orders-absent (metamask.perps.assert_orders, 155ms): matching=0
- PASS teardown-state (metamask.perps.teardown_state, 328ms): proof=metamask-perps-teardown-state
- PASS done (end, 0ms)
