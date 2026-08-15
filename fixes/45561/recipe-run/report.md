# MetaMask Recipe Run

Status: pass
Duration: 5.7s
Nodes: 24/24 passed

## Side findings
- REVIEW 3 distinct application warning/error event(s) (non-blocking; expanded below and stored in diagnostics.json)

## Steps
- PASS setup-status (app.status, 9ms): platform=extension
- PASS gate-cdp (cdp.target, 10ms): platform=extension
- PASS setup-unlock (metamask.wallet.ensure_unlocked, 76ms): proof=extension-unlocked-state
- PASS setup-open-home (ui.navigate, 90ms): page=home, proof=ui-navigation
- PASS setup-open-order-entry (ui.navigate, 114ms): proof=ui-navigation
- PASS ac1-wait-percent-pill (ui.wait_for, 2.8s): matched=true, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac1-probe-initial-load (command, 49ms): exitCode=0, stdout={"href":"chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH","percentValue":"0","percentIsInteger":true,"percentClientWidth":45,"percentScrollWidth":45,"percentIsClipped":false,"sliderValueNow":"0","sliderIsOnStepGrid":true}

- PASS ac1-assert-percent-is-whole-number (assert_json, 6ms): path=temp/tasks/fix/45561-0815-094257/artifacts/probe-initial-load.json
- PASS ac1-assert-percent-not-clipped (assert_json, 5ms): path=temp/tasks/fix/45561-0815-094257/artifacts/probe-initial-load.json
- PASS ac1-assert-slider-on-step-grid (assert_json, 4ms): path=temp/tasks/fix/45561-0815-094257/artifacts/probe-initial-load.json
- PASS ac1-clear-capture-orphans (command, 30ms): exitCode=0
- PASS ac1-screenshot-initial-load-percent (ui.screenshot, 239ms): path=screenshots/evidence-ac1-initial-load-percent.png
- PASS ac2-press-slider (ui.press, 361ms): clicked=true, selector=[data-testid="amount-slider"] input[type="range"], tagName=INPUT, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac2-key-increment-1 (ui.key_press, 353ms): key=ArrowRight, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac2-key-increment-2 (ui.key_press, 359ms): key=ArrowRight, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac2-key-increment-3 (ui.key_press, 355ms): key=ArrowRight, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac2-wait-percent-pill (ui.wait_for, 346ms): matched=true, cdpPort=7665, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH
- PASS ac2-probe-after-interaction (command, 48ms): exitCode=0, stdout={"href":"chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/ETH","percentValue":"3","percentIsInteger":true,"percentClientWidth":45,"percentScrollWidth":45,"percentIsClipped":false,"sliderValueNow":"3","sliderIsOnStepGrid":true}

- PASS ac2-assert-percent-value (assert_json, 7ms): path=temp/tasks/fix/45561-0815-094257/artifacts/probe-after-interaction.json
- PASS ac2-assert-percent-is-whole-number (assert_json, 8ms): path=temp/tasks/fix/45561-0815-094257/artifacts/probe-after-interaction.json
- PASS ac2-assert-percent-not-clipped (assert_json, 6ms): path=temp/tasks/fix/45561-0815-094257/artifacts/probe-after-interaction.json
- PASS ac2-clear-capture-orphans (command, 32ms): exitCode=0
- PASS ac2-screenshot-after-interaction (ui.screenshot, 209ms): path=screenshots/evidence-ac2-after-slider-interaction.png
- PASS done (end, 0ms)
