# Reviewer-Driven Learnings (PR #43357)

- **Async modal lifecycle**: bugbot caught that `onClose()` ran before async `setMaxSlippage` finished — modals with persist callbacks should await success before dismissing.
- **Deferred price-dependent defaults**: initial amount prefill must not lock `hasSetInitialAmount` until `currentPrice > 0`, then re-apply capped defaults when price arrives.
- **Shared stream ownership**: hooks that read a global perps stream must not deactivate it on cleanup when another surface owns lifecycle — add an explicit `manageStream: false` read-only mode.
