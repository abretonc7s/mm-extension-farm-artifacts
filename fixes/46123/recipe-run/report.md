# MetaMask Recipe Run

Status: pass
Duration: 8.3s
Nodes: 13/13 passed

## Side findings
- REVIEW 5 distinct application warning/error event(s) (non-blocking; expanded below and stored in diagnostics.json)

## Steps
- PASS ensure-unlocked (metamask.wallet.ensure_unlocked, 73ms): proof=extension-unlocked-state
- PASS home-before-lock (ui.navigate, 83ms): page=home, proof=ui-navigation
- PASS lock (metamask.wallet.lock, 451ms): route=#/unlock, proof=trusted-pointer-visible-ui
- PASS unlock (metamask.wallet.ensure_unlocked, 289ms): proof=extension-password-unlock
- PASS settle-on-home (ui.wait_for, 339ms): matched=true, cdpPort=7662, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/, cdpTargetId=F1AEF567E48D1D4ADA85248076ED6002, runtimeSessionId=25bf98ec-2c4c-46fb-b080-0d55446ccdba
- PASS dwell-on-home (wait, 4.0s): durationMs=4000
- PASS enter-perps (ui.navigate, 1.2s): page=perps, proof=ui-navigation
- PASS perps-home-state (metamask.perps.read_visible_state, 77ms): platform=extension, route=#/perps-home, proof=visible-dom-accessibility
- PASS screenshot-perps-home (ui.screenshot, 228ms): path=artifacts/perps-home-after-preload.png
- PASS open-market-list (ui.navigate, 1.2s): page=perps-market-list, proof=ui-navigation
- PASS market-list-state (metamask.perps.read_visible_state, 87ms): platform=extension, route=#/perps/market-list, proof=visible-dom-accessibility
- PASS screenshot-market-list (ui.screenshot, 244ms): path=artifacts/perps-market-list.png
- PASS done (end, 0ms)
