# Recipe Issue Review

Status: review

Observed 20 unexpected warning/error/exception event(s) during validation. Relation to the recipe or current change is not determined; review the artifacts.

Observed:
- warnings: 16
- errors: 4
- exceptions: 0
- total: 20

Gating:
- warnings: 0
- errors: 0
- exceptions: 0
- total: 0

Informational-only events: 0

Top issues (by frequency):
- [WARNING x10] home: An input selector returned a different result when passed same arguments.
This means your output selector will likely run more frequently than intended.
Avoid returning a new reference inside your input selector, e.g.
`createSelector([state => state.todos.map(todo => todo.id)], todoIds => todoIds.length)` Object
- [ERROR x6] home: Unknown action Object
- [WARNING x2] home: ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
- [WARNING x2] home: MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 close listeners added. Use emitter.setMaxListeners() to increase limit

Artifacts:
- /Users/deeeed/dev/metamask/metamask-extension-1/temp/tasks/review/42261-0430-160751/artifacts/recipe-issues.json
- /Users/deeeed/dev/metamask/metamask-extension-1/temp/tasks/review/42261-0430-160751/artifacts/console-warnings.json
- /Users/deeeed/dev/metamask/metamask-extension-1/temp/tasks/review/42261-0430-160751/artifacts/console-errors.json
- /Users/deeeed/dev/metamask/metamask-extension-1/temp/tasks/review/42261-0430-160751/artifacts/runtime-exceptions.json
