# Recipe Issue Review

Status: review

Observed 17 unexpected warning/error/exception event(s) during validation. Relation to the recipe or current change is not determined; review the artifacts.

Observed:
- warnings: 11
- errors: 6
- exceptions: 0
- total: 17

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
- [WARNING x2] home: ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.

Artifacts:
- /Users/deeeed/dev/metamask/metamask-extension-1/temp/tasks/review/41949-0427-163946/artifacts/evidence/recipe-issues.json
- /Users/deeeed/dev/metamask/metamask-extension-1/temp/tasks/review/41949-0427-163946/artifacts/evidence/console-warnings.json
- /Users/deeeed/dev/metamask/metamask-extension-1/temp/tasks/review/41949-0427-163946/artifacts/evidence/console-errors.json
- /Users/deeeed/dev/metamask/metamask-extension-1/temp/tasks/review/41949-0427-163946/artifacts/evidence/runtime-exceptions.json
