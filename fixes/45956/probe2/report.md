# MetaMask Recipe Run

Status: pass
Duration: 2.1s
Nodes: 6/6 passed

## Steps
- PASS gate (cdp.target, 12ms): platform=extension
- PASS unlock (metamask.wallet.ensure_unlocked, 95ms): proof=extension-unlocked-state
- PASS nav (ui.navigate, 1.2s): page=perps, proof=ui-navigation
- PASS wait (ui.wait_for, 494ms): matched=true, cdpPort=7666, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=EA7EF33110178EA4607668989B21E000, runtimeSessionId=545746f7-d9d5-4ab5-8f2b-fe06e382c75e
- PASS shot (ui.screenshot, 285ms): path=screenshots/perps-tab.png
- PASS done (end, 0ms)
