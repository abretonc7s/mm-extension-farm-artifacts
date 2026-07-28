# MetaMask Recipe Run

Status: pass
Duration: 16s
Nodes: 7/7 passed

## Side findings
- REVIEW 10 distinct application warning/error event(s) (non-blocking; expanded below and stored in diagnostics.json)

## Steps
- PASS status (app.status, 206ms): platform=extension
- PASS cdp (cdp.target, 240ms): platform=extension
- PASS ensure-unlocked (metamask.wallet.ensure_unlocked, 2.1s): proof=extension-unlocked-state
- PASS open-perps (ui.navigate, 7.0s): page=perps, proof=ui-navigation
- PASS read-positions (metamask.perps.read_positions, 3.5s): count=0, matching=0
- PASS read-orders (metamask.perps.read_orders, 2.3s): count=0, matching=0
- PASS done (end, 0ms)
