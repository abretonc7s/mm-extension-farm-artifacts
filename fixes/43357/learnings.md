# Reviewer-Driven Learnings

- **Async hook loading gates:** reviewer flagged max-slippage defaulting to 3% before controller read — fix-bug should wire `isLoading` from `usePerpsMaxSlippage` into display, validation, and submit-disable paths on first integration.
- **Shared stream ownership:** reviewer caught slippage estimation deactivating the order-book stream the page still needs — add `manageStream: false` (or equivalent) when a hook only reads a shared channel.
- **Modal close vs async persist:** reviewer noted modal dismissed before `setMaxSlippage` finished — await persistence in `onSave` and close only after success.
- **Deferred default amount cap:** reviewer found initial amount set before price was available and never re-capped — defer `hasSetInitialAmount` until price exists and re-apply capped default when price resolves.
