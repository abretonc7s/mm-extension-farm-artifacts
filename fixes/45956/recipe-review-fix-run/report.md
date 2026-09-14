# MetaMask Recipe Run

Status: pass
Duration: 21s
Nodes: 15/15 passed

## Side findings
- REVIEW 9 distinct application warning/error event(s) (non-blocking; expanded below and stored in diagnostics.json)

## Steps
- PASS attach (cdp.target, 110ms): platform=extension
- PASS reload-extension-page (command, 1.2s): exitCode=0
- PASS settle-after-reload (wait, 4.0s): durationMs=4000
- PASS unlock (metamask.wallet.ensure_unlocked, 1.5s): proof=extension-password-unlock
- PASS open-perps-tab (ui.navigate, 2.3s): page=perps, proof=ui-navigation
- PASS wait-products (ui.wait_for, 2.9s): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=8723AFAE4B57CB7FB2279AD806E3E003, runtimeSessionId=c8570f57-8bbc-4de2-ad93-05a912fd0678
- PASS scroll-products (ui.scroll, 711ms): scrolled=true, selector=[data-testid="perps-products-categories"], [data-test-id="perps-products-categories"], [data-test="perps-products-categories"], intoView=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home
- PASS assert-wraps (ui.wait_for, 383ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=8723AFAE4B57CB7FB2279AD806E3E003, runtimeSessionId=c8570f57-8bbc-4de2-ad93-05a912fd0678
- PASS assert-first-crypto (ui.wait_for, 871ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=8723AFAE4B57CB7FB2279AD806E3E003, runtimeSessionId=c8570f57-8bbc-4de2-ad93-05a912fd0678
- PASS assert-index-fourth (ui.wait_for, 732ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=8723AFAE4B57CB7FB2279AD806E3E003, runtimeSessionId=c8570f57-8bbc-4de2-ad93-05a912fd0678
- PASS assert-commodity-sixth (ui.wait_for, 578ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=8723AFAE4B57CB7FB2279AD806E3E003, runtimeSessionId=c8570f57-8bbc-4de2-ad93-05a912fd0678
- PASS assert-new-last (ui.wait_for, 507ms): matched=true, cdpPort=6663, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=8723AFAE4B57CB7FB2279AD806E3E003, runtimeSessionId=c8570f57-8bbc-4de2-ad93-05a912fd0678
- PASS clear-capture-orphans (command, 337ms): exitCode=0
- PASS screenshot-products (ui.screenshot, 4.1s): path=screenshots/products-controller-order.png
- PASS done (end, 0ms)
