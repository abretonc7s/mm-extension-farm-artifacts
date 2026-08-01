# MetaMask Recipe Run

Status: pass
Duration: 21s
Nodes: 28/28 passed

## Side findings
- REVIEW 7 distinct application warning/error event(s) (non-blocking; expanded below and stored in diagnostics.json)

## Steps
- PASS gate-status (app.status, 8ms): platform=extension
- PASS gate-fixture (metamask.wallet.fixture_status, 14ms): path=temp/recipe/runtime/wallet-fixture.json
- PASS setup-unlock (metamask.wallet.ensure_unlocked, 59ms): proof=extension-unlocked-state
- PASS setup-open-home (ui.navigate, 137ms): proof=ui-navigation
- PASS setup-wait-app-ready (ui.wait_for, 357ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/
- PASS setup-select-account (metamask.wallet.select_account, 83ms): proof=extension-account-selection
- PASS setup-start-state (metamask.perps.start_state, 134ms): proof=metamask-perps-start-state
- PASS ac1-ensure-order-open (metamask.perps.ensure_orders, 5.3s): matching=1
- PASS ac1-navigate-market (ui.navigate, 104ms): proof=ui-navigation
- PASS ac1-wait-order-card (ui.wait_for, 380ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market/ETH
- PASS ac1-open-cancel-modal (ui.press, 1.0s): clicked=true, selector=[data-testid^='order-card-'], tagName=BUTTON, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market/ETH
- PASS ac1-wait-modal (ui.wait_for, 356ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market/ETH
- PASS ac1-press-cancel (ui.press, 658ms): clicked=true, selector=[data-testid="perps-cancel-order-button"], [data-test-id="perps-cancel-order-button"], [data-test="perps-cancel-order-button"], tagName=BUTTON, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market/ETH
- PASS ac1-wait-modal-closed (ui.wait_for, 1.1s): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market/ETH
- PASS ac1-assert-orders-absent (metamask.perps.assert_orders, 146ms): matching=0
- PASS ac2-ensure-order-open (metamask.perps.ensure_orders, 6.0s): matching=1
- PASS ac2-navigate-market (ui.navigate, 103ms): proof=ui-navigation
- PASS ac2-wait-order-card (ui.wait_for, 353ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market/ETH
- PASS ac2-open-cancel-modal (ui.press, 463ms): clicked=true, selector=[data-testid^='order-card-'], tagName=BUTTON, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market/ETH
- PASS ac2-wait-modal (ui.wait_for, 610ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market/ETH
- PASS ac2-cancel-out-of-band (metamask.perps.close_orders, 1.2s): matching=0
- PASS ac2-press-cancel (ui.press, 356ms): clicked=true, selector=[data-testid="perps-cancel-order-button"], [data-test-id="perps-cancel-order-button"], [data-test="perps-cancel-order-button"], tagName=BUTTON, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market/ETH
- PASS ac2-wait-toast (ui.wait_for, 977ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market/ETH
- PASS ac2-screenshot (ui.screenshot, 166ms): path=screenshots/evidence-ac2-cancel-order-already-closed.png
- PASS ac2-wait-modal-closed (ui.wait_for, 348ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/market/ETH
- PASS ac2-assert-orders-absent (metamask.perps.assert_orders, 71ms): matching=0
- PASS teardown-state (metamask.perps.teardown_state, 111ms): proof=metamask-perps-teardown-state
- PASS done (end, 0ms)
