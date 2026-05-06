# Recipe Issue Review

Status: review

Observed 1 unexpected warning/error/exception event(s) during validation. Relation to the recipe or current change is not determined; review the artifacts.

Observed:
- warnings: 0
- errors: 1
- exceptions: 0
- total: 1

Gating:
- warnings: 0
- errors: 0
- exceptions: 0
- total: 0

Informational-only events: 0

Top issues (by frequency):
- [ERROR x1] home: Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in %s.%s a useEffect cleanup function 
  at PerpsView (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-7.js:15078:48)
  at PerpsViewStreamBoundary (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-7.js:15003:41)
  at ErrorBoundary (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-5.js:18105:5)
  at PerpsToastProvider (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-7.js:13086:41)
  at PerpsTab (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-7.js:12890:41)
  at div
  at chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/common-4.js:11280:42
  at div
  at chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/common-4.js:11280:42
  at Tabs (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-12.js:6432:41)
  at AccountOverviewTabs (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-10.js:2379:41)
  at AccountOverviewLayout (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-10.js:2190:41)
  at AccountOverviewEth (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-10.js:2137:41)
  at AccountOverview (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-10.js:2717:41)
  at div
  at div
  at div
  at ScrollContainer (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-12.js:9991:41)
  at Home (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-19.js:3607:5)
  at div
  at HomeWithRouter (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-19.js:4439:10)
  at ConnectFunction (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/common-16.js:49401:41)
  at ComponentWithRouterHooks (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-12.js:16793:58)

Artifacts:
- /Users/deeeed/dev/metamask/metamask-extension-5/temp/tasks/fix/tat-3012-0506-074754/artifacts/negative-ui-probe-isolated/recipe-issues.json
- /Users/deeeed/dev/metamask/metamask-extension-5/temp/tasks/fix/tat-3012-0506-074754/artifacts/negative-ui-probe-isolated/console-warnings.json
- /Users/deeeed/dev/metamask/metamask-extension-5/temp/tasks/fix/tat-3012-0506-074754/artifacts/negative-ui-probe-isolated/console-errors.json
- /Users/deeeed/dev/metamask/metamask-extension-5/temp/tasks/fix/tat-3012-0506-074754/artifacts/negative-ui-probe-isolated/runtime-exceptions.json
