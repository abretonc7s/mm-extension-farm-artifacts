# Reviewer-driven learnings (PR #43357)

- **Split loading states in pending UI copy**: bugbot flagged pending slippage row hiding the resolved max cap — treat max-slippage loading and estimate readiness as separate gates before choosing placeholder text.
- **Readiness flags before comparisons**: stale estimate/symbol-switch bugs recurred until `isReady` gated both display and `exceedsMaxSlippage` — derive guards from hook readiness, not numeric presence alone.
- **Async modal close contract**: slippage config modal must await persistence success before dismiss so errors stay in-context.
- **Shared stream ownership**: hooks that only read order book data must not deactivate streams other surfaces still consume (`manageStream: false`).
- **Conditional error clearing**: clearing submit errors after save needs the same predicate as submit blocking, not unconditional reset.
