# MetaMask Recipe Run

Status: pass
Duration: 6.0s
Nodes: 13/13 passed

## Side findings
- REVIEW 2 distinct application warning/error event(s) (non-blocking; expanded below and stored in diagnostics.json)

## Steps
- PASS setup-unlock (metamask.wallet.ensure_unlocked, 61ms): proof=extension-unlocked-state
- PASS setup-select-unfunded (metamask.wallet.select_account, 629ms): proof=extension-background-account-selection
- PASS setup-open-trade (ui.navigate, 119ms): proof=ui-navigation
- PASS setup-wait-form (ui.wait_for, 2.9s): matched=true, cdpPort=7664, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/BTC?direction=long&mode=new, cdpTargetId=ACFD4FB9EFF92B98546333F9703EBADA, runtimeSessionId=7422acf1-cb65-4eb5-8ae5-acaf0c57f53a
- PASS setup-wait-zero-balance (ui.wait_for, 350ms): matched=true, cdpPort=7664, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/BTC?direction=long&mode=new, cdpTargetId=ACFD4FB9EFF92B98546333F9703EBADA, runtimeSessionId=7422acf1-cb65-4eb5-8ae5-acaf0c57f53a
- PASS ac2-wait-hint (ui.wait_for, 338ms): matched=true, cdpPort=7664, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/BTC?direction=long&mode=new, cdpTargetId=ACFD4FB9EFF92B98546333F9703EBADA, runtimeSessionId=7422acf1-cb65-4eb5-8ae5-acaf0c57f53a
- PASS ac2-wait-cta (ui.wait_for, 350ms): matched=true, cdpPort=7664, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/BTC?direction=long&mode=new, cdpTargetId=ACFD4FB9EFF92B98546333F9703EBADA, runtimeSessionId=7422acf1-cb65-4eb5-8ae5-acaf0c57f53a
- PASS ac2-wait-enabled (ui.wait_for, 350ms): matched=true, cdpPort=7664, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/BTC?direction=long&mode=new, cdpTargetId=ACFD4FB9EFF92B98546333F9703EBADA, runtimeSessionId=7422acf1-cb65-4eb5-8ae5-acaf0c57f53a
- PASS ac2-kill-capture-helper (command, 51ms): exitCode=0
- PASS ac2-screenshot-cta (ui.screenshot, 212ms): path=screenshots/after-ac2-unfunded-cta.png
- PASS done (end, 0ms)
- PASS teardown-restore-account (metamask.wallet.select_account, 575ms): proof=extension-background-account-selection
- PASS teardown-done (end, 0ms)
