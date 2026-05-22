# Recipe Issue Review

Status: review

Observed 4 unexpected warning/error/exception event(s) during validation. Relation to the recipe or current change is not determined; review the artifacts.

Observed:
- warnings: 2
- errors: 2
- exceptions: 0
- total: 4

Gating:
- warnings: 0
- errors: 0
- exceptions: 0
- total: 0

Informational-only events: 0

Top issues (by frequency):
- [WARNING x3] home: An input selector returned a different result when passed same arguments.
This means your output selector will likely run more frequently than intended.
Avoid returning a new reference inside your input selector, e.g.
`createSelector([state => state.todos.map(todo => todo.id)], todoIds => todoIds.length)` Object
- [ERROR x1] home: Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in %s.%s a useEffect cleanup function 
    at PerpsToastProvider (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/js-ui_components_app_a.js:47282:72)
    at PerpsLayout (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/js-ui_p.js:63105:72)
    at RenderedRoute (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/js-node_modules_p.js:8640:11)
    at Outlet (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/js-node_modules_p.js:9241:28)
    at BasicFunctionalityRequired (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/js-ui_he.js:15882:89)
- [ERROR x1] home: Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in %s.%s a useEffect cleanup function 
    at PerpsView (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/js-ui_components_app_a.js:64376:84)
    at PerpsViewStreamBoundary (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/js-ui_components_app_a.js:16115:72)
    at ErrorBoundary (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/js-ui_components_app_a.js:47580:9)
    at PerpsToastProvider (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/js-ui_components_app_a.js:47282:72)
    at PerpsTab (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/js-ui_components_app_a.js:54452:72)
    at div
    at chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/js-node_modules_metamask_c.js:76744:66
    at div
    at chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/js-node_modules_metamask_c.js:76744:66
    at Tabs (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/js-ui_components_ui_b.js:3173:72)
    at AccountOverviewTabs (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/js-ui_components_a.js:47319:72)
    at AccountOverviewLayout (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/js-ui_components_a.js:43135:72)
    at AccountOverviewEth (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/js-ui_components_a.js:12462:72)
    at AccountOverview (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/js-ui_components_a.js:80536:72)
    at div
    at div
    at div
    at ScrollContainer (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/js-ui_contexts_a.js:3702:72)
    at Home (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/js-ui_pages_a.js:6148:9)
    at div
    at HomeWithRouter (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/js-ui_pages_a.js:40997:34)
    at ConnectFunction (chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/js-node_modules_p.js:63820:74)

- [WARNING x1] home: Warning: componentWillReceiveProps has been renamed, and is not recommended for use. See https://reactjs.org/link/unsafe-component-lifecycles for details.

* Move data fetching code or side effects to componentDidUpdate.
* If you're updating state whenever props change, refactor your code to use memoization techniques or move it to static getDerivedStateFromProps. Learn more at: https://reactjs.org/link/derived-state
* Rename componentWillReceiveProps to UNSAFE_componentWillReceiveProps to suppress this warning in non-strict mode. In React 18.x, only the UNSAFE_ name will work. To rename all deprecated lifecycles to their new names, you can run `npx react-codemod rename-unsafe-lifecycles` in your project source folder.

Please update the following components: %s t

Artifacts:
- /Users/deeeed/dev/metamask/metamask-extension-1/temp/tasks/fix/tat-3077-0522-175924/artifacts/recipe-issues.json
- /Users/deeeed/dev/metamask/metamask-extension-1/temp/tasks/fix/tat-3077-0522-175924/artifacts/console-warnings.json
- /Users/deeeed/dev/metamask/metamask-extension-1/temp/tasks/fix/tat-3077-0522-175924/artifacts/console-errors.json
- /Users/deeeed/dev/metamask/metamask-extension-1/temp/tasks/fix/tat-3077-0522-175924/artifacts/runtime-exceptions.json
