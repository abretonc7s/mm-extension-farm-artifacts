# Recipe Issue Review

Status: review

Observed 2 unexpected warning/error/exception event(s) during validation. Relation to the recipe or current change is not determined; review the artifacts.

Observed:
- warnings: 2
- errors: 0
- exceptions: 0
- total: 2

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
- [WARNING x1] home: Warning: componentWillReceiveProps has been renamed, and is not recommended for use. See https://reactjs.org/link/unsafe-component-lifecycles for details.

* Move data fetching code or side effects to componentDidUpdate.
* If you're updating state whenever props change, refactor your code to use memoization techniques or move it to static getDerivedStateFromProps. Learn more at: https://reactjs.org/link/derived-state
* Rename componentWillReceiveProps to UNSAFE_componentWillReceiveProps to suppress this warning in non-strict mode. In React 18.x, only the UNSAFE_ name will work. To rename all deprecated lifecycles to their new names, you can run `npx react-codemod rename-unsafe-lifecycles` in your project source folder.

Please update the following components: %s t

Artifacts:
- /Users/deeeed/dev/metamask/metamask-extension-1/temp/tasks/fix/42661-0513-234457/artifacts/recipe-issues.json
- /Users/deeeed/dev/metamask/metamask-extension-1/temp/tasks/fix/42661-0513-234457/artifacts/console-warnings.json
- /Users/deeeed/dev/metamask/metamask-extension-1/temp/tasks/fix/42661-0513-234457/artifacts/console-errors.json
- /Users/deeeed/dev/metamask/metamask-extension-1/temp/tasks/fix/42661-0513-234457/artifacts/runtime-exceptions.json
