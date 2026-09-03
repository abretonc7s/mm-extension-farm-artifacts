# MetaMask Recipe Run

Status: pass
Duration: 6.0s
Nodes: 13/13 passed

## Side findings
- REVIEW 1 distinct application warning/error event(s) (non-blocking; expanded below and stored in diagnostics.json)

## Steps
- PASS setup-unlock (metamask.wallet.ensure_unlocked, 298ms): proof=extension-unlocked-state
- PASS setup-select-unfunded (metamask.wallet.select_account, 789ms): proof=extension-background-account-selection
- PASS setup-open-trade (ui.navigate, 205ms): proof=ui-navigation
- PASS setup-wait-form (ui.wait_for, 661ms): matched=true, cdpPort=7664, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/BTC?direction=long&mode=new, cdpTargetId=055056AA3346CF632A2FDF809788F641, runtimeSessionId=385558dd-478f-4f8e-875b-40288a6af71d
- PASS setup-wait-zero-balance (ui.wait_for, 448ms): matched=true, cdpPort=7664, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/BTC?direction=long&mode=new, cdpTargetId=055056AA3346CF632A2FDF809788F641, runtimeSessionId=385558dd-478f-4f8e-875b-40288a6af71d
- PASS ac2-wait-hint (ui.wait_for, 1.5s): matched=true, cdpPort=7664, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/BTC?direction=long&mode=new, cdpTargetId=055056AA3346CF632A2FDF809788F641, runtimeSessionId=385558dd-478f-4f8e-875b-40288a6af71d
- PASS ac2-wait-cta (ui.wait_for, 359ms): matched=true, cdpPort=7664, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/BTC?direction=long&mode=new, cdpTargetId=055056AA3346CF632A2FDF809788F641, runtimeSessionId=385558dd-478f-4f8e-875b-40288a6af71d
- PASS ac2-wait-enabled (ui.wait_for, 354ms): matched=true, cdpPort=7664, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/BTC?direction=long&mode=new, cdpTargetId=055056AA3346CF632A2FDF809788F641, runtimeSessionId=385558dd-478f-4f8e-875b-40288a6af71d
- PASS ac2-kill-capture-helper (command, 93ms): exitCode=0
- PASS ac2-screenshot-cta (ui.screenshot, 528ms): path=screenshots/after-ac2-unfunded-cta.png
- PASS done (end, 1ms)
- PASS teardown-restore-account (metamask.wallet.select_account, 568ms): proof=extension-background-account-selection
- PASS teardown-done (end, 0ms)
