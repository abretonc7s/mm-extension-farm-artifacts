# MetaMask Recipe Run

Status: pass
Duration: 6.3s
Nodes: 14/14 passed

## Side findings
- REVIEW 4 distinct application warning/error event(s) (non-blocking; expanded below and stored in diagnostics.json)

## Steps
- PASS setup-status (app.status, 21ms): platform=extension
- PASS setup-cdp (cdp.target, 9ms): platform=extension
- PASS setup-ensure-unlocked (metamask.wallet.ensure_unlocked, 551ms): proof=extension-password-unlock
- PASS setup-open-perps (ui.navigate, 378ms): proof=ui-navigation
- PASS setup-perps-ready (ui.wait_for, 3.9s): matched=true, cdpPort=7667, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=1ED7CD2E15AC58B09D09BBE9183BC1FA, runtimeSessionId=18e5fd79-9059-4e61-87df-5be926599abb
- PASS ac2-read-home (metamask.perps.read_visible_state, 197ms): platform=extension, route=#/perps-home, proof=visible-dom-accessibility
- PASS ac2-assert-home (assert_output, 5ms): source=ac2-read-home, stream=stdout
- PASS ac2-assert-markets (assert_output, 5ms): source=ac2-read-home, stream=stdout
- PASS ac2-read-positions (metamask.perps.read_positions, 159ms): count=1, matching=1
- PASS ac2-read-orders (metamask.perps.read_orders, 137ms): count=0, matching=0
- PASS ac2-settle (ui.wait_for, 363ms): matched=true, cdpPort=7667, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=1ED7CD2E15AC58B09D09BBE9183BC1FA, runtimeSessionId=18e5fd79-9059-4e61-87df-5be926599abb
- PASS ac2-capture (ui.screenshot, 313ms): path=screenshots/ac2-home.png
- PASS ac1-version (command, 47ms): exitCode=0, stdout={"manifest":"^20.0.0","installed":"20.0.0","lock20":true}

- PASS gate-done (end, 0ms)
