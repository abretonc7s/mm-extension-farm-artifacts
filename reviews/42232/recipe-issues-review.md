# Recipe Issue Review

Status: review

Observed 14 unexpected warning/error/exception event(s) during validation. Relation to the recipe or current change is not determined; review the artifacts.

Observed:
- warnings: 11
- errors: 3
- exceptions: 0
- total: 14

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
- [WARNING x4] home: The result function returned its own inputs without modification. e.g
`createSelector([state => state.todos], todos => todos)`
This could lead to inefficient memoization and unnecessary re-renders.
Ensure transformation logic is in the result function, and extraction logic is in the input selectors. Object
- [WARNING x3] sw: Sentry not initialized

Artifacts:
- /Users/deeeed/dev/metamask/metamask-extension-1/temp/tasks/review/42232-0429-120213/artifacts/recipe-issues.json
- /Users/deeeed/dev/metamask/metamask-extension-1/temp/tasks/review/42232-0429-120213/artifacts/console-warnings.json
- /Users/deeeed/dev/metamask/metamask-extension-1/temp/tasks/review/42232-0429-120213/artifacts/console-errors.json
- /Users/deeeed/dev/metamask/metamask-extension-1/temp/tasks/review/42232-0429-120213/artifacts/runtime-exceptions.json
