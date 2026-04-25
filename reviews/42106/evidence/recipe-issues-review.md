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
  at PerpsView (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-7.js:13601:48)
  at PerpsViewStreamBoundary (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-7.js:13527:41)
  at ErrorBoundary (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-5.js:16860:5)
  at PerpsToastProvider (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-7.js:11610:41)
  at div
  at chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/common-4.js:983:42
  at div
  at chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/common-4.js:983:42
  at Tabs (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-12.js:3828:41)
  at AccountOverviewTabs (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-10.js:49:41)
  at AccountOverviewLayout (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-9.js:17847:41)
  at AccountOverviewEth (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-9.js:17794:41)
  at AccountOverview (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-10.js:389:41)
  at div
  at div
  at div
  at ScrollContainer (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-12.js:7308:41)
  at Home (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-18.js:17473:5)
  at div
  at HomeWithRouter (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-19.js:170:10)
  at ConnectFunction (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/common-16.js:30459:41)
  at ComponentWithRouterHooks (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-12.js:13994:58)

Artifacts:
- /Users/deeeed/dev/metamask/metamask-extension-4/temp/tasks/review/42106-0425-215324/artifacts/evidence/recipe-issues.json
- /Users/deeeed/dev/metamask/metamask-extension-4/temp/tasks/review/42106-0425-215324/artifacts/evidence/console-warnings.json
- /Users/deeeed/dev/metamask/metamask-extension-4/temp/tasks/review/42106-0425-215324/artifacts/evidence/console-errors.json
- /Users/deeeed/dev/metamask/metamask-extension-4/temp/tasks/review/42106-0425-215324/artifacts/evidence/runtime-exceptions.json
