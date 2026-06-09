# Reviewer-Driven Learnings

- **Throttle reset on context switch**: bugbot flagged stale throttled order-book data after symbol change — pass a resetKey (symbol) into throttled hooks when the underlying channel clears on navigation.
- **Shared stream lifecycle**: slippage estimation must not deactivate order-book streams owned by order entry — use `manageStream: false` when reading shared perps channels.
- **Async modal persist**: config modals that call async persistence must await `onSave` before closing so failures stay recoverable in-context.
- **Deferred default application**: initial amount prefills should not lock until price is valid, and manual edits must mark the field as user-owned so late price loads cannot overwrite input.
- **Loading-gated caps**: persisted max-slippage reads are async — block submit and cap comparisons until `isLoading` is false to avoid transient 3% default behavior.
