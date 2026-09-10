# MetaMask Recipe Run

Status: pass
Duration: 6.0s
Nodes: 13/13 passed

## Side findings
- REVIEW 2 distinct application warning/error event(s) (non-blocking; expanded below and stored in diagnostics.json)

## Steps
- PASS setup-unlock (metamask.wallet.ensure_unlocked, 70ms): proof=extension-unlocked-state
- PASS setup-select-unfunded (metamask.wallet.select_account, 387ms): proof=extension-background-account-selection
- PASS setup-open-trade (ui.navigate, 103ms): proof=ui-navigation
- PASS setup-wait-form (ui.wait_for, 3.1s): matched=true, cdpPort=7662, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/BTC?direction=long&mode=new, cdpTargetId=FBB4A5D58A441B1612337F38576F6408, runtimeSessionId=0b4044af-6b2a-4fec-b1b7-c67d24d4d7ef
- PASS setup-wait-zero-balance (ui.wait_for, 372ms): matched=true, cdpPort=7662, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/BTC?direction=long&mode=new, cdpTargetId=FBB4A5D58A441B1612337F38576F6408, runtimeSessionId=0b4044af-6b2a-4fec-b1b7-c67d24d4d7ef
- PASS ac2-wait-hint (ui.wait_for, 370ms): matched=true, cdpPort=7662, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/BTC?direction=long&mode=new, cdpTargetId=FBB4A5D58A441B1612337F38576F6408, runtimeSessionId=0b4044af-6b2a-4fec-b1b7-c67d24d4d7ef
- PASS ac2-wait-cta (ui.wait_for, 364ms): matched=true, cdpPort=7662, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/BTC?direction=long&mode=new, cdpTargetId=FBB4A5D58A441B1612337F38576F6408, runtimeSessionId=0b4044af-6b2a-4fec-b1b7-c67d24d4d7ef
- PASS ac2-wait-enabled (ui.wait_for, 372ms): matched=true, cdpPort=7662, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/BTC?direction=long&mode=new, cdpTargetId=FBB4A5D58A441B1612337F38576F6408, runtimeSessionId=0b4044af-6b2a-4fec-b1b7-c67d24d4d7ef
- PASS ac2-kill-capture-helper (command, 84ms): exitCode=0
- PASS ac2-screenshot-cta (ui.screenshot, 234ms): path=screenshots/after-ac2-unfunded-cta.png
- PASS done (end, 0ms)
- PASS teardown-restore-account (metamask.wallet.select_account, 484ms): proof=extension-background-account-selection
- PASS teardown-done (end, 0ms)
