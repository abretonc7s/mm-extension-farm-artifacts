# MetaMask Recipe Run

Status: pass
Duration: 7.3s
Nodes: 13/13 passed

## Side findings
- REVIEW 5 distinct application warning/error event(s) (non-blocking; expanded below and stored in diagnostics.json)

## Steps
- PASS setup-unlock (metamask.wallet.ensure_unlocked, 523ms): proof=extension-password-unlock
- PASS setup-select-unfunded (metamask.wallet.select_account, 663ms): proof=extension-background-account-selection
- PASS setup-open-trade (ui.navigate, 159ms): proof=ui-navigation
- PASS setup-wait-form (ui.wait_for, 3.2s): matched=true, cdpPort=7662, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/BTC?direction=long&mode=new, cdpTargetId=D92AEB38A97EA6EB0E36A40BE21EB4B2, runtimeSessionId=e6d11b56-28dc-4ee4-a2cc-b539b213ae21
- PASS setup-wait-zero-balance (ui.wait_for, 358ms): matched=true, cdpPort=7662, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/BTC?direction=long&mode=new, cdpTargetId=D92AEB38A97EA6EB0E36A40BE21EB4B2, runtimeSessionId=e6d11b56-28dc-4ee4-a2cc-b539b213ae21
- PASS ac2-wait-hint (ui.wait_for, 354ms): matched=true, cdpPort=7662, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/BTC?direction=long&mode=new, cdpTargetId=D92AEB38A97EA6EB0E36A40BE21EB4B2, runtimeSessionId=e6d11b56-28dc-4ee4-a2cc-b539b213ae21
- PASS ac2-wait-cta (ui.wait_for, 364ms): matched=true, cdpPort=7662, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/BTC?direction=long&mode=new, cdpTargetId=D92AEB38A97EA6EB0E36A40BE21EB4B2, runtimeSessionId=e6d11b56-28dc-4ee4-a2cc-b539b213ae21
- PASS ac2-wait-enabled (ui.wait_for, 363ms): matched=true, cdpPort=7662, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/BTC?direction=long&mode=new, cdpTargetId=D92AEB38A97EA6EB0E36A40BE21EB4B2, runtimeSessionId=e6d11b56-28dc-4ee4-a2cc-b539b213ae21
- PASS ac2-kill-capture-helper (command, 100ms): exitCode=0
- PASS ac2-screenshot-cta (ui.screenshot, 386ms): path=screenshots/after-ac2-unfunded-cta.png
- PASS done (end, 0ms)
- PASS teardown-restore-account (metamask.wallet.select_account, 716ms): proof=extension-background-account-selection
- PASS teardown-done (end, 0ms)
