# Reviewer-driven learnings (PR #43357)

- **Async modal close**: bugbot caught modal dismissing before `setMaxSlippage` finished — await persist in the modal save handler before calling `onClose`.
- **Deferred price cap**: default order size must re-apply when `currentPrice` resolves after mount, not only on first render with zero price.
- **Shared stream ownership**: hooks that read the order book for slippage must not deactivate the stream the order entry page owns (`manageStream: false`).
- **Loading-gated config**: persisted max-slippage must block UI/submit until the background read completes, not fall back to the 3% default during load.
- **User edit wins over prefill**: any manual amount change should lock `hasSetInitialAmount` so a later price tick cannot overwrite typed input.
