# MetaMask Recipe Run

Status: pass
Duration: 6.2s
Nodes: 13/13 passed

## Side findings
- REVIEW 9 distinct application warning/error event(s) (non-blocking; expanded below and stored in diagnostics.json)

## Steps
- PASS setup-unlock (metamask.wallet.ensure_unlocked, 334ms): proof=extension-password-unlock
- PASS setup-select-unfunded (metamask.wallet.select_account, 924ms): proof=extension-background-account-selection
- PASS setup-open-trade (ui.navigate, 122ms): proof=ui-navigation
- PASS setup-wait-form (ui.wait_for, 2.2s): matched=true, cdpPort=7664, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/BTC?direction=long&mode=new, cdpTargetId=2C1956F121B088D019D6389A1F594C00, runtimeSessionId=3c0f6ce7-bc87-48c6-b37f-9a633d6a783c
- PASS setup-wait-zero-balance (ui.wait_for, 592ms): matched=true, cdpPort=7664, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/BTC?direction=long&mode=new, cdpTargetId=2C1956F121B088D019D6389A1F594C00, runtimeSessionId=3c0f6ce7-bc87-48c6-b37f-9a633d6a783c
- PASS ac2-wait-hint (ui.wait_for, 371ms): matched=true, cdpPort=7664, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/BTC?direction=long&mode=new, cdpTargetId=2C1956F121B088D019D6389A1F594C00, runtimeSessionId=3c0f6ce7-bc87-48c6-b37f-9a633d6a783c
- PASS ac2-wait-cta (ui.wait_for, 364ms): matched=true, cdpPort=7664, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/BTC?direction=long&mode=new, cdpTargetId=2C1956F121B088D019D6389A1F594C00, runtimeSessionId=3c0f6ce7-bc87-48c6-b37f-9a633d6a783c
- PASS ac2-wait-enabled (ui.wait_for, 368ms): matched=true, cdpPort=7664, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/BTC?direction=long&mode=new, cdpTargetId=2C1956F121B088D019D6389A1F594C00, runtimeSessionId=3c0f6ce7-bc87-48c6-b37f-9a633d6a783c
- PASS ac2-kill-capture-helper (command, 64ms): exitCode=0
- PASS ac2-screenshot-cta (ui.screenshot, 240ms): path=screenshots/after-ac2-unfunded-cta.png
- PASS done (end, 0ms)
- PASS teardown-restore-account (metamask.wallet.select_account, 497ms): proof=extension-background-account-selection
- PASS teardown-done (end, 0ms)
