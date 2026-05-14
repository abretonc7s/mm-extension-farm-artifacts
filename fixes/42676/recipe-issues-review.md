# Recipe Issue Review

Status: review

Observed 1 unexpected warning/error/exception event(s) during validation. Relation to the recipe or current change is not determined; review the artifacts.

Observed:
- warnings: 1
- errors: 0
- exceptions: 0
- total: 1

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

Artifacts:
- /Users/deeeed/dev/metamask/metamask-extension-1/temp/tasks/fix/42676-0514-161309/artifacts/recipe-issues.json
- /Users/deeeed/dev/metamask/metamask-extension-1/temp/tasks/fix/42676-0514-161309/artifacts/console-warnings.json
- /Users/deeeed/dev/metamask/metamask-extension-1/temp/tasks/fix/42676-0514-161309/artifacts/console-errors.json
- /Users/deeeed/dev/metamask/metamask-extension-1/temp/tasks/fix/42676-0514-161309/artifacts/runtime-exceptions.json
