# MetaMask Recipe Run

Status: pass
Duration: 6.8s
Nodes: 13/13 passed

## Side findings
- REVIEW 5 distinct application warning/error event(s) (non-blocking; expanded below and stored in diagnostics.json)

## Steps
- PASS setup-unlock (metamask.wallet.ensure_unlocked, 359ms): proof=extension-password-unlock
- PASS setup-select-unfunded (metamask.wallet.select_account, 631ms): proof=extension-background-account-selection
- PASS setup-open-trade (ui.navigate, 116ms): proof=ui-navigation
- PASS setup-wait-form (ui.wait_for, 3.4s): matched=true, cdpPort=7662, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/BTC?direction=long&mode=new, cdpTargetId=1A280E81ECA7B749C7B3073A178A4FBF, runtimeSessionId=421408cc-b788-493e-91d7-caa58443042a
- PASS setup-wait-zero-balance (ui.wait_for, 350ms): matched=true, cdpPort=7662, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/BTC?direction=long&mode=new, cdpTargetId=1A280E81ECA7B749C7B3073A178A4FBF, runtimeSessionId=421408cc-b788-493e-91d7-caa58443042a
- PASS ac2-wait-hint (ui.wait_for, 355ms): matched=true, cdpPort=7662, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/BTC?direction=long&mode=new, cdpTargetId=1A280E81ECA7B749C7B3073A178A4FBF, runtimeSessionId=421408cc-b788-493e-91d7-caa58443042a
- PASS ac2-wait-cta (ui.wait_for, 405ms): matched=true, cdpPort=7662, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/BTC?direction=long&mode=new, cdpTargetId=1A280E81ECA7B749C7B3073A178A4FBF, runtimeSessionId=421408cc-b788-493e-91d7-caa58443042a
- PASS ac2-wait-enabled (ui.wait_for, 358ms): matched=true, cdpPort=7662, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/BTC?direction=long&mode=new, cdpTargetId=1A280E81ECA7B749C7B3073A178A4FBF, runtimeSessionId=421408cc-b788-493e-91d7-caa58443042a
- PASS ac2-kill-capture-helper (command, 89ms): exitCode=0
- PASS ac2-screenshot-cta (ui.screenshot, 305ms): path=screenshots/after-ac2-unfunded-cta.png
- PASS done (end, 0ms)
- PASS teardown-restore-account (metamask.wallet.select_account, 404ms): proof=extension-background-account-selection
- PASS teardown-done (end, 0ms)
