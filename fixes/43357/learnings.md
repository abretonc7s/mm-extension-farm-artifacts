# Reviewer-Driven Learnings — PR #43357

- **Readiness gate on derived estimates**: bugbot caught `exceedsMaxSlippage` using throttled L2 data before `isReady` — order entry must treat hook readiness as part of the validation predicate, not only null checks on the numeric field.
- **Conditional error clearing**: clearing `submitError` after a successful settings save must respect remaining blockers; fix-bug should compare the new cap against the live estimate instead of blanket `setSubmitError(null)`.
- **Shared stream ownership**: hooks that subscribe to a global order-book channel must not deactivate streams owned by the page (`manageStream: false`) — fix-bug should map stream lifecycle to the component that opens the channel.
- **Throttle reset on identity change**: throttled book snapshots need a `resetKey` (symbol) so symbol switches do not reuse the prior market during the throttle window.
- **Async modal close**: config modals wrapping async persistence must await `onSave` and keep the sheet open on failure rather than closing optimistically.
