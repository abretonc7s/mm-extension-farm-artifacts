# Learnings — TAT-3077

- Recipe `wait_for` with `expression` requires the expression to return a JSON object whose field matches the `assert` clause; a bare `boolean` expression silently keeps polling because `result.ok` is undefined. Made the expression return `JSON.stringify({ok: <bool>})` to fix.
- The browser kept old extension code after webpack reloaded — `Page.reload()` wasn't sufficient. `temp/runtime/reopen-browser.sh --slot-id mme-6 ...` was needed to pick up the new build, otherwise the recipe re-ran the buggy code.
- For market-detail recent activity, we cannot assume any specific symbol has fills. Picking the symbol with the most fills via `stateHooks.submitRequestToBackground('perpsGetOrderFills', [])` made the recipe portable across fixture accounts.
- Mobile (`PerpsRecentActivityList`) wraps every row in a `TouchableOpacity` `onPress`; on extension `TransactionCard` only renders an interactive `ButtonBase` when `onClick` is supplied — easy parity gap to miss when porting screens.
- `git diff main...HEAD` returned empty because the branch was bootstrapped from main with only an empty commit before the fix; `git diff` (unstaged) was the right view for self-review prior to staging.
