# MetaMask Recipe Run

Status: pass
Duration: 7.7s
Nodes: 21/21 passed

## Side findings
- REVIEW 3 distinct application warning/error event(s) (non-blocking; expanded below and stored in diagnostics.json)

## Steps
- PASS unlock (metamask.wallet.ensure_unlocked, 165ms): proof=extension-unlocked-state
- PASS open-btc (ui.navigate, 164ms): proof=ui-navigation
- PASS wait-entry (ui.wait_for, 369ms): matched=true, cdpPort=7667, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/BTC, cdpTargetId=1ED7CD2E15AC58B09D09BBE9183BC1FA, runtimeSessionId=18e5fd79-9059-4e61-87df-5be926599abb
- PASS leverage (ui.set_input, 430ms): set=true, selector=[data-testid="leverage-input"] input, tagName=INPUT, previousLength=1, retainedLength=1
- PASS long (ui.press, 467ms): clicked=true, selector=[data-testid="direction-tab-long"], [data-test-id="direction-tab-long"], [data-test="direction-tab-long"], tagName=BUTTON, cdpPort=7667, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/BTC
- PASS amount-100 (ui.set_input, 418ms): set=true, selector=[data-testid="amount-input-field"] input, tagName=INPUT, previousLength=6, retainedLength=3
- PASS read-100 (metamask.perps.read_visible_state, 203ms): platform=extension, route=#/perps/trade/BTC, proof=visible-dom-accessibility
- PASS fee-visible-100 (ui.scroll, 362ms): scrolled=true, selector=[data-testid="perps-order-summary-estimated-fees"], [data-test-id="perps-order-summary-estimated-fees"], [data-test="perps-order-summary-estimated-fees"], intoView=true, cdpPort=7667, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/BTC
- PASS quote-100 (command, 922ms): exitCode=0, stdout={"isTestnet":true,"quotes":[{"name":"OrderEntry","isFallback":false,"result":{"feeRate":0.00145,"feeAmount":0.145,"protocolFeeRate":0.00045,"protocolFeeAmount":0.045,"metamaskFeeRate":0.001,"metamaskFeeAmount":0.1,"chargesMetamaskBuilderFee":true,"feeSource":"rewards","metamaskFeeDiscountBips":0,"undiscountedMetamaskFeeRate":0.001}},{"name":"PerpsOrderEntryPage","isFallback":false,"result":{"feeRate":0.00145,"feeAmount":0.145,"protocolFeeRate":0.00045,"protocolFeeAmount":0.045,"metamaskFeeRate":0.001,"metamaskFeeAmount":0.1,"chargesMetamaskBuilderFee":true,"feeSource":"rewards","metamaskFeeDiscountBips":0,"undiscountedMetamaskFeeRate":0.001}}],"amount":"100","leverage":"3","displayedFee":"$0.15","discountBadge":null,"route":"#/perps/trade/BTC"}

- PASS capture-100 (ui.screenshot, 189ms): path=screenshots/btc-100-fee.png
- PASS amount-1000 (ui.set_input, 377ms): set=true, selector=[data-testid="amount-input-field"] input, tagName=INPUT, previousLength=3, retainedLength=4
- PASS read-1000 (metamask.perps.read_visible_state, 203ms): platform=extension, route=#/perps/trade/BTC, proof=visible-dom-accessibility
- PASS fee-visible-1000 (ui.scroll, 381ms): scrolled=true, selector=[data-testid="perps-order-summary-estimated-fees"], [data-test-id="perps-order-summary-estimated-fees"], [data-test="perps-order-summary-estimated-fees"], intoView=true, cdpPort=7667, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/BTC
- PASS quote-1000 (command, 698ms): exitCode=0, stdout={"isTestnet":true,"quotes":[{"name":"OrderEntry","isFallback":false,"result":{"feeRate":0.00145,"feeAmount":1.45,"protocolFeeRate":0.00045,"protocolFeeAmount":0.45,"metamaskFeeRate":0.001,"metamaskFeeAmount":1,"chargesMetamaskBuilderFee":true,"feeSource":"rewards","metamaskFeeDiscountBips":0,"undiscountedMetamaskFeeRate":0.001}},{"name":"PerpsOrderEntryPage","isFallback":false,"result":{"feeRate":0.00145,"feeAmount":1.45,"protocolFeeRate":0.00045,"protocolFeeAmount":0.45,"metamaskFeeRate":0.001,"metamaskFeeAmount":1,"chargesMetamaskBuilderFee":true,"feeSource":"rewards","metamaskFeeDiscountBips":0,"undiscountedMetamaskFeeRate":0.001}}],"amount":"1000","leverage":"3","displayedFee":"$1.45","discountBadge":null,"route":"#/perps/trade/BTC"}

- PASS capture-1000 (ui.screenshot, 178ms): path=screenshots/btc-1000-fee.png
- PASS home (ui.navigate, 187ms): proof=ui-navigation
- PASS close-all (ui.press, 769ms): clicked=true, selector=[data-testid="perps-close-all-positions"], [data-test-id="perps-close-all-positions"], [data-test="perps-close-all-positions"], tagName=BUTTON, cdpPort=7667, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home
- PASS wait-close-all (ui.wait_for, 698ms): matched=true, cdpPort=7667, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=1ED7CD2E15AC58B09D09BBE9183BC1FA, runtimeSessionId=18e5fd79-9059-4e61-87df-5be926599abb
- PASS capture-close-all (ui.screenshot, 189ms): path=screenshots/close-all-fee.png
- PASS leave-preview (ui.navigate, 136ms): proof=ui-navigation
- PASS done (end, 0ms)
