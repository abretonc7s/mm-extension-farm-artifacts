# MetaMask Recipe Run

Status: pass
Duration: 16s
Nodes: 27/27 passed

## Side findings
- REVIEW 6 distinct application warning/error event(s) (non-blocking; expanded below and stored in diagnostics.json)

## Steps
- PASS setup-unlock (metamask.wallet.ensure_unlocked, 74ms): proof=extension-unlocked-state
- PASS setup-home (ui.navigate, 87ms): page=home, proof=ui-navigation
- PASS setup-lock (metamask.wallet.lock, 463ms): route=#/unlock, proof=trusted-pointer-visible-ui
- PASS setup-cache-expiry (command, 109ms): exitCode=0, stderr=(node:63627) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///Users/deeeed/dev/metamask/metamask-extension-1/temp/tasks/feat/tat-3857-0908-110457/artifacts/proof.ts is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /Users/deeeed/dev/metamask/metamask-extension-1/package.json.
(Use `node --trace-warnings ...` to show where the warning was created)

- PASS setup-reload (command, 918ms): exitCode=0, stderr=(node:63628) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///Users/deeeed/dev/metamask/metamask-extension-1/temp/tasks/feat/tat-3857-0908-110457/artifacts/proof.ts is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /Users/deeeed/dev/metamask/metamask-extension-1/package.json.
(Use `node --trace-warnings ...` to show where the warning was created)

- PASS setup-observer (command, 2.1s): exitCode=0, stderr=(node:63629) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///Users/deeeed/dev/metamask/metamask-extension-1/temp/tasks/feat/tat-3857-0908-110457/artifacts/proof.ts is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /Users/deeeed/dev/metamask/metamask-extension-1/package.json.
(Use `node --trace-warnings ...` to show where the warning was created)

- PASS ac1-unlock (metamask.wallet.ensure_unlocked, 338ms): proof=extension-password-unlock
- PASS ac1-preload (command, 3.6s): exitCode=0, stderr=(node:63638) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///Users/deeeed/dev/metamask/metamask-extension-1/temp/tasks/feat/tat-3857-0908-110457/artifacts/proof.ts is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /Users/deeeed/dev/metamask/metamask-extension-1/package.json.
(Use `node --trace-warnings ...` to show where the warning was created)

- PASS ac2-lazy (command, 669ms): exitCode=0, stderr=(node:63730) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///Users/deeeed/dev/metamask/metamask-extension-1/temp/tasks/feat/tat-3857-0908-110457/artifacts/proof.ts is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /Users/deeeed/dev/metamask/metamask-extension-1/package.json.
(Use `node --trace-warnings ...` to show where the warning was created)

- PASS ac3-shared (command, 85ms): exitCode=0, stderr=(node:63743) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///Users/deeeed/dev/metamask/metamask-extension-1/temp/tasks/feat/tat-3857-0908-110457/artifacts/proof.ts is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /Users/deeeed/dev/metamask/metamask-extension-1/package.json.
(Use `node --trace-warnings ...` to show where the warning was created)

- PASS ac4-cold-enter (ui.navigate, 1.2s): page=perps, proof=ui-navigation
- PASS ac5-rows (ui.wait_for, 640ms): matched=true, cdpPort=7661, targetUrl=chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/home.html#/perps-home, cdpTargetId=B815F8EF04E341D7C2283FD8DD7FA47E, runtimeSessionId=e2ccfa28-f662-47c4-b3f1-0a4ac162b015
- PASS ac5-state (metamask.perps.read_visible_state, 111ms): platform=extension, route=#/perps-home, proof=visible-dom-accessibility
- PASS ac4-cold-trace (command, 69ms): exitCode=0, stderr=(node:63750) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///Users/deeeed/dev/metamask/metamask-extension-1/temp/tasks/feat/tat-3857-0908-110457/artifacts/proof.ts is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /Users/deeeed/dev/metamask/metamask-extension-1/package.json.
(Use `node --trace-warnings ...` to show where the warning was created)

- PASS ac5-screenshot (ui.screenshot, 218ms): path=screenshots/evidence-ac5-live-markets.png
- PASS ac4-home (ui.navigate, 365ms): page=home, proof=ui-navigation
- PASS ac4-warm-enter (ui.navigate, 1.2s): page=perps, proof=ui-navigation
- PASS ac4-warm-trace (command, 93ms): exitCode=0, stderr=(node:63797) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///Users/deeeed/dev/metamask/metamask-extension-1/temp/tasks/feat/tat-3857-0908-110457/artifacts/proof.ts is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /Users/deeeed/dev/metamask/metamask-extension-1/package.json.
(Use `node --trace-warnings ...` to show where the warning was created)

- PASS ac4-resume-home (ui.navigate, 369ms): page=home, proof=ui-navigation
- PASS ac4-resume (command, 177ms): exitCode=0, stderr=(node:63800) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///Users/deeeed/dev/metamask/metamask-extension-1/temp/tasks/feat/tat-3857-0908-110457/artifacts/proof.ts is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /Users/deeeed/dev/metamask/metamask-extension-1/package.json.
(Use `node --trace-warnings ...` to show where the warning was created)

- PASS ac4-resume-enter (ui.navigate, 1.2s): page=perps, proof=ui-navigation
- PASS ac4-resume-trace (command, 87ms): exitCode=0, stderr=(node:63815) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///Users/deeeed/dev/metamask/metamask-extension-1/temp/tasks/feat/tat-3857-0908-110457/artifacts/proof.ts is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /Users/deeeed/dev/metamask/metamask-extension-1/package.json.
(Use `node --trace-warnings ...` to show where the warning was created)

- PASS ac3-browser-enter (ui.navigate, 1.2s): page=perps-market-list, proof=ui-navigation
- PASS ac3-browser-trace (command, 88ms): exitCode=0, stderr=(node:63850) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///Users/deeeed/dev/metamask/metamask-extension-1/temp/tasks/feat/tat-3857-0908-110457/artifacts/proof.ts is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /Users/deeeed/dev/metamask/metamask-extension-1/package.json.
(Use `node --trace-warnings ...` to show where the warning was created)

- PASS ac6-regression (command, 107ms): exitCode=0, stderr=(node:63851) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///Users/deeeed/dev/metamask/metamask-extension-1/temp/tasks/feat/tat-3857-0908-110457/artifacts/proof.ts is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /Users/deeeed/dev/metamask/metamask-extension-1/package.json.
(Use `node --trace-warnings ...` to show where the warning was created)

- PASS teardown-observer (command, 68ms): exitCode=0, stderr=(node:63864) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///Users/deeeed/dev/metamask/metamask-extension-1/temp/tasks/feat/tat-3857-0908-110457/artifacts/proof.ts is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /Users/deeeed/dev/metamask/metamask-extension-1/package.json.
(Use `node --trace-warnings ...` to show where the warning was created)

- PASS teardown-done (end, 0ms)
