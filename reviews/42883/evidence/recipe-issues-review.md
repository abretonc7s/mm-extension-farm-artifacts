# Recipe Issue Review

Status: review

Observed 2 unexpected warning/error/exception event(s) during validation. Relation to the recipe or current change is not determined; review the artifacts.

Observed:
- warnings: 0
- errors: 2
- exceptions: 0
- total: 2

Gating:
- warnings: 0
- errors: 0
- exceptions: 0
- total: 0

Informational-only events: 0

Top issues (by frequency):
- [ERROR x1] home: Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in %s.%s a useEffect cleanup function 
    at ClosePositionModal (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/1691.js:140:31)
- [ERROR x1] home: Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in %s.%s a useEffect cleanup function 
    at PerpsView (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/js-ui_com.js:121032:84)
    at PerpsViewStreamBoundary (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/js-ui_com.js:23551:72)
    at ErrorBoundary (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/js-ui_com.js:96434:9)
    at PerpsToastProvider (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/js-ui_com.js:95969:72)
    at PerpsTab (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/js-ui_com.js:108222:72)
    at div
    at chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/vendor-node_modules_metamask_a.js:106497:66
    at div
    at chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/vendor-node_modules_metamask_a.js:106497:66
    at Tabs (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/js-ui_com.js:40339:72)
    at AccountOverviewTabs (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/js-ui_com.js:62012:72)
    at AccountOverviewLayout (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/js-ui_com.js:56103:72)
    at AccountOverviewEth (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/js-ui_com.js:19738:72)
    at AccountOverview (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/js-ui_com.js:108113:72)
    at div
    at div
    at div
    at ScrollContainer (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/js-ui_contexts_a.js:3702:72)
    at Home (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/3594.js:344:9)
    at div
    at HomeWithRouter (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/3594.js:5258:34)
    at ConnectFunction (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/vendor-node_modules_p.js:62776:74)
    at ComponentWithRouterHooks (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/js-ui_he.js:6877:91)

Artifacts:
- /Users/deeeed/dev/metamask/metamask-extension-6/temp/tasks/review/42883-0526-095906/artifacts/evidence/recipe-issues.json
- /Users/deeeed/dev/metamask/metamask-extension-6/temp/tasks/review/42883-0526-095906/artifacts/evidence/console-warnings.json
- /Users/deeeed/dev/metamask/metamask-extension-6/temp/tasks/review/42883-0526-095906/artifacts/evidence/console-errors.json
- /Users/deeeed/dev/metamask/metamask-extension-6/temp/tasks/review/42883-0526-095906/artifacts/evidence/runtime-exceptions.json
