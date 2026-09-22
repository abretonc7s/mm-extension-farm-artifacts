# MetaMask Recipe Run

Status: pass
Duration: 7.2s
Nodes: 13/13 passed

## Side findings
- REVIEW 5 distinct application warning/error event(s) (non-blocking; expanded below and stored in diagnostics.json)

## Steps
- PASS setup-unlock (metamask.wallet.ensure_unlocked, 448ms): proof=extension-password-unlock
- PASS setup-select-unfunded (metamask.wallet.select_account, 421ms): proof=extension-background-account-selection
- PASS setup-open-trade (ui.navigate, 160ms): proof=ui-navigation
- PASS setup-wait-form (ui.wait_for, 3.4s): matched=true, cdpPort=7662, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/BTC?direction=long&mode=new, cdpTargetId=D459A6AB122AD48B7883CE4C3B3EF88A, runtimeSessionId=d94d5b7d-8d1a-49cf-83be-c2eaa19ed6b8
- PASS setup-wait-zero-balance (ui.wait_for, 358ms): matched=true, cdpPort=7662, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/BTC?direction=long&mode=new, cdpTargetId=D459A6AB122AD48B7883CE4C3B3EF88A, runtimeSessionId=d94d5b7d-8d1a-49cf-83be-c2eaa19ed6b8
- PASS ac2-wait-hint (ui.wait_for, 351ms): matched=true, cdpPort=7662, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/BTC?direction=long&mode=new, cdpTargetId=D459A6AB122AD48B7883CE4C3B3EF88A, runtimeSessionId=d94d5b7d-8d1a-49cf-83be-c2eaa19ed6b8
- PASS ac2-wait-cta (ui.wait_for, 353ms): matched=true, cdpPort=7662, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/BTC?direction=long&mode=new, cdpTargetId=D459A6AB122AD48B7883CE4C3B3EF88A, runtimeSessionId=d94d5b7d-8d1a-49cf-83be-c2eaa19ed6b8
- PASS ac2-wait-enabled (ui.wait_for, 355ms): matched=true, cdpPort=7662, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps/trade/BTC?direction=long&mode=new, cdpTargetId=D459A6AB122AD48B7883CE4C3B3EF88A, runtimeSessionId=d94d5b7d-8d1a-49cf-83be-c2eaa19ed6b8
- PASS ac2-kill-capture-helper (command, 109ms): exitCode=0
- PASS ac2-screenshot-cta (ui.screenshot, 437ms): path=screenshots/after-ac2-unfunded-cta.png
- PASS done (end, 0ms)
- PASS teardown-restore-account (metamask.wallet.select_account, 726ms): proof=extension-background-account-selection
- PASS teardown-done (end, 0ms)
