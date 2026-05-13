# Recipe Issue Review

Status: review

Observed 3 unexpected warning/error/exception event(s) during validation. Relation to the recipe or current change is not determined; review the artifacts.

Observed:
- warnings: 1
- errors: 2
- exceptions: 0
- total: 3

Gating:
- warnings: 0
- errors: 0
- exceptions: 0
- total: 0

Informational-only events: 0

Top issues (by frequency):
- [ERROR x4] sw: Error: No metadata found for 'autoLockTimeLimit'
- [WARNING x3] home: An input selector returned a different result when passed same arguments.
This means your output selector will likely run more frequently than intended.
Avoid returning a new reference inside your input selector, e.g.
`createSelector([state => state.todos.map(todo => todo.id)], todoIds => todoIds.length)` Object
- [ERROR x1] home: Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in %s.%s a useEffect cleanup function 
  at PerpsView (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-7.js:17778:48)
  at PerpsViewStreamBoundary (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-7.js:17704:41)
  at ErrorBoundary (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-6.js:1875:5)
  at PerpsToastProvider (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-7.js:15790:41)
  at PerpsTab (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-7.js:15595:41)
  at div
  at chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-0.js:33771:42
  at div
  at chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-0.js:33771:42
  at Tabs (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-12.js:19181:41)
  at AccountOverviewTabs (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-10.js:12601:41)
  at AccountOverviewLayout (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-10.js:12413:41)
  at AccountOverviewEth (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-10.js:12361:41)
  at AccountOverview (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-10.js:12939:41)
  at div
  at div
  at div
  at ScrollContainer (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-13.js:1928:41)
  at Home (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-20.js:753:5)
  at div
  at HomeWithRouter (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-20.js:1583:10)
  at ConnectFunction (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/common-16.js:32753:41)
  at ComponentWithRouterHooks (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/ui-13.js:8783:58)

Artifacts:
- /Users/deeeed/dev/metamask/metamask-extension-2/temp/tasks/feat/tat-1043-0513-160437/artifacts/recipe-issues.json
- /Users/deeeed/dev/metamask/metamask-extension-2/temp/tasks/feat/tat-1043-0513-160437/artifacts/console-warnings.json
- /Users/deeeed/dev/metamask/metamask-extension-2/temp/tasks/feat/tat-1043-0513-160437/artifacts/console-errors.json
- /Users/deeeed/dev/metamask/metamask-extension-2/temp/tasks/feat/tat-1043-0513-160437/artifacts/runtime-exceptions.json
